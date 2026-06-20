// Content patch for the sre category (review Phase 2, batch 6 / final).
import fs from 'node:fs'
import path from 'node:path'

const QFILE = 'functions/_shared/questions.js'
const AUDIO_DIR = 'public/audio'
const { questions } = await import(`../${QFILE}`)

const patches = {
  'sre-incident-mitigate-first': {
    mnemonic: '事故顺序：先止血恢复→留证据定位根因→沉淀改进项。',
    explanation: '止血解决当下，证据链解决事实，复盘行动项解决未来：先恢复，再保留证据定位根因，最后沉淀可执行的改进项。',
  },
  'sre-alert-actionable': {
    mnemonic: '好告警能指导下一步：影响+原因+排查入口+升级人+止血动作。',
    explanation: '好告警不是让系统更吵，而是让值班人更快行动：必须说明影响、触发原因、排查入口、升级人和止血动作。',
  },
  'sre-slo-error-budget': {
    mnemonic: '错误预算耗尽=收紧发布保稳定，别继续加风险变更。',
  },
  'sre-capacity-planning': {
    mnemonic: '容量评估：历史峰值+增长预估+瓶颈+压测+扩容阈值+降级。',
  },
  'sre-runbook-quality': {
    mnemonic: 'Runbook：告警含义+影响+排查步骤+止血+回滚+升级人。',
    options: [
      { id: 'a', text: '只写“联系负责人”' },
      { id: 'b', text: '告警含义、影响范围、排查步骤、止血动作、回滚和升级联系人' },
      { id: 'c', text: '随机命令列表' },
      { id: 'd', text: '值班人员的排班表' },
    ],
    wrongReasons: {
      d: '排班表只用于联系人查询，不构成可执行的排查与止血步骤。',
    },
  },
  'sre-postmortem-blameless': {
    mnemonic: '无责复盘=找系统性改进，不追个人责任。',
  },
  'sre-incident-communication': {
    mnemonic: '对外第一条：影响+开始时间+当前状态+已做动作+下次更新+负责人。',
  },
  'sre-monitoring-baseline': {
    mnemonic: '监控基线三层：主机资源 + 业务 RED + 依赖组件。',
    options: [
      { id: 'a', text: '业务入口：可用性、错误率、延迟、吞吐、证书有效期' },
      { id: 'b', text: '依赖组件：数据库、缓存、队列、负载均衡、外部接口' },
      { id: 'c', text: '主机资源：CPU、内存、磁盘、inode、网络、进程' },
      { id: 'd', text: '只统计每日 PV/UV 访问量' },
    ],
    wrongReasons: {
      d: 'PV/UV 是业务统计，不能反映资源、错误率和依赖健康，不足以发现故障。',
    },
  },
  'sre-log-platform': {
    mnemonic: '日志平台价值=关联检索：统一字段+traceId+版本+错误码+耗时。',
  },
  'sre-customer-acceptance': {
    mnemonic: '验收靠证据：部署清单+测试记录+监控+权限+回滚+双方确认。',
  },
  'sre-onsite-industry-ops': {
    mnemonic: '现场中断逐层查：供电→设备→传感器→链路→上报配置→平台接收。',
  },
  'sre-oncall-handover': {
    mnemonic: '交接必含：当前告警+未关故障+风险变更+遗留工单+升级路径。',
  },

  // --- 30 basic SRE questions: mnemonic only ---
  'sre-basic-slo-sli': { mnemonic: 'SLI=测到的指标值，SLO=给它定的目标范围。' },
  'sre-basic-prometheus': { mnemonic: 'Prometheus 采集/存储/告警，Grafana 画看板。' },
  'sre-basic-four-signals': { mnemonic: '黄金四信号：延迟、流量、错误、饱和度。' },
  'sre-basic-alert-severity': { mnemonic: 'Critical=核心受损，立即呼叫 on-call 止血。' },
  'sre-basic-postmortem-purpose': { mnemonic: '复盘=还原时间线找系统缺陷，无责改进。' },
  'sre-basic-runbook': { mnemonic: '告警对应的排障文档=Runbook/Playbook。' },
  'sre-basic-spof': { mnemonic: 'SPOF=单点失效拖垮全局，需高可用兜底。' },
  'sre-basic-uptime-math': { mnemonic: '三个 9≈年停机 8.76 小时；四个 9≈52 分钟。' },
  'sre-basic-logging-levels': { mnemonic: '日志级别：DEBUG<INFO<WARN<ERROR(<FATAL)。' },
  'sre-basic-load-testing': { mnemonic: '压测=模拟高并发，提前找瓶颈、验扩容降级。' },
  'sre-basic-oncall': { mnemonic: 'On-call=值班期告警畅通，按时响应止血。' },
  'sre-basic-error-budget': { mnemonic: '错误预算=100%-SLO：有余量可发版，超支冻结发布。' },
  'sre-basic-mttr': { mnemonic: 'MTTR=平均恢复/修复时间(越小越好)。' },
  'sre-basic-mttd': { mnemonic: 'MTTD=平均检测时间(多快发现告警)。' },
  'sre-basic-rca': { mnemonic: '根因分析=RCA，常配 5 Whys。' },
  'sre-basic-dr': { mnemonic: '灾难恢复=DR：异地备份+多活+演练。' },
  'sre-basic-rto': { mnemonic: 'RTO=允许停机多久(时间窗口)。' },
  'sre-basic-rpo': { mnemonic: 'RPO=允许丢多少数据(数据时间点)。' },
  'sre-basic-circuit-breaker': { mnemonic: '下游频繁超时就熔断降级=Circuit Breaker。' },
  'sre-basic-canary': { mnemonic: '小流量先发再放量=金丝雀/灰度发布。' },
  'sre-basic-rate-limit': { mnemonic: '限单位时间请求数自保=限流(令牌桶/漏桶)。' },
  'sre-basic-graceful-shutdown': { mnemonic: '停新请求、处理完再退=优雅停机。' },
  'sre-basic-monitoring-types': { mnemonic: '只从外部探活=黑盒；看内部指标=白盒。' },
  'sre-basic-backup-test': { mnemonic: '备份必做恢复演练+校验，没验证=没备份。' },
  'sre-basic-chaos': { mnemonic: '主动注入故障验自愈=混沌工程。' },
  'sre-basic-elk': { mnemonic: '集中查日志搭 ELK(ES+Logstash+Kibana)。' },
  'sre-basic-grafana-dash': { mnemonic: '监控大屏看板=Grafana。' },
  'sre-basic-alert-fatigue': { mnemonic: '告警太多致麻木漏看=告警疲劳。' },
  'sre-basic-escalation': { mnemonic: '超时未响应自动升级二线=Escalation 策略。' },
  'sre-basic-blameless': { mnemonic: '无责复盘=坦诚还原、机制加固，不追责个人。' },
}

