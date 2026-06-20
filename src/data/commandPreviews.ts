export interface CommandToken {
  text: string
  type: 'command' | 'option' | 'argument' | 'operator'
  description: string
}

export interface CommandPreview {
  tokens: CommandToken[]
  output: string
}

const toolDescriptions: Record<string, string> = {
  tar: 'tape archive 归档工具，用于对文件目录进行打包、压缩或解压提取',
  ls: 'list directory contents 列出目录下的文件和子目录列表信息',
  df: 'disk free 磁盘空间使用率报告工具，展示挂载文件系统的数据容量与 inode 占比',
  du: 'disk usage 磁盘占用量统计评估工具，递归汇总目录及文件的真实大小',
  ss: 'socket statistics 套接字统计工具，用于分析 TCP/UDP 监听状态及网络连接数',
  netstat: 'network statistics 网络统计看板，查看端口占用、连接会话和路由表信息',
  systemctl: 'systemd 管理客户端，控制服务 Unit 的启停、开机自启与配置加载状态',
  kubectl: 'Kubernetes 命令行集群控制客户端，负责管理和检索 K8s 的各类资源对象',
  docker: 'Docker 容器引擎客户端，控制容器生命周期、查看资源指标与读取内部日志',
  grep: 'global regular expression print 文本行正则过滤检索工具，提取匹配模式的内容',
  chmod: 'change mode 变更文件或目录的读取、写入、执行 (rwx) 安全访问权限',
  chown: 'change owner 变更文件或目录的所有者 (owner) 与所属用户组 (group)',
  find: '文件系统深度检索器，支持按文件名、大小、时间、类型过滤查找指定文件',
  curl: '命令行数据传输工具，发起 HTTP 请求访问网页或 API，并输出返回包内容',
  ping: '网络连通性探测工具，利用 ICMP 请求响应机制测算网路延迟和丢包率',
  openssl: 'SSL/TLS 加密诊断工具，用于测试证书握手过程、提取证书链和查看过期时间',
  dig: 'domain information groper DNS 域名详细解析工具，支持追踪根域迭代解析路径',
  nc: 'netcat 网络网络调试瑞士军刀，支持测试远程端口可达性、端口监听和数据传输',
  journalctl: 'systemd 日志库查询工具，检索 OS 内核、系统服务及单元的历史运行日志',
  free: '系统内存资源查看工具，展示物理内存与 Swap 分区的空闲、已用和缓存容量',
  top: '实时动态系统资源监控看板，跟踪进程 CPU/内存使用率及系统平均负载',
  iostat: 'I/O statistics 磁盘读写负载分析工具，监控磁盘吞吐量与 %util 使用率',
  logrotate: '系统日志自动轮转清理器，定时完成日志的切割、旧日志压缩和超期清理',
  visudo: 'sudoers 配置文件专用安全编辑器，保存前会自动做严格的语法合规性检查',
  last: '显示系统最近的用户登录历史记录及开机重启事件',
  ausearch: '审计系统日志查询工具，检索 Linux Audit 安全审计系统记录的安全事件',
  conntrack: 'Linux 连接跟踪表管理工具，展示 Netfilter 框架在内核记录的所有连接状态',
  tcpdump: 'Linux 命令行抓包与协议解析分析器，能实时捕获并解构指定网卡的网络报文',
  lsblk: 'list block devices 列出所有可用块设备(磁盘分区、逻辑卷)的层级与挂载点',
  growpart: '扩展物理分区表以覆盖磁盘空余空间的工具，常用于分区热扩容',
  resize2fs: 'ext2/ext3/ext4 文件系统容量热调整工具，使扩容的分区生效',
  xfs_growfs: 'XFS 文件系统容量在线挂载扩容工具，用于将分区增长应用至 XFS 系统',
  helm: 'Kubernetes 的包管理客户端，负责 Helm Chart 应用的部署、历史管理与回滚',
  'ansible-playbook': 'Ansible 自动化配置剧本执行器，基于 SSH 批量编编管理远程主机',
  explain: 'SQL 查询计划剖析工具，展示数据库查询引擎预期的解析方式与成本估算',
  analyze: '配合 EXPLAIN 实际运行 SQL 并打印物理扫描的精确耗时与内存使用情况',
  info: 'Redis 服务器实时运行状态、内存碎片、连接计数与持久化状态查询命令',
  gzip: 'GNU zip 单个文件压缩/解压缩工具',
  zip: 'ZIP 格式多文件压缩与归档工具',
}

const flagDecoders: Record<string, Record<string, string>> = {
  tar: {
    c: '创建新归档包 (create)',
    x: '解压/提取归档包 (extract)',
    z: '使用 gzip 格式进行压缩或解压 (gzip)',
    j: '使用 bzip2 格式进行压缩或解压 (bzip2)',
    v: '显示详细的打包/解包进度与文件列表 (verbose)',
    f: '指定要操作的归档文件名 (file)',
    t: '列出归档文件内的文件目录清单 (list)',
  },
  ls: {
    a: '列出所有文件，包括以 `.` 开头的隐藏文件 (all)',
    l: '长格式显示，输出文件权限、属主、大小和修改时间等详情 (long)',
    h: '配合 `-l`，以人类易读单位 (如 K, M, G) 显示文件大小 (human-readable)',
    t: '按修改时间从新到旧排序 (time sort)',
    r: '反转排序顺序，如逆序排列文件 (reverse)',
    R: '递归列出所有子目录中的文件 (recursive)',
  },
  df: {
    h: '以人类易读单位 (如 GB, MB) 显示分区容量与空闲大小 (human-readable)',
    i: '显示 inode 索引节点使用数量及占比，而非显示数据块容量 (inodes)',
    T: '在输出结果中额外打印文件系统类型 (如 xfs, ext4) (type)',
  },
  du: {
    s: '仅显示目录总计大小，不列出每一级子目录的明细占用 (summary)',
    h: '以人类易读单位 (如 KB, MB, GB) 显示大小 (human-readable)',
    a: '同时估算文件和目录的大小，默认仅列出目录大小 (all files)',
  },
  ss: {
    l: '仅显示监听状态 (LISTEN) 的套接字连接 (listen)',
    n: '以纯数字形式显示地址与端口号，禁用反向 DNS 域名解析 (numeric)',
    t: '仅显示 TCP 协议套接字连接 (tcp)',
    u: '仅显示 UDP 协议套接字连接 (udp)',
    p: '输出套接字关联的进程 PID 与可执行程序名称 (process)',
    a: '显示所有状态下的连接套接字 (监听与已连接) (all)',
    s: '输出连接计数总结摘要 (summary)',
  },
  netstat: {
    l: '仅显示监听状态 (LISTEN) 的连接端口 (listen)',
    n: '以数字格式输出 IP 地址与端口号，不进行反向解析 (numeric)',
    t: '仅筛选 TCP 协议网络连接 (tcp)',
    u: '仅筛选 UDP 协议网络连接 (udp)',
    p: '显示关联的进程 PID 及名称，需 sudo/root 权限 (process)',
    a: '显示所有连接套接字 (all)',
    s: '显示各协议统计的摘要面板 (summary)',
  },
  systemctl: {
    cat: '查看服务单元对应的完整原始 Unit 配置文件内容',
    show: '展示服务单元在 systemd 内核中记录的所有属性与具体参数',
    status: '查看目标服务当前的活动状态 (active/inactive) 与最近日志',
    list_timers: '列出系统中当前被激活的所有定时器 (Timer) 状态',
  },
  kubectl: {
    describe: '深入检索 Kubernetes 资源的运行状态、详情及历史事件 (Events)',
    get: '列出并简要展现 K8s 资源的状态表格',
    logs: '检索并输出容器的标准输出与标准错误日志',
    top: '实时获取集群内 Pod 或 Node 的 CPU/内存资源利用指标',
  },
  docker: {
    logs: '获取并输出 Docker 容器运行时内部打印的日志',
    inspect: '审查容器、镜像的底层 JSON 配置元数据与详细环境变量',
    stats: '实时动态输出各个容器的 CPU、内存限制及 I/O 资源用量',
  },
  grep: {
    i: '忽略匹配字符的大小写差异 (ignore case)',
    v: '反向选择，仅输出不匹配指定搜索条件的行 (invert match)',
    n: '在输出结果前加上该行在原始文件中的行号 (line number)',
    r: '递归检索，遍历指定目录下所有子文件夹中的文件 (recursive)',
    E: '启用扩展正则表达式匹配模式 (extended regex)',
  },
  curl: {
    v: '详细模式，输出完整的 HTTP 握手、请求头与返回头信息 (verbose)',
    s: '静默模式，不输出请求下载进度条和常规连接信息 (silent)',
    o: '将服务器响应的内容保存写入到指定本地文件中 (output)',
    I: '仅获取 HTTP 响应报文头 (HEAD 请求)，不下载网页实体 (head)',
    L: '当遇到 HTTP 3xx 重定向时，自动跟随跳转到新 URL 页面 (location)',
    k: '跳过 SSL 安全证书的可信校验证书 (insecure)',
  },
  ping: {
    c: '指定发送 ICMP 探测数据包的次数，达到后自动终止退出 (count)',
    s: '指定 ICMP 报文中的数据负载字节数 (size)',
    i: '指定每次发送探测包的时间间隔秒数 (interval)',
    M: '探测路径上的 MTU 大小，`do` 表示设置 DF 标志位禁止分片 (MTU)',
  },
}

