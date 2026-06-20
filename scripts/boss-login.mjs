import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { chromium } from 'playwright'
import { bossProfileDir, buildBossJobsUrl, bossCityTargets } from './boss-shared.mjs'

const context = await chromium.launchPersistentContext(bossProfileDir, {
  channel: 'chrome',
  headless: false,
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai',
  viewport: { width: 1440, height: 1100 },
})

const page = context.pages()[0] ?? await context.newPage()
await page.goto(buildBossJobsUrl(bossCityTargets[0]), { waitUntil: 'domcontentloaded' })

console.log('')
console.log('已打开 BOSS 专用同步浏览器。')
console.log('请在弹出的 Chrome 窗口完成登录/安全验证，确认右上角显示你的账号后回到这里按 Enter。')
console.log(`专用登录态目录: ${bossProfileDir}`)
console.log('')

const rl = createInterface({ input, output })
await rl.question('登录完成后按 Enter 继续...')
rl.close()

const bodyText = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '')
const loggedIn = !/登录\/注册|立即登录|登录账号/.test(bodyText)

if (!loggedIn) {
  console.error('未检测到登录态。请重新运行 npm run boss:login 并确认 BOSS 右上角不是“登录/注册”。')
  await context.close()
  process.exit(1)
}

console.log('已检测到 BOSS 登录态，后续自动同步会复用这个专用浏览器配置。')
await context.close()
