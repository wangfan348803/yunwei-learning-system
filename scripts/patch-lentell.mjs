// Length-parity pass: expand terse distractors in descriptive scenario questions
// so the comprehensive correct answer is no longer conspicuously the longest.
// Only distractor text changes (correct option untouched → -correct.mp3 stays valid).
import fs from 'node:fs'
import path from 'node:path'

const QFILE = 'functions/_shared/questions.js'
const AUDIO_DIR = 'public/audio'
const { questions } = await import(`../${QFILE}`)

// id -> { optionId: newText, ... } (distractors only)
const distractorRewrites = {
  'network-waf-403': {
    a: '数据库慢查询日志里的执行计划和锁等待',
    b: '后端 Pod 的镜像体积和拉取耗时',
    c: '应用服务器的主机名和时区配置',
  },
  'middleware-mysql-slow-query': {
    a: '重启应用服务器，期望连接重置后变快',
    b: '直接给数据库实例加大 CPU 和内存规格',
    c: '调大连接池上限，让更多请求挤进来',
  },
  'middleware-jvm-gc': {
    a: '删除 GC 日志，避免它占用磁盘空间',
    c: '直接把堆内存调到最大压住毛刺',
    d: '只增加服务副本数，不分析 JVM 行为',
  },
  'middleware-es-shard': {
    a: '直接删除报红的索引让状态变绿',
    b: '随机重启一个数据节点看能否自愈',
    c: '关闭集群健康检查不再报 red/yellow',
  },
  'middleware-connection-pool': {
    a: '应用的日志打印级别和输出格式配置',
    b: '前端请求头里的 User-Agent 和 Referer',
    c: '源码里的注释行数和代码风格规范',
  },
  'middleware-mq-dead-letter': {
    b: '直接给队列扩容更多分区提高吞吐',
    c: '把消费者的重试次数直接调成无限',
    d: '直接清空死信队列假装没发生过',
  },
  'middleware-redis-hit-rate': {
    b: '把所有 key 的过期时间统一调短',
    c: '关闭数据库慢查询日志减少干扰',
    d: '直接清空整个 Redis 再重新预热',
  },
  'devops-helm-rollback': {
    b: '先关闭相关告警，避免一直被打扰',
    c: '继续把新版本放量到全部实例',
    d: '删除 Helm 发布历史记录清爽一下',
  },
  'devops-container-resource-limit': {
    a: '关闭监控告警，让 OOMKilled 不再提示',
    b: '换一个更大的基础镜像重新构建',
    c: '反复重启容器，期望它自己恢复',
  },
  'devops-k8s-readiness': {
    a: '替代数据库的定时备份任务',
    c: '决定容器镜像的分层构建方式',
    d: '自动为服务申请域名 TLS 证书',
  },
  'devops-image-pull-secret': {
    a: 'PVC 申请的存储容量和 accessModes',
    c: 'HPA 配置的目标指标和副本上限',
    d: 'Service 的 selector 与端口配置',
  },
  'devops-pvc-pending': {
    b: 'Ingress 的 host 规则和路径拼写',
    c: 'Service 的 ClusterIP 和端口映射',
    d: 'Pod 的 restartPolicy 和重启次数',
  },
  'cloud-vulnerability-patch': {
    a: '关闭漏洞扫描器，让高危告警消失',
    b: '把漏洞报告标记已读，先搁置观望',
    c: '不做验证就直接全量升级所有依赖',
  },
  'cloud-government-compliance': {
    a: '把漏洞拖到等保测评前再集中处理',
    b: '多人共用一个管理员账号提高效率',
    c: '为节省存储空间关闭操作审计日志',
  },
  'cloud-storage-expansion': {
    a: '删掉云盘重新创建，指望容量自动扩上去',
    c: '重装业务应用，期望文件系统容量变大',
    d: '清空数据库数据来腾出磁盘空间',
  },
  'cloud-instance-retirement': {
    a: '下线后顺手把变更记录一并清掉',
    b: '确认不了依赖也先把实例释放掉',
    d: '改个主机名，标记成已下线就算完成',
  },
  'cloud-slb-vip-cutover': {
    a: '先把旧后端实例删掉腾出资源配额',
    c: '关闭健康检查，让失败实例也保持在线',
    d: '让用户多刷新几次浏览器重试一下',
  },
  'sre-slo-error-budget': {
    a: '关闭监控告警，先让页面安静下来',
    c: '继续加速发布所有新功能赶进度',
    d: '删除历史指标数据来释放存储',
  },
  'sre-postmortem-blameless': {
    a: '尽量隐藏事故影响范围不对外说',
    c: '删除现场所有证据避免被追查',
    d: '找到一个责任人出来背锅了事',
  },
  'sre-customer-acceptance': {
    a: '口头说一句"我感觉差不多了"',
    b: '只发一张桌面截图当作交付',
    c: '什么材料都不留，做完就走',
  },
  'sre-capacity-planning': {
    a: '只看当前 CPU 水位很低就放心',
    c: '等大促当天报警了再临时扩容',
    d: '无脑多买服务器堆资源就行',
  },
  'sre-incident-mitigate-first': {
    a: '只要服务恢复就不做事后复盘',
    b: '事故期间先把相关告警全部关掉',
    d: '先追查是谁的责任并立刻问责',
  },
  'sre-alert-actionable': {
    a: '通知越晚越好，免得打扰值班人',
    c: '告警数量越多覆盖越全越好',
    d: '只展示一个 CPU 使用率数值',
  },
  'sre-incident-communication': {
    a: '回一句"别催，正在看了"',
    c: '抛出大量还没验证的猜测原因',
    d: '完全保持沉默直到彻底修好',
  },
  'sre-onsite-industry-ops': {
    b: '不取证就直接归因为客户网络问题',
    c: '删除中断期间的历史采集数据',
    d: '只重启中心平台等数据自己回来',
  },
  'sre-log-platform': {
    a: '把所有日志堆到一个目录里不建索引',
    b: '让各服务随意定义自己的日志字段名',
  },
}

const staleAudio = new Set()
let changed = 0
const next = questions.map((q) => {
  const rw = distractorRewrites[q.id]
  if (!rw) return q
  changed++
  const answerSet = new Set(q.answer)
  const options = q.options.map((o) => {
    if (rw[o.id] && rw[o.id] !== o.text) {
      if (answerSet.has(o.id)) throw new Error(`refusing to rewrite correct option ${q.id}/${o.id}`)
      staleAudio.add(`${q.id}-option-${o.id}.mp3`)
      return { ...o, text: rw[o.id] }
    }
    return o
  })
  return { ...q, options }
})

const missing = Object.keys(distractorRewrites).filter((id) => !questions.some((q) => q.id === id))
if (missing.length) { console.error('未匹配到的 id:', missing); process.exit(1) }

fs.writeFileSync(QFILE, `export const questions = ${JSON.stringify(next, null, 2)};\n`)
let deleted = 0
for (const name of staleAudio) {
  const fp = path.join(AUDIO_DIR, name)
  if (fs.existsSync(fp)) { fs.rmSync(fp); deleted++ }
}
console.log(`已等长改写题目: ${changed}`)
console.log(`需失效的旧音频: ${staleAudio.size}，实际删除: ${deleted}`)