function decodeOption(cmdName: string, optionStr: string): string {
  const cleanCmd = cmdName.toLowerCase()
  const hasDash = optionStr.startsWith('-')
  const cleanOpt = optionStr.replace(/^-+/, '')

  // If long option, e.g. --previous
  if (optionStr.startsWith('--')) {
    if (cleanCmd === 'kubectl' && cleanOpt === 'previous') {
      return '选项参数：查看上一个已退出容器的历史日志，用以定位 CrashReason (previous)'
    }
    if (cleanCmd === 'kubectl' && cleanOpt === 'show-labels') {
      return '选项参数：在资源表格输出中，额外附带展示该资源的所有 Labels 标签'
    }
    if (cleanCmd === 'ansible-playbook' && cleanOpt === 'check') {
      return '选项参数：试运行演练模式 (Dry Run)，只模拟语法与配置变更，不真正执行下发'
    }
    if (cleanOpt === 'recursive') {
      return '选项参数：递归操作参数，自动对当前目录下所有深层子目录及文件递归生效'
    }
    return `选项参数：控制行为的配置选项 \`${optionStr}\``
  }

  // If short option group (e.g. -lntp, -czvf, -xe)
  if (hasDash && cleanOpt.length > 0) {
    const decoder = flagDecoders[cleanCmd]
    if (decoder) {
      const descriptions: string[] = []
      for (const char of cleanOpt) {
        if (decoder[char]) {
          descriptions.push(decoder[char])
        }
      }
      if (descriptions.length > 0) {
        return `组合参数解释：${descriptions.join('；')}`
      }
    }
  }

  // General fallbacks
  if (optionStr.startsWith('-')) {
    return `选项参数：修改命令作用范围与执行行为的参数标志 \`${optionStr}\``
  }
  return `目标参数或文件对象 \`${optionStr}\``
}

