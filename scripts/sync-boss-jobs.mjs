import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import {
  bossCityTargets,
  bossProfileDir,
  buildBossJobsUrl,
  getBossSearchUrl,
  getShanghaiDate,
  normalizeText,
  repoRoot,
} from './boss-shared.mjs'

const args = new Set(process.argv.slice(2))
const headed = !args.has('--headless')
const allowPublic = args.has('--allow-public')
const minJobsPerCity = Number(process.env.BOSS_MIN_JOBS_PER_CITY ?? 8)
const sampledAt = getShanghaiDate()
const cdpEndpoint = process.env.BOSS_CDP_ENDPOINT ?? 'http://127.0.0.1:9223'

function toTsString(value) {
  return JSON.stringify(value, null, 2)
}

function createDataModule(snapshots) {
  const cityType = bossCityTargets.map((target) => `'${target.key}'`).join(' | ')
  return `export type BossCityKey = ${cityType}

export interface BossJob {
  id: string
  title: string
  salary: string
  company: string
  city: string
  tags: string[]
  sourceRank: string
  url: string
}

export interface BossCitySnapshot {
  key: BossCityKey
  cityName: string
  sampledAt: string | null
  sampledJobs: number
  usableDetails: number
  status: 'synced' | 'pending'
  sourceLabel: string
  jobs: BossJob[]
}

const bossSearchUrl = (cityName: string, query = '运维工程师') =>
  \`https://www.zhipin.com/web/geek/jobs?query=\${encodeURIComponent(\`\${cityName} \${query}\`)}\`

export const defaultBossCityKey: BossCityKey = 'xian'

export const bossCitySnapshots: BossCitySnapshot[] = ${toTsString(snapshots)}

export const getBossCitySnapshot = (cityKey: BossCityKey) =>
  bossCitySnapshots.find((snapshot) => snapshot.key === cityKey) ?? bossCitySnapshots[0]

export const getBossSearchUrl = bossSearchUrl
`
}

async function collectCity(page, target) {
  await page.goto(buildBossJobsUrl(target), { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined)
  await page.waitForFunction(
    () => document.querySelectorAll('.job-card-wrap').length > 0
      || /安全验证|点击按钮进行验证|登录\/注册|暂无|没有找到/.test(document.body.innerText),
    { timeout: 12_000 },
  ).catch(() => undefined)
  await page.waitForTimeout(1_000)

  const state = await page.evaluate((target) => {
    const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
    const bodyText = document.body.innerText
    const loggedIn = !/登录\/注册|立即登录|登录账号/.test(bodyText)
    const cards = [...document.querySelectorAll('.job-card-wrap')].slice(0, 18)

    const jobs = cards.map((card, index) => {
      const title = clean(card.querySelector('.job-name')?.textContent) || '运维工程师'
      const href = card.querySelector('.job-name')?.getAttribute('href') || ''
      const rawSalary = clean(card.querySelector('.job-salary')?.textContent)
      const salary = rawSalary || (loggedIn ? '薪资未公开' : '薪资登录后可见')
      const tags = [...card.querySelectorAll('.tag-list li, .job-info .tag-list span, .job-info ul li')]
        .map((el) => clean(el.textContent))
        .filter(Boolean)
        .slice(0, 3)
      const footerText = clean(card.querySelector('.job-card-footer')?.textContent)
      let company = clean(card.querySelector('.boss-name, .company-name')?.textContent)
      let city = ''
      const cityMatcher = new RegExp(`^(.*?)(北京|上海|深圳|杭州|成都|西安)(·.*)?$`)
      const match = footerText.match(cityMatcher)

      if (match) {
        company = company || clean(match[1])
        city = clean(`${match[2]}${match[3] || ''}`)
      } else {
        company = company || footerText || '公司未公开'
        city = target.cityName
      }

      return {
        id: `${target.key}-${index + 1}`,
        title,
        salary,
        company,
        city,
        tags: tags.length > 0 ? tags : ['运维工程师', target.cityName],
        sourceRank: `#${String(index + 1).padStart(2, '0')}`,
        url: href ? new URL(href, location.origin).href : location.href,
      }
    }).filter((job) => job.title && job.company)

    return {
      loggedIn,
      url: location.href,
      title: document.title,
      bodyHint: clean(bodyText).slice(0, 240),
      jobs,
    }
  }, target)

  return {
    key: target.key,
    cityName: target.cityName,
    sampledAt,
    sampledJobs: state.jobs.length,
    usableDetails: state.jobs.filter((job) => job.title && job.company && job.city).length,
    status: state.jobs.length > 0 ? 'synced' : 'pending',
    sourceLabel: state.loggedIn ? 'BOSS登录列表样本' : 'BOSS公开列表样本',
    jobs: state.jobs.map((job, index) => ({
      ...job,
      id: `${target.key}-${index + 1}`,
      sourceRank: `#${String(index + 1).padStart(2, '0')}`,
      url: job.url || getBossSearchUrl(target.cityName, `${job.company} ${job.title}`),
    })),
    meta: {
      loggedIn: state.loggedIn,
      title: state.title,
      url: state.url,
      bodyHint: normalizeText(state.bodyHint),
    },
  }
}

async function withTimeout(promise, timeoutMs, label) {
  let timeout
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
  })
  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    clearTimeout(timeout)
  }
}

