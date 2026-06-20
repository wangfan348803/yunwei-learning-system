// Content patch for the network category (review Phase 2, batch 2).
// Same rules as patch-linux: add mnemonic to every question, strip recruitment
// filler / add mechanism to weak explanations, replace joke distractors with
// credible-but-wrong options. Correct-option text/prompts/titles untouched.
import fs from 'node:fs'
import path from 'node:path'

const QFILE = 'functions/_shared/questions.js'
const AUDIO_DIR = 'public/audio'
const { questions } = await import(`../${QFILE}`)

const patches = {
  'network-timeout-refused': {
    mnemonic: 'timeout=没回应(查链路/策略)；refused=有回应但端口没开(查监听)。',
  },
  'network-security-group-layering': {
    mnemonic: '端口不通逐层证：进程监听→主机防火墙→安全组/ACL→路由→客户端位置。',
    explanation:
      '排障要分层证明：进程是否监听、主机防火墙、云安全组/ACL、路由路径和客户端位置，逐层放通，不能一句"网络不通"混过去。',
    options: [
      { id: 'a', text: '默认网络都是通的，先去排查应用代码 bug' },
      { id: 'b', text: '服务本机是否监听目标端口' },
      { id: 'c', text: '从客户端、跳板机和同 VPC 位置分别测试' },
      { id: 'd', text: '主机防火墙、安全组、ACL 和路由是否放通' },
    ],
    wrongReasons: {
      a: '端口不通要先证明网络各层是否放通，跳过分层直接怀疑代码会漏掉安全组/防火墙等真实拦点。',
    },
  },
  'network-dns-authoritative-cache': {
    mnemonic: 'DNS 改了没全生效：TTL 内各级缓存仍握旧记录，等缓存过期或手动刷新。',
    explanation:
      'DNS 变更受 TTL、递归缓存、客户端缓存和权威记录影响。部分用户拿旧地址，通常是递归或客户端缓存还没过期，要区分权威查询和用户侧缓存。',
  },
  'network-tls-certificate': {
    mnemonic: '证书报错先看四样：有效期、SAN 域名、证书链、服务器时间。',
  },
  'network-http-502-upstream': {
    mnemonic: '502=网关连不上上游：查上游地址/端口/监听/健康，再看上游日志。',
  },
  'network-lb-healthcheck': {
    mnemonic: '实例频繁摘除看五样：探活路径、超时阈值、响应码、实例负载、网络抖动。',
    options: [
      { id: 'a', text: '直接重启全部后端实例，期望抖动自愈' },
      { id: 'b', text: '放宽或关闭健康检查，让实例不再被摘除' },
      { id: 'c', text: '给 SLB 加大带宽配额' },
      { id: 'd', text: '健康检查路径、超时阈值、后端响应码、实例负载和网络抖动' },
    ],
    wrongReasons: {
      a: '不定位根因直接重启，抖动会复发，还可能放大影响。',
      b: '放宽/关闭健康检查会让半健康实例继续接流量，是掩盖问题而非排查。',
      c: '频繁摘除是探活与实例健康问题，与 SLB 带宽配额无关。',
    },
  },
  'network-mtu-mss': {
    mnemonic: '小包通、大包/握手卡=MTU/MSS 黑洞，ping -M do -s 逐步试探。',
  },
  'network-nat-session': {
    mnemonic: '出口端口耗尽：连接复用+连接池，减少短连接，评估 NAT 会话容量。',
    explanation:
      '短连接会成倍增加 TCP/TLS 握手和 NAT 端口压力。连接复用和连接池能显著降低出口端口与会话消耗，是会话容量优化的主线。',
  },
  'network-device-config-backup': {
    mnemonic: '网络变更四保险：先备份、看 diff、备回滚、改后验证。',
    options: [
      { id: 'a', text: '准备回滚命令和远程断连应急方案' },
      { id: 'b', text: '变更前备份配置并记录差异' },
      { id: 'c', text: '改完直接保存生效，出问题再说' },
      { id: 'd', text: '变更后验证路由、ACL、会话和业务探活' },
    ],
    wrongReasons: {
      c: '不留备份和回滚、改完即生效，一旦出错无法快速恢复，可能造成大范围中断。',
    },
  },
  'network-zero-trust-access': {
    mnemonic: '临时访问最小化：限源 IP、限端口、限时间、留审计。',
    explanation:
      '临时访问要最小范围、最短时间、可审计：限定源地址和目标端口、设置时间窗口、保留审计记录，既能排障又不扩大暴露面。',
    options: [
      { id: 'a', text: '直接共享一个长期 VPN 账号给供应商' },
      { id: 'b', text: '对供应商来源放开全部端口图省事' },
      { id: 'c', text: '省去审计，直接给生产主机 SSH 权限' },
      { id: 'd', text: '限定源地址、目标端口、访问时间和审计记录' },
    ],
    wrongReasons: {
      a: '长期共享账号无法追责，离场后也难以及时回收。',
      b: '放开全部端口会暴露巨大攻击面，违背最小授权。',
      c: '跳过审计会丢失操作证据，事后无法追溯。',
    },
  },
  'network-packet-capture': {
    mnemonic: '抓包按五元组，在出口/入口/网关三点对比，定位丢在哪一段。',
    options: [
      { id: 'a', text: '在任意一台机器全量抓包再慢慢翻' },
      { id: 'b', text: '客户端出口、服务端入口或关键网关节点，按五元组过滤' },
      { id: 'c', text: '先清空防火墙规则看是否恢复' },
      { id: 'd', text: '只在客户端看应用层报错日志' },
    ],
    wrongReasons: {
      a: '不限位置和条件的全量抓包噪声极大，难以定位丢包段。',
      c: '未取证就清空规则风险过大，且无法证明丢在哪一层。',
      d: '应用层日志证明不了网络路径，要在链路关键点抓包对比。',
    },
  },
  'network-waf-403': {
    mnemonic: '请求没到应用却 403：先查 CDN/WAF/网关的拦截规则命中。',
  },

  // --- 30 basic networking questions: mnemonic only ---
  'network-basic-ip': { mnemonic: '看 IP 用 ip addr（ip a），取代老旧 ifconfig。' },
  'network-basic-ping': { mnemonic: 'ping 走三层 ICMP，验通断/丢包/时延。' },
  'network-basic-telnet': { mnemonic: '测端口通不通：telnet IP 端口，或 nc -zv。' },
  'network-basic-curl': { mnemonic: 'curl 调接口/测网站，看返回体和状态码。' },
  'network-basic-nslookup': { mnemonic: '查域名解析到哪个 IP：nslookup 或 dig。' },
  'network-basic-hosts': { mnemonic: '本地强制域名映射改 /etc/hosts，优先于外部 DNS。' },
  'network-basic-resolv': { mnemonic: '指定上游 DNS 改 /etc/resolv.conf 的 nameserver。' },
  'network-basic-dns-port': { mnemonic: 'DNS 端口 53：UDP 为主，大包走 TCP。' },
  'network-basic-http-port': { mnemonic: 'HTTP=80，HTTPS=443，记牢这一对。' },
  'network-basic-https-port': { mnemonic: 'HTTPS=443（TLS 加密）；80 是明文 HTTP。' },
  'network-basic-dhcp': { mnemonic: '自动发 IP/网关/DNS 的协议是 DHCP。' },
  'network-basic-loopback': { mnemonic: '127.0.0.1 是回环 localhost，包不出网卡。' },
  'network-basic-private-range': { mnemonic: '私有段三块：10/8、172.16-31、192.168/16。' },
  'network-basic-tcp-udp-diff': { mnemonic: 'TCP=面向连接可靠重传；UDP=快但不保证到达。' },
  'network-basic-gateway': { mnemonic: '默认网关=出本网段时找它转发（下一跳）。' },
  'network-basic-traceroute': { mnemonic: 'traceroute 看每一跳路由；ping 只看通断。' },
  'network-basic-mac': { mnemonic: 'MAC=网卡出厂烧录的 48 位物理地址。' },
  'network-basic-ssh-port': { mnemonic: 'SSH=22，Telnet=23（明文，别用）。' },
  'network-basic-ftp-port': { mnemonic: 'FTP 控制口 21，数据口 20。' },
  'network-basic-cidr': { mnemonic: '/24=255.255.255.0；/16、/8 依次少一段 255。' },
  'network-basic-nat': { mnemonic: 'NAT=内网私有 IP 与公网 IP 互转，省公网地址。' },
  'network-basic-arp': { mnemonic: 'ARP=已知 IP 求 MAC；DNS=域名求 IP。' },
  'network-basic-firewalld': { mnemonic: 'firewalld 放行：--permanent --add-port=80/tcp 再 --reload。' },
  'network-basic-subnet-mask': { mnemonic: '子网掩码=划分 IP 的网络位和主机位，判断是否同网段。' },
  'network-basic-tcpdump': { mnemonic: '抓包标准工具 tcpdump，配过滤表达式。' },
  'network-basic-osi': { mnemonic: 'OSI 七层：物链网传会示应；TCP/IP 是四层。' },
  'network-basic-packet-loss': { mnemonic: '丢包=数据包中途被丢，没到对端。' },
  'network-basic-icmp': { mnemonic: 'ping 靠 ICMP（差错/探测），不是 TCP。' },
  'network-basic-vpn': { mnemonic: 'VPN=公网上的加密隧道，传私有数据。' },
  'network-basic-mtu': { mnemonic: '以太网默认 MTU=1500，超了要分片。' },
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
if (missing.length) {
  console.error('未匹配到的 id:', missing)
  process.exit(1)
}

fs.writeFileSync(QFILE, `export const questions = ${JSON.stringify(next, null, 2)};\n`)
let deleted = 0
for (const name of staleAudio) {
  const fp = path.join(AUDIO_DIR, name)
  if (fs.existsSync(fp)) { fs.rmSync(fp); deleted++ }
}
console.log(`已改写 network 题目: ${changed}`)
console.log(`需失效的旧音频: ${staleAudio.size}，实际删除: ${deleted}`)
console.log([...staleAudio].sort().join('\n'))