export const commandPreviews: Record<string, CommandPreview> = {
  'journalctl -u nginx -xe': {
    tokens: [
      { text: 'journalctl', type: 'command', description: 'systemd 日志管理查询服务，集中查看和检索 OS 系统及各服务的历史日志' },
      { text: '-u', type: 'option', description: '限制仅查询指定 Unit (服务单元)' },
      { text: 'nginx', type: 'argument', description: '指定过滤的服务单元名称为 nginx' },
      { text: '-x', type: 'option', description: '在日志输出中增加解释性说明文本，显示问题的目录结构或排查提示' },
      { text: '-e', type: 'option', description: '直接跳转到日志流末尾，即立即查看最新的日志记录' }
    ],
    output: `[root@localhost ~]# journalctl -u nginx -xe
-- Support: https://lists.freedesktop.org/mailman/listinfo/systemd-devel
--
-- The unit nginx.service has begun starting up.
Jun 02 19:10:00 server nginx[1234]: nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
Jun 02 19:10:00 server nginx[1234]: nginx: configuration file /etc/nginx/nginx.conf test failed
Jun 02 19:10:01 server systemd[1]: nginx.service: Control process exited, code=exited, status=1/FAILURE
-- Subject: Unit nginx.service has failed
-- Defined-By: systemd
-- Support: https://lists.freedesktop.org/mailman/listinfo/systemd-devel
--
-- Unit nginx.service has failed.`
  },
  'set -euo pipefail': {
    tokens: [
      { text: 'set', type: 'command', description: 'shell 内置命令，用于改变 shell 脚本的执行环境与行为' },
      { text: '-e', type: 'option', description: '一旦发生非零退出状态的命令错误，脚本执行立即终止退出' },
      { text: '-u', type: 'option', description: '如果在执行中引用了未初始化的变量，报告未定义错误并立即退出' },
      { text: '-o', type: 'option', description: '改变 shell 环境变量的开关，开启或关闭某项配置参数' },
      { text: 'pipefail', type: 'argument', description: '管道中任意环节出错(返回值非0)，整个管道流水线即判定失败并返回该错误' }
    ],
    output: `[root@localhost ~]# cat test.sh
#!/bin/bash
set -euo pipefail
non_exist_command | echo "hello"
echo "this line will not run"

[root@localhost ~]# ./test.sh
bash: non_exist_command: command not found...
# 脚本立刻终止退出，没有任何其他输出`
  },
  'df -h && df -i && du -sh /* 2>/dev/null': {
    tokens: [
      { text: 'df', type: 'command', description: 'disk free 磁盘空间使用率报告工具，展示挂载文件系统的数据容量与 inode 占比' },
      { text: '-h', type: 'option', description: '以人类可读的格式(如 GB, MB)显示分区容量与空闲大小 (human-readable)' },
      { text: '&&', type: 'operator', description: '逻辑与操作符，前一个命令成功执行后才执行下一个' },
      { text: 'df', type: 'command', description: 'disk free 磁盘空间使用率报告工具，展示挂载文件系统的数据容量与 inode 占比' },
      { text: '-i', type: 'option', description: '显示 inode 索引节点使用数量及占比，而非显示数据块容量 (inodes)' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'du', type: 'command', description: 'disk usage 磁盘占用量统计评估工具，递归汇总目录及文件的真实大小' },
      { text: '-sh', type: 'option', description: '组合参数解释：仅显示目录总计大小 (s)；以人类可读格式显示 (h)' },
      { text: '/*', type: 'argument', description: '对根目录下的所有子目录 and 文件进行评估' },
      { text: '2>/dev/null', type: 'operator', description: '将标准错误(fd=2)重定向到空设备(忽略权限不足等报错)' }
    ],
    output: `[root@localhost ~]# df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        50G   48G  2.0G  96% /
tmpfs           3.9G     0  3.9G   0% /dev/shm

[root@localhost ~]# df -i
Filesystem      Inodes  IUsed   IFree IUse% Mounted on
/dev/vda1      3276800 3276800       0  100% /
tmpfs           998246      1  998245   1% /dev/shm

[root@localhost ~]# du -sh /* 2>/dev/null
8.5G    /usr
12G     /var
20G     /data
2.2G    /home`
  },
  'top && iostat -x 1': {
    tokens: [
      { text: 'top', type: 'command', description: '实时动态系统资源监控看板，跟踪进程 CPU/内存使用率及系统平均负载' },
      { text: '&&', type: 'operator', description: '逻辑与操作符，前驱命令退出后执行后继命令' },
      { text: 'iostat', type: 'command', description: '磁盘读写负载分析工具，监控磁盘吞吐量与 %util 使用率' },
      { text: '-x', type: 'option', description: '显示详细的磁盘扩展统计数据(包括 %util, await 等)' },
      { text: '1', type: 'argument', description: '采样间隔为 1 秒，持续刷新输出' }
    ],
    output: `[root@localhost ~]# iostat -x 1
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.50    0.00    5.00   45.20    0.00   47.30

Device            r/s     w/s     rkB/s     wkB/s   await  svctm  %util
vda             120.0   250.0    2048.0    4096.0   38.50   2.50  87.50
# %util 接近 100% 且 await 高，表示磁盘遭遇严重 I/O 瓶颈`
  },
  'ss -lntp | grep :8080': {
    tokens: [
      { text: 'ss', type: 'command', description: 'socket statistics 套接字统计工具，用于分析 TCP/UDP 监听状态及网络连接数' },
      { text: '-lntp', type: 'option', description: '组合参数解释：仅显示监听状态 (l)；以数字格式显示 (n)；仅 TCP 连接 (t)；显示进程 PID/程序名 (p)' },
      { text: '|', type: 'operator', description: '管道符，将左侧命令的输出作为右侧命令的输入' },
      { text: 'grep', type: 'command', description: 'global regular expression print 文本行正则过滤检索工具，提取匹配内容' },
      { text: ':8080', type: 'argument', description: '匹配包含 :8080 的行(即过滤 8080 端口)' }
    ],
    output: `[root@localhost ~]# ss -lntp | grep :8080
LISTEN   0    128   0.0.0.0:8080   0.0.0.0:*   users:(("java",pid=9527,fd=12))
# 可以清楚地看到 Java 进程 (PID=9527) 正在监听 8080 端口`
  },
  'nc -vz <host> <port>': {
    tokens: [
      { text: 'nc', type: 'command', description: 'netcat 网络网络调试瑞士军刀，支持测试远程端口可达性、端口监听和数据传输' },
      { text: '-v', type: 'option', description: '显示详细的输出信息 (verbose)' },
      { text: '-z', type: 'option', description: '仅进行端口扫描/检测，不发送任何数据' },
      { text: '<host>', type: 'argument', description: '目标主机 IP 地址或域名' },
      { text: '<port>', type: 'argument', description: '目标主机的端口号' }
    ],
    output: `[root@localhost ~]# nc -vz 10.0.0.15 3306
Connection to 10.0.0.15 3306 port [tcp/mysql] succeeded!
[root@localhost ~]# nc -vz 10.0.0.15 80
nc: connect to 10.0.0.15 port 80 (tcp) failed: Connection refused`
  },
  'ss -lntp && nc -vz <host> <port>': {
    tokens: [
      { text: 'ss', type: 'command', description: 'socket statistics 套接字统计工具，显示本地端口状态' },
      { text: '-lntp', type: 'option', description: '组合参数解释：仅显示监听状态 (l)；以数字格式显示 (n)；仅 TCP 连接 (t)；显示进程 PID/程序名 (p)' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'nc', type: 'command', description: 'netcat 网络调试工具' },
      { text: '-v', type: 'option', description: '显示详细的连接输出 (verbose)' },
      { text: '-z', type: 'option', description: '仅测试连接，不发送数据' },
      { text: '<host>', type: 'argument', description: '测试的目标主机' },
      { text: '<port>', type: 'argument', description: '测试的目标端口' }
    ],
    output: `[root@localhost ~]# ss -lntp
State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port   Process
LISTEN   0        128            0.0.0.0:80          0.0.0.0:*       users:(("nginx",pid=1024,fd=6))

[root@localhost ~]# nc -vz 192.168.1.100 80
Connection to 192.168.1.100 80 port [tcp/http] succeeded!`
  },
  'dig @8.8.8.8 example.com && dig +trace example.com': {
    tokens: [
      { text: 'dig', type: 'command', description: 'domain information groper DNS 域名详细解析工具，支持追踪根域迭代解析路径' },
      { text: '@8.8.8.8', type: 'option', description: '指定使用谷歌公共 DNS 服务器 (8.8.8.8) 进行解析' },
      { text: 'example.com', type: 'argument', description: '待查询的目标域名' },
      { text: '&&', type: 'operator', description: '逻辑与，前一条成功后执行下一条' },
      { text: 'dig', type: 'command', description: 'DNS 解析查询工具' },
      { text: '+trace', type: 'option', description: '从根域开始进行迭代查询全路径追踪' },
      { text: 'example.com', type: 'argument', description: '待追踪的目标域名' }
    ],
    output: `[root@localhost ~]# dig @8.8.8.8 example.com
;; ANSWER SECTION:
example.com.      86400   IN      A       93.184.216.34

[root@localhost ~]# dig +trace example.com
.                       518400  IN      NS      a.root-servers.net.
com.                    172800  IN      NS      a.gtld-servers.net.
example.com.            172800  IN      NS      a.iana-servers.net.
;; Received 397 bytes from 192.5.6.30#53(a.iana-servers.net) in 48 ms`
  },
  'openssl s_client -connect example.com:443 -servername example.com': {
    tokens: [
      { text: 'openssl', type: 'command', description: 'openssl SSL/TLS 加密诊断工具，用于测试证书握手过程' },
      { text: 's_client', type: 'argument', description: '启动一个 SSL/TLS 客户端连接连接到远程服务端' },
      { text: '-connect', type: 'option', description: '指定要建立 SSL/TLS 握手的目标地址与端口' },
      { text: 'example.com:443', type: 'argument', description: '域名以及 HTTPS 端口(443)' },
      { text: '-servername', type: 'option', description: '启用 SNI (服务器名称指示)，传递目标主机名以匹配证书' },
      { text: 'example.com', type: 'argument', description: '在 SNI 中声明的服务器域名' }
    ],
    output: `[root@localhost ~]# openssl s_client -connect example.com:443 -servername example.com
CONNECTED(00000003)
depth=1 C = US, O = DigiCert Inc, CN = DigiCert TLS RSA SHA256 2020 CA1
verify return:1
---
Certificate chain
 0 s:CN = www.example.org, O = Internet Corporation for Assigned Names and Numbers, L = Los Angeles, C = US
   i:C = US, O = DigiCert Inc, CN = DigiCert TLS RSA SHA256 2020 CA1
---
Server public key is RSA, 2048 bit
Protocol  : TLSv1.3
Cipher    : TLS_AES_256_GCM_SHA384
---
HTTP/1.1 200 OK
Content-Type: text/html`
  },
  'curl -v http://upstream/health': {
    tokens: [
      { text: 'curl', type: 'command', description: '命令行网页浏览器/数据传输工具，支持 HTTP/HTTPS 等各种协议进行数据交互' },
      { text: '-v', type: 'option', description: '选项参数：详细模式，输出完整的 HTTP 握手、请求头与返回头信息 (verbose)' },
      { text: 'http://upstream/health', type: 'argument', description: '请求的 HTTP URL 路径(此处通常为 upstream 配置节点下的健康检查接口)' }
    ],
    output: `[root@localhost ~]# curl -v http://upstream/health
*   Trying 10.0.2.22:80...
* Connected to upstream (10.0.2.22) port 80
> GET /health HTTP/1.1
> Host: upstream
> User-Agent: curl/7.79.1
>
< HTTP/1.1 502 Bad Gateway
< Server: nginx/1.20.1
< Content-Length: 150
<
* Connection #0 to host upstream left intact
# 发现了上游节点直接返回了 502 网关错误`
  },
  'ping -M do -s 1472 <host>': {
    tokens: [
      { text: 'ping', type: 'command', description: '网络连通性探测工具，利用 ICMP 请求响应机制测算延迟与丢包率' },
      { text: '-M', type: 'option', description: '探测路径上的 MTU 大小，这里指定 MTU 探测分片策略' },
      { text: 'do', type: 'argument', description: '禁止分片(Don\'t Fragment)，若包超长，直接报错丢包' },
      { text: '-s', type: 'option', description: '指定发送 ICMP 报文中的数据负载字节大小' },
      { text: '1472', type: 'argument', description: '设置为 1472 字节(加上 8字节ICMP头 + 20字节IP头 = 1500 字节标准 MTU)' },
      { text: '<host>', type: 'argument', description: '目标探测主机' }
    ],
    output: `[root@localhost ~]# ping -M do -s 1472 10.0.5.50
PING 10.0.5.50 (10.0.5.50) 1472(1500) bytes of data.
1480 bytes from 10.0.5.50: icmp_seq=1 ttl=64 time=1.20 ms

[root@localhost ~]# ping -M do -s 1500 10.0.5.50
PING 10.0.5.50 (10.0.5.50) 1500(1528) bytes of data.
ping: local error: Message too long, mtu=1500
# 报文过大且禁止分片，直接产生 local error 报错`
  },
  'ss -s && conntrack -S': {
    tokens: [
      { text: 'ss', type: 'command', description: 'socket statistics 套接字统计工具，显示系统连接概要' },
      { text: '-s', type: 'option', description: '输出统计总结，显示各状态的连接计数 (summary)' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'conntrack', type: 'command', description: 'Linux 连接跟踪表管理工具，展示 Netfilter 框架在内核记录的所有连接状态' },
      { text: '-S', type: 'option', description: '显示当前连接跟踪表状态概要(如当前计数、最大容量)' }
    ],
    output: `[root@localhost ~]# ss -s
Total: 1450
TCP:   1200 (estab 950, closed 150, orphaned 0, timewait 100)

[root@localhost ~]# conntrack -S
cpu=0   found=0 invalid=120 insert=24000000 insert_failed=5000 drop=1250 early_drop=0 keep_ctx=0
# insert_failed 计数值增长，表示连接跟踪表(conntrack table)已满，新连接正在被丢弃`
  },
  'tcpdump -i eth0 host <ip> and port <port>': {
    tokens: [
      { text: 'tcpdump', type: 'command', description: 'Linux 命令行抓包与协议解析分析器，能实时捕获并解构指定网卡的网络报文' },
      { text: '-i', type: 'option', description: '指定要监听抓包的网卡物理接口' },
      { text: 'eth0', type: 'argument', description: '网卡接口名称 eth0' },
      { text: 'host', type: 'operator', description: '过滤条件：匹配的 IP 主机' },
      { text: '<ip>', type: 'argument', description: '具体的目标 IP 地址' },
      { text: 'and', type: 'operator', description: '逻辑与组合过滤条件' },
      { text: 'port', type: 'operator', description: '过滤条件：匹配的端口' },
      { text: '<port>', type: 'argument', description: '具体的监听端口号' }
    ],
    output: `[root@localhost ~]# tcpdump -i eth0 host 10.0.1.12 and port 80 -n -c 3
19:12:00.102450 IP 10.0.1.50.45678 > 10.0.1.12.80: Flags [S], seq 123456, win 64240
19:12:00.104210 IP 10.0.1.12.80 > 10.0.1.50.45678: Flags [S.], seq 987654, ack 123457
19:12:00.105110 IP 10.0.1.50.45678 > 10.0.1.12.80: Flags [.], ack 1
3 packets captured
3 packets received by filter`
  },
  'lsblk && growpart && resize2fs/xfs_growfs': {
    tokens: [
      { text: 'lsblk', type: 'command', description: 'list block devices 列出所有可用块设备(磁盘分区、逻辑卷)的层级与挂载点' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'growpart', type: 'command', description: '扩展物理分区表以覆盖磁盘空余空间的工具，常用于分区热扩容' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'resize2fs/xfs_growfs', type: 'command', description: '调整文件系统容量以使扩容生效(resize2fs用于ext4, xfs_growfs用于XFS)' }
    ],
    output: `[root@localhost ~]# growpart /dev/vda 1
CHANGED: partition=1 start=2048 old: size=41940992 end=41943040 new: size=83883998 end=83886046

[root@localhost ~]# xfs_growfs /
meta-data=/dev/vda1              isize=512    agcount=4, agsize=1310656 blks
         =                       sectsz=512   attr=2, projid=0, crc=1
data     =                       bsize=4096   blocks=5242624, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 5242624 to 10485504`
  },
  'docker logs <container> && docker inspect <container>': {
    tokens: [
      { text: 'docker logs', type: 'command', description: 'Docker 容器客户端日志提取工具，获取容器运行的终端 stdout 信息' },
      { text: '<container>', type: 'argument', description: '操作的目标容器 ID 或名称' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'docker inspect', type: 'command', description: 'Docker 元数据深度检查，获取容器的完整底层 JSON 配置参数' },
      { text: '<container>', type: 'argument', description: '操作的目标容器 ID 或名称' }
    ],
    output: `[root@localhost ~]# docker logs nginx-api
2026-06-02T19:12:00Z [info] Starting nginx...
2026-06-02T19:12:05Z [error] Cannot load configuration /etc/nginx/nginx.conf

[root@localhost ~]# docker inspect nginx-api | grep -i status
        "Status": "exited",
        "Running": false,
        "ExitCode": 1,
        "Error": ""`
  },
  'docker stats && inspect memory limit': {
    tokens: [
      { text: 'docker stats', type: 'command', description: 'Docker 运行容器资源监控指标查看，流式展示 CPU、内存、I/O 等指标' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'inspect memory limit', type: 'command', description: '配合 docker inspect 对容器内存 hard limit 限制进行定位提取' }
    ],
    output: `[root@localhost ~]# docker stats --no-stream
CONTAINER ID   NAME         CPU %     MEM USAGE / LIMIT     MEM %     NET I/O
a3b4c5d6e7f8   web-service  0.15%     511.9MiB / 512MiB     99.98%    12kB / 8kB
# 可以看到 web-service 内存已经几乎吃满 (99.98%)，极有可能面临 OOM 风险`
  },
  'kubectl describe pod <pod> && kubectl logs <pod> --previous': {
    tokens: [
      { text: 'kubectl describe pod', type: 'command', description: '深入检索 K8s 指定 Pod 资源的健康状态、生命周期事件 (Events) 和详细配置' },
      { text: '<pod>', type: 'argument', description: '需要检查的目标 Pod 资源名称' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'kubectl logs', type: 'command', description: 'K8s 命令行客户端日志提取工具，输出 Pod 容器终端日志' },
      { text: '<pod>', type: 'argument', description: 'Pod 资源名称' },
      { text: '--previous', type: 'option', description: '选项参数：查看上一个已退出/已崩溃容器的历史运行日志，用以定位 CrashReason (previous)' }
    ],
    output: `[root@localhost ~]# kubectl describe pod auth-service
Status:             Running
Containers:
  auth-service:
    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    137
Events:
  Type     Reason      Age                  From               Message
  ----     ------      ----                 ----               -------
  Warning  BackOff     5s (x10 over 2m)     kubelet            Back-off restarting failed container

[root@localhost ~]# kubectl logs auth-service --previous
2026-06-02T19:10:00Z [info] Starting auth-service...
2026-06-02T19:11:45Z [fatal] Out of Memory. Exiting.`
  },
  'kubectl get endpoints && kubectl get pod --show-labels': {
    tokens: [
      { text: 'kubectl get endpoints', type: 'command', description: '查看 K8s 对应 Service 绑定的后端可用容器 IP 端点列表 (Endpoints)' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'kubectl get pod', type: 'command', description: '获取 K8s 当前命名空间下运行 of Pod 列表状态表格' },
      { text: '--show-labels', type: 'option', description: '选项参数：在输出结果中额外列出 Pod 的标签 (Label)，以便核对 selectors 匹配' }
    ],
    output: `[root@localhost ~]# kubectl get endpoints api-gateway-service
NAME                  ENDPOINTS            AGE
api-gateway-service   <none>               12d
# <none> 表示 Service 的 Selector 标签未匹配到任何后端 Pod 导致无可用端点

[root@localhost ~]# kubectl get pod --show-labels
NAME                       READY   STATUS    RESTARTS   LABELS
api-gateway-78cf9f-abcde   1/1     Running   0          app=api-gateway-prod,version=v1.2`
  },
  'helm history <release> && helm rollback <release> <revision>': {
    tokens: [
      { text: 'helm history', type: 'command', description: '查看 Helm 发行版(Release)的历史部署版本和升级记录描述' },
      { text: '<release>', type: 'argument', description: '查看的目标部署 Release 实例名称' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'helm rollback', type: 'command', description: 'Helm 版本管理工具，用于回滚指定的部署实例到某一个历史 Revision 版本' },
      { text: '<release>', type: 'argument', description: 'Release 实例名称' },
      { text: '<revision>', type: 'argument', description: '目标的历史 Revision 版本号，如 1, 2, 3 等' }
    ],
    output: `[root@localhost ~]# helm history core-app
REVISION    UPDATED                     STATUS        CHART             DESCRIPTION
1           Mon Jun  1 10:00:00 2026    superseded    core-app-1.0.0    Install complete
2           Tue Jun  2 19:00:00 2026    failed        core-app-1.1.0    Upgrade failed

[root@localhost ~]# helm rollback core-app 1
Rollback release core-app to revision 1 completed.
# 成功回滚到版本号 1，业务容器已自动触发拉取旧镜像滚动更新`
  },
  'ansible-playbook --check': {
    tokens: [
      { text: 'ansible-playbook', type: 'command', description: 'Ansible 自动化配置剧本批量部署执行器' },
      { text: '--check', type: 'option', description: '选项参数：演练模式 (Dry-Run)，只模拟语法与配置变更，不真正执行下发修改' }
    ],
    output: `[root@localhost ~]# ansible-playbook site.yml --check
PLAY [Configure Web Servers] ***************************************************
TASK [Ensure Nginx is installed] ***********************************************
changed: [web01]
changed: [web02]

PLAY RECAP *********************************************************************
web01                      : ok=1    changed=1    unreachable=0    failed=0
web02                      : ok=1    changed=1    unreachable=0    failed=0
# 报告显示若正式运行， site.yml 将会在两台 web 主机上触发 Nginx 安装修改`
  },
  'kubectl top pod && kubectl describe hpa': {
    tokens: [
      { text: 'kubectl top pod', type: 'command', description: 'K8s 资源状态监控指标查看，实时获取 Pod 当前 CPU 和内存物理占用数据' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'kubectl describe hpa', type: 'command', description: '查看水平自动扩缩容(HPA)资源的详细状态、指标参数与扩缩事件日志' }
    ],
    output: `[root@localhost ~]# kubectl top pod
NAME                       CPU(cores)   MEMORY(bytes)
order-service-78cd-abcde   950m         420Mi

[root@localhost ~]# kubectl describe hpa order-service-hpa
Reference:                                  Deployment/order-service
Metrics:                                    ( current / target )
  resource cpu on pods (as a % of request): 95% / 70%
Conditions:
  Type            Status  Reason              Message
  ----            ------  ------              -------
  AbleToScale     True    ReadyForNewScale    the last scale time was sufficiently old; HPA is ready to scale
# HPA 显示当前 CPU 资源占比 (95%) 已大幅超出触发阈值 (70%)，即刻会触发自动扩容副本数`
  },
  'kubectl describe pvc <pvc>': {
    tokens: [
      { text: 'kubectl describe pvc', type: 'command', description: '深入检索 K8s 持久卷声明 (PVC) 的当前挂载状态、容量细节与底层事件日志' },
      { text: '<pvc>', type: 'argument', description: '需要检查的目标 PVC 资源名称' }
    ],
    output: `[root@localhost ~]# kubectl describe pvc mysql-data-pvc
Status:       Pending
Volume:       
Events:
  Type     Reason              Age                  From                         Message
  ----     ------              ----                 ----                         -------
  Warning  ProvisioningFailed  10s (x5 over 2m)     persistentvolume-controller  Failed to provision volume with StorageClass "gp3": unauthorized to call CreateVolume API
# PVC 目前处于 Pending 挂载不成功状态，事件揭示了底层存储类授权凭证配置缺失，导致调用 AWS/云盘 API 失败`
  },
  'EXPLAIN ANALYZE ...': {
    tokens: [
      { text: 'EXPLAIN', type: 'command', description: 'SQL 查询引擎解析计划查询工具，估算查询成本与解析树结构' },
      { text: 'ANALYZE', type: 'option', description: '指示数据库实际运行该 SQL，并打印出真实的各节点执行耗时、扫描行数与内存占用数据' },
      { text: '...', type: 'argument', description: '具体的查询 SQL 语句' }
    ],
    output: `mysql> EXPLAIN ANALYZE SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE users.status = 'active';
-> Inner hash join (orders.user_id = users.id)  (cost=12500 rows=500) (actual time=45.2..120.5 rows=12000 loops=1)
    -> Table scan on orders  (cost=5000 rows=50000) (actual time=0.05..12.3 rows=50000 loops=1)
    -> Hash
        -> Filter: (users.status = 'active')  (cost=1200 rows=1000) (actual time=0.08..8.5 rows=1000 loops=1)
            -> Table scan on users  (cost=1200 rows=10000) (actual time=0.05..6.2 rows=10000 loops=1)
# 能够直接评估哈希连接阶段真实物理扫描的时间损耗`
  },
  'INFO stats && INFO memory': {
    tokens: [
      { text: 'INFO', type: 'command', description: 'Redis 状态与统计指标查看指令' },
      { text: 'stats', type: 'argument', description: '查看 Redis 连接吞吐量、被拒连接数、缓存失效事件等统计详情' },
      { text: '&&', type: 'operator', description: '逻辑与操作符' },
      { text: 'INFO', type: 'command', description: 'Redis 状态与统计指标查看指令' },
      { text: 'memory', type: 'argument', description: '查看 Redis 实际使用内存、RSS 内存、内存分配器及碎片率指标详情' }
    ],
    output: `127.0.0.1:6379> INFO stats
# Stats
total_connections_received:245000
rejected_connections:1250  # 发生了连接被拒拒绝
sync_full:1

127.0.0.1:6379> INFO memory
# Memory
used_memory:2147483648 (2.00G)
used_memory_rss:4294967296 (4.00G)  # 实际系统物理内存占用比 Redis 内部申请高一倍
mem_fragmentation_ratio:2.00  # 内存碎片率达到 2.0，说明碎片问题极为严重`
  }
}

