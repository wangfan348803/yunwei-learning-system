// Content patch for the cloud category (review Phase 2, batch 3).
import fs from 'node:fs'
import path from 'node:path'

const QFILE = 'functions/_shared/questions.js'
const AUDIO_DIR = 'public/audio'
const { questions } = await import(`../${QFILE}`)

const patches = {
  'cloud-vpc-migration': {
    mnemonic: '迁移五步：梳依赖→备份→灰度切流→验路由/安全组/SLB→留回滚窗口。',
    explanation: '迁移不是点控制台，而是把网络、数据、依赖、验证和回滚收进流程：先梳理依赖、备份，再灰度切流并逐项验证，最后保留回滚窗口。',
    options: [
      { id: 'a', text: '迁移当晚一次性全量切流，不留灰度' },
      { id: 'b', text: '只改入口 IP，不同步上下游依赖' },
      { id: 'c', text: '梳理依赖、备份、灰度切流、验证路由/安全组/SLB、保留回滚窗口' },
      { id: 'd', text: '切流成功就立即删除旧资源释放成本' },
    ],
    wrongReasons: {
      a: '一次性全量切流没有灰度和回滚缓冲，出问题影响面最大。',
      b: '只改 IP 会漏掉依赖、路由和安全组，上下游可能直接中断。',
      d: '立即删除旧资源会失去回滚入口，问题暴露时无法快速退回。',
    },
  },
  'cloud-iam-ram-policy': {
    mnemonic: '临时授权：限项目、限时间、只读、留审计；绝不发 AK 或给主账号。',
    explanation: '最小权限、临时授权和审计记录能兼顾排障效率和安全边界：限定项目、限定时间、只读日志权限并保留审计。',
    options: [
      { id: 'a', text: '把长期 AccessKey 直接发给外包同学' },
      { id: 'b', text: '限定项目、限定时间、只读日志权限，并保留审计' },
      { id: 'c', text: '图省事直接授予全局管理员权限' },
      { id: 'd', text: '把主账号密码临时借给对方使用' },
    ],
    wrongReasons: {
      a: '长期 AK 外发易泄露且难回收，权限也远超只读日志所需。',
      c: '全局管理员远超排查日志范围，违反最小授权。',
      d: '主账号是最高权限且不可共享，借出无法追责。',
    },
  },
  'cloud-slb-vip-cutover': {
    mnemonic: '切流后按路径验：DNS/VIP 指向→后端健康→权重→监听→安全组→探活。',
    options: [
      { id: 'a', text: '先把旧后端实例删掉腾出资源' },
      { id: 'b', text: 'DNS/VIP 指向、SLB 后端健康、权重、监听端口、安全组和业务探活' },
      { id: 'c', text: '关闭健康检查让失败实例也保持在线' },
      { id: 'd', text: '让用户多刷新几次浏览器重试' },
    ],
    wrongReasons: {
      a: '删除旧实例会失去回滚空间，切换失败就无法退回。',
      c: '关闭健康检查会让坏实例继续接流量，扩大故障。',
      d: '刷新浏览器证明不了入口链路和后端健康。',
    },
  },
  'cloud-backup-restore-drill': {
    mnemonic: '备份成功≠能恢复，要定期恢复演练验完整性和 RTO/RPO。',
    options: [
      { id: 'a', text: '没有风险，备份成功就一定能恢复' },
      { id: 'b', text: '不能证明数据完整、权限正确、版本兼容、RTO/RPO 达标' },
      { id: 'c', text: '把每日备份保留期缩短到 1 天省空间' },
      { id: 'd', text: '只要备份任务状态为成功就放心' },
    ],
    wrongReasons: {
      a: '备份成功和恢复成功之间还有完整性、权限、版本和时间等很多风险。',
      c: '缩短保留期会减少可回退的时间点，遇到延迟发现的故障无法恢复。',
      d: '任务成功只代表生成了文件，不能证明能恢复出可用数据。',
    },
  },
  'cloud-vulnerability-patch': {
    mnemonic: '修漏闭环：定影响→测试验证→灰度→复扫。',
    options: [
      { id: 'a', text: '关闭漏洞扫描器让告警消失' },
      { id: 'b', text: '把漏洞报告标记已读先放着' },
      { id: 'c', text: '直接全量升级所有依赖' },
      { id: 'd', text: '确认影响范围，测试环境验证补丁，安排窗口灰度修复并复扫' },
    ],
    wrongReasons: {
      a: '关掉扫描器只是看不到风险，漏洞仍然存在。',
      b: '标记已读不等于修复，高危漏洞会持续暴露。',
      c: '未验证就全量升级可能造成业务不可用。',
    },
  },
  'cloud-cost-capacity': {
    mnemonic: '降本不砍 SLA：清闲置(低利用/闲盘/空 IP)+按峰值调规格。',
    options: [
      { id: 'a', text: '变更前通知业务并保留回滚方案' },
      { id: 'b', text: '结合峰值、SLA 和扩容时间调整规格或购买策略' },
      { id: 'c', text: '识别低利用率实例、闲置磁盘、未使用公网 IP 和过大规格' },
      { id: 'd', text: '为压成本直接调低生产库规格且不做评估' },
    ],
    wrongReasons: {
      d: '不评估就压低生产库规格可能触发性能瓶颈甚至故障，违背不破坏 SLA 的前提。',
    },
  },
  'cloud-cmdb-assets': {
    mnemonic: '资源变更必同步台账：实例/盘/IP/SLB/库+责任人+拓扑。',
  },
  'cloud-government-compliance': {
    mnemonic: '合规四件套：审批、最小权限、留审计、漏洞基线闭环。',
    explanation: '政务云强调等保、审计、安全加固和报告：操作走审批、权限最小化、关键操作留审计、漏洞和基线形成闭环，稳定性之外还要可追溯。',
    options: [
      { id: 'a', text: '漏洞等审计前再处理' },
      { id: 'b', text: '多人共用一个管理员账号图效率' },
      { id: 'c', text: '为省存储关闭操作审计日志' },
      { id: 'd', text: '操作走审批，权限最小化，关键操作留审计，漏洞和基线形成闭环报告' },
    ],
    wrongReasons: {
      a: '漏洞拖到审计前才处理会长期暴露风险，不符合闭环要求。',
      b: '共用账号无法定位到人，破坏责任追溯，违反等保要求。',
      c: '关闭审计会让关键操作不可追溯，直接违规。',
    },
  },
  'cloud-datacenter-inspection': {
    mnemonic: '机房巡检四面：硬件、环境(电/温/UPS/消防)、资产、变更一致。',
    options: [
      { id: 'a', text: '服务器硬件告警、磁盘阵列、存储链路和备件' },
      { id: 'b', text: '只远程看监控大盘绿不绿' },
      { id: 'c', text: '资产标签、端口连接、上架下架记录和变更单一致性' },
      { id: 'd', text: '机柜电力、温湿度、UPS、空调和消防环境' },
    ],
    wrongReasons: {
      b: '只看大盘颜色会漏掉硬件、环境和资产层的隐患，巡检要逐项核实。',
    },
  },
  'cloud-storage-expansion': {
    mnemonic: '云盘扩容两步：控制台扩→OS 内 growpart + resize2fs/xfs_growfs。',
    options: [
      { id: 'a', text: '删掉云盘重建，以为能扩上去' },
      { id: 'b', text: '确认分区和文件系统类型，执行对应 growpart/resize2fs/xfs_growfs' },
      { id: 'c', text: '重装业务应用，期望容量变大' },
      { id: 'd', text: '清空数据库腾出空间' },
    ],
    wrongReasons: {
      a: '删除云盘会丢数据，且扩容根本不需要重建。',
      c: '应用重装不动文件系统，容量依然没变。',
      d: '清空数据库是破坏性操作，与文件系统扩容无关。',
    },
  },
  'cloud-instance-retirement': {
    mnemonic: '下线先证无依赖：无流量/任务/数据依赖，再备份/摘监控/擦数据。',
    explanation: '下线是高风险操作，必须先证明没有业务依赖，再处理数据、监控、资产和审计：确认无流量、无定时任务、无数据依赖，备份归档、摘除监控并擦除数据。',
    options: [
      { id: 'a', text: '下线后顺手清掉变更记录' },
      { id: 'b', text: '确认不了依赖就直接释放实例' },
      { id: 'c', text: '确认无流量、无定时任务、无数据依赖、备份归档、监控摘除和数据擦除' },
      { id: 'd', text: '改个主机名标记为已下线' },
    ],
    wrongReasons: {
      a: '删除变更记录会破坏审计，事后无法追溯下线过程。',
      b: '未证明无依赖直接释放，可能中断隐藏的上下游调用。',
      d: '改主机名不等于真正下线，资源、监控和数据都还在。',
    },
  },
  'cloud-multi-az-dr': {
    mnemonic: '跨 AZ 高可用：入口/计算/数据/缓存/消息/配置都要能切换+演练。',
  },

  // --- 30 basic cloud questions: mnemonic only ---
  'cloud-basic-vm': { mnemonic: '云上弹性虚拟服务器叫实例(Instance)。' },
  'cloud-basic-sg': { mnemonic: '安全组=作用于网卡的虚拟防火墙(进出端口白名单)。' },
  'cloud-basic-vpc': { mnemonic: 'VPC=云上隔离的私有网络，自划子网和路由。' },
  'cloud-basic-oss': { mnemonic: '海量图片/视频/包用对象存储(OSS/S3)，便宜高可用。' },
  'cloud-basic-az': { mnemonic: '可用区(AZ)=同地域内电力网络独立的机房，跨 AZ 容灾。' },
  'cloud-basic-snapshot': { mnemonic: '升级前先打快照(Snapshot)，失败可秒级回滚。' },
  'cloud-basic-rds': { mnemonic: 'RDS=托管数据库：自动备份+高可用+免运维补丁。' },
  'cloud-basic-billing': { mnemonic: '两种计费：包年包月(稳定)、按量付费(弹性)。' },
  'cloud-basic-iam': { mnemonic: '子账号分权用 IAM/RAM。' },
  'cloud-basic-elastic-ip': { mnemonic: 'EIP=可独立购买、随时解绑重绑到任意实例的公网 IP。' },
  'cloud-basic-slb': { mnemonic: '流量分发到多台后端用负载均衡(SLB/ALB)。' },
  'cloud-basic-cdn': { mnemonic: '静态资源全球加速用 CDN(边缘节点就近)。' },
  'cloud-basic-ha': { mnemonic: '防整机房断电=跨多 AZ 双活部署。' },
  'cloud-basic-autoscaling': { mnemonic: '按 CPU 水位自动增减实例=弹性伸缩(Auto Scaling)。' },
  'cloud-basic-monitor': { mnemonic: '云内置资源监控=云监控/CloudWatch。' },
  'cloud-basic-bucket': { mnemonic: '对象存储的顶级容器叫桶(Bucket)，名字全局唯一。' },
  'cloud-basic-hybrid': { mnemonic: '本地私有云+公有云混用=混合云(Hybrid)。' },
  'cloud-basic-serverless': { mnemonic: '只传函数代码、按调用付费=Serverless/FaaS。' },
  'cloud-basic-metadata': { mnemonic: '云内取实例元数据：169.254.169.254。' },
  'cloud-basic-storage-tier': { mnemonic: '冷数据长期归档选归档/冷存储，最便宜但取数慢。' },
  'cloud-basic-shared-responsibility': { mnemonic: '责任共担：云厂商管机房和底层虚拟化，客户管 OS/数据/权限/代码。' },
  'cloud-basic-ebs': { mnemonic: '能挂载装系统的本地盘=块存储/云盘(EBS)。' },
  'cloud-basic-nat-gateway': { mnemonic: '内网机出外网用 NAT 网关(SNAT)，外面进不来。' },
  'cloud-basic-vpn-gateway': { mnemonic: '不拉专线打通办公室到 VPC，用 VPN 网关(IPsec)。' },
  'cloud-basic-migration': { mnemonic: '原样平移上云=Lift and Shift/Rehost。' },
  'cloud-basic-audit': { mnemonic: '查谁调了哪个云 API 看云审计(CloudTrail/ActionTrail)。' },
  'cloud-basic-accesskey': { mnemonic: '调云 API 用 AK/SK：AK 标识身份，SK 签名。' },
  'cloud-basic-dns-route53': { mnemonic: '云智能 DNS：健康检查+地理就近+权重切流。' },
  'cloud-basic-directconnect': { mnemonic: '极严苛低延迟内网互联拉物理专线(Direct Connect)。' },
  'cloud-basic-paas': { mnemonic: '免运维 OS、直接拿运行平台=PaaS。' },
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
console.log(`已改写 cloud 题目: ${changed}`)
console.log(`需失效的旧音频: ${staleAudio.size}，实际删除: ${deleted}`)
