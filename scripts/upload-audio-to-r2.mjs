// Upload media/audio/*.mp3 to an R2 bucket via wrangler.
//
// Prerequisites:
//   1. A CLOUDFLARE_API_TOKEN with R2 read/write (Workers R2 Storage: Edit).
//   2. The bucket already created: npx wrangler r2 bucket create yunwei-audio
//
// Usage:
//   node scripts/upload-audio-to-r2.mjs [bucketName] [--remote] [--concurrency=8]
//
// Defaults: bucket "yunwei-audio", remote upload, concurrency 8.

import { spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

const args = process.argv.slice(2)
const bucket = args.find((a) => !a.startsWith('--')) || 'yunwei-audio'
const local = args.includes('--local')
const concurrencyArg = args.find((a) => a.startsWith('--concurrency='))
const concurrency = concurrencyArg ? Math.max(1, Number(concurrencyArg.split('=')[1]) || 8) : 8

const audioDir = join(process.cwd(), 'public', 'audio')

function putObject(file) {
  return new Promise((resolve, reject) => {
    const key = `audio/${file}`
    const cmdArgs = [
      'wrangler',
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      `--file=${join(audioDir, file)}`,
      '--content-type=audio/mpeg',
      local ? '--local' : '--remote',
    ]
    const child = spawn('npx', cmdArgs, { shell: true, stdio: 'ignore' })
    child.on('error', reject)
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code} for ${file}`))))
  })
}

async function main() {
  const entries = await readdir(audioDir)
  const files = entries.filter((f) => f.endsWith('.mp3'))
  if (files.length === 0) {
    console.error(`No .mp3 files found in ${audioDir}`)
    process.exit(1)
  }

  console.log(`Uploading ${files.length} files to "${bucket}" (${local ? 'local' : 'remote'}, concurrency ${concurrency})…`)
  let done = 0
  let failed = 0
  let cursor = 0

  async function worker() {
    while (cursor < files.length) {
      const file = files[cursor++]
      try {
        await putObject(file)
      } catch (err) {
        failed++
        console.error(`✗ ${file}: ${err.message}`)
      }
      done++
      if (done % 50 === 0 || done === files.length) {
        console.log(`  ${done}/${files.length} (${failed} failed)`)
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  console.log(failed === 0 ? '✅ All uploaded.' : `⚠️ Done with ${failed} failures.`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