const staleAudio = new Set()
let changed = 0
const next = questions.map((q) => {
  const p = patches[q.id]
  if (!p) return q
  changed++
  if (p.explanation && p.explanation !== q.explanation) staleAudio.add(`${q.id}-explanation.mp3`)
  if (p.options) {
    const oldById = new Map(q.options.map((o) => [o.id, o.text]))
    for (const o of p.options) if (oldById.get(o.id) !== o.text) staleAudio.add(`${q.id}-option-${o.id}.mp3`)
  }
  const merged = { ...q, ...p }
  if (p.wrongReasons) merged.wrongReasons = { ...q.wrongReasons, ...p.wrongReasons }
  return merged
})

const missing = Object.keys(patches).filter((id) => !questions.some((q) => q.id === id))
if (missing.length) { console.error('未匹配到的 id:', missing); process.exit(1) }

fs.writeFileSync(QFILE, `export const questions = ${JSON.stringify(next, null, 2)};\n`)
let deleted = 0
for (const name of staleAudio) {
  const fp = path.join(AUDIO_DIR, name)
  if (fs.existsSync(fp)) { fs.rmSync(fp); deleted++ }
}
console.log(`已改写 sre 题目: ${changed}`)
console.log(`需失效的旧音频: ${staleAudio.size}，实际删除: ${deleted}`)