await fs.mkdir(path.join(repoRoot, 'scratch'), { recursive: true })
await fs.mkdir(path.join(repoRoot, 'logs'), { recursive: true })

async function canConnectToExistingChrome(endpoint) {
  try {
    const response = await fetch(`${endpoint}/json/version`, { signal: AbortSignal.timeout(800) })
    return response.ok
  } catch {
    return false
  }
}

let browser
let context
let connectedExistingBrowser = false

if (await canConnectToExistingChrome(cdpEndpoint)) {
  browser = await chromium.connectOverCDP(cdpEndpoint)
  context = browser.contexts()[0] ?? await browser.newContext({
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    viewport: { width: 1440, height: 1100 },
  })
  connectedExistingBrowser = true
  console.log(`Connected to existing BOSS sync browser: ${cdpEndpoint}`)
} else {
  context = await chromium.launchPersistentContext(bossProfileDir, {
    channel: 'chrome',
    headless: !headed,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    viewport: { width: 1440, height: 1100 },
  })
}

try {
  const snapshotsWithMeta = []

  for (const target of bossCityTargets) {
    let page
    try {
      console.log(`Collecting ${target.cityName}...`)
      page = await context.newPage()
      let snapshot = await withTimeout(collectCity(page, target), 40_000, target.cityName)
      if (snapshot.sampledJobs === 0) {
        await page.waitForTimeout(2_000)
        snapshot = await withTimeout(collectCity(page, target), 40_000, `${target.cityName} retry`)
      }
      snapshotsWithMeta.push(snapshot)
      console.log(`${target.cityName}: ${snapshot.sampledJobs} jobs, ${snapshot.sourceLabel}`)
    } catch (error) {
      snapshotsWithMeta.push({
        key: target.key,
        cityName: target.cityName,
        sampledAt,
        sampledJobs: 0,
        usableDetails: 0,
        status: 'pending',
        sourceLabel: 'BOSS同步失败',
        jobs: [],
        meta: {
          loggedIn: false,
          title: '采集页面关闭或加载失败',
          url: '',
          bodyHint: error instanceof Error ? error.message : String(error),
        },
      })
      console.error(`${target.cityName}: failed, ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      await page?.close().catch(() => undefined)
    }
  }

  const failures = snapshotsWithMeta.filter((snapshot) => snapshot.sampledJobs < minJobsPerCity)
  if (failures.length > 0) {
    const failurePath = path.join(repoRoot, 'logs', `boss-sync-failed-${sampledAt}-${Date.now()}.json`)
    await fs.writeFile(failurePath, JSON.stringify({
      sampledAt,
      minJobsPerCity,
      failures: failures.map((snapshot) => ({
        key: snapshot.key,
        cityName: snapshot.cityName,
        sampledJobs: snapshot.sampledJobs,
        sourceLabel: snapshot.sourceLabel,
        meta: snapshot.meta,
      })),
    }, null, 2), 'utf8')
    const screenshotPath = path.join(repoRoot, 'logs', `boss-sync-failed-${sampledAt}-${Date.now()}.png`)
    const diagnosticPage = context.pages().at(-1)
    await diagnosticPage?.screenshot({ path: screenshotPath, fullPage: false }).catch(() => undefined)
    console.error(`失败诊断: ${failurePath}`)
    console.error(`失败截图: ${screenshotPath}`)
    throw new Error(`采集结果不足，已阻止覆盖旧数据: ${failures.map((item) => `${item.cityName}=${item.sampledJobs}`).join(', ')}`)
  }

  const allLoggedIn = snapshotsWithMeta.every((snapshot) => snapshot.meta.loggedIn)
  if (!allLoggedIn && !allowPublic) {
    throw new Error('未检测到完整 BOSS 登录态，已阻止覆盖旧数据。先运行 npm run boss:login，或临时使用 npm run boss:sync -- --allow-public。')
  }

  const snapshots = snapshotsWithMeta.map(({ meta, ...snapshot }) => snapshot)
  const rawPath = path.join(repoRoot, 'scratch', `boss-city-snapshots-${sampledAt}.json`)
  const dataPath = path.join(repoRoot, 'src', 'data', 'bossJobSnapshots.ts')
  const logPath = path.join(repoRoot, 'logs', `boss-sync-${sampledAt}.json`)

  await fs.writeFile(rawPath, JSON.stringify(snapshotsWithMeta, null, 2), 'utf8')
  await fs.writeFile(dataPath, createDataModule(snapshots), 'utf8')
  await fs.writeFile(logPath, JSON.stringify({
    sampledAt,
    createdAt: new Date().toISOString(),
    minJobsPerCity,
    allLoggedIn,
    snapshots: snapshotsWithMeta.map((snapshot) => ({
      key: snapshot.key,
      cityName: snapshot.cityName,
      sampledJobs: snapshot.sampledJobs,
      usableDetails: snapshot.usableDetails,
      sourceLabel: snapshot.sourceLabel,
      loggedIn: snapshot.meta.loggedIn,
      url: snapshot.meta.url,
    })),
  }, null, 2), 'utf8')

  console.log(`已更新 ${dataPath}`)
  console.log(`原始快照 ${rawPath}`)
  console.log(`同步日志 ${logPath}`)
} finally {
  if (!connectedExistingBrowser) {
    await context.close()
  }
}
