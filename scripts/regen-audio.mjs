// Regenerate any missing question-audio mp3 files with edge-tts.
//
// The ~1764 narration files under public/audio/ are pre-generated and NOT in
// git. Editing a question's option/explanation text leaves the old mp3 stale
// (the player only falls back to live TTS when the file is *missing*), so the
// rewrite scripts delete the stale files. Run this afterwards to regenerate
// them so narration matches the on-screen text again.
//
// Text per file (matches the app's TTS fallback in src/App.tsx):
//   <id>.mp3                -> prompt
//   <id>-explanation.mp3    -> explanation
//   <id>-option-<x>.mp3     -> "<X>。<option text>"
//   <id>-correct.mp3        -> "正确答案是：<IDS>。<X>。<text>…"
//
// Usage:  node scripts/regen-audio.mjs
// Env:    EDGE_TTS  path to edge-tts executable (default: "edge-tts" on PATH)
//         TTS_VOICE edge-tts voice (default: zh-CN-XiaoxiaoNeural)
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileP = promisify(execFile)
const EXE = process.env.EDGE_TTS || 'edge-tts'
const VOICE = process.env.TTS_VOICE || 'zh-CN-XiaoxiaoNeural'
const AUDIO_DIR = 'public/audio'
const CONCURRENCY = 5

const { questions } = await import('../functions/_shared/questions.js')
const have = new Set(fs.existsSync(AUDIO_DIR) ? fs.readdirSync(AUDIO_DIR) : [])

function expectedFiles(q) {
  const out = [
    { file: `${q.id}.mp3`, text: q.prompt },
    { file: `${q.id}-explanation.mp3`, text: q.explanation },
  ]
  for (const o of q.options) out.push({ file: `${q.id}-option-${o.id}.mp3`, text: `${o.id.toUpperCase()}。${o.text}` })
  const correct = q.options.filter((o) => q.answer.includes(o.id)).map((o) => `${o.id.toUpperCase()}。${o.text}`).join('。')
  out.push({ file: `${q.id}-correct.mp3`, text: `正确答案是：${q.answer.join('、').toUpperCase()}。${correct}` })
  return out
}

const missing = questions.flatMap(expectedFiles).filter((it) => {
  const fp = path.join(AUDIO_DIR, it.file)
  return !(have.has(it.file) && fs.statSync(fp).size > 0)
})

if (!missing.length) {
  console.log('没有缺失的音频文件，无需生成。')
  process.exit(0)
}
console.log(`待生成: ${missing.length} 个 | 发音: ${VOICE}`)

async function genOne(it) {
  const out = path.join(AUDIO_DIR, it.file)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await execFileP(EXE, ['--voice', VOICE, `--text=${it.text}`, '--write-media', out], { timeout: 60000 })
      if (fs.existsSync(out) && fs.statSync(out).size > 0) return { file: it.file, status: 'ok' }
      throw new Error('empty output')
    } catch (err) {
      if (attempt === 2) return { file: it.file, status: 'fail', error: String(err.message || err).slice(0, 120) }
      await new Promise((r) => setTimeout(r, 800))
    }
  }
}

let done = 0
const results = []
const queue = [...missing]
async function worker() {
  while (queue.length) {
    const r = await genOne(queue.shift())
    results.push(r)
    if (++done % 20 === 0 || done === missing.length) console.log(`  进度 ${done}/${missing.length}`)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

const ok = results.filter((r) => r.status === 'ok').length
const fails = results.filter((r) => r.status === 'fail')
console.log(`\n完成：成功 ${ok}，失败 ${fails.length}`)
if (fails.length) {
  fails.forEach((f) => console.log('  -', f.file, '|', f.error))
  process.exit(1)
}
