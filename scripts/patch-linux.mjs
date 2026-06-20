// One-off content patch for the Linux category (review Phase 2, batch 1).
// - Adds a mnemonic (口诀) to every Linux question.
// - Strips recruitment filler and adds mechanism to weak explanations.
// - Replaces joke/implausible distractors with credible-but-wrong options.
// Correct-option text, prompts and titles are left untouched so the
// `${id}.mp3` / `${id}-correct.mp3` narration stays valid; only the stale
// `-explanation.mp3` / `-option-x.mp3` files for changed text are deleted.
import fs from 'node:fs'
import path from 'node:path'

const QFILE = 'functions/_shared/questions.js'
const AUDIO_DIR = 'public/audio'

const { questions } = await import(`../${QFILE}`)

/** patches keyed by question id. Provide full options/wrongReasons when changed. */
const patches = {
  'linux-service-log-first': {
    mnemonic: '服务起不来先 journalctl -u <服务>：-x 加解释，-e 跳最新。',
    explanation:
      'systemd 把服务日志统一收进 journal。按 unit 过滤（-u）能直接定位这个服务的启动错误、退出码和依赖失败；-x 补充解释、-e 跳到最新。只盯 systemctl status 那几行往往不够。',
  },
  'linux-script-production-quality': {
    mnemonic: '生产脚本四要素：幂等、留证据、失败退出码、护生产边界。',
    explanation:
      '好脚本的价值是把重复判断标准化：幂等保证能复跑，失败退出码让编排能感知，审计日志留证据，dry-run/白名单守住生产边界。',
    options: [
      { id: 'a', text: '具备幂等、超时、失败退出码和审计日志' },
      { id: 'b', text: '把判断和参数写死在脚本里，换环境就改源码' },
      { id: 'c', text: '输出清晰的成功/失败状态和关键证据' },
      { id: 'd', text: '对危险操作有确认、白名单或 dry-run 机制' },
    ],
    wrongReasons: {
      b: '把配置写死会让脚本无法跨环境复用，每次变更都要改源码，反而更易出错、更难交接。',
    },
  },
  'linux-disk-inode-triage': {
    mnemonic: '写不进先两查：df -h 看容量，df -i 看 inode，再 du 找大目录。',
    explanation:
      'No space left 有两种成因：数据块满（df -h）或 inode 耗尽（df -i，常见于海量小文件）。先用 df 判断是哪种、哪个分区，再用 du 逐层找大目录或异常堆积，最后处理日志、缓存或临时文件。',
    options: [
      { id: 'a', text: 'du 逐层定位大目录或异常小文件堆积' },
      { id: 'b', text: '重启服务器，期望磁盘空间自动释放' },
      { id: 'c', text: 'df -h 查看分区容量使用率' },
      { id: 'd', text: 'df -i 查看 inode 使用率' },
    ],
    wrongReasons: {
      b: '重启不会释放被占用的磁盘；进程仍持有的已删除文件反而可能继续占空间，治标不治本。',
    },
  },
  'linux-load-iowait': {
    mnemonic: 'load 高 CPU 闲，先查盘别加核——D 态不吃 CPU 也抬 load。',
    explanation:
      'load 统计的是「运行(R)+不可中断睡眠(D)」的进程数。D 态多卡在磁盘/网络存储 IO 上，不占 CPU 却照样抬高 load——于是出现 load 高、CPU idle 也高。方向是查 IO（iostat 的 %util、await），而不是盲目加 CPU。',
  },
  'linux-file-descriptor': {
    mnemonic: 'Too many open files=数 fd 看三限：ulimit、LimitNOFILE、连接泄漏。',
  },
  'linux-permission-noexec': {
    mnemonic: 'Permission denied 四查：执行位、属主、用户身份、noexec 挂载。',
    options: [
      { id: 'a', text: '确认当前用户和 sudo 权限边界' },
      { id: 'b', text: '检查所在挂载点是否 noexec' },
      { id: 'c', text: 'ls -l 查看执行位和属主属组' },
      { id: 'd', text: '给脚本统一 chmod 777 绕过权限检查' },
    ],
    wrongReasons: {
      d: 'chmod 777 放开全部权限会引入严重安全风险，是绕过现象而非定位 Permission denied 的根因。',
    },
  },
  'linux-logrotate-policy': {
    mnemonic: '日志会撑爆盘：切割+压缩+保留周期+磁盘告警，缺一不可。',
    explanation:
      '日志能力不止会 grep，更要管生命周期。应用日志若没有切割、压缩、保留周期和磁盘告警，迟早把分区写满拖垮服务。logrotate 或应用自带轮转就是补这套机制。',
  },
  'linux-process-port-owner': {
    mnemonic: '查端口归属用 ss -lntp：l 监听 n 数字 t TCP p 进程。',
  },
  'linux-systemd-unit-hardening': {
    mnemonic: '生产 unit 五件套：Restart、LimitNOFILE、Env、非 root、日志依赖。',
    options: [
      { id: 'a', text: 'Restart 策略、LimitNOFILE、EnvironmentFile、日志和依赖顺序' },
      { id: 'b', text: '只配 ExecStart，靠人工盯着失败再手动拉起' },
      { id: 'c', text: '统一用 root 启动，省去配置专用运行账号' },
      { id: 'd', text: '把日志直接丢到 /dev/null，省磁盘空间' },
    ],
    wrongReasons: {
      b: '没有 Restart 和资源限制策略，故障要靠人工值守，恢复慢且不可靠。',
      c: '默认 root 运行扩大攻击面，违反最小权限，应配置专用低权账号。',
      d: '丢弃日志会让排障没有证据，事故复盘无从下手。',
    },
  },
  'linux-cron-timer-audit': {
    mnemonic: '定时没跑先看证据：用户、环境变量、路径、退出码、timer 日志。',
  },
  'linux-user-sudo-audit': {
    mnemonic: '临时授权：个人账号+限定 sudo+设期限+留审计，绝不共享 root。',
    explanation:
      '生产授权的底线是可追责：个人账号能定位到人，限定 sudo 给最小权限，有效期控制临时窗口，审计保留可回溯。',
    options: [
      { id: 'a', text: '直接共用一个 root 账号登录操作' },
      { id: 'b', text: '创建个人账号，授予限定 sudo 权限，设置有效期并保留审计' },
      { id: 'c', text: '复用已离职同事遗留的账号临时顶替' },
      { id: 'd', text: '给临时人员配置永久 NOPASSWD 全量 sudo' },
    ],
    wrongReasons: {
      a: '共用 root 无法追责，任何误操作都定位不到人，风险极高。',
      c: '复用离职账号同样无法追责，还可能绕过账号回收与权限审计。',
      d: '永久 NOPASSWD 全量 sudo 等于无限期最高权限，临时排障用完也收不回。',
    },
  },
  'linux-baseline-inspection': {
    mnemonic: '基线巡检四个面：资源、服务、安全、可维护。',
    explanation:
      '基线巡检要覆盖四个面：资源（CPU/内存/磁盘/inode/负载）、服务（关键进程/端口/failed units）、安全（账号/补丁/SSH）、可维护（日志轮转/时间同步）。漏掉一面，后续监控和排障都会有盲区。',
    options: [
      { id: 'a', text: 'CPU、内存、磁盘、inode、负载、时间同步' },
      { id: 'b', text: '账号权限、补丁版本、SSH 配置和日志轮转' },
      { id: 'c', text: '仅采集主机名和上线日期等静态台账信息' },
      { id: 'd', text: '关键进程、端口、systemd failed units' },
    ],
    wrongReasons: {
      c: '静态台账不反映运行健康；基线巡检要的是能随时间对比的动态指标。',
    },
  },

  // --- 30 basic command questions: mnemonic only (explanations kept) ---
  'linux-basic-ls': { mnemonic: 'ls = List 列目录；-la 看全部+详情。' },
  'linux-basic-pwd': { mnemonic: 'pwd = Print Working Directory，打印当前绝对路径。' },
  'linux-basic-cd': { mnemonic: 'cd = Change Directory；cd / 回根，cd ~ 回家。' },
  'linux-basic-mkdir': { mnemonic: 'mkdir = Make Directory；-p 一次建多级。' },
  'linux-basic-touch': { mnemonic: 'touch 碰一下：文件不存在就建个空文件。' },
  'linux-basic-rm': { mnemonic: 'rm = Remove 删文件；Linux 没有 del。' },
  'linux-basic-rm-rf': { mnemonic: 'rm -rf：r 递归 f 强制删非空目录——高危，慎用。' },
  'linux-basic-cp': { mnemonic: 'cp = Copy，源在前目标在后，原文件还在。' },
  'linux-basic-mv': { mnemonic: 'mv = Move：既能移动也能改名，原文件不留。' },
  'linux-basic-cat': { mnemonic: 'cat 一次吐全文；大文件改用 less/tail。' },
  'linux-basic-grep': { mnemonic: 'grep 找「行」：在文件里按关键字过滤。' },
  'linux-basic-chmod': { mnemonic: 'chmod 改权限 +x 给执行；chown 改属主、chgrp 改组。' },
  'linux-basic-chown': { mnemonic: 'chown 改属主：chown 用户 文件。' },
  'linux-basic-df': { mnemonic: 'df 看分区剩余（Disk Free），du 看目录占用。' },
  'linux-basic-du': { mnemonic: 'du -sh 看目录总大小：s 汇总、h 易读。' },
  'linux-basic-ps': { mnemonic: 'ps -ef 列全部进程快照；要实时看用 top。' },
  'linux-basic-top': { mnemonic: 'top 实时刷 CPU/内存排行；ps 只是静态快照。' },
  'linux-basic-kill': { mnemonic: 'kill -9 发 SIGKILL 强杀卡死；默认 15 可被忽略。' },
  'linux-basic-free': { mnemonic: 'free -h 看内存与 Swap；磁盘用 df 别搞混。' },
  'linux-basic-tar': { mnemonic: '打包记 czvf：c 创建 z 压缩 v 进度 f 文件名；解包换 x。' },
  'linux-basic-uname': { mnemonic: 'uname -r 看内核版本，-a 看全部系统信息。' },
  'linux-basic-whoami': { mnemonic: 'whoami 报当前有效用户名；id 看 uid/gid。' },
  'linux-basic-sudo': { mnemonic: 'sudo 单次提权执行；su 是切换身份开新会话。' },
  'linux-basic-find': { mnemonic: 'find 路径 -name 通配，递归找「文件」；grep 找内容。' },
  'linux-basic-tail': { mnemonic: 'tail -f 跟随日志尾部实时刷新；head 看头部。' },
  'linux-basic-head': { mnemonic: 'head -n N 看前 N 行；tail 看后 N 行。' },
  'linux-basic-history': { mnemonic: 'history 列本会话命令历史；last 看登录历史。' },
  'linux-basic-ln': { mnemonic: 'ln -s 建软链（快捷方式）；不加 -s 是硬链。' },
  'linux-basic-uptime': { mnemonic: 'uptime 看运行时长 + 1/5/15 分钟负载。' },
  'linux-basic-passwd': { mnemonic: 'passwd 改自己密码；带用户名(需 root)改他人。' },
}

