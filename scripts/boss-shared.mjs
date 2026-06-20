import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const bossProfileDir = path.join(repoRoot, 'scratch', 'boss-browser-profile')

export const bossCityTargets = [
  { key: 'xian', cityName: '西安', cityCode: '101110100' },
  { key: 'beijing', cityName: '北京', cityCode: '101010100' },
  { key: 'shanghai', cityName: '上海', cityCode: '101020100' },
  { key: 'shenzhen', cityName: '深圳', cityCode: '101280600' },
  { key: 'hangzhou', cityName: '杭州', cityCode: '101210100' },
  { key: 'chengdu', cityName: '成都', cityCode: '101270100' },
]

export function getShanghaiDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function getBossSearchUrl(cityName, query = '运维工程师') {
  return `https://www.zhipin.com/web/geek/jobs?query=${encodeURIComponent(`${cityName} ${query}`)}`
}

export function buildBossJobsUrl(target) {
  return `https://www.zhipin.com/web/geek/jobs?query=${encodeURIComponent('运维工程师')}&city=${target.cityCode}`
}

export function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}