export function getCommandPreview(command: string): CommandPreview {
  const cleanCmd = command.trim()
  if (commandPreviews[cleanCmd]) {
    return commandPreviews[cleanCmd]
  }

  // Fallback dynamic tokenizer
  const tokens: CommandToken[] = []
  const words = cleanCmd.split(/\s+/)
  let currentCmd = words[0] || ''
  
  words.forEach((word, index) => {
    if (!word) return
    let type: 'command' | 'option' | 'argument' | 'operator'
    let description: string

    if (index === 0) {
      type = 'command'
      const desc = toolDescriptions[word.toLowerCase()]
      description = desc ? `基础指令：${desc}` : `系统可执行工具命令 \`${word}\``
    } else if (['&&', '||', '|', '>', '>>', '<', ';', '2>', '2>&1'].includes(word)) {
      type = 'operator'
      description = '控制操作符：' + (
        word === '&&' ? '逻辑与，前一条命令执行成功后才执行后继命令' :
        word === '||' ? '逻辑或，前一条命令失败后才执行后继命令' :
        word === '|' ? '管道符，将左侧命令的标准输出(Stdout)流向右侧命令' :
        word === '>' ? '输出重定向，清空文件并将标准输出写入该文件' :
        word === '>>' ? '追加输出重定向，将标准输出写入文件末尾而不覆盖' :
        word === '2>' ? '标准错误重定向，将报错信息过滤至指定文件或黑洞' :
        '命令行连接控制符'
      )
    } else if (index > 0 && ['&&', '||', '|', ';'].includes(words[index - 1])) {
      type = 'command'
      currentCmd = word
      const desc = toolDescriptions[word.toLowerCase()]
      description = desc ? `后续指令：${desc}` : `后续执行系统命令 \`${word}\``
    } else if (word.startsWith('-')) {
      type = 'option'
      description = decodeOption(currentCmd, word)
    } else {
      type = 'argument'
      const lowerWord = word.toLowerCase()
      if (lowerWord.includes('.conf') || lowerWord.includes('.yaml') || lowerWord.includes('.json') || lowerWord.includes('.xml')) {
        description = `配置文件参数：指向需要读取或应用的目标配置文件 \`${word}\``
      } else if (lowerWord.includes('.log') || lowerWord.includes('.txt')) {
        description = `日志/文本文件：操作的目标文本文件 \`${word}\``
      } else if (lowerWord.includes('.tar.gz') || lowerWord.includes('.zip') || lowerWord.includes('.tgz')) {
        description = `归档压缩包：读写或解包归档压缩包 \`${word}\``
      } else if (lowerWord.startsWith('http://') || lowerWord.startsWith('https://')) {
        description = `网络 URL 地址：网络传输交互的远程链接接口 \`${word}\``
      } else if (lowerWord.includes('<host>') || lowerWord.includes('<ip>') || word.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        description = `目标主机/地址：请求连接的远程 IP 地址或域名 \`${word}\``
      } else if (lowerWord.includes('<port>') || word.match(/^\d{2,5}$/)) {
        description = `服务端口：目标进程监听的具体端口号 \`${word}\``
      } else if (lowerWord.includes('<container>') || lowerWord.includes('<pod>') || lowerWord.includes('<service>') || lowerWord.includes('<timer>') || lowerWord.includes('<svc>')) {
        description = `资源/服务占位符：命令操作的 Kubernetes 资源对象或系统服务对象`
      } else {
        description = `目标对象/参数：命令操作的输入内容、筛选目标或目录路径 \`${word}\``
      }
    }

    tokens.push({
      text: word,
      type,
      description
    })
  })

  // Format a high quality output preview based on currentCmd
  let customOutput: string
  const firstCmdLower = tokens[0]?.text?.toLowerCase() || ''
  
  if (firstCmdLower === 'kubectl') {
    const isApply = command.includes('apply')
    const isGet = command.includes('get')
    const isCreate = command.includes('create')
    const isDescribe = command.includes('describe')
    const isClusterInfo = command.includes('cluster-info')
    const isTop = command.includes('top')
    const isLogs = command.includes('logs')
    
    if (isApply) {
      const fileArg = words.find(w => w.endsWith('.yaml') || w.endsWith('.yml') || w.endsWith('.json')) || 'deployment.yaml'
      const baseName = fileArg.split('/').pop()?.replace(/\.[^/.]+$/, "") || 'deployment'
      customOutput = `deployment.apps/${baseName} created
service/${baseName}-service created`
    } else if (isGet) {
      if (command.includes('pods') || command.includes('pod')) {
        customOutput = `NAME                               READY   STATUS    RESTARTS   AGE
frontend-pod-78cd56-abcde          1/1     Running   0          45s
backend-pod-5c8f8b-fghij           1/1     Running   0          3m
db-pod-12ab34-klmno                1/1     Running   0          10m`
      } else if (command.includes('svc') || command.includes('service') || command.includes('services')) {
        customOutput = `NAME               TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes         ClusterIP      10.96.0.1       <none>        443/TCP        15d
frontend-service   LoadBalancer   10.96.128.50    1.2.3.4       80:31280/TCP   2m
backend-service    ClusterIP      10.96.128.60    <none>        8080/TCP       3m`
      } else if (command.includes('endpoints') || command.includes('ep')) {
        customOutput = `NAME               ENDPOINTS                               AGE
frontend-service   10.244.0.15:80,10.244.1.20:80           2m
backend-service    10.244.0.16:8080                        3m`
      } else {
        customOutput = `NAME      TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
default   ClusterIP   10.96.0.1    <none>        443/TCP   15d`
      }
    } else if (isCreate) {
      const secretName = words.find((w, i) => words[i-1] === 'generic' || words[i-1] === 'secret') || 'db-pass'
      customOutput = `secret/${secretName} created`
    } else if (isDescribe) {
      const resType = words.find((w, i) => ['pod', 'pvc', 'hpa', 'service', 'deployment'].includes(words[i-1]?.toLowerCase())) || 'pod'
      const resName = words[words.length - 1] === resType ? 'my-resource' : words[words.length - 1]
      customOutput = `Name:             ${resName}
Namespace:        default
Priority:         0
Status:           Running
IP:               10.244.0.15
Containers:
  app-container:
    Image:          nginx:alpine
    State:          Running
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  10m   default-scheduler  Successfully assigned default/${resName} to node-1`
    } else if (isClusterInfo) {
      customOutput = `Kubernetes control plane is running at https://127.0.0.1:6443
CoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.`
    } else if (isTop) {
      customOutput = `NAME                        CPU(cores)   MEMORY(bytes)   
frontend-pod-78cd56-abcde   120m         145Mi           
backend-pod-5c8f8b-fghij    350m         412Mi           
db-pod-12ab34-klmno         90m          512Mi           `
    } else if (isLogs) {
      customOutput = `2026-06-02T19:40:00Z [info] Starting application server...
2026-06-02T19:40:02Z [info] Connecting to database...
2026-06-02T19:40:03Z [info] Database connection established.
2026-06-02T19:40:04Z [info] Server listening on port 8080.`
    } else {
      customOutput = `Client Version: v1.28.2
Server Version: v1.28.2`
    }
  } else if (firstCmdLower === 'docker') {
    const isPs = command.includes('ps')
    const isImages = command.includes('images')
    const isRun = command.includes('run')
    const isLogs = command.includes('logs')
    const isBuild = command.includes('build')
    const isPull = command.includes('pull')
    const isInspect = command.includes('inspect')
    const isInfo = command.includes('info')
    const isLogin = command.includes('login')
    const isRm = command.includes('rm')
    
    if (isPs) {
      customOutput = `CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                NAMES
a3b4c5d6e7f8   nginx:alpine   "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp   my-nginx`
    } else if (isImages) {
      customOutput = `REPOSITORY          TAG       IMAGE ID       CREATED        SIZE
nginx               alpine    845dbc5b5b2c   2 days ago     23.5MB
ubuntu              latest    35a4f326c567   3 weeks ago    77.8MB
node                20-slim   e5c8f8b7b2ca   4 weeks ago    195MB`
    } else if (isRun) {
      customOutput = `a3b4c5d6e7f8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789ab`
    } else if (isLogs) {
      customOutput = `[info] 2026-06-02T19:40:00Z Starting web server...
[info] 2026-06-02T19:40:01Z Configuration loaded successfully.
[info] 2026-06-02T19:40:01Z Listening on port 80...`
    } else if (isBuild) {
      customOutput = `Sending build context to Docker daemon  2.048kB
Step 1/3 : FROM node:20-slim
 ---> e5c8f8b7b2ca
Step 2/3 : COPY . /app
 ---> Using cache
 ---> a1b2c3d4e5f6
Step 3/3 : CMD ["node", "/app/index.js"]
 ---> Running in 9527abcdef12
Removing intermediate container 9527abcdef12
 ---> c7d8e9f0a1b2
Successfully built c7d8e9f0a1b2
Successfully tagged my-app:v1`
    } else if (isPull) {
      customOutput = `latest: Pulling from library/ubuntu
35a4f326c567: Pull complete 
Digest: sha256:d5c8f8b7b2ca3a4b5c6d7e8f90123456789abcdef0123456789ab1234567890
Status: Downloaded newer image for ubuntu:latest
docker.io/library/ubuntu:latest`
    } else if (isInspect) {
      customOutput = `[
  {
    "Id": "sha256:a3b4c5d6e7f8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789ab",
    "Created": "2026-06-02T19:00:00Z",
    "State": {
      "Status": "running",
      "Running": true,
      "ExitCode": 0
    }
  }
]`
    } else if (isInfo) {
      customOutput = `Client:
 Context:    default
 Debug Mode: false

Server:
 Containers: 1
  Running: 1
  Paused: 0
  Stopped: 0
 Images: 3
 Server Version: 24.0.7
 Storage Driver: overlay2`
    } else if (isLogin) {
      customOutput = `Username: admin
Password: 
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Login Succeeded`
    } else if (isRm) {
      customOutput = `container_id_removed`
    } else {
      customOutput = `docker daemon is running.`
    }
  } else if (firstCmdLower === 'git') {
    const gitAction = words[1] || 'status'
    if (gitAction === 'clone') {
      customOutput = `Cloning into 'kubernetes'...
remote: Enumerating objects: 325400, done.
remote: Counting objects: 100% (4562/4562), done.
Receiving objects:  95% (309130/325400), 45.12 MiB | 12.50 MiB/s
Resolving deltas: 100% (214500/214500), done.`
    } else if (gitAction === 'add') {
      customOutput = `# git status tracking
# Changes staged for commit`
    } else if (gitAction === 'commit') {
      customOutput = `[main a1b2c3d] commit update
 2 files changed, 25 insertions(+), 12 deletions(-)`
    } else if (gitAction === 'push') {
      customOutput = `Writing objects: 100% (3/3), 320 bytes | 320.00 KiB/s, done.
Total 3 (delta 2), reused 0 (delta 0), pack-reused 0
To github.com:user/repo.git
   a1b2c3d..e4f5g6h  main -> main`
    } else if (gitAction === 'branch') {
      const newBranch = words[2]
      if (newBranch) {
        customOutput = `Branch '${newBranch}' created successfully.`
      } else {
        customOutput = `* main
  dev
  feature-login`
      }
    } else if (gitAction === 'checkout') {
      const targetBranch = words.find((w, i) => words[i-1] === 'checkout' || words[i-1] === '-b') || 'main'
      customOutput = `Switched to branch '${targetBranch}'`
    } else if (gitAction === 'merge') {
      customOutput = `Updating a1b2c3d..e4f5g6h
Fast-forward
 src/App.tsx            | 12 +++++++++---
 src/styles.css         |  5 +++++
 2 files changed, 14 insertions(+), 3 deletions(-)`
    } else {
      customOutput = `On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean`
    }
  } else if (firstCmdLower === 'tar') {
    const hasC = command.includes('c')
    const fileArg = words.find(w => w.endsWith('.tar.gz') || w.endsWith('.tgz')) || 'archive.tar.gz'
    const targetArg = words[words.length - 1] === fileArg ? 'target_directory' : words[words.length - 1]
    
    if (hasC) {
      customOutput = `[root@localhost ~]# ${cleanCmd}
# 正在将目录 [${targetArg}] 进行打包...
# 正在启用 gzip 进行数据流压缩...
# 已成功生成压缩包文件: ${fileArg}
-rw-r--r--. 1 root root 40960 Jun 02 19:20 ${fileArg}`
    } else {
      customOutput = `[root@localhost ~]# ${cleanCmd}
# 正在读取归档文件 ${fileArg} 并启用 gzip 进行解压...
${targetArg}/
${targetArg}/config.json
${targetArg}/app.log
# 提取完成，解压成功`
    }
  } else if (firstCmdLower === 'top') {
    customOutput = `top - 19:27:13 up 10 days,  4:23,  1 user,  load average: 0.15, 0.08, 0.02
Tasks: 120 total,   1 running, 119 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.5 us,  1.2 sy,  0.0 ni, 95.8 id,  0.5 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   7966.3 total,    841.2 free,   2052.4 used,   5072.7 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5432.1 avail Mem 

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   9527 root      20   0 3412352 524288  12456 S   2.5   6.6   0:45.12 java
   1024 root      20   0  120456  12450   8920 S   1.2   0.2   0:12.40 nginx
      1 root      20   0  182352   9120   6120 S   0.0   0.1   0:04.50 systemd`
  } else if (firstCmdLower === 'free') {
    customOutput = `              total        used        free      shared  buff/cache   available
Mem:           7966        2052         841         182        5071        5432
Swap:          2047           0        2047`
  } else if (firstCmdLower === 'uname') {
    customOutput = `Linux localhost 5.15.0-88-generic #98-Ubuntu SMP Mon Oct 2 15:18:56 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux`
  } else if (firstCmdLower === 'whoami') {
    customOutput = `root`
  } else if (firstCmdLower === 'id') {
    customOutput = `uid=0(root) gid=0(root) groups=0(root) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023`
  } else if (firstCmdLower === 'passwd') {
    customOutput = `Changing password for user root.
New PASSWORD: 
Retype new PASSWORD: 
passwd: all authentication tokens updated successfully.`
  } else if (firstCmdLower === 'history') {
    customOutput = `  995  cd /var/log/nginx/
  996  tail -f error.log
  997  systemctl reload nginx
  998  ss -lntp | grep :80
  999  top
 1000  history`
  } else if (firstCmdLower === 'ln') {
    const fileArg = words.find(w => w.startsWith('/')) || '/opt/app/bin'
    const linkName = words[words.length - 1] === fileArg ? 'run' : words[words.length - 1]
    customOutput = `# 符号链接创建成功！
lrwxrwxrwx 1 root root ${fileArg.length} Jun 02 19:27 ${linkName} -> ${fileArg}`
  } else if (firstCmdLower === 'tail') {
    customOutput = `Jun 02 19:26:00 server info: Starting API requests processing...
Jun 02 19:27:00 server debug: Received connection from 10.0.12.55
Jun 02 19:27:13 server info: GET /v1/status completed in 12ms (status=200)`
  } else if (firstCmdLower === 'head') {
    customOutput = `root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin`
  } else if (firstCmdLower === 'ip') {
    customOutput = `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic eth0
       valid_lft 86320sec preferred_lft 86320sec`
  } else if (firstCmdLower === 'ping') {
    const hostArg = words.find(w => !w.startsWith('-') && w !== 'ping') || '127.0.0.1'
    customOutput = `PING ${hostArg} (${hostArg}) 56(84) bytes of data.
64 bytes from ${hostArg}: icmp_seq=1 ttl=64 time=0.04 ms
64 bytes from ${hostArg}: icmp_seq=2 ttl=64 time=0.05 ms
64 bytes from ${hostArg}: icmp_seq=3 ttl=64 time=0.04 ms
--- ${hostArg} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 0.04/0.04/0.05/0.00 ms`
  } else if (firstCmdLower === 'telnet') {
    const hostArg = words[1] || '127.0.0.1'
    const portArg = words[2] || '6379'
    customOutput = `Trying ${hostArg}:${portArg}...
Connected to ${hostArg}.
Escape character is '^]'.`
  } else if (firstCmdLower === 'curl') {
    if (command.includes('-I')) {
      const hostArg = words.find(w => w.includes('.')) || 'example.com'
      customOutput = `HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Server: nginx/1.20.1
Host: ${hostArg}
Date: Tue, 02 Jun 2026 19:40:00 GMT
Connection: keep-alive`
    } else {
      customOutput = `{
  "status": "healthy",
  "version": "v1.2.0",
  "uptime": "10d"
}`
    }
  } else if (firstCmdLower === 'nslookup') {
    const domainArg = words.find(w => w.includes('.')) || 'example.com'
    customOutput = `Server:         127.0.0.53
Address:        127.0.0.53#53

Non-authoritative answer:
Name:   ${domainArg}
Address: 93.184.216.34`
  } else if (firstCmdLower === 'nginx') {
    customOutput = `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful`
  } else if (firstCmdLower === 'firewall-cmd') {
    customOutput = `80/tcp 443/tcp 8080/tcp 22/tcp`
  } else if (firstCmdLower === 'systemctl') {
    const isCat = command.includes('cat')
    const isShow = command.includes('show')
    const isTimers = command.includes('list-timers')
    const svcArg = words[words.length - 1] === 'systemctl' ? 'nginx' : words[words.length - 1]
    
    if (isCat) {
      customOutput = `# /lib/systemd/system/${svcArg}.service
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=syslog.target network-online.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/usr/sbin/nginx -s reload
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true`
    } else if (isShow) {
      customOutput = `Type=forking
Restart=on-failure
NotifyAccess=none
RestartUSec=100ms
LimitNOFILE=65535
ActiveState=active`
    } else if (isTimers) {
      customOutput = `NEXT                         LEFT          LAST                         PASSED       UNIT                         ACTIVATES
Wed 2026-06-03 00:00:00 UTC  4h 32m left   Tue 2026-06-02 00:00:00 UTC  19h ago      logrotate.timer              logrotate.service
Wed 2026-06-03 01:15:00 UTC  5h 47m left   Tue 2026-06-02 01:15:00 UTC  18h ago      apt-daily-upgrade.timer      apt-daily-upgrade.service`
    } else {
      customOutput = `● ${svcArg}.service - System Service
     Loaded: loaded (/usr/lib/systemd/system/${svcArg}.service; enabled; vendor preset: disabled)
     Active: active (running) since Tue 2026-06-02 10:00:00 UTC; 9h ago
   Main PID: 1024 (nginx)
      Tasks: 3 (limit: 9527)
     Memory: 12.4M
        CPU: 4.52s`
    }
  } else if (firstCmdLower === 'chown' || firstCmdLower === 'chmod') {
    customOutput = `` // silent success for chmod and chown
  } else if (firstCmdLower === 'lsof') {
    customOutput = `COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
nginx    1024 root    6u  IPv4  24500      0t0  TCP *:80 (LISTEN)
nginx    1025 nginx   6u  IPv4  24500      0t0  TCP *:80 (LISTEN)`
  } else if (firstCmdLower === 'sysctl') {
    customOutput = `net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1`
  } else if (firstCmdLower === 'find') {
    customOutput = `/var/log/nginx/access.log
/var/log/nginx/error.log
/var/log/messages`
  } else if (firstCmdLower === 'lsblk') {
    customOutput = `NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda     253:0    0   50G  0 disk 
└─vda1  253:1    0   50G  0 part /
vdb     253:16   0  100G  0 disk /data`
  } else if (firstCmdLower === 'ls') {
    customOutput = `total 16
drwxr-xr-x 2 root root 4096 Jun 02 19:40 .
drwxr-xr-x 4 root root 4096 Jun 02 19:00 ..
-rwxr-xr-x 1 root root  120 Jun 02 19:35 script.sh`
  } else if (firstCmdLower === 'df') {
    customOutput = `Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        50G   24G   26G  48% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
/dev/vdb        100G   45G   55G  45% /data`
  } else if (firstCmdLower === 'du') {
    const targetDir = words.find(w => !w.startsWith('-') && w !== 'du') || '/var/log'
    customOutput = `1.2G\t${targetDir}`
  } else if (firstCmdLower === 'cat') {
    const filename = words.find(w => !w.startsWith('-') && w !== 'cat') || '/etc/hosts'
    if (filename.includes('hostname')) {
      customOutput = `sre-node-01`
    } else if (filename.includes('hosts')) {
      customOutput = `127.0.0.1   localhost localhost.localdomain
::1         localhost6 localhost6.localdomain6
10.0.2.15   sre-node-01`
    } else if (filename.includes('resolv.conf')) {
      customOutput = `nameserver 8.8.8.8
nameserver 1.1.1.1
search localdomain`
    } else if (filename.includes('Dockerfile')) {
      customOutput = `FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]`
    } else {
      customOutput = `# Content of ${filename}
[INFO] File content read successfully.`
    }
  } else if (firstCmdLower === 'grep') {
    customOutput = `Jun 02 19:40:05 server nginx[1024]: 10.0.1.50 - - [02/Jun/2026:19:40:05 +0000] "GET /upstream HTTP/1.1" 502 150`
  } else if (firstCmdLower === 'ss' || firstCmdLower === 'netstat') {
    customOutput = `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port   Process
LISTEN   0        4096           0.0.0.0:80          0.0.0.0:*       users:(("nginx",pid=1024,fd=6))
LISTEN   0        128            0.0.0.0:22          0.0.0.0:*       users:(("sshd",pid=900,fd=3))`
  } else if (firstCmdLower === 'nc') {
    const hostArg = words[2] || '127.0.0.1'
    const portArg = words[3] || '80'
    customOutput = `Connection to ${hostArg} ${portArg} port [tcp/*] succeeded!`
  } else if (firstCmdLower === 'dig') {
    const hostArg = words.find(w => !w.startsWith('-') && !w.startsWith('@') && w !== 'dig') || 'example.com'
    customOutput = `;; ANSWER SECTION:
${hostArg}.      86400   IN      A       93.184.216.34`
  } else if (firstCmdLower === 'aws') {
    const isS3 = command.includes('s3')
    if (isS3) {
      customOutput = `make_bucket: s3://my-unique-bucket-name`
    } else {
      customOutput = `AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: json`
    }
  } else if (firstCmdLower === 'terraform') {
    customOutput = `Terraform will perform the following actions:
  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami                          = "ami-0c55b159cbfafe1f0"
      + instance_type                = "t2.micro"
    }

Plan: 1 to add, 0 to change, 0 to destroy.
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.`
  } else if (firstCmdLower === 'logrotate') {
    customOutput = `reading config file /etc/logrotate.conf
rotating pattern: /var/log/nginx/*.log  weekly (4 rotations)
empty log files are rotated, old logs are removed
considering log /var/log/nginx/access.log`
  } else if (firstCmdLower === 'visudo' || firstCmdLower === 'last' || firstCmdLower === 'ausearch') {
    customOutput = `/etc/sudoers: parsed OK
reboot   system boot  5.15.0-88-generic Tue Jun  2 10:00   still running`
  } else if (firstCmdLower === 'tcpdump') {
    customOutput = `19:40:01.102450 IP 10.0.1.50.45678 > 10.0.2.15.80: Flags [S], seq 123456, win 64240
19:40:01.104210 IP 10.0.2.15.80 > 10.0.1.50.45678 > Flags [S.], seq 987654, ack 123457`
  } else {
    customOutput = `[INFO] 正在目标沙箱环境中准备执行运维命令...
[INFO] 进程已启动，底层载入主程序 [${tokens[0]?.text ?? 'binary'}]。
[SUCCESS] 命令已成功执行结束 (Exit Code: 0)。`
  }

  // Prepend the terminal prompt for realism, unless it's a special client prompt or already has it
  if (customOutput !== undefined && customOutput !== null) {
    const trimmedOut = customOutput.trim();
    if (!trimmedOut.startsWith('[root@') && !trimmedOut.startsWith('127.0.0.1') && !trimmedOut.startsWith('mysql>') && !trimmedOut.startsWith('redis>')) {
      if (customOutput === '') {
        customOutput = `[root@localhost ~]# ${cleanCmd}`
      } else {
        customOutput = `[root@localhost ~]# ${cleanCmd}\n${customOutput}`
      }
    }
  }

  return {
    tokens,
    output: customOutput
  }
}