const staleAudio = new Set()
let changed = 0

const next = questions.map((q) => {
  const p = patches[q.id]
  if (!p) return q
  changed++

  if (p.explanation && p.explanation !== q.explanation) {
    staleAudio.add(`${q.id}-explanation.mp3`)
  }
  if (p.options) {
    const oldById = new Map(q.options.map((o) => [o.id, o.text]))
    for (const o of p.options) {
      if (oldById.get(o.id) !== o.text) staleAudio.add(`${q.id}-option-${o.id}.mp3`)
    }
  }

  // Merge wrongReasons so unchanged keys are preserved.
  const merged = { ...q, ...p }
  if (p.wrongReasons) merged.wrongReasons = { ...q.wrongReasons, ...p.wrongReasons }
  return merged
})

const missing = Object.keys(patches).filter((id) => !questions.some((q) => q.id === id))
if (missing.length) {
  console.error('未匹配到的 id:', missing)
  process.exit(1)
}

fs.writeFileSync(QFILE, `export const questions = ${JSON.stringify(next, null, 2)};\n`)

// Delete stale narration so the player falls back to live TTS of the new text.
let deleted = 0
for (const name of staleAudio) {
  const fp = path.join(AUDIO_DIR, name)
  if (fs.existsSync(fp)) {
    fs.rmSync(fp)
    deleted++
  }
}

console.log(`已改写 Linux 题目: ${changed}`)
console.log(`需失效的旧音频: ${staleAudio.size}，实际删除: ${deleted}`)
console.log([...staleAudio].sort().join('\n'))
