export const questions = [
  {
    "estimatedTime": 50,
    "id": "linux-service-log-first",
    "category": "linux",
    "type": "log-analysis",
    "level": "basic",
    "title": "服务失败先看日志",
    "prompt": "systemd 服务启动失败后，最直接查看该服务错误上下文的命令是哪一个？",
    "options": [
      {
        "id": "a",
        "text": "whoami"
      },
      {
        "id": "b",
        "text": "journalctl -u nginx -xe"
      },
      {
        "id": "c",
        "text": "ip route"
      },
      {
        "id": "d",
        "text": "df -h"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "systemd 把服务日志统一收进 journal。按 unit 过滤（-u）能直接定位这个服务的启动错误、退出码和依赖失败；-x 补充解释、-e 跳到最新。只盯 systemctl status 那几行往往不够。",
    "wrongReasons": {
      "d": "df -h 只能看磁盘容量，不能解释服务启动失败。",
      "c": "ip route 看路由，不是服务日志入口。",
      "a": "whoami 只显示当前用户。"
    },
    "skillTags": [
      "linux",
      "systemd",
      "journalctl",
      "logs"
    ],
    "relatedCommand": "journalctl -u nginx -xe",
    "mnemonic": "服务起不来先 journalctl -u <服务>：-x 加解释，-e 跳最新。"
  },
  {
    "estimatedTime": 95,
    "id": "linux-script-production-quality",
    "category": "linux",
    "type": "multiple",
    "level": "intermediate",
    "title": "生产级脚本",
    "prompt": "岗位要求 Shell/Python 自动化时，哪些特征说明脚本可以用于生产巡检或变更？",
    "options": [
      {
        "id": "a",
        "text": "具备幂等、超时、失败退出码和审计日志"
      },
      {
        "id": "b",
        "text": "把判断和参数写死在脚本里，换环境就改源码"
      },
      {
        "id": "c",
        "text": "输出清晰的成功/失败状态和关键证据"
      },
      {
        "id": "d",
        "text": "对危险操作有确认、白名单或 dry-run 机制"
      }
    ],
    "answer": [
      "a",
      "c",
      "d"
    ],
    "explanation": "好脚本的价值是把重复判断标准化：幂等保证能复跑，失败退出码让编排能感知，审计日志留证据，dry-run/白名单守住生产边界。",
    "wrongReasons": {
      "b": "把配置写死会让脚本无法跨环境复用，每次变更都要改源码，反而更易出错、更难交接。"
    },
    "skillTags": [
      "shell",
      "python",
      "automation",
      "audit"
    ],
    "relatedCommand": "set -euo pipefail",
    "mnemonic": "生产脚本四要素：幂等、留证据、失败退出码、护生产边界。"
  },
  {
    "estimatedTime": 80,
    "id": "linux-disk-inode-triage",
    "category": "linux",
    "type": "multiple",
    "level": "basic",
    "title": "磁盘与 inode",
    "prompt": "线上写文件失败并提示 No space left on device，第一轮应检查哪些内容？",
    "options": [
      {
        "id": "a",
        "text": "du 逐层定位大目录或异常小文件堆积"
      },
      {
        "id": "b",
        "text": "重启服务器，期望磁盘空间自动释放"
      },
      {
        "id": "c",
        "text": "df -h 查看分区容量使用率"
      },
      {
        "id": "d",
        "text": "df -i 查看 inode 使用率"
      }
    ],
    "answer": [
      "a",
      "c",
      "d"
    ],
    "explanation": "No space left 有两种成因：数据块满（df -h）或 inode 耗尽（df -i，常见于海量小文件）。先用 df 判断是哪种、哪个分区，再用 du 逐层找大目录或异常堆积，最后处理日志、缓存或临时文件。",
    "wrongReasons": {
      "b": "重启不会释放被占用的磁盘；进程仍持有的已删除文件反而可能继续占空间，治标不治本。"
    },
    "skillTags": [
      "disk",
      "inode",
      "df",
      "du"
    ],
    "relatedCommand": "df -h && df -i && du -sh /* 2>/dev/null",
    "mnemonic": "写不进先两查：df -h 看容量，df -i 看 inode，再 du 找大目录。"
  },
  {
    "estimatedTime": 90,
    "id": "linux-load-iowait",
    "category": "linux",
    "type": "scenario",
    "level": "intermediate",
    "title": "高负载低 CPU",
    "prompt": "load average 很高但 CPU idle 也高，最可能优先排查哪类问题？",
    "options": [
      {
        "id": "a",
        "text": "物理网卡队列深度（txqueuelen）发生抖动"
      },
      {
        "id": "b",
        "text": "Nginx 的 keepalive 连接数触发后端软上限"
      },
      {
        "id": "c",
        "text": "DNS TTL 缓存被本级网卡配置强制忽略"
      },
      {
        "id": "d",
        "text": "大量进程处于不可中断 I/O 等待"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "load 统计的是「运行(R)+不可中断睡眠(D)」的进程数。D 态多卡在磁盘/网络存储 IO 上，不占 CPU 却照样抬高 load——于是出现 load 高、CPU idle 也高。方向是查 IO（iostat 的 %util、await），而不是盲目加 CPU。",
    "wrongReasons": {
      "c": "DNS 缓存不会直接引起系统的 CPU iowait 升高。",
      "b": "keepalive 耗尽可能增加连接建立耗时，但不会导致 CPU 在 IO 上空转等待。",
      "a": "网卡队列深度抖动可能引起网络丢包或延迟，通常与磁盘 IO iowait 无关。"
    },
    "skillTags": [
      "load",
      "iowait",
      "top",
      "iostat"
    ],
    "relatedCommand": "top && iostat -x 1",
    "mnemonic": "load 高 CPU 闲，先查盘别加核——D 态不吃 CPU 也抬 load。"
  },
  {
    "estimatedTime": 100,
    "id": "linux-file-descriptor",
    "category": "linux",
    "type": "scenario",
    "level": "advanced",
    "title": "文件句柄耗尽",
    "prompt": "服务日志出现 Too many open files，最应该先确认什么？",
    "options": [
      {
        "id": "a",
        "text": "磁盘文件系统由于底层存储故障被只读挂载"
      },
      {
        "id": "b",
        "text": "进程打开文件数、ulimit 和 systemd LimitNOFILE"
      },
      {
        "id": "c",
        "text": "系统 swap 交换分区使用水位过高触发换入换出"
      },
      {
        "id": "d",
        "text": "系统全局端口范围限制 ip_local_port_range"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "连接、日志、socket 都会消耗 fd。排查要看进程当前 fd 数、系统限制、服务单元限制和是否存在连接泄漏。",
    "wrongReasons": {
      "d": "端口范围限制会造成连接无法建立（Cannot assign requested address），而非 Too many open files。",
      "c": "swap 水位高会引起性能严重下降，不会直接导致文件句柄耗尽。",
      "a": "文件系统只读会导致写操作失败（Read-only file system），而不是句柄耗尽。"
    },
    "skillTags": [
      "fd",
      "ulimit",
      "lsof",
      "systemd"
    ],
    "relatedCommand": "ls /proc/<pid>/fd | wc -l && systemctl show <svc> -p LimitNOFILE",
    "mnemonic": "Too many open files=数 fd 看三限：ulimit、LimitNOFILE、连接泄漏。"
  },
  {
    "estimatedTime": 75,
    "id": "linux-permission-noexec",
    "category": "linux",
    "type": "multiple",
    "level": "basic",
    "title": "权限拒绝",
    "prompt": "脚本执行 Permission denied，哪些检查方向合理？",
    "options": [
      {
        "id": "a",
        "text": "确认当前用户和 sudo 权限边界"
      },
      {
        "id": "b",
        "text": "检查所在挂载点是否 noexec"
      },
      {
        "id": "c",
        "text": "ls -l 查看执行位和属主属组"
      },
      {
        "id": "d",
        "text": "给脚本统一 chmod 777 绕过权限检查"
      }
    ],
    "answer": [
      "a",
      "b",
      "c"
    ],
    "explanation": "权限排查要按文件权限、用户身份、挂载参数和安全策略逐层确认。生产环境更要先判断权限边界，不能用破坏性操作绕过。",
    "wrongReasons": {
      "d": "chmod 777 放开全部权限会引入严重安全风险，是绕过现象而非定位 Permission denied 的根因。"
    },
    "skillTags": [
      "permission",
      "chmod",
      "sudo",
      "mount"
    ],
    "relatedCommand": "ls -l script.sh && id && mount | grep noexec",
    "mnemonic": "Permission denied 四查：执行位、属主、用户身份、noexec 挂载。"
  },
  {
    "estimatedTime": 70,
    "id": "linux-logrotate-policy",
    "category": "linux",
    "type": "config",
    "level": "intermediate",
    "title": "日志轮转",
    "prompt": "应用日志持续增长导致磁盘满，应该补齐哪类机制？",
    "options": [
      {
        "id": "a",
        "text": "系统 cron 定时任务的挂载执行权限限制"
      },
      {
        "id": "b",
        "text": "定期清理 CPU 运行指标的历史快照数据"
      },
      {
        "id": "c",
        "text": "logrotate 或应用自身日志切割、压缩、保留周期和告警"
      },
      {
        "id": "d",
        "text": "在日志输出中禁用系统 Audit 审计安全策略"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "日志能力不止会 grep，更要管生命周期。应用日志若没有切割、压缩、保留周期和磁盘告警，迟早把分区写满拖垮服务。logrotate 或应用自带轮转就是补这套机制。",
    "wrongReasons": {
      "a": "cron 定时任务本身不解决日志持续增长的资源回收问题。",
      "d": "禁用 Audit 审计与日志生命周期和切割无关，且增加合规风险。",
      "b": "清理 CPU 指标快照无法释放被应用日志占用的磁盘空间。"
    },
    "skillTags": [
      "logs",
      "logrotate",
      "retention",
      "alerting"
    ],
    "relatedCommand": "logrotate -d /etc/logrotate.conf",
    "mnemonic": "日志会撑爆盘：切割+压缩+保留周期+磁盘告警，缺一不可。"
  },
  {
    "estimatedTime": 45,
    "id": "linux-process-port-owner",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "端口进程归属",
    "prompt": "要确认 8080 端口由哪个进程监听，优先使用哪个命令？",
    "options": [
      {
        "id": "a",
        "text": "free -h"
      },
      {
        "id": "b",
        "text": "ss -lntp | grep :8080"
      },
      {
        "id": "c",
        "text": "date"
      },
      {
        "id": "d",
        "text": "lsblk"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "端口归属是服务排障、发布冲突和安全检查的入口。ss 能同时看到监听地址、端口和进程信息。",
    "wrongReasons": {
      "a": "free 查看内存。",
      "c": "date 查看时间。",
      "d": "lsblk 查看块设备。"
    },
    "skillTags": [
      "port",
      "process",
      "ss"
    ],
    "relatedCommand": "ss -lntp | grep :8080",
    "mnemonic": "查端口归属用 ss -lntp：l 监听 n 数字 t TCP p 进程。"
  },
  {
    "estimatedTime": 95,
    "id": "linux-systemd-unit-hardening",
    "category": "linux",
    "type": "config",
    "level": "advanced",
    "title": "systemd 服务治理",
    "prompt": "一个长期运行的业务服务交给 systemd 管理，哪些配置更贴近生产要求？",
    "options": [
      {
        "id": "a",
        "text": "Restart 策略、LimitNOFILE、EnvironmentFile、日志和依赖顺序"
      },
      {
        "id": "b",
        "text": "只配 ExecStart，靠人工盯着失败再手动拉起"
      },
      {
        "id": "c",
        "text": "统一用 root 启动，省去配置专用运行账号"
      },
      {
        "id": "d",
        "text": "把日志直接丢到 /dev/null，省磁盘空间"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "服务治理要考虑启动依赖、失败重启、资源限制、配置注入、权限边界和日志。systemd unit 写得好，值班时少很多不确定性。",
    "wrongReasons": {
      "b": "没有 Restart 和资源限制策略，故障要靠人工值守，恢复慢且不可靠。",
      "c": "默认 root 运行扩大攻击面，违反最小权限，应配置专用低权账号。",
      "d": "丢弃日志会让排障没有证据，事故复盘无从下手。"
    },
    "skillTags": [
      "systemd",
      "service",
      "limit",
      "hardening"
    ],
    "relatedCommand": "systemctl cat <service>",
    "mnemonic": "生产 unit 五件套：Restart、LimitNOFILE、Env、非 root、日志依赖。"
  },
  {
    "estimatedTime": 80,
    "id": "linux-cron-timer-audit",
    "category": "linux",
    "type": "scenario",
    "level": "intermediate",
    "title": "定时任务失效",
    "prompt": "巡检脚本昨晚没有执行，第一轮应检查哪些证据？",
    "options": [
      {
        "id": "a",
        "text": "crontab/systemd timer 配置、执行用户、日志、环境变量和退出码"
      },
      {
        "id": "b",
        "text": "Nginx 代理服务器缓存过期时间 (proxy_cache_valid)"
      },
      {
        "id": "c",
        "text": "系统的局部静态路由表条目 (route -n)"
      },
      {
        "id": "d",
        "text": "系统时间同步服务 (chronyd) 的上游时钟源状态"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "定时任务故障常见于用户不对、环境变量缺失、路径写死、权限不足或脚本退出。要先看执行证据，而不是猜测。",
    "wrongReasons": {
      "b": "Nginx 代理缓存过期不影响本地定时任务的执行。",
      "d": "时钟源微小偏差不会导致定时任务昨晚完全未执行。",
      "c": "路由表影响网络包路由，不是定时任务排错的首选证据。"
    },
    "skillTags": [
      "cron",
      "timer",
      "automation",
      "logs"
    ],
    "relatedCommand": "systemctl list-timers && journalctl -u <timer>",
    "mnemonic": "定时没跑先看证据：用户、环境变量、路径、退出码、timer 日志。"
  },
  {
    "estimatedTime": 75,
    "id": "linux-user-sudo-audit",
    "category": "linux",
    "type": "single",
    "level": "intermediate",
    "title": "账号与 sudo 审计",
    "prompt": "生产主机需要给临时人员排障权限，最合理的方式是什么？",
    "options": [
      {
        "id": "a",
        "text": "直接共用一个 root 账号登录操作"
      },
      {
        "id": "b",
        "text": "创建个人账号，授予限定 sudo 权限，设置有效期并保留审计"
      },
      {
        "id": "c",
        "text": "复用已离职同事遗留的账号临时顶替"
      },
      {
        "id": "d",
        "text": "给临时人员配置永久 NOPASSWD 全量 sudo"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "生产授权的底线是可追责：个人账号能定位到人，限定 sudo 给最小权限，有效期控制临时窗口，审计保留可回溯。",
    "wrongReasons": {
      "a": "共用 root 无法追责，任何误操作都定位不到人，风险极高。",
      "c": "复用离职账号同样无法追责，还可能绕过账号回收与权限审计。",
      "d": "永久 NOPASSWD 全量 sudo 等于无限期最高权限，临时排障用完也收不回。"
    },
    "skillTags": [
      "sudo",
      "account",
      "audit",
      "least-privilege"
    ],
    "relatedCommand": "visudo && last && ausearch",
    "mnemonic": "临时授权：个人账号+限定 sudo+设期限+留审计，绝不共享 root。"
  },
  {
    "estimatedTime": 90,
    "id": "linux-baseline-inspection",
    "category": "linux",
    "type": "multiple",
    "level": "intermediate",
    "title": "主机基线巡检",
    "prompt": "新接手一批 Linux 主机，哪些基线项最应该纳入自动巡检？",
    "options": [
      {
        "id": "a",
        "text": "CPU、内存、磁盘、inode、负载、时间同步"
      },
      {
        "id": "b",
        "text": "账号权限、补丁版本、SSH 配置和日志轮转"
      },
      {
        "id": "c",
        "text": "仅采集主机名和上线日期等静态台账信息"
      },
      {
        "id": "d",
        "text": "关键进程、端口、systemd failed units"
      }
    ],
    "answer": [
      "a",
      "b",
      "d"
    ],
    "explanation": "基线巡检要覆盖四个面：资源（CPU/内存/磁盘/inode/负载）、服务（关键进程/端口/failed units）、安全（账号/补丁/SSH）、可维护（日志轮转/时间同步）。漏掉一面，后续监控和排障都会有盲区。",
    "wrongReasons": {
      "c": "静态台账不反映运行健康；基线巡检要的是能随时间对比的动态指标。"
    },
    "skillTags": [
      "baseline",
      "inspection",
      "linux",
      "security"
    ],
    "relatedCommand": "主机巡检脚本：resource + service + security + logs",
    "mnemonic": "基线巡检四个面：资源、服务、安全、可维护。"
  },
  {
    "estimatedTime": 80,
    "id": "network-timeout-refused",
    "category": "network",
    "type": "single",
    "level": "intermediate",
    "title": "超时与拒绝",
    "prompt": "connect timeout 和 connection refused 的关键区别是什么？",
    "options": [
      {
        "id": "a",
        "text": "refused 一定是 DNS 错误"
      },
      {
        "id": "b",
        "text": "timeout 多为链路或策略无响应；refused 表示目标可达但端口拒绝或无监听"
      },
      {
        "id": "c",
        "text": "timeout 一定是证书过期"
      },
      {
        "id": "d",
        "text": "二者完全等价"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "网络排障要先识别失败类型。超时常看路由、ACL、防火墙、安全组；拒绝常看监听进程、端口、健康状态或主动拒绝策略。",
    "wrongReasons": {
      "d": "两者排查方向不同。",
      "a": "DNS 错误通常连 IP 都解析不到。",
      "c": "证书问题发生在 TLS 阶段，不是 TCP connect timeout。"
    },
    "skillTags": [
      "tcp",
      "timeout",
      "refused",
      "nc"
    ],
    "relatedCommand": "nc -vz <host> <port>",
    "mnemonic": "timeout=没回应(查链路/策略)；refused=有回应但端口没开(查监听)。"
  },
  {
    "estimatedTime": 100,
    "id": "network-security-group-layering",
    "category": "network",
    "type": "multiple",
    "level": "intermediate",
    "title": "安全组分层排查",
    "prompt": "云上服务端口不通，哪些层必须逐一确认？",
    "options": [
      {
        "id": "a",
        "text": "默认网络都是通的，先去排查应用代码 bug"
      },
      {
        "id": "b",
        "text": "服务本机是否监听目标端口"
      },
      {
        "id": "c",
        "text": "从客户端、跳板机和同 VPC 位置分别测试"
      },
      {
        "id": "d",
        "text": "主机防火墙、安全组、ACL 和路由是否放通"
      }
    ],
    "answer": [
      "b",
      "c",
      "d"
    ],
    "explanation": "排障要分层证明：进程是否监听、主机防火墙、云安全组/ACL、路由路径和客户端位置，逐层放通，不能一句\"网络不通\"混过去。",
    "wrongReasons": {
      "a": "端口不通要先证明网络各层是否放通，跳过分层直接怀疑代码会漏掉安全组/防火墙等真实拦点。"
    },
    "skillTags": [
      "security-group",
      "firewall",
      "vpc",
      "port"
    ],
    "relatedCommand": "ss -lntp && nc -vz <host> <port>",
    "mnemonic": "端口不通逐层证：进程监听→主机防火墙→安全组/ACL→路由→客户端位置。"
  },
  {
    "estimatedTime": 75,
    "id": "network-dns-authoritative-cache",
    "category": "network",
    "type": "scenario",
    "level": "intermediate",
    "title": "DNS 缓存与权威",
    "prompt": "域名记录已修改，但部分用户仍访问旧地址，常见原因是什么？",
    "options": [
      {
        "id": "a",
        "text": "VPC 路由表发生重叠路由条目冲突"
      },
      {
        "id": "b",
        "text": "递归 DNS、客户端或中间缓存仍持有旧记录"
      },
      {
        "id": "c",
        "text": "DHCP 租约过期触发本地主机 IP 变更重连"
      },
      {
        "id": "d",
        "text": "本地网卡驱动发生中断聚合（Interrupt Coalescing）故障"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "DNS 变更受 TTL、递归缓存、客户端缓存和权威记录影响。部分用户拿旧地址，通常是递归或客户端缓存还没过期，要区分权威查询和用户侧缓存。",
    "wrongReasons": {
      "d": "网卡驱动中断聚合会引起网络吞吐或丢包变化，不影响 DNS 缓存生命周期。",
      "a": "重叠路由冲突会导致目标路由不可达，与部分用户依然拿到旧 DNS 记录无关。",
      "c": "DHCP 租约与域名的外部递归缓存传播无关。"
    },
    "skillTags": [
      "dns",
      "ttl",
      "cache",
      "dig"
    ],
    "relatedCommand": "dig @8.8.8.8 example.com && dig +trace example.com",
    "mnemonic": "DNS 改了没全生效：TTL 内各级缓存仍握旧记录，等缓存过期或手动刷新。"
  },
  {
    "estimatedTime": 80,
    "id": "network-tls-certificate",
    "category": "network",
    "type": "single",
    "level": "intermediate",
    "title": "TLS 证书异常",
    "prompt": "浏览器提示证书过期或域名不匹配，第一轮应确认什么？",
    "options": [
      {
        "id": "a",
        "text": "证书有效期、SAN 域名、证书链和服务器时间"
      },
      {
        "id": "b",
        "text": "Redis 缓存中连接池的最大空闲连接数"
      },
      {
        "id": "c",
        "text": "VPC 默认网关的 MTU 大小限制"
      },
      {
        "id": "d",
        "text": "后端 Deployment 的滚动发布副本数"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "TLS 排障要看证书本身、链路和 SNI。很多线上事故来自续期失败、证书链缺失、部署错证书或服务器时间异常。",
    "wrongReasons": {
      "d": "滚动发布副本数与 TLS 握手阶段证书校验不通过无关。",
      "b": "Redis 连接池不会影响客户端到 HTTPS 网关的证书校验。",
      "c": "MTU 限制可能导致大包卡住，但浏览器能收到证书数据并提示过期或不匹配，说明握手包已达，重点应检查证书本身。"
    },
    "skillTags": [
      "tls",
      "certificate",
      "openssl",
      "sni"
    ],
    "relatedCommand": "openssl s_client -connect example.com:443 -servername example.com",
    "mnemonic": "证书报错先看四样：有效期、SAN 域名、证书链、服务器时间。"
  },
  {
    "estimatedTime": 80,
    "id": "network-http-502-upstream",
    "category": "network",
    "type": "log-analysis",
    "level": "intermediate",
    "title": "网关 502",
    "prompt": "Nginx 返回 502，日志显示 connect() failed while connecting to upstream，优先检查哪一层？",
    "options": [
      {
        "id": "a",
        "text": "本地 DNS 解析服务器的转发规则限制"
      },
      {
        "id": "b",
        "text": "客户端请求头部中 Accept-Encoding 的参数类型"
      },
      {
        "id": "c",
        "text": "安全证书链文件的哈希冲突"
      },
      {
        "id": "d",
        "text": "Nginx 到上游服务的地址、端口、监听和健康状态"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "502 通常说明网关到上游失败或上游返回异常。先看 upstream 配置、端口监听、健康检查、网络策略和上游日志。",
    "wrongReasons": {
      "b": "Accept-Encoding 仅指示压缩编码方式，与网关 upstream 连接失败无关。",
      "a": "如果解析失败会报 host not found，日志报 connect() failed while connecting to upstream 说明 IP 已解析但无法建立连接。",
      "c": "证书哈希与网关到上游的连接失败无直接关联。"
    },
    "skillTags": [
      "nginx",
      "http",
      "502",
      "upstream"
    ],
    "relatedCommand": "curl -v http://upstream/health",
    "mnemonic": "502=网关连不上上游：查上游地址/端口/监听/健康，再看上游日志。"
  },
  {
    "estimatedTime": 95,
    "id": "network-lb-healthcheck",
    "category": "network",
    "type": "scenario",
    "level": "advanced",
    "title": "负载均衡健康检查",
    "prompt": "SLB 后端实例被频繁摘除又恢复，最应该看哪些信息？",
    "options": [
      {
        "id": "a",
        "text": "直接重启全部后端实例，期望抖动自愈"
      },
      {
        "id": "b",
        "text": "放宽或关闭健康检查，让实例不再被摘除"
      },
      {
        "id": "c",
        "text": "给 SLB 加大带宽配额"
      },
      {
        "id": "d",
        "text": "健康检查路径、超时阈值、后端响应码、实例负载和网络抖动"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "负载均衡不是只转发流量，还决定哪些实例可以接流量。频繁摘除常见于探活路径不稳、阈值过严、实例负载高、网络抖动或应用半健康。",
    "wrongReasons": {
      "b": "放宽/关闭健康检查会让半健康实例继续接流量，是掩盖问题而非排查。",
      "a": "不定位根因直接重启，抖动会复发，还可能放大影响。",
      "c": "频繁摘除是探活与实例健康问题，与 SLB 带宽配额无关。"
    },
    "skillTags": [
      "slb",
      "load-balancer",
      "healthcheck",
      "ha"
    ],
    "relatedCommand": "check health path + upstream status + backend logs",
    "mnemonic": "实例频繁摘除看五样：探活路径、超时阈值、响应码、实例负载、网络抖动。"
  },
  {
    "estimatedTime": 105,
    "id": "network-mtu-mss",
    "category": "network",
    "type": "scenario",
    "level": "advanced",
    "title": "MTU 黑洞",
    "prompt": "小包正常，大请求或 TLS 握手偶发卡住，可能需要检查什么？",
    "options": [
      {
        "id": "a",
        "text": "Nginx 配置的 keepalive_timeout 过短"
      },
      {
        "id": "b",
        "text": "MTU、MSS 和路径分片问题"
      },
      {
        "id": "c",
        "text": "DNS 权威服务器 A 记录 TTL 过长"
      },
      {
        "id": "d",
        "text": "服务端开启了 TCP timestamp 且未同步导致丢包"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "跨云、VPN、专线和容器网络里 MTU/MSS 不匹配很常见。表现通常不是完全不通，而是大包、TLS 或特定请求异常。",
    "wrongReasons": {
      "c": "TTL 过长不会引发“大包偶发卡住”的表现。",
      "a": "keepalive 超时短会导致连接快速断开，而不是握手大包卡住。",
      "d": "TCP timestamp 不同步通常会导致连接完全无法建立，而非仅大包卡死。"
    },
    "skillTags": [
      "mtu",
      "mss",
      "fragmentation",
      "vpn"
    ],
    "relatedCommand": "ping -M do -s 1472 <host>",
    "mnemonic": "小包通、大包/握手卡=MTU/MSS 黑洞，ping -M do -s 逐步试探。"
  },
  {
    "estimatedTime": 95,
    "id": "network-nat-session",
    "category": "network",
    "type": "single",
    "level": "advanced",
    "title": "NAT 与会话",
    "prompt": "大量短连接导致公网出口端口耗尽，常见优化方向是什么？",
    "options": [
      {
        "id": "a",
        "text": "扩大 Linux 控制台的历史命令缓冲区大小"
      },
      {
        "id": "b",
        "text": "将日志收集 Agent 的轮询间隔设为微秒级"
      },
      {
        "id": "c",
        "text": "连接复用、连接池、减少短连接并评估 NAT 会话容量"
      },
      {
        "id": "d",
        "text": "为云主机网卡配置双 IP 绑定以分流 ARP 广播"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "短连接会成倍增加 TCP/TLS 握手和 NAT 端口压力。连接复用和连接池能显著降低出口端口与会话消耗，是会话容量优化的主线。",
    "wrongReasons": {
      "a": "缓冲区大小与公网出口的 NAT 端口耗尽无关。",
      "b": "Agent 轮询间隔调小会增加负载，反而可能产生更多连接消耗。",
      "d": "ARP 广播是局域网二层协议，不能解决公网出口四层 NAT 端口资源不足。"
    },
    "skillTags": [
      "nat",
      "connection-pool",
      "tcp",
      "capacity"
    ],
    "relatedCommand": "ss -s && conntrack -S",
    "mnemonic": "出口端口耗尽：连接复用+连接池，减少短连接，评估 NAT 会话容量。"
  },
  {
    "estimatedTime": 90,
    "id": "network-device-config-backup",
    "category": "network",
    "type": "multiple",
    "level": "intermediate",
    "title": "网络设备配置备份",
    "prompt": "网络运维岗位要求交换机、路由器、防火墙维护，哪些做法能降低误操作风险？",
    "options": [
      {
        "id": "a",
        "text": "准备回滚命令和远程断连应急方案"
      },
      {
        "id": "b",
        "text": "变更前备份配置并记录差异"
      },
      {
        "id": "c",
        "text": "改完直接保存生效，出问题再说"
      },
      {
        "id": "d",
        "text": "变更后验证路由、ACL、会话和业务探活"
      }
    ],
    "answer": [
      "a",
      "b",
      "d"
    ],
    "explanation": "网络设备变更容易造成大范围影响。配置备份、差异审查、回滚方案和变更后验证，是成熟网络运维的底线。",
    "wrongReasons": {
      "c": "不留备份和回滚、改完即生效，一旦出错无法快速恢复，可能造成大范围中断。"
    },
    "skillTags": [
      "switch",
      "router",
      "firewall",
      "change"
    ],
    "relatedCommand": "配置备份 + diff + rollback + post-check",
    "mnemonic": "网络变更四保险：先备份、看 diff、备回滚、改后验证。"
  },
  {
    "estimatedTime": 75,
    "id": "network-zero-trust-access",
    "category": "network",
    "type": "single",
    "level": "intermediate",
    "title": "远程访问边界",
    "prompt": "给供应商临时开放远程排障访问，最合理的网络控制是什么？",
    "options": [
      {
        "id": "a",
        "text": "直接共享一个长期 VPN 账号给供应商"
      },
      {
        "id": "b",
        "text": "对供应商来源放开全部端口图省事"
      },
      {
        "id": "c",
        "text": "省去审计，直接给生产主机 SSH 权限"
      },
      {
        "id": "d",
        "text": "限定源地址、目标端口、访问时间和审计记录"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "临时访问要最小范围、最短时间、可审计：限定源地址和目标端口、设置时间窗口、保留审计记录，既能排障又不扩大暴露面。",
    "wrongReasons": {
      "b": "放开全部端口会暴露巨大攻击面，违背最小授权。",
      "a": "长期共享账号无法追责，离场后也难以及时回收。",
      "c": "跳过审计会丢失操作证据，事后无法追溯。"
    },
    "skillTags": [
      "remote-access",
      "acl",
      "audit",
      "zero-trust"
    ],
    "relatedCommand": "source + destination + time window + audit",
    "mnemonic": "临时访问最小化：限源 IP、限端口、限时间、留审计。"
  },
  {
    "estimatedTime": 105,
    "id": "network-packet-capture",
    "category": "network",
    "type": "command",
    "level": "advanced",
    "title": "抓包定位",
    "prompt": "怀疑服务端没有收到客户端请求，抓包验证应优先在哪些位置做？",
    "options": [
      {
        "id": "a",
        "text": "在任意一台机器全量抓包再慢慢翻"
      },
      {
        "id": "b",
        "text": "客户端出口、服务端入口或关键网关节点，按五元组过滤"
      },
      {
        "id": "c",
        "text": "先清空防火墙规则看是否恢复"
      },
      {
        "id": "d",
        "text": "只在客户端看应用层报错日志"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "抓包的价值在于证明包有没有走到某一层。按源 IP、目标 IP、端口、协议过滤，并在路径关键点对比，能快速判断丢包位置。",
    "wrongReasons": {
      "a": "不限位置和条件的全量抓包噪声极大，难以定位丢包段。",
      "c": "未取证就清空规则风险过大，且无法证明丢在哪一层。",
      "d": "应用层日志证明不了网络路径，要在链路关键点抓包对比。"
    },
    "skillTags": [
      "tcpdump",
      "packet",
      "five-tuple",
      "network"
    ],
    "relatedCommand": "tcpdump -i eth0 host <ip> and port <port>",
    "mnemonic": "抓包按五元组，在出口/入口/网关三点对比，定位丢在哪一段。"
  },
  {
    "estimatedTime": 85,
    "id": "network-waf-403",
    "category": "network",
    "type": "scenario",
    "level": "intermediate",
    "title": "WAF 误拦截",
    "prompt": "业务请求突然大量 403，但服务端应用日志没有对应请求，优先检查什么？",
    "options": [
      {
        "id": "a",
        "text": "数据库慢查询日志里的执行计划和锁等待"
      },
      {
        "id": "b",
        "text": "后端 Pod 的镜像体积和拉取耗时"
      },
      {
        "id": "c",
        "text": "应用服务器的主机名和时区配置"
      },
      {
        "id": "d",
        "text": "CDN/WAF/网关访问日志和拦截规则命中情况"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "请求没到应用但返回 403，说明可能被入口层拦截。先看 CDN、WAF、网关和安全策略命中，再决定放行、调整规则或联系安全团队。",
    "wrongReasons": {
      "a": "请求未到应用，慢查询不是首要证据。",
      "b": "镜像大小不会导致入口 403。",
      "c": "主机名不是 WAF 拦截证据。"
    },
    "skillTags": [
      "waf",
      "403",
      "gateway",
      "security"
    ],
    "relatedCommand": "查 WAF/CDN requestId 和规则命中",
    "mnemonic": "请求没到应用却 403：先查 CDN/WAF/网关的拦截规则命中。"
  },
  {
    "estimatedTime": 120,
    "id": "cloud-vpc-migration",
    "category": "cloud",
    "type": "scenario",
    "level": "advanced",
    "title": "VPC 迁移闭环",
    "prompt": "业务从经典网络迁到 VPC，最成熟的迁移动作是什么？",
    "options": [
      {
        "id": "a",
        "text": "迁移当晚一次性全量切流，不留灰度"
      },
      {
        "id": "b",
        "text": "只改入口 IP，不同步上下游依赖"
      },
      {
        "id": "c",
        "text": "梳理依赖、备份、灰度切流、验证路由/安全组/SLB、保留回滚窗口"
      },
      {
        "id": "d",
        "text": "切流成功就立即删除旧资源释放成本"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "迁移不是点控制台，而是把网络、数据、依赖、验证和回滚收进流程：先梳理依赖、备份，再灰度切流并逐项验证，最后保留回滚窗口。",
    "wrongReasons": {
      "d": "立即删除旧资源会失去回滚入口，问题暴露时无法快速退回。",
      "b": "只改 IP 会漏掉依赖、路由和安全组，上下游可能直接中断。",
      "a": "一次性全量切流没有灰度和回滚缓冲，出问题影响面最大。"
    },
    "skillTags": [
      "vpc",
      "migration",
      "rollback",
      "cloud"
    ],
    "relatedCommand": "inventory -> backup -> switch -> validate -> rollback-ready",
    "mnemonic": "迁移五步：梳依赖→备份→灰度切流→验路由/安全组/SLB→留回滚窗口。"
  },
  {
    "estimatedTime": 75,
    "id": "cloud-iam-ram-policy",
    "category": "cloud",
    "type": "single",
    "level": "intermediate",
    "title": "云账号权限",
    "prompt": "给外包同学排查日志，最合适的 RAM/IAM 授权方式是什么？",
    "options": [
      {
        "id": "a",
        "text": "把长期 AccessKey 直接发给外包同学"
      },
      {
        "id": "b",
        "text": "限定项目、限定时间、只读日志权限，并保留审计"
      },
      {
        "id": "c",
        "text": "图省事直接授予全局管理员权限"
      },
      {
        "id": "d",
        "text": "把主账号密码临时借给对方使用"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "最小权限、临时授权和审计记录能兼顾排障效率和安全边界：限定项目、限定时间、只读日志权限并保留审计。",
    "wrongReasons": {
      "d": "主账号是最高权限且不可共享，借出无法追责。",
      "c": "全局管理员远超排查日志范围，违反最小授权。",
      "a": "长期 AK 外发易泄露且难回收，权限也远超只读日志所需。"
    },
    "skillTags": [
      "iam",
      "ram",
      "least-privilege",
      "audit"
    ],
    "relatedCommand": "least privilege + temporary access + audit log",
    "mnemonic": "临时授权：限项目、限时间、只读、留审计；绝不发 AK 或给主账号。"
  },
  {
    "estimatedTime": 100,
    "id": "cloud-slb-vip-cutover",
    "category": "cloud",
    "type": "scenario",
    "level": "advanced",
    "title": "SLB/VIP 切流",
    "prompt": "云上切换 SLB/VIP 后部分用户失败，优先验证什么？",
    "options": [
      {
        "id": "a",
        "text": "先把旧后端实例删掉腾出资源配额"
      },
      {
        "id": "b",
        "text": "DNS/VIP 指向、SLB 后端健康、权重、监听端口、安全组和业务探活"
      },
      {
        "id": "c",
        "text": "关闭健康检查，让失败实例也保持在线"
      },
      {
        "id": "d",
        "text": "让用户多刷新几次浏览器重试一下"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "切流故障常来自入口指向、后端健康、权重、策略或缓存。要按流量路径逐层验证，不能只看控制台显示成功。",
    "wrongReasons": {
      "d": "刷新浏览器证明不了入口链路和后端健康。",
      "a": "删除旧实例会失去回滚空间，切换失败就无法退回。",
      "c": "关闭健康检查会让坏实例继续接流量，扩大故障。"
    },
    "skillTags": [
      "slb",
      "vip",
      "cutover",
      "healthcheck"
    ],
    "relatedCommand": "dig + curl VIP + check backend health/weight",
    "mnemonic": "切流后按路径验：DNS/VIP 指向→后端健康→权重→监听→安全组→探活。"
  },
  {
    "estimatedTime": 100,
    "id": "cloud-backup-restore-drill",
    "category": "cloud",
    "type": "scenario",
    "level": "advanced",
    "title": "备份恢复演练",
    "prompt": "备份任务每天成功，但从未恢复演练。真正风险是什么？",
    "options": [
      {
        "id": "a",
        "text": "没有风险，备份成功就一定能恢复"
      },
      {
        "id": "b",
        "text": "不能证明数据完整、权限正确、版本兼容、RTO/RPO 达标"
      },
      {
        "id": "c",
        "text": "把每日备份保留期缩短到 1 天省空间"
      },
      {
        "id": "d",
        "text": "只要备份任务状态为成功就放心"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "备份的目标是恢复业务，不是生成文件。恢复演练验证完整性、流程、权限、时间和数据丢失边界。",
    "wrongReasons": {
      "a": "备份成功和恢复成功之间还有完整性、权限、版本和时间等很多风险。",
      "c": "缩短保留期会减少可回退的时间点，遇到延迟发现的故障无法恢复。",
      "d": "任务成功只代表生成了文件，不能证明能恢复出可用数据。"
    },
    "skillTags": [
      "backup",
      "restore",
      "rto",
      "rpo"
    ],
    "relatedCommand": "restore drill + checksum + service startup + RTO/RPO record",
    "mnemonic": "备份成功≠能恢复，要定期恢复演练验完整性和 RTO/RPO。"
  },
  {
    "estimatedTime": 85,
    "id": "cloud-vulnerability-patch",
    "category": "cloud",
    "type": "single",
    "level": "intermediate",
    "title": "漏洞修复闭环",
    "prompt": "云主机出现高危漏洞，最稳妥的处理策略是什么？",
    "options": [
      {
        "id": "a",
        "text": "关闭漏洞扫描器，让高危告警消失"
      },
      {
        "id": "b",
        "text": "把漏洞报告标记已读，先搁置观望"
      },
      {
        "id": "c",
        "text": "不做验证就直接全量升级所有依赖"
      },
      {
        "id": "d",
        "text": "确认影响范围，测试环境验证补丁，安排窗口灰度修复并复扫"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "安全修复要兼顾风险降低和可用性。影响面、验证、灰度、复扫闭环缺一不可。",
    "wrongReasons": {
      "c": "未验证就全量升级可能造成业务不可用。",
      "b": "标记已读不等于修复，高危漏洞会持续暴露。",
      "a": "关掉扫描器只是看不到风险，漏洞仍然存在。"
    },
    "skillTags": [
      "vulnerability",
      "patch",
      "security",
      "change"
    ],
    "relatedCommand": "scope -> test -> gray patch -> rescan",
    "mnemonic": "修漏闭环：定影响→测试验证→灰度→复扫。"
  },
  {
    "estimatedTime": 80,
    "id": "cloud-cost-capacity",
    "category": "cloud",
    "type": "multiple",
    "level": "intermediate",
    "title": "云资源成本优化",
    "prompt": "哪些动作属于合理的云资源成本优化？",
    "options": [
      {
        "id": "a",
        "text": "变更前通知业务并保留回滚方案"
      },
      {
        "id": "b",
        "text": "结合峰值、SLA 和扩容时间调整规格或购买策略"
      },
      {
        "id": "c",
        "text": "识别低利用率实例、闲置磁盘、未使用公网 IP 和过大规格"
      },
      {
        "id": "d",
        "text": "为压成本直接调低生产库规格且不做评估"
      }
    ],
    "answer": [
      "a",
      "b",
      "c"
    ],
    "explanation": "成本优化不是砍资源，而是在不破坏 SLA 的前提下减少浪费。要结合峰值、扩容速度、稳定性和回滚。",
    "wrongReasons": {
      "d": "不评估就压低生产库规格可能触发性能瓶颈甚至故障，违背不破坏 SLA 的前提。"
    },
    "skillTags": [
      "cloud-cost",
      "capacity",
      "sla",
      "resource"
    ],
    "relatedCommand": "utilization report + peak analysis + rollback plan",
    "mnemonic": "降本不砍 SLA：清闲置(低利用/闲盘/空 IP)+按峰值调规格。"
  },
  {
    "estimatedTime": 85,
    "id": "cloud-cmdb-assets",
    "category": "cloud",
    "type": "multiple",
    "level": "intermediate",
    "title": "云资源资产台账",
    "prompt": "云资源变更后，哪些信息必须同步到 CMDB 或资产台账？",
    "options": [
      {
        "id": "a",
        "text": "拓扑关系、环境、业务归属和过期时间"
      },
      {
        "id": "b",
        "text": "只靠个人记忆维护"
      },
      {
        "id": "c",
        "text": "监控、告警、Runbook 和联系人变化"
      },
      {
        "id": "d",
        "text": "实例、磁盘、公网 IP、SLB、数据库和责任人"
      }
    ],
    "answer": [
      "a",
      "c",
      "d"
    ],
    "explanation": "云资源弹性强，也更容易失控。台账不准会导致找错资源、漏删资源、漏监控和误操作。",
    "wrongReasons": {
      "b": "个人记忆不可审计、不可交接。"
    },
    "skillTags": [
      "cmdb",
      "asset",
      "cloud",
      "runbook"
    ],
    "relatedCommand": "CMDB + topology + owner + monitor sync",
    "mnemonic": "资源变更必同步台账：实例/盘/IP/SLB/库+责任人+拓扑。"
  },
  {
    "estimatedTime": 85,
    "id": "cloud-government-compliance",
    "category": "cloud",
    "type": "single",
    "level": "intermediate",
    "title": "政务云合规",
    "prompt": "政务云运维最符合合规要求的做法是什么？",
    "options": [
      {
        "id": "a",
        "text": "把漏洞拖到等保测评前再集中处理"
      },
      {
        "id": "b",
        "text": "多人共用一个管理员账号提高效率"
      },
      {
        "id": "c",
        "text": "为节省存储空间关闭操作审计日志"
      },
      {
        "id": "d",
        "text": "操作走审批，权限最小化，关键操作留审计，漏洞和基线形成闭环报告"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "政务云强调等保、审计、安全加固和报告：操作走审批、权限最小化、关键操作留审计、漏洞和基线形成闭环，稳定性之外还要可追溯。",
    "wrongReasons": {
      "b": "共用账号无法定位到人，破坏责任追溯，违反等保要求。",
      "c": "关闭审计会让关键操作不可追溯，直接违规。",
      "a": "漏洞拖到审计前才处理会长期暴露风险，不符合闭环要求。"
    },
    "skillTags": [
      "government-cloud",
      "compliance",
      "audit",
      "baseline"
    ],
    "relatedCommand": "approval + bastion audit + vulnerability closure",
    "mnemonic": "合规四件套：审批、最小权限、留审计、漏洞基线闭环。"
  },
  {
    "estimatedTime": 90,
    "id": "cloud-datacenter-inspection",
    "category": "cloud",
    "type": "multiple",
    "level": "intermediate",
    "title": "数据中心巡检",
    "prompt": "数据中心运维巡检时，哪些检查能提前发现生产风险？",
    "options": [
      {
        "id": "a",
        "text": "服务器硬件告警、磁盘阵列、存储链路和备件"
      },
      {
        "id": "b",
        "text": "只远程看监控大盘绿不绿"
      },
      {
        "id": "c",
        "text": "资产标签、端口连接、上架下架记录和变更单一致性"
      },
      {
        "id": "d",
        "text": "机柜电力、温湿度、UPS、空调和消防环境"
      }
    ],
    "answer": [
      "a",
      "c",
      "d"
    ],
    "explanation": "数据中心巡检把硬件、环境、资产和变更串在一起：不是走过场，而是提前把磁盘阵列、电力温湿度、资产一致性等隐患变成工单。",
    "wrongReasons": {
      "b": "只看大盘颜色会漏掉硬件、环境和资产层的隐患，巡检要逐项核实。"
    },
    "skillTags": [
      "datacenter",
      "server",
      "storage",
      "environment"
    ],
    "relatedCommand": "hardware alerts + environment + CMDB check",
    "mnemonic": "机房巡检四面：硬件、环境(电/温/UPS/消防)、资产、变更一致。"
  },
  {
    "estimatedTime": 85,
    "id": "cloud-storage-expansion",
    "category": "cloud",
    "type": "scenario",
    "level": "intermediate",
    "title": "云盘扩容",
    "prompt": "云盘控制台扩容后，系统内文件系统容量没有变化，下一步应该做什么？",
    "options": [
      {
        "id": "a",
        "text": "删掉云盘重新创建，指望容量自动扩上去"
      },
      {
        "id": "b",
        "text": "确认分区和文件系统类型，执行对应 growpart/resize2fs/xfs_growfs"
      },
      {
        "id": "c",
        "text": "重装业务应用，期望文件系统容量变大"
      },
      {
        "id": "d",
        "text": "清空数据库数据来腾出磁盘空间"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "云盘扩容通常分两步：云资源层扩容和系统内分区/文件系统扩容。只在控制台扩容，不等于 OS 已可用。",
    "wrongReasons": {
      "a": "删除云盘会丢数据，且扩容根本不需要重建。",
      "c": "应用重装不动文件系统，容量依然没变。",
      "d": "清空数据库是破坏性操作，与文件系统扩容无关。"
    },
    "skillTags": [
      "cloud-disk",
      "filesystem",
      "resize",
      "storage"
    ],
    "relatedCommand": "lsblk && growpart && resize2fs/xfs_growfs",
    "mnemonic": "云盘扩容两步：控制台扩→OS 内 growpart + resize2fs/xfs_growfs。"
  },
  {
    "estimatedTime": 100,
    "id": "cloud-instance-retirement",
    "category": "cloud",
    "type": "scenario",
    "level": "advanced",
    "title": "旧主机下线",
    "prompt": "云主机准备下线回收，最完整的检查是什么？",
    "options": [
      {
        "id": "a",
        "text": "下线后顺手把变更记录一并清掉"
      },
      {
        "id": "b",
        "text": "确认不了依赖也先把实例释放掉"
      },
      {
        "id": "c",
        "text": "确认无流量、无定时任务、无数据依赖、备份归档、监控摘除和数据擦除"
      },
      {
        "id": "d",
        "text": "改个主机名，标记成已下线就算完成"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "下线是高风险操作，必须先证明没有业务依赖，再处理数据、监控、资产和审计：确认无流量、无定时任务、无数据依赖，备份归档、摘除监控并擦除数据。",
    "wrongReasons": {
      "b": "未证明无依赖直接释放，可能中断隐藏的上下游调用。",
      "d": "改主机名不等于真正下线，资源、监控和数据都还在。",
      "a": "删除变更记录会破坏审计，事后无法追溯下线过程。"
    },
    "skillTags": [
      "decommission",
      "archive",
      "wipe",
      "cmdb"
    ],
    "relatedCommand": "traffic zero + backup + archive + wipe + CMDB update",
    "mnemonic": "下线先证无依赖：无流量/任务/数据依赖，再备份/摘监控/擦数据。"
  },
  {
    "estimatedTime": 110,
    "id": "cloud-multi-az-dr",
    "category": "cloud",
    "type": "single",
    "level": "advanced",
    "title": "多可用区灾备",
    "prompt": "业务要求跨可用区高可用，最关键的设计点是什么？",
    "options": [
      {
        "id": "a",
        "text": "入口、计算、数据、缓存、消息和配置都要有故障切换与演练"
      },
      {
        "id": "b",
        "text": "不做演练，等故障自然验证"
      },
      {
        "id": "c",
        "text": "只买更贵的单机"
      },
      {
        "id": "d",
        "text": "只把应用复制一份，不管数据库"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "跨 AZ 高可用不是多放几台机器。入口、状态数据、依赖组件、配置、监控和演练都要闭环，任何单点都可能让灾备失效。",
    "wrongReasons": {
      "d": "数据库单点会让应用多副本失去意义。",
      "c": "更贵单机仍然是单点。",
      "b": "不演练的灾备不可相信。"
    },
    "skillTags": [
      "multi-az",
      "dr",
      "ha",
      "architecture"
    ],
    "relatedCommand": "failover drill + dependency checklist",
    "mnemonic": "跨 AZ 高可用：入口/计算/数据/缓存/消息/配置都要能切换+演练。"
  },
  {
    "estimatedTime": 70,
    "id": "devops-docker-image-runtime",
    "category": "devops",
    "type": "single",
    "level": "intermediate",
    "title": "镜像能构建但不能运行",
    "prompt": "Docker 镜像构建成功，但容器启动后立即退出，最优先看什么？",
    "options": [
      {
        "id": "a",
        "text": "docker logs、退出码、ENTRYPOINT/CMD 和运行时环境变量"
      },
      {
        "id": "b",
        "text": "Docker 守护进程配置中的镜像仓库鉴权代理地址"
      },
      {
        "id": "c",
        "text": "Dockerfile 中构建阶段的 LABEL 标签信息"
      },
      {
        "id": "d",
        "text": "主机宿主网卡的 MTU 大小配置"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "容器排障要区分构建期和运行期。启动即退出通常看入口命令、依赖配置、环境变量、权限和日志。",
    "wrongReasons": {
      "b": "如果是仓库鉴权问题，容器根本无法成功拉取构建，而不是启动后才退出。",
      "c": "LABEL 是元数据信息，不影响运行期进程的退出。",
      "d": "MTU 影响数据传输，一般不会导致容器刚起来就立即退出并改变状态。"
    },
    "skillTags": [
      "docker",
      "logs",
      "entrypoint",
      "container"
    ],
    "relatedCommand": "docker logs <container> && docker inspect <container>",
    "mnemonic": "容器起来就退：看 docker logs + 退出码 + ENTRYPOINT/CMD + 环境变量。"
  },
  {
    "estimatedTime": 85,
    "id": "devops-container-resource-limit",
    "category": "devops",
    "type": "scenario",
    "level": "intermediate",
    "title": "容器资源限制",
    "prompt": "容器频繁 OOMKilled，优先确认哪些内容？",
    "options": [
      {
        "id": "a",
        "text": "关闭监控告警，让 OOMKilled 不再提示"
      },
      {
        "id": "b",
        "text": "换一个更大的基础镜像重新构建"
      },
      {
        "id": "c",
        "text": "反复重启容器，期望它自己恢复"
      },
      {
        "id": "d",
        "text": "容器 memory limit、应用内存曲线、GC/堆配置和近期流量或发布变化"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "OOMKilled 表示资源限制触发。要把容器限制、应用内存行为、流量、发布和依赖变化一起看，不能只靠重启。",
    "wrongReasons": {
      "c": "重启只是临时拉起，没有定位内存增长的根因。",
      "b": "换基础镜像不改变应用自身内存占用，OOM 会复现。",
      "a": "关掉监控只是看不到 OOM，内存问题依旧存在。"
    },
    "skillTags": [
      "docker",
      "oom",
      "memory",
      "resource-limit"
    ],
    "relatedCommand": "docker stats && inspect memory limit",
    "mnemonic": "OOMKilled=内存超限：查 limit、内存曲线、GC/堆、近期流量与发布。"
  },
  {
    "estimatedTime": 80,
    "id": "devops-k8s-crashloop",
    "category": "devops",
    "type": "log-analysis",
    "level": "intermediate",
    "title": "CrashLoopBackOff",
    "prompt": "Pod CrashLoopBackOff，最应该先看什么？",
    "options": [
      {
        "id": "a",
        "text": "Kube-proxy 服务所选用的 IPVS 路由转发模式"
      },
      {
        "id": "b",
        "text": "集群中 Service 账号所绑定的 RBAC 权限边界"
      },
      {
        "id": "c",
        "text": "kubectl describe 事件、退出码和 kubectl logs --previous"
      },
      {
        "id": "d",
        "text": "CoreDNS 副本集在其他节点上的分布比例"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "排查不是只看 Pod 状态，而要拿到退出前日志、事件、探针和配置变更证据：kubectl describe 看事件和退出码，kubectl logs --previous 看上一次崩溃日志。",
    "wrongReasons": {
      "a": "IPVS 转发影响网络连通，不是排查 Pod 自身崩溃启动循环的首要入口。",
      "b": "RBAC 会引发 Permission Denied，但需要通过 describe 和 --previous 日志捕获。",
      "d": "CoreDNS 分布与单个 Pod 重复重启的内部退出码和事件关联不大。"
    },
    "skillTags": [
      "kubernetes",
      "crashloop",
      "logs",
      "events"
    ],
    "relatedCommand": "kubectl describe pod <pod> && kubectl logs <pod> --previous",
    "mnemonic": "CrashLoopBackOff：describe 看事件 + logs --previous 看退出前日志。"
  },
  {
    "estimatedTime": 65,
    "id": "devops-k8s-readiness",
    "category": "devops",
    "type": "single",
    "level": "intermediate",
    "title": "就绪探针",
    "prompt": "readinessProbe 的核心作用是什么？",
    "options": [
      {
        "id": "a",
        "text": "替代数据库的定时备份任务"
      },
      {
        "id": "b",
        "text": "判断 Pod 是否可以接收 Service 流量"
      },
      {
        "id": "c",
        "text": "决定容器镜像的分层构建方式"
      },
      {
        "id": "d",
        "text": "自动为服务申请域名 TLS 证书"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "readinessProbe 防止未就绪实例接流量。发布和扩容时，它直接影响业务是否会打到半启动实例。",
    "wrongReasons": {
      "c": "镜像构建由 Dockerfile/CI 决定。",
      "a": "探针不能替代备份。",
      "d": "证书由证书系统处理。"
    },
    "skillTags": [
      "kubernetes",
      "readiness",
      "service",
      "probe"
    ],
    "relatedCommand": "kubectl describe pod <pod>",
    "mnemonic": "readinessProbe=就绪才接 Service 流量，挡住半启动实例。"
  },
  {
    "estimatedTime": 80,
    "id": "devops-k8s-service-selector",
    "category": "devops",
    "type": "scenario",
    "level": "intermediate",
    "title": "Service 无 Endpoints",
    "prompt": "Service 没有 endpoints，最常见的原因是什么？",
    "options": [
      {
        "id": "a",
        "text": "Service 的 type 设成了 ClusterIP"
      },
      {
        "id": "b",
        "text": "镜像 tag 用了 latest"
      },
      {
        "id": "c",
        "text": "Deployment 副本数设为 1"
      },
      {
        "id": "d",
        "text": "Service selector 与 Pod labels 不匹配"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "Service 通过 selector 匹配 Pod labels。Endpoints 为空时先核对 selector、labels 和 Pod readiness。",
    "wrongReasons": {
      "a": "Service type 决定暴露方式，不影响 endpoints 是否生成。",
      "c": "副本数为 1 也会产生 endpoint，数量不是 endpoints 为空的原因。",
      "b": "镜像 tag 影响拉取，与 selector/labels 匹配无关。"
    },
    "skillTags": [
      "kubernetes",
      "service",
      "selector",
      "endpoints"
    ],
    "relatedCommand": "kubectl get endpoints && kubectl get pod --show-labels",
    "mnemonic": "Service 没 endpoints：先核对 selector 与 Pod labels 是否匹配。"
  },
  {
    "estimatedTime": 70,
    "id": "devops-image-pull-secret",
    "category": "devops",
    "type": "scenario",
    "level": "basic",
    "title": "ImagePullBackOff",
    "prompt": "Pod 状态为 ImagePullBackOff，应优先检查哪些方向？",
    "options": [
      {
        "id": "a",
        "text": "PVC 申请的存储容量和 accessModes"
      },
      {
        "id": "b",
        "text": "镜像名、tag、仓库地址、网络和 imagePullSecrets"
      },
      {
        "id": "c",
        "text": "HPA 配置的目标指标和副本上限"
      },
      {
        "id": "d",
        "text": "Service 的 selector 与端口配置"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "镜像拉取失败通常与地址、tag、认证、仓库权限或节点到仓库网络有关。describe 事件会给出直接错误。",
    "wrongReasons": {
      "d": "selector 影响流量，不影响拉镜像。",
      "c": "HPA 不负责拉镜像。",
      "a": "PVC 容量不影响镜像认证。"
    },
    "skillTags": [
      "kubernetes",
      "image",
      "registry",
      "secret"
    ],
    "relatedCommand": "kubectl describe pod <pod>",
    "mnemonic": "ImagePullBackOff：查镜像名/tag/仓库地址/网络/imagePullSecrets。"
  },
  {
    "estimatedTime": 85,
    "id": "devops-helm-rollback",
    "category": "devops",
    "type": "single",
    "level": "intermediate",
    "title": "Helm 回滚",
    "prompt": "Helm 发布后错误率升高，最稳妥的动作是什么？",
    "options": [
      {
        "id": "a",
        "text": "停止放量，保留证据，根据 release revision 回滚到上一稳定版本"
      },
      {
        "id": "b",
        "text": "先关闭相关告警，避免一直被打扰"
      },
      {
        "id": "c",
        "text": "继续把新版本放量到全部实例"
      },
      {
        "id": "d",
        "text": "删除 Helm 发布历史记录清爽一下"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "发布要可回滚：Helm revision、发布日志、指标和错误率是判断是否回滚的核心证据，先停放量保留现场，再回滚到上一稳定版本。",
    "wrongReasons": {
      "c": "继续放量会扩大影响。",
      "d": "删除历史会丢失回滚入口。",
      "b": "关闭告警会掩盖事故。"
    },
    "skillTags": [
      "helm",
      "release",
      "rollback",
      "canary"
    ],
    "relatedCommand": "helm history <release> && helm rollback <release> <revision>",
    "mnemonic": "发布出问题：停放量、留证据、按 release revision 回滚上一稳定版。"
  },
  {
    "estimatedTime": 100,
    "id": "devops-jenkins-pipeline",
    "category": "devops",
    "type": "multiple",
    "level": "intermediate",
    "title": "CI/CD 流水线",
    "prompt": "生产级 Jenkins/GitLab CI 流水线应包含哪些关键环节？",
    "options": [
      {
        "id": "a",
        "text": "灰度发布、健康检查、回滚和通知"
      },
      {
        "id": "b",
        "text": "凭据安全管理和审计"
      },
      {
        "id": "c",
        "text": "把生产密码写进脚本明文"
      },
      {
        "id": "d",
        "text": "构建、测试、制品版本、镜像扫描和发布审批"
      }
    ],
    "answer": [
      "a",
      "b",
      "d"
    ],
    "explanation": "流水线的价值是把交付风险工程化：覆盖构建、测试、制品版本、镜像扫描、发布审批，并配套灰度、健康检查、回滚、凭据安全和审计。",
    "wrongReasons": {
      "c": "明文密码会造成严重泄露风险。"
    },
    "skillTags": [
      "jenkins",
      "gitlab-ci",
      "cicd",
      "secret"
    ],
    "relatedCommand": "build -> test -> scan -> deploy -> healthcheck -> rollback",
    "mnemonic": "生产流水线：构建→测试→制品→镜像扫描→审批→灰度→回滚→通知。"
  },
  {
    "estimatedTime": 75,
    "id": "devops-ansible-idempotent",
    "category": "devops",
    "type": "single",
    "level": "intermediate",
    "title": "Ansible 幂等",
    "prompt": "Ansible 自动化最重要的工程特征之一是什么？",
    "options": [
      {
        "id": "a",
        "text": "永远不用 inventory"
      },
      {
        "id": "b",
        "text": "每次执行结果都不一样才算灵活"
      },
      {
        "id": "c",
        "text": "幂等：重复执行不会把系统推向未知状态"
      },
      {
        "id": "d",
        "text": "只在生产直接试命令"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "自动化运维要可重复、可预测。幂等能让批量配置、补丁和部署在失败重试时仍保持安全。",
    "wrongReasons": {
      "b": "结果不确定意味着不可复现、不可审计，与自动化要的可预测背道而驰。",
      "a": "inventory 是主机分组和变量管理基础。",
      "d": "直接在生产试命令风险高。"
    },
    "skillTags": [
      "ansible",
      "idempotent",
      "automation",
      "inventory"
    ],
    "relatedCommand": "ansible-playbook --check",
    "mnemonic": "Ansible 核心=幂等：重复执行结果一致，失败重试也安全。"
  },
  {
    "estimatedTime": 60,
    "id": "devops-secret-config",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "配置与密钥",
    "prompt": "数据库密码这类敏感配置更适合放在哪里？",
    "options": [
      {
        "id": "a",
        "text": "ConfigMap 明文公开"
      },
      {
        "id": "b",
        "text": "Secret 或外部密钥管理系统，并配合权限控制"
      },
      {
        "id": "c",
        "text": "硬编码进应用启动参数"
      },
      {
        "id": "d",
        "text": "镜像 Dockerfile 明文写死"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "敏感数据要和普通配置分离，并纳入权限、加密和审计：放 Secret 或外部密钥管理系统，而不是明文配置或镜像里。",
    "wrongReasons": {
      "a": "ConfigMap 适合非敏感配置，放密码有明文泄露风险。",
      "d": "写进镜像会永久泄露到制品层。",
      "c": "写进启动参数会出现在进程列表和日志里，等同明文泄露。"
    },
    "skillTags": [
      "secret",
      "config",
      "kubernetes",
      "security"
    ],
    "relatedCommand": "kubectl create secret generic db --from-literal=password=...",
    "mnemonic": "敏感配置进 Secret/KMS + 权限控制，别放 ConfigMap/镜像/明文。"
  },
  {
    "estimatedTime": 90,
    "id": "devops-hpa-metrics",
    "category": "devops",
    "type": "scenario",
    "level": "advanced",
    "title": "HPA 无指标",
    "prompt": "HPA 显示 unknown metrics，常见原因是什么？",
    "options": [
      {
        "id": "a",
        "text": "Deployment 历史 Revision 记录数达到上限"
      },
      {
        "id": "b",
        "text": "Pod 数量已达到 HPA 定义的 maxReplicas 上限"
      },
      {
        "id": "c",
        "text": "metrics-server 或自定义指标链路异常"
      },
      {
        "id": "d",
        "text": "Service 没有 NodePort 类型导致外界无法抓取"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "HPA 依赖指标链路。扩缩容异常要看 metrics-server、自定义指标、权限、资源 request 和目标指标是否存在。",
    "wrongReasons": {
      "a": "Revision 限制影响发布回滚，与 HPA 指标采集完全无关。",
      "d": "HPA 不要求 Service 是 NodePort。",
      "b": "Pod 数量达到上限只会导致不进行扩容，不会在 HPA 状态显示为 unknown metrics。"
    },
    "skillTags": [
      "hpa",
      "metrics-server",
      "autoscaling",
      "kubernetes"
    ],
    "relatedCommand": "kubectl top pod && kubectl describe hpa",
    "mnemonic": "HPA unknown metrics：查 metrics-server 或自定义指标链路是否异常。"
  },
  {
    "estimatedTime": 95,
    "id": "devops-pvc-pending",
    "category": "devops",
    "type": "scenario",
    "level": "advanced",
    "title": "PVC Pending",
    "prompt": "PVC 一直 Pending，优先排查什么？",
    "options": [
      {
        "id": "a",
        "text": "StorageClass、动态供给器、PV 匹配、容量和 accessModes"
      },
      {
        "id": "b",
        "text": "Ingress 的 host 规则和路径拼写"
      },
      {
        "id": "c",
        "text": "Service 的 ClusterIP 和端口映射"
      },
      {
        "id": "d",
        "text": "Pod 的 restartPolicy 和重启次数"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "K8s 存储问题要看 StorageClass、Provisioner、PV/PVC 匹配和事件。状态 Pending 说明绑定还没成功。",
    "wrongReasons": {
      "c": "ClusterIP 不决定 PVC 绑定。",
      "b": "Ingress host 不影响存储绑定。",
      "d": "restartPolicy 影响容器重启行为，与 PVC 能否绑定存储无关。"
    },
    "skillTags": [
      "pvc",
      "storageclass",
      "pv",
      "kubernetes"
    ],
    "relatedCommand": "kubectl describe pvc <pvc>",
    "mnemonic": "PVC Pending：查 StorageClass、动态供给器、PV 匹配、容量、accessModes。"
  },
  {
    "estimatedTime": 110,
    "id": "middleware-mysql-slow-query",
    "category": "middleware",
    "type": "scenario",
    "level": "advanced",
    "title": "MySQL 慢查询",
    "prompt": "接口 P95 延迟升高，MySQL CPU 和慢查询同步升高，优先方向是什么？",
    "options": [
      {
        "id": "a",
        "text": "重启应用服务器，期望连接重置后变快"
      },
      {
        "id": "b",
        "text": "直接给数据库实例加大 CPU 和内存规格"
      },
      {
        "id": "c",
        "text": "调大连接池上限，让更多请求挤进来"
      },
      {
        "id": "d",
        "text": "分析慢 SQL、执行计划、索引、锁等待和近期发布变更"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "慢查询要结合慢 SQL、执行计划、索引、锁等待、连接数和发布变更一起分析，不能只看 CPU 高就盲目加资源。",
    "wrongReasons": {
      "a": "重启只是临时断开连接，慢 SQL 和锁等待会很快复现。",
      "c": "调大连接池会让更多慢查询并发挤压数据库，加重而非缓解。",
      "b": "盲目扩 CPU 不解决慢 SQL 与索引问题，成本高且治标。"
    },
    "skillTags": [
      "mysql",
      "slow-query",
      "index",
      "latency"
    ],
    "relatedCommand": "EXPLAIN ANALYZE ...",
    "mnemonic": "慢查询升高查五样：慢 SQL、执行计划、索引、锁等待、近期发布。"
  },
  {
    "estimatedTime": 95,
    "id": "middleware-redis-hit-rate",
    "category": "middleware",
    "type": "scenario",
    "level": "intermediate",
    "title": "Redis 命中率下降",
    "prompt": "Redis 命中率下降，数据库压力升高，优先检查什么？",
    "options": [
      {
        "id": "a",
        "text": "key 过期策略、热点 key、内存淘汰、发布变更和缓存穿透/击穿"
      },
      {
        "id": "b",
        "text": "把所有 key 的过期时间统一调短"
      },
      {
        "id": "c",
        "text": "关闭数据库慢查询日志减少干扰"
      },
      {
        "id": "d",
        "text": "直接清空整个 Redis 再重新预热"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "缓存问题会把压力打回数据库。命中率下降要看 key 生命周期、淘汰策略、热点、穿透击穿和代码变更。",
    "wrongReasons": {
      "d": "清空缓存可能制造缓存雪崩。",
      "c": "关闭慢日志会丢失证据。",
      "b": "统一设短会让大批 key 同时失效，反而引发缓存雪崩。"
    },
    "skillTags": [
      "redis",
      "cache",
      "hit-rate",
      "database"
    ],
    "relatedCommand": "INFO stats && INFO memory",
    "mnemonic": "Redis 命中掉、压力回库：查过期策略、热点 key、淘汰、穿透/击穿。"
  },
  {
    "estimatedTime": 90,
    "id": "middleware-nginx-upstream-timeout",
    "category": "middleware",
    "type": "log-analysis",
    "level": "intermediate",
    "title": "Nginx upstream 超时",
    "prompt": "Nginx 日志出现 upstream timed out，应该优先关联哪些信息？",
    "options": [
      {
        "id": "a",
        "text": "Nginx 访问日志的切割周期"
      },
      {
        "id": "b",
        "text": "上游响应时间、连接数、应用日志、数据库/缓存依赖和超时配置"
      },
      {
        "id": "c",
        "text": "前端页面的静态资源大小"
      },
      {
        "id": "d",
        "text": "Nginx 配置文件的注释格式"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "upstream timeout 可能是上游慢、依赖慢、连接池耗尽或超时配置不合理。要顺着请求链路看。",
    "wrongReasons": {
      "c": "静态资源大小不影响到上游的连接与响应耗时。",
      "d": "注释格式不影响运行，不是超时证据。",
      "a": "日志切割周期与上游是否超时无关。"
    },
    "skillTags": [
      "nginx",
      "upstream",
      "timeout",
      "latency"
    ],
    "relatedCommand": "grep upstream app.log && curl -w \"%{time_total}\"",
    "mnemonic": "upstream timed out 顺链路：上游耗时、连接数、依赖(库/缓存)、超时配置。"
  },
  {
    "estimatedTime": 105,
    "id": "middleware-kafka-lag",
    "category": "middleware",
    "type": "scenario",
    "level": "advanced",
    "title": "Kafka 消费堆积",
    "prompt": "Kafka consumer lag 持续上涨，优先排查什么？",
    "options": [
      {
        "id": "a",
        "text": "调小 consumer 的 max.poll.interval.ms 以促使频繁提交"
      },
      {
        "id": "b",
        "text": "将配置中的 fetch.min.bytes 大小设为 0"
      },
      {
        "id": "c",
        "text": "生产速率、消费速率、消费者实例、分区数、错误重试和下游依赖"
      },
      {
        "id": "d",
        "text": "在没有增加 Topic Partition 的情况下盲目横向扩容 Consumer 实例数"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "消息堆积要判断是生产突增、消费能力不足、分区限制、消费错误还是下游变慢。直接删 topic 会丢数据。",
    "wrongReasons": {
      "d": "Consumer 数大于分区数会导致多余 Consumer 闲置，无法增加总消费能力。",
      "a": "调小此配置可能导致消费超时触发 Rebalance，反而增大 lag。",
      "b": "fetch.min.bytes 设为 0 会让 Broker 立即发送数据，虽然增加吞吐开销，但通常不会导致 Lag 堆积。"
    },
    "skillTags": [
      "kafka",
      "lag",
      "consumer",
      "queue"
    ],
    "relatedCommand": "kafka-consumer-groups --describe",
    "mnemonic": "consumer lag 涨：比生产/消费速率，看分区数、实例数、错误重试、下游。"
  },
  {
    "estimatedTime": 85,
    "id": "middleware-mq-dead-letter",
    "category": "middleware",
    "type": "scenario",
    "level": "intermediate",
    "title": "死信队列",
    "prompt": "消息进入死信队列，第一轮应该确认什么？",
    "options": [
      {
        "id": "a",
        "text": "消费失败原因、重试次数、消息内容、幂等性和下游服务状态"
      },
      {
        "id": "b",
        "text": "直接给队列扩容更多分区提高吞吐"
      },
      {
        "id": "c",
        "text": "把消费者的重试次数直接调成无限"
      },
      {
        "id": "d",
        "text": "直接清空死信队列假装没发生过"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "死信队列是故障证据，不是垃圾桶。要确认失败原因、是否可重放、是否幂等，以及下游是否恢复。",
    "wrongReasons": {
      "d": "直接丢弃可能造成业务数据丢失。",
      "b": "扩分区不解决消费失败本身，失败消息仍会进死信。",
      "c": "无限重试会放大故障并堆积，应先定位失败原因。"
    },
    "skillTags": [
      "mq",
      "dead-letter",
      "retry",
      "idempotency"
    ],
    "relatedCommand": "inspect DLQ message + consumer error log",
    "mnemonic": "死信不是垃圾桶：查失败原因、重试次数、消息内容、幂等、下游状态。"
  },
  {
    "estimatedTime": 110,
    "id": "middleware-jvm-gc",
    "category": "middleware",
    "type": "log-analysis",
    "level": "advanced",
    "title": "JVM GC 抖动",
    "prompt": "Java 服务延迟毛刺明显，怀疑 GC，应该收集哪些证据？",
    "options": [
      {
        "id": "a",
        "text": "删除 GC 日志，避免它占用磁盘空间"
      },
      {
        "id": "b",
        "text": "GC 日志、堆使用、线程栈、接口延迟和发布/流量变化"
      },
      {
        "id": "c",
        "text": "直接把堆内存调到最大压住毛刺"
      },
      {
        "id": "d",
        "text": "只增加服务副本数，不分析 JVM 行为"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "GC 排障要结合 GC 日志、堆使用、停顿时长、线程栈、接口延迟和发布/流量变化，扩容只能缓解不能定位根因。",
    "wrongReasons": {
      "d": "扩容可能缓解但不能定位根因。",
      "a": "GC 日志是关键证据。",
      "c": "盲目加堆可能延后 GC，但不定位毛刺根因，还可能拉长单次停顿。"
    },
    "skillTags": [
      "java",
      "jvm",
      "gc",
      "latency"
    ],
    "relatedCommand": "jstat -gcutil <pid> 1s && jstack <pid>",
    "mnemonic": "GC 毛刺收证据：GC 日志、堆使用、线程栈、接口延迟、发布流量。"
  },
  {
    "estimatedTime": 105,
    "id": "middleware-connection-pool",
    "category": "middleware",
    "type": "scenario",
    "level": "advanced",
    "title": "连接池耗尽",
    "prompt": "应用报数据库连接池耗尽，哪些方向最值得优先检查？",
    "options": [
      {
        "id": "a",
        "text": "应用的日志打印级别和输出格式配置"
      },
      {
        "id": "b",
        "text": "前端请求头里的 User-Agent 和 Referer"
      },
      {
        "id": "c",
        "text": "源码里的注释行数和代码风格规范"
      },
      {
        "id": "d",
        "text": "慢查询、连接泄漏、池大小、数据库 max_connections 和流量变化"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "连接池耗尽常由慢 SQL、连接泄漏、池配置不合理、数据库连接上限或流量突增引起。要看应用和数据库两侧。",
    "wrongReasons": {
      "b": "请求头 UA 与数据库连接资源无关。",
      "a": "日志级别不决定连接是否被占满或泄漏。",
      "c": "注释不影响运行时连接占用。"
    },
    "skillTags": [
      "connection-pool",
      "mysql",
      "leak",
      "capacity"
    ],
    "relatedCommand": "show processlist; pool metrics; slow log",
    "mnemonic": "连接池耗尽两侧查：慢 SQL/连接泄漏/池大小 + 库 max_connections。"
  },
  {
    "estimatedTime": 105,
    "id": "middleware-es-shard",
    "category": "middleware",
    "type": "scenario",
    "level": "advanced",
    "title": "ES 分片异常",
    "prompt": "Elasticsearch 集群 yellow/red，优先检查什么？",
    "options": [
      {
        "id": "a",
        "text": "直接删除报红的索引让状态变绿"
      },
      {
        "id": "b",
        "text": "随机重启一个数据节点看能否自愈"
      },
      {
        "id": "c",
        "text": "关闭集群健康检查不再报 red/yellow"
      },
      {
        "id": "d",
        "text": "分片分配、节点磁盘水位、索引副本、节点状态和集群事件"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "ES 健康异常常与分片未分配、磁盘水位、节点丢失、副本配置有关。先看 allocation explain 和节点资源。",
    "wrongReasons": {
      "a": "删除索引会造成数据丢失。",
      "b": "未定位未分配分片就重启节点，可能触发更多分片迁移，加剧 red。",
      "c": "关闭检查只会掩盖问题。"
    },
    "skillTags": [
      "elasticsearch",
      "shard",
      "cluster",
      "storage"
    ],
    "relatedCommand": "GET _cluster/health && GET _cluster/allocation/explain",
    "mnemonic": "ES yellow/red：分片分配、磁盘水位、副本、节点状态，看 allocation explain。"
  },
  {
    "estimatedTime": 120,
    "id": "middleware-db-migration-validate",
    "category": "middleware",
    "type": "multiple",
    "level": "advanced",
    "title": "数据库迁移校验",
    "prompt": "数据库迁移完成后，哪些校验必须做？",
    "options": [
      {
        "id": "a",
        "text": "立刻删除旧库"
      },
      {
        "id": "b",
        "text": "回滚入口和旧库只读/下线计划"
      },
      {
        "id": "c",
        "text": "应用连接串、权限、慢查询和错误率"
      },
      {
        "id": "d",
        "text": "数据量、校验和、主从延迟和关键表抽样"
      }
    ],
    "answer": [
      "b",
      "c",
      "d"
    ],
    "explanation": "迁移成功不是任务结束，而是数据一致、应用可用、性能稳定、回滚可控的闭环：校验数据量、校验和、主从延迟和关键表抽样，并准备回滚入口和旧库下线计划。",
    "wrongReasons": {
      "a": "立即删除旧库会失去回滚和比对能力。"
    },
    "skillTags": [
      "database",
      "migration",
      "consistency",
      "rollback"
    ],
    "relatedCommand": "row count + checksum + app probe + slow log",
    "mnemonic": "迁移要闭环：数据量+校验和+主从延迟+抽样，留回滚和旧库下线计划。"
  },
  {
    "estimatedTime": 90,
    "id": "middleware-cache-avalanche",
    "category": "middleware",
    "type": "single",
    "level": "advanced",
    "title": "缓存雪崩",
    "prompt": "大量缓存同时过期导致数据库压力暴涨，常见预防手段是什么？",
    "options": [
      {
        "id": "a",
        "text": "所有 key 设置同一过期时间"
      },
      {
        "id": "b",
        "text": "过期时间加随机抖动、热点保护、限流降级和预热"
      },
      {
        "id": "c",
        "text": "把所有缓存过期时间统一调到更长"
      },
      {
        "id": "d",
        "text": "雪崩时直接重启数据库"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "缓存雪崩会把流量突然打到数据库。随机过期、热点保护、降级和预热能降低同步失效风险。",
    "wrongReasons": {
      "a": "同一过期时间会让大量 key 同时失效，放大雪崩风险。",
      "d": "重启数据库会中断服务，且缓存集中到期的问题依旧。",
      "c": "统一调长只是推迟集中失效，到点仍会同时过期引发雪崩。"
    },
    "skillTags": [
      "cache",
      "redis",
      "avalanche",
      "degrade"
    ],
    "relatedCommand": "TTL jitter + hot key protection + rate limit",
    "mnemonic": "防缓存雪崩：过期加随机抖动 + 热点保护 + 限流降级 + 预热。"
  },
  {
    "estimatedTime": 100,
    "id": "middleware-observability-correlation",
    "category": "middleware",
    "type": "multiple",
    "level": "advanced",
    "title": "跨组件关联",
    "prompt": "排查一次跨服务请求失败，哪些字段最有助于关联链路？",
    "options": [
      {
        "id": "a",
        "text": "只保留单机的本地文件日志"
      },
      {
        "id": "b",
        "text": "错误码、上游耗时和依赖组件状态"
      },
      {
        "id": "c",
        "text": "服务名、版本、时间戳和实例 IP"
      },
      {
        "id": "d",
        "text": "traceId/requestId"
      }
    ],
    "answer": [
      "b",
      "c",
      "d"
    ],
    "explanation": "中间件排障要能跨入口、应用、缓存、数据库和消息队列关联证据。统一字段比海量日志更重要。",
    "wrongReasons": {
      "a": "只看单机本地日志无法跨服务关联，缺统一字段链路就断了。"
    },
    "skillTags": [
      "trace",
      "logging",
      "observability",
      "middleware"
    ],
    "relatedCommand": "grep <traceId> + dashboard dependency view",
    "mnemonic": "跨服务关联靠 traceId/requestId，统一字段胜过海量日志。"
  },
  {
    "estimatedTime": 115,
    "id": "middleware-ai-gpu-runtime",
    "category": "middleware",
    "type": "multiple",
    "level": "advanced",
    "title": "AI/GPU 运行栈",
    "prompt": "AI 运维岗位要求 GPU、CUDA、CuDNN、PyTorch 和推理平台。哪些检查最贴近生产？",
    "options": [
      {
        "id": "a",
        "text": "GPU 利用率、显存、温度、训练中断和推理延迟"
      },
      {
        "id": "b",
        "text": "只看 CPU idle"
      },
      {
        "id": "c",
        "text": "GPU 驱动、CUDA/CuDNN、框架版本和容器运行时兼容"
      },
      {
        "id": "d",
        "text": "模型版本、训练数据和推理服务的备份回滚"
      }
    ],
    "answer": [
      "a",
      "c",
      "d"
    ],
    "explanation": "AI 运维把传统稳定性扩展到算力栈。驱动、框架、显存、调度、模型版本和服务延迟都是生产信号。",
    "wrongReasons": {
      "b": "GPU 平台瓶颈常在显存、驱动、调度和模型服务。"
    },
    "skillTags": [
      "gpu",
      "cuda",
      "pytorch",
      "aiops"
    ],
    "relatedCommand": "nvidia-smi && python -c \"import torch; print(torch.cuda.is_available())\"",
    "mnemonic": "GPU 生产信号：驱动/CUDA/CuDNN/框架版本 + 显存/利用率/温度 + 模型版本。"
  },
  {
    "estimatedTime": 95,
    "id": "sre-incident-mitigate-first",
    "category": "sre",
    "type": "single",
    "level": "advanced",
    "title": "事故先止血",
    "prompt": "生产事故发生后，最符合 SRE 思路的顺序是什么？",
    "options": [
      {
        "id": "a",
        "text": "只要服务恢复就不做事后复盘"
      },
      {
        "id": "b",
        "text": "事故期间先把相关告警全部关掉"
      },
      {
        "id": "c",
        "text": "先止血恢复，再保留证据定位根因，最后沉淀改进项"
      },
      {
        "id": "d",
        "text": "先追查是谁的责任并立刻问责"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "止血解决当下，证据链解决事实，复盘行动项解决未来：先恢复，再保留证据定位根因，最后沉淀可执行的改进项。",
    "wrongReasons": {
      "d": "甩锅会让事实变形。",
      "a": "不复盘会让同类事故重复发生。",
      "b": "关闭告警会切断观测能力。"
    },
    "skillTags": [
      "incident",
      "sre",
      "postmortem",
      "mitigation"
    ],
    "relatedCommand": "mitigate -> evidence -> root cause -> action items",
    "mnemonic": "事故顺序：先止血恢复→留证据定位根因→沉淀改进项。"
  },
  {
    "estimatedTime": 80,
    "id": "sre-alert-actionable",
    "category": "sre",
    "type": "single",
    "level": "intermediate",
    "title": "可行动告警",
    "prompt": "真正有价值的告警应优先满足什么？",
    "options": [
      {
        "id": "a",
        "text": "通知越晚越好，免得打扰值班人"
      },
      {
        "id": "b",
        "text": "说明影响、触发原因、排查入口、升级人和止血动作"
      },
      {
        "id": "c",
        "text": "告警数量越多覆盖越全越好"
      },
      {
        "id": "d",
        "text": "只展示一个 CPU 使用率数值"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "好告警不是让系统更吵，而是让值班人更快行动：必须说明影响、触发原因、排查入口、升级人和止血动作。",
    "wrongReasons": {
      "c": "告警风暴会造成疲劳。",
      "d": "单一资源指标缺少业务上下文。",
      "a": "延迟通知会扩大故障时间。"
    },
    "skillTags": [
      "alerting",
      "oncall",
      "runbook",
      "monitoring"
    ],
    "relatedCommand": "alert -> impact -> runbook -> owner -> escalation",
    "mnemonic": "好告警能指导下一步：影响+原因+排查入口+升级人+止血动作。"
  },
  {
    "estimatedTime": 90,
    "id": "sre-slo-error-budget",
    "category": "sre",
    "type": "scenario",
    "level": "advanced",
    "title": "SLO 与错误预算",
    "prompt": "服务错误率超过 SLO 阈值，发布流程上通常应该怎么做？",
    "options": [
      {
        "id": "a",
        "text": "关闭监控告警，先让页面安静下来"
      },
      {
        "id": "b",
        "text": "暂停高风险发布，优先恢复稳定性并消耗错误预算复盘"
      },
      {
        "id": "c",
        "text": "继续加速发布所有新功能赶进度"
      },
      {
        "id": "d",
        "text": "删除历史指标数据来释放存储"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "SLO 把可靠性目标量化。错误预算耗尽意味着稳定性风险升高，应该收紧发布而不是扩大变更。",
    "wrongReasons": {
      "c": "继续高风险发布会扩大事故概率。",
      "a": "关闭告警掩盖问题。",
      "d": "删除指标破坏复盘。"
    },
    "skillTags": [
      "slo",
      "error-budget",
      "release",
      "reliability"
    ],
    "relatedCommand": "SLO dashboard + error budget burn rate",
    "mnemonic": "错误预算耗尽=收紧发布保稳定，别继续加风险变更。"
  },
  {
    "estimatedTime": 100,
    "id": "sre-capacity-planning",
    "category": "sre",
    "type": "scenario",
    "level": "advanced",
    "title": "容量规划",
    "prompt": "大促前做容量评估，最应该关注哪组信息？",
    "options": [
      {
        "id": "a",
        "text": "只看当前 CPU 水位很低就放心"
      },
      {
        "id": "b",
        "text": "历史峰值、增长预估、瓶颈资源、压测结果、扩容阈值和降级预案"
      },
      {
        "id": "c",
        "text": "等大促当天报警了再临时扩容"
      },
      {
        "id": "d",
        "text": "无脑多买服务器堆资源就行"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "容量管理是把未来风险提前量化。峰值、瓶颈、扩容时间、压测和降级决定系统能否撑住。",
    "wrongReasons": {
      "a": "当前低负载不代表峰值安全。",
      "d": "只扩应用层可能把瓶颈转移。",
      "c": "当天临时扩容来不及验证。"
    },
    "skillTags": [
      "capacity",
      "load-test",
      "scaling",
      "degrade"
    ],
    "relatedCommand": "peak + load test + scaling threshold + degrade plan",
    "mnemonic": "容量评估：历史峰值+增长预估+瓶颈+压测+扩容阈值+降级。"
  },
  {
    "estimatedTime": 65,
    "id": "sre-runbook-quality",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "Runbook 质量",
    "prompt": "一份好的故障 Runbook 最应该包含什么？",
    "options": [
      {
        "id": "a",
        "text": "只写“联系负责人”"
      },
      {
        "id": "b",
        "text": "告警含义、影响范围、排查步骤、止血动作、回滚和升级联系人"
      },
      {
        "id": "c",
        "text": "随机命令列表"
      },
      {
        "id": "d",
        "text": "值班人员的排班表"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "Runbook 要让值班人员在压力下能快速判断影响、执行安全动作并升级。它是组织经验的可执行版本。",
    "wrongReasons": {
      "d": "排班表只用于联系人查询，不构成可执行的排查与止血步骤。",
      "c": "随机命令缺少上下文和安全边界。",
      "a": "只有联系人会降低响应效率。"
    },
    "skillTags": [
      "runbook",
      "incident",
      "oncall",
      "rollback"
    ],
    "relatedCommand": "维护服务级 Runbook",
    "mnemonic": "Runbook：告警含义+影响+排查步骤+止血+回滚+升级人。"
  },
  {
    "estimatedTime": 75,
    "id": "sre-postmortem-blameless",
    "category": "sre",
    "type": "single",
    "level": "intermediate",
    "title": "无责复盘",
    "prompt": "无责复盘最重要的目标是什么？",
    "options": [
      {
        "id": "a",
        "text": "尽量隐藏事故影响范围不对外说"
      },
      {
        "id": "b",
        "text": "找出系统性改进项，降低同类事故复发概率"
      },
      {
        "id": "c",
        "text": "删除现场所有证据避免被追查"
      },
      {
        "id": "d",
        "text": "找到一个责任人出来背锅了事"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "复盘关注事实、时间线、检测和响应缺口，以及可执行改进项。目标是让系统更可靠。",
    "wrongReasons": {
      "d": "甩锅会降低信息透明度。",
      "a": "隐藏影响会损害信任。",
      "c": "删除证据会阻碍改进。"
    },
    "skillTags": [
      "postmortem",
      "reliability",
      "learning"
    ],
    "relatedCommand": "timeline + impact + root cause + action items",
    "mnemonic": "无责复盘=找系统性改进，不追个人责任。"
  },
  {
    "estimatedTime": 70,
    "id": "sre-incident-communication",
    "category": "sre",
    "type": "scenario",
    "level": "intermediate",
    "title": "事故沟通",
    "prompt": "生产故障处理中，面向业务方的第一条同步信息最好包含什么？",
    "options": [
      {
        "id": "a",
        "text": "回一句\"别催，正在看了\""
      },
      {
        "id": "b",
        "text": "影响范围、开始时间、当前状态、已采取动作、下次更新时间和负责人"
      },
      {
        "id": "c",
        "text": "抛出大量还没验证的猜测原因"
      },
      {
        "id": "d",
        "text": "完全保持沉默直到彻底修好"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "事故沟通的目标是降低不确定性。业务方需要知道影响、状态、动作、负责人和下次更新时间。",
    "wrongReasons": {
      "c": "未验证猜测会误导决策。",
      "a": "情绪化回复不能支持业务判断。",
      "d": "沉默会放大焦虑。"
    },
    "skillTags": [
      "communication",
      "incident",
      "stakeholder",
      "status"
    ],
    "relatedCommand": "impact/status/action/next update/owner",
    "mnemonic": "对外第一条：影响+开始时间+当前状态+已做动作+下次更新+负责人。"
  },
  {
    "estimatedTime": 90,
    "id": "sre-monitoring-baseline",
    "category": "sre",
    "type": "multiple",
    "level": "intermediate",
    "title": "监控基线",
    "prompt": "新接手一套业务系统，最少应该补齐哪些监控基线？",
    "options": [
      {
        "id": "a",
        "text": "业务入口：可用性、错误率、延迟、吞吐、证书有效期"
      },
      {
        "id": "b",
        "text": "依赖组件：数据库、缓存、队列、负载均衡、外部接口"
      },
      {
        "id": "c",
        "text": "主机资源：CPU、内存、磁盘、inode、网络、进程"
      },
      {
        "id": "d",
        "text": "只统计每日 PV/UV 访问量"
      }
    ],
    "answer": [
      "a",
      "b",
      "c"
    ],
    "explanation": "监控基线要覆盖主机、业务和依赖。资源指标、RED 指标和依赖健康共同构成故障发现能力。",
    "wrongReasons": {
      "d": "PV/UV 是业务统计，不能反映资源、错误率和依赖健康，不足以发现故障。"
    },
    "skillTags": [
      "monitoring",
      "baseline",
      "red",
      "use"
    ],
    "relatedCommand": "USE + RED + dependency health",
    "mnemonic": "监控基线三层：主机资源 + 业务 RED + 依赖组件。"
  },
  {
    "estimatedTime": 95,
    "id": "sre-log-platform",
    "category": "sre",
    "type": "single",
    "level": "advanced",
    "title": "日志平台设计",
    "prompt": "建设日志分析平台，最重要的设计目标是什么？",
    "options": [
      {
        "id": "a",
        "text": "把所有日志堆到一个目录里不建索引"
      },
      {
        "id": "b",
        "text": "让各服务随意定义自己的日志字段名"
      },
      {
        "id": "c",
        "text": "永久保存所有日志，不考虑成本和合规"
      },
      {
        "id": "d",
        "text": "让请求、服务、错误码、耗时和版本能快速关联，支持排障和复盘"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "日志平台的价值是关联和检索。统一字段、traceId、服务名、版本、错误码、耗时和保留策略决定排障效率。",
    "wrongReasons": {
      "a": "堆文件没有统一索引和关联能力。",
      "b": "字段不统一会让跨服务查询困难。",
      "c": "永久保存可能带来成本和合规风险。"
    },
    "skillTags": [
      "logging",
      "trace",
      "platform",
      "observability"
    ],
    "relatedCommand": "traceId + service + version + error + latency",
    "mnemonic": "日志平台价值=关联检索：统一字段+traceId+版本+错误码+耗时。"
  },
  {
    "estimatedTime": 70,
    "id": "sre-customer-acceptance",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "客户验收",
    "prompt": "项目运维/实施交付岗位里，最可靠的验收材料是什么？",
    "options": [
      {
        "id": "a",
        "text": "口头说一句\"我感觉差不多了\""
      },
      {
        "id": "b",
        "text": "只发一张桌面截图当作交付"
      },
      {
        "id": "c",
        "text": "什么材料都不留，做完就走"
      },
      {
        "id": "d",
        "text": "部署清单、测试记录、监控截图、权限清单、回滚方案和双方确认记录"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "验收材料要能证明系统按约定交付。它既保护客户，也保护交付团队，避免后续扯皮。",
    "wrongReasons": {
      "a": "主观感觉不能作为验收证据。",
      "b": "单张截图无法证明功能、监控和回滚。",
      "c": "不留材料会制造风险。"
    },
    "skillTags": [
      "delivery",
      "acceptance",
      "evidence",
      "rollback"
    ],
    "relatedCommand": "deploy list + test record + monitor + rollback + signoff",
    "mnemonic": "验收靠证据：部署清单+测试记录+监控+权限+回滚+双方确认。"
  },
  {
    "estimatedTime": 90,
    "id": "sre-onsite-industry-ops",
    "category": "sre",
    "type": "scenario",
    "level": "intermediate",
    "title": "行业现场运维",
    "prompt": "环保、电力、燃气等现场系统数据突然中断，第一轮合理排查是什么？",
    "options": [
      {
        "id": "a",
        "text": "供电、采集设备、传感器、网络链路、上报配置和平台接收状态"
      },
      {
        "id": "b",
        "text": "不取证就直接归因为客户网络问题"
      },
      {
        "id": "c",
        "text": "删除中断期间的历史采集数据"
      },
      {
        "id": "d",
        "text": "只重启中心平台等数据自己回来"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "现场运维和纯云运维不同，故障可能在供电、设备、传感器、网络、平台配置任一层。要按链路拆开验证。",
    "wrongReasons": {
      "d": "中心平台重启不能替代现场链路排查。",
      "c": "删除历史数据有合规和业务风险。",
      "b": "没有证据的归因会破坏客户信任。"
    },
    "skillTags": [
      "onsite",
      "iot",
      "industry",
      "data-link"
    ],
    "relatedCommand": "power -> device -> network -> platform -> record",
    "mnemonic": "现场中断逐层查：供电→设备→传感器→链路→上报配置→平台接收。"
  },
  {
    "estimatedTime": 75,
    "id": "sre-oncall-handover",
    "category": "sre",
    "type": "multiple",
    "level": "intermediate",
    "title": "值班交接",
    "prompt": "一次值班交接至少应包含哪些内容？",
    "options": [
      {
        "id": "a",
        "text": "只说“没事”"
      },
      {
        "id": "b",
        "text": "当前告警、未关闭故障、风险变更和特殊保障事项"
      },
      {
        "id": "c",
        "text": "遗留工单、观察指标和下个检查时间"
      },
      {
        "id": "d",
        "text": "关键联系人、升级路径、临时权限和到期时间"
      }
    ],
    "answer": [
      "b",
      "c",
      "d"
    ],
    "explanation": "值班交接是可靠性流程的一部分。它让下一班知道风险在哪里、谁负责、何时检查和如何升级。",
    "wrongReasons": {
      "a": "笼统交接会丢失上下文。"
    },
    "skillTags": [
      "oncall",
      "handover",
      "ticket",
      "risk"
    ],
    "relatedCommand": "handover: alerts + incidents + changes + risks + owners",
    "mnemonic": "交接必含：当前告警+未关故障+风险变更+遗留工单+升级路径。"
  },
  {
    "id": "linux-basic-ls",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "列出目录内容",
    "prompt": "在 Linux 中，用于列出当前工作目录下所有文件和子目录信息的命令是哪一个？",
    "options": [
      {
        "id": "a",
        "text": "pwd"
      },
      {
        "id": "b",
        "text": "cd"
      },
      {
        "id": "c",
        "text": "mkdir"
      },
      {
        "id": "d",
        "text": "ls"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "ls 是 List 的缩写，是 Linux 中最基础的命令，用于查看目录内容。",
    "wrongReasons": {
      "b": "cd 用于切换当前工作目录。",
      "a": "pwd 用于显示当前所在的绝对路径。",
      "c": "mkdir 用于创建新目录。"
    },
    "skillTags": [
      "linux",
      "cli",
      "files"
    ],
    "relatedCommand": "ls -la",
    "estimatedTime": 30,
    "mnemonic": "ls = List 列目录；-la 看全部+详情。"
  },
  {
    "id": "linux-basic-pwd",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "查看当前路径",
    "prompt": "要获取当前终端所在的完整绝对路径，应该执行哪一个命令？",
    "options": [
      {
        "id": "a",
        "text": "cd"
      },
      {
        "id": "b",
        "text": "ls"
      },
      {
        "id": "c",
        "text": "whoami"
      },
      {
        "id": "d",
        "text": "pwd"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "pwd 代表 Print Working Directory，打印当前的工作目录路径。",
    "wrongReasons": {
      "b": "ls 用于列出文件。",
      "a": "cd 用于改变路径。",
      "c": "whoami 显示当前登录用户名。"
    },
    "skillTags": [
      "linux",
      "cli",
      "directory"
    ],
    "relatedCommand": "pwd",
    "estimatedTime": 30,
    "mnemonic": "pwd = Print Working Directory，打印当前绝对路径。"
  },
  {
    "id": "linux-basic-cd",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "切换工作目录",
    "prompt": "要从当前目录切换到系统的根目录 `/`，应该使用哪条命令？",
    "options": [
      {
        "id": "a",
        "text": "ls /"
      },
      {
        "id": "b",
        "text": "pwd /"
      },
      {
        "id": "c",
        "text": "cd /"
      },
      {
        "id": "d",
        "text": "mv /"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "cd 是 Change Directory 的缩写，后接目录路径即可完成切换。",
    "wrongReasons": {
      "a": "ls / 只会列出根目录下的文件，并不会切换目录。",
      "b": "pwd 不接受参数作为路径，也不能用来切换目录。",
      "d": "mv 用于移动或重命名文件。"
    },
    "skillTags": [
      "linux",
      "cli",
      "directory"
    ],
    "relatedCommand": "cd /var/log",
    "estimatedTime": 30,
    "mnemonic": "cd = Change Directory；cd / 回根，cd ~ 回家。"
  },
  {
    "id": "linux-basic-mkdir",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "创建新文件夹",
    "prompt": "在当前目录下创建一个名为 `backup` 的新目录，应该使用哪个命令？",
    "options": [
      {
        "id": "a",
        "text": "mkdir backup"
      },
      {
        "id": "b",
        "text": "rmdir backup"
      },
      {
        "id": "c",
        "text": "touch backup"
      },
      {
        "id": "d",
        "text": "cat backup"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "mkdir 是 Make Directory 的缩写，用于创建新文件夹。",
    "wrongReasons": {
      "c": "touch 用于创建空文件或修改文件时间戳，不是用来新建目录的。",
      "b": "rmdir 用于删除空目录。",
      "d": "cat 用于查看或合并文本文件内容。"
    },
    "skillTags": [
      "linux",
      "cli",
      "directory"
    ],
    "relatedCommand": "mkdir -p /tmp/backup/logs",
    "estimatedTime": 30,
    "mnemonic": "mkdir = Make Directory；-p 一次建多级。"
  },
  {
    "id": "linux-basic-touch",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "新建空文件",
    "prompt": "要快速创建一个名为 `app.log` 的空白文件，通常使用什么命令？",
    "options": [
      {
        "id": "a",
        "text": "mkdir app.log"
      },
      {
        "id": "b",
        "text": "touch app.log"
      },
      {
        "id": "c",
        "text": "cp app.log"
      },
      {
        "id": "d",
        "text": "rm app.log"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "touch 命令若接不存在的文件名，会默认新建一个 0 字节的空文本文件。",
    "wrongReasons": {
      "a": "mkdir 会创建一个名为 app.log 的目录，而不是文件。",
      "d": "rm 用于删除文件。",
      "c": "cp 是复制命令，必须提供源文件和目标路径参数。"
    },
    "skillTags": [
      "linux",
      "cli",
      "files"
    ],
    "relatedCommand": "touch test.txt",
    "estimatedTime": 30,
    "mnemonic": "touch 碰一下：文件不存在就建个空文件。"
  },
  {
    "id": "linux-basic-rm",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "删除文件",
    "prompt": "在 Linux 终端中，用于删除一个名为 `temp.txt` 文件的基础命令是？",
    "options": [
      {
        "id": "a",
        "text": "mv temp.txt"
      },
      {
        "id": "b",
        "text": "del temp.txt"
      },
      {
        "id": "c",
        "text": "rm temp.txt"
      },
      {
        "id": "d",
        "text": "mkdir temp.txt"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "rm (Remove) 是 Linux 下删除文件和目录的标准指令。",
    "wrongReasons": {
      "b": "del 是 Windows CMD 里的删除指令，在 Linux 下默认不支持。",
      "a": "mv 用于移动文件或改名。",
      "d": "mkdir 用于创建目录。"
    },
    "skillTags": [
      "linux",
      "cli",
      "files"
    ],
    "relatedCommand": "rm -f temp.txt",
    "estimatedTime": 30,
    "mnemonic": "rm = Remove 删文件；Linux 没有 del。"
  },
  {
    "id": "linux-basic-rm-rf",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "递归强制删除",
    "prompt": "要强制删除一个名为 `old_logs` 的非空目录及其内部所有文件，应该执行什么命令？",
    "options": [
      {
        "id": "a",
        "text": "rm old_logs"
      },
      {
        "id": "b",
        "text": "rm -rf old_logs"
      },
      {
        "id": "c",
        "text": "mv old_logs /dev/null"
      },
      {
        "id": "d",
        "text": "rmdir old_logs"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "rm -rf 表示递归(r)并强制(f)删除目录及其所有子内容，这是运维高危但常用的清理操作。",
    "wrongReasons": {
      "d": "rmdir 只能用来删除空目录，如果目录非空会报错失败。",
      "a": "rm 不加参数无法直接删除目录，会提示 \"is a directory\" 错误。",
      "c": "mv /dev/null 是错误的语法，/dev/null 是设备文件而不是目标目录。"
    },
    "skillTags": [
      "linux",
      "cli",
      "danger"
    ],
    "relatedCommand": "rm -rf /path/to/dir",
    "estimatedTime": 40,
    "mnemonic": "rm -rf：r 递归 f 强制删非空目录——高危，慎用。"
  },
  {
    "id": "linux-basic-cp",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "复制文件",
    "prompt": "将 `config.json` 复制一份并命名为 `config.json.bak`，应该使用什么命令？",
    "options": [
      {
        "id": "a",
        "text": "tar config.json config.json.bak"
      },
      {
        "id": "b",
        "text": "ln config.json config.json.bak"
      },
      {
        "id": "c",
        "text": "cp config.json config.json.bak"
      },
      {
        "id": "d",
        "text": "mv config.json config.json.bak"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "cp 是 Copy 的缩写，语法为 cp [源文件] [目标位置/文件名]。",
    "wrongReasons": {
      "d": "mv 会将源文件重命名，导致原有的 config.json 消失。",
      "b": "ln 用于创建硬链接或软链接，而不是独立的副本。",
      "a": "tar 是打包归档工具，语法不同。"
    },
    "skillTags": [
      "linux",
      "cli",
      "files"
    ],
    "relatedCommand": "cp -p source.txt dest.txt",
    "estimatedTime": 35,
    "mnemonic": "cp = Copy，源在前目标在后，原文件还在。"
  },
  {
    "id": "linux-basic-mv",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "移动与重命名",
    "prompt": "要将当前目录下的 `app.tar` 移动到 `/opt` 目录下，应该执行哪条命令？",
    "options": [
      {
        "id": "a",
        "text": "cp app.tar /opt/"
      },
      {
        "id": "b",
        "text": "mv app.tar /opt/"
      },
      {
        "id": "c",
        "text": "rm app.tar /opt/"
      },
      {
        "id": "d",
        "text": "tar app.tar /opt/"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "mv (Move) 既可用于重命名文件，也可用于在不同路径间移动文件。",
    "wrongReasons": {
      "a": "cp 复制后，当前目录下仍然会保留原有的 app.tar，未达到“移动”目的。",
      "c": "rm 是删除命令，接受两个参数代表删除这两个文件。",
      "d": "tar 命令用来解压或打包文件。"
    },
    "skillTags": [
      "linux",
      "cli",
      "files"
    ],
    "relatedCommand": "mv old.txt new.txt",
    "estimatedTime": 35,
    "mnemonic": "mv = Move：既能移动也能改名，原文件不留。"
  },
  {
    "id": "linux-basic-cat",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "查看文件内容",
    "prompt": "想要在终端屏幕上一次性输出文本文件 `version.txt` 的全部内容，最简单的命令是？",
    "options": [
      {
        "id": "a",
        "text": "cd version.txt"
      },
      {
        "id": "b",
        "text": "cat version.txt"
      },
      {
        "id": "c",
        "text": "pwd version.txt"
      },
      {
        "id": "d",
        "text": "mkdir version.txt"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "cat (Concatenate) 命令用于连接文件并打印到标准输出设备上。",
    "wrongReasons": {
      "a": "cd 用于切换目录，输入文件名会报错 \"Not a directory\"。",
      "c": "pwd 不接收文件参数，只会打印当前所在目录。",
      "d": "mkdir 会创建一个以 version.txt 命名的子目录。"
    },
    "skillTags": [
      "linux",
      "cli",
      "files"
    ],
    "relatedCommand": "cat /etc/hostname",
    "estimatedTime": 30,
    "mnemonic": "cat 一次吐全文；大文件改用 less/tail。"
  },
  {
    "id": "linux-basic-grep",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "过滤文本关键字",
    "prompt": "要在日志文件 `error.log` 中搜索包含关键字 `failed` 的所有行，应使用什么命令？",
    "options": [
      {
        "id": "a",
        "text": "tar \"failed\" error.log"
      },
      {
        "id": "b",
        "text": "grep \"failed\" error.log"
      },
      {
        "id": "c",
        "text": "cat \"failed\" error.log"
      },
      {
        "id": "d",
        "text": "find \"failed\" error.log"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "grep 过滤工具支持在文件中通过正则表达式/字符串匹配特定行，并将其输出。",
    "wrongReasons": {
      "d": "find 用于在目录层级中根据名称、大小或时间查找文件本身，而不是查找文件内的文本。",
      "c": "cat 会尝试输出名为 \"failed\" 和 \"error.log\" 的两个文件。",
      "a": "tar 是打包归档命令，语法不符。"
    },
    "skillTags": [
      "linux",
      "grep",
      "logs"
    ],
    "relatedCommand": "grep -i \"error\" /var/log/nginx/error.log",
    "estimatedTime": 40,
    "mnemonic": "grep 找「行」：在文件里按关键字过滤。"
  },
  {
    "id": "linux-basic-chmod",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "修改文件权限",
    "prompt": "要给一个名为 `run.sh` 的 Shell 脚本增加可执行权限，最常用的命令是？",
    "options": [
      {
        "id": "a",
        "text": "umask +x run.sh"
      },
      {
        "id": "b",
        "text": "chmod +x run.sh"
      },
      {
        "id": "c",
        "text": "chown +x run.sh"
      },
      {
        "id": "d",
        "text": "chgrp +x run.sh"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "chmod (Change Mode) 用于调整文件或目录的读写执行权限，+x 代表增加执行(execute)权限。",
    "wrongReasons": {
      "c": "chown (Change Owner) 用于修改文件的拥有者。",
      "d": "chgrp (Change Group) 用于修改文件的所属用户组。",
      "a": "umask 用于设定默认的权限掩码。"
    },
    "skillTags": [
      "linux",
      "permission",
      "chmod"
    ],
    "relatedCommand": "chmod 755 run.sh",
    "estimatedTime": 35,
    "mnemonic": "chmod 改权限 +x 给执行；chown 改属主、chgrp 改组。"
  },
  {
    "id": "linux-basic-chown",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "更改文件所有者",
    "prompt": "要把文件 `app.jar` 的所有者（owner）变更为用户 `admin`，正确的命令 is？",
    "options": [
      {
        "id": "a",
        "text": "chmod admin app.jar"
      },
      {
        "id": "b",
        "text": "useradd admin app.jar"
      },
      {
        "id": "c",
        "text": "chgrp admin app.jar"
      },
      {
        "id": "d",
        "text": "chown admin app.jar"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "chown (Change Owner) 命令用来改变文件或目录的属主，基本语法是 chown [用户] [文件]。",
    "wrongReasons": {
      "a": "chmod 用于修改文件的读、写、执行权限属性。",
      "c": "chgrp 用于修改所属组，而不是属主用户。",
      "b": "useradd 是用于在系统中创建新用户的管理指令。"
    },
    "skillTags": [
      "linux",
      "permission",
      "chown"
    ],
    "relatedCommand": "chown admin:admin app.jar",
    "estimatedTime": 35,
    "mnemonic": "chown 改属主：chown 用户 文件。"
  },
  {
    "id": "linux-basic-df",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "查看磁盘空间",
    "prompt": "在 Linux 系统中，要以人类易读的格式（如 GB/MB）查看各个分区的磁盘空间占用情况，应执行？",
    "options": [
      {
        "id": "a",
        "text": "free -m"
      },
      {
        "id": "b",
        "text": "du -sh"
      },
      {
        "id": "c",
        "text": "lsblk -d"
      },
      {
        "id": "d",
        "text": "df -h"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "df (Disk Free) 配合 -h (human-readable) 可以直观查看整个系统磁盘挂载分区的剩余和已用容量。",
    "wrongReasons": {
      "b": "du -sh 是用来查看某一个特定目录或文件所占用的磁盘空间大小。",
      "a": "free -m 用于以 MB 为单位显示系统的内存使用状态。",
      "c": "lsblk 主要查看块设备的层次结构和分区大小，不显示文件系统的具体使用率。"
    },
    "skillTags": [
      "linux",
      "disk",
      "cli"
    ],
    "relatedCommand": "df -h",
    "estimatedTime": 40,
    "mnemonic": "df 看分区剩余（Disk Free），du 看目录占用。"
  },
  {
    "id": "linux-basic-du",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "查看目录大小",
    "prompt": "想要快速查看当前目录的总磁盘占用空间大小，正确的命令是？",
    "options": [
      {
        "id": "a",
        "text": "free -h"
      },
      {
        "id": "b",
        "text": "uptime"
      },
      {
        "id": "c",
        "text": "df -h"
      },
      {
        "id": "d",
        "text": "du -sh"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "du (Disk Usage) 的 -s 参数代表汇总(summarize)，-h 代表人类易读格式，合起来 du -sh 能查看当前目录总大小。",
    "wrongReasons": {
      "c": "df -h 用于查看分区级别的剩余空间，不能查看某个特定目录的总占用。",
      "a": "free -h 显示内存使用。",
      "b": "uptime 显示系统负载和运行时间。"
    },
    "skillTags": [
      "linux",
      "disk",
      "cli"
    ],
    "relatedCommand": "du -sh /var/log",
    "estimatedTime": 35,
    "mnemonic": "du -sh 看目录总大小：s 汇总、h 易读。"
  },
  {
    "id": "linux-basic-ps",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "查看系统进程",
    "prompt": "要查看当前系统正在运行的所有进程的详细快照信息，通常执行哪个命令？",
    "options": [
      {
        "id": "a",
        "text": "free"
      },
      {
        "id": "b",
        "text": "ps -ef"
      },
      {
        "id": "c",
        "text": "netstat"
      },
      {
        "id": "d",
        "text": "uptime"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "ps (Process Status) 用于列出当前进程快照，-ef 常配合使用来列出系统中所有的进程以及它们的父子关系。",
    "wrongReasons": {
      "a": "free 用于查看内存大小。",
      "c": "netstat 用于监控网络连接和端口占用。",
      "d": "uptime 查看系统运行时长。"
    },
    "skillTags": [
      "linux",
      "process",
      "cli"
    ],
    "relatedCommand": "ps -ef | grep nginx",
    "estimatedTime": 35,
    "mnemonic": "ps -ef 列全部进程快照；要实时看用 top。"
  },
  {
    "id": "linux-basic-top",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "实时进程监控",
    "prompt": "要进入一个能够实时刷新、展示当前 CPU/内存占用最高的进程列表的动态监控界面，应使用？",
    "options": [
      {
        "id": "a",
        "text": "jstack"
      },
      {
        "id": "b",
        "text": "ps"
      },
      {
        "id": "c",
        "text": "df"
      },
      {
        "id": "d",
        "text": "top"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "top 提供了一个交互式的、实时刷新 CPU/内存排行和系统负载指标的命令行工具。",
    "wrongReasons": {
      "b": "ps 只能列出静态的进程快照，不会自动循环刷新。",
      "c": "df 用于查看磁盘分区。",
      "a": "jstack 用于打印 Java 虚拟机当前的线程堆栈信息。"
    },
    "skillTags": [
      "linux",
      "process",
      "top"
    ],
    "relatedCommand": "top -b -n 1",
    "estimatedTime": 35,
    "mnemonic": "top 实时刷 CPU/内存排行；ps 只是静态快照。"
  },
  {
    "id": "linux-basic-kill",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "结束进程",
    "prompt": "若某后台进程的 PID 为 `2048` 且卡死，想通过发送强制终止信号（SIGKILL）结束它，应执行？",
    "options": [
      {
        "id": "a",
        "text": "stop 2048"
      },
      {
        "id": "b",
        "text": "kill 2048"
      },
      {
        "id": "c",
        "text": "close 2048"
      },
      {
        "id": "d",
        "text": "kill -9 2048"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "kill 发送信号给进程，-9 参数代表强制终止信号 SIGKILL，能够清理不响应标准终止信号的卡死进程。",
    "wrongReasons": {
      "b": "默认不加信号参数时，kill 会发送 SIGTERM (15) 信号，可能被进程捕获或忽略，无法确保杀死卡死进程。",
      "a": "stop 不是 Linux 结束 PID 进程的系统命令。",
      "c": "close 没有该进程管理命令。"
    },
    "skillTags": [
      "linux",
      "process",
      "kill"
    ],
    "relatedCommand": "killall -9 nginx",
    "estimatedTime": 40,
    "mnemonic": "kill -9 发 SIGKILL 强杀卡死；默认 15 可被忽略。"
  },
  {
    "id": "linux-basic-free",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "查看物理内存",
    "prompt": "以人类易读单位（G/M）显示当前系统的总内存、已用内存和剩余 Swap 交换空间，正确的命令是？",
    "options": [
      {
        "id": "a",
        "text": "top -d"
      },
      {
        "id": "b",
        "text": "du -h"
      },
      {
        "id": "c",
        "text": "free -h"
      },
      {
        "id": "d",
        "text": "df -h"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "free 命令用于查看物理内存(RAM)和交换内存(Swap)的状态，配合 -h 可以提供易读的度量后缀。",
    "wrongReasons": {
      "d": "df -h 用于查看磁盘空间挂载，与内存无关。",
      "b": "du -h 用于查看文件目录的物理磁盘占用大小。",
      "a": "top 可在头部输出内存，但它是一个持续刷新的交互看板。"
    },
    "skillTags": [
      "linux",
      "memory",
      "cli"
    ],
    "relatedCommand": "free -m",
    "estimatedTime": 35,
    "mnemonic": "free -h 看内存与 Swap；磁盘用 df 别搞混。"
  },
  {
    "id": "linux-basic-tar",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "压缩归档",
    "prompt": "要把整个 `logs` 目录打包并压缩为 `logs.tar.gz` 文件，以下哪条命令是正确的？",
    "options": [
      {
        "id": "a",
        "text": "tar -xzvf logs.tar.gz logs"
      },
      {
        "id": "b",
        "text": "gzip logs.tar.gz logs"
      },
      {
        "id": "c",
        "text": "tar -czvf logs.tar.gz logs"
      },
      {
        "id": "d",
        "text": "zip -d logs.tar.gz logs"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "tar -czvf 中：c 代表创建包(create)，z 代表用 gzip 压缩，v 代表显示进度(verbose)，f 代表输出文件名。",
    "wrongReasons": {
      "a": "-x 代表解压归档(extract)，而不是打包创建。",
      "d": "zip 命令的参数用法不符，-d 是用来在 zip 包中删除指定文件的。",
      "b": "gzip 无法直接打包目录，只能对单个文件进行压缩。"
    },
    "skillTags": [
      "linux",
      "tar",
      "compress"
    ],
    "relatedCommand": "tar -czvf logs.tar.gz logs",
    "estimatedTime": 40,
    "mnemonic": "打包记 czvf：c 创建 z 压缩 v 进度 f 文件名；解包换 x。"
  },
  {
    "id": "linux-basic-uname",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "查看内核版本",
    "prompt": "想要获取当前 Linux 主机的内核版本号和系统架构（如 x86_64），可以执行什么命令？",
    "options": [
      {
        "id": "a",
        "text": "hostname"
      },
      {
        "id": "b",
        "text": "uname -a"
      },
      {
        "id": "c",
        "text": "cat /etc/hosts"
      },
      {
        "id": "d",
        "text": "whoami"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "uname 命令显示系统内核等硬件及版本信息，-a 参数能列出全部(all)可用的内核信息。",
    "wrongReasons": {
      "a": "hostname 只会打印主机名。",
      "d": "whoami 用于查看当前登录的用户名。",
      "c": "cat /etc/hosts 是打印本机的静态域名解析配置文件。"
    },
    "skillTags": [
      "linux",
      "cli",
      "system"
    ],
    "relatedCommand": "uname -r",
    "estimatedTime": 30,
    "mnemonic": "uname -r 看内核版本，-a 看全部系统信息。"
  },
  {
    "id": "linux-basic-whoami",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "确认当前登录用户",
    "prompt": "当不确定当前终端会话是以哪个系统用户身份登录时，可以使用什么命令直接查看？",
    "options": [
      {
        "id": "a",
        "text": "id -g"
      },
      {
        "id": "b",
        "text": "pwd"
      },
      {
        "id": "c",
        "text": "groups"
      },
      {
        "id": "d",
        "text": "whoami"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "whoami 直接打印当前终端有效用户的名称。",
    "wrongReasons": {
      "b": "pwd 显示当前路径。",
      "a": "id -g 用于显示当前用户的主用户组 ID(GID)。",
      "c": "groups 打印当前用户所属的所有群组。"
    },
    "skillTags": [
      "linux",
      "cli",
      "user"
    ],
    "relatedCommand": "id",
    "estimatedTime": 30,
    "mnemonic": "whoami 报当前有效用户名；id 看 uid/gid。"
  },
  {
    "id": "linux-basic-sudo",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "使用超级用户特权",
    "prompt": "在普通用户权限下，想要以系统管理员（root）的身份来运行命令，通常在该命令前加什么？",
    "options": [
      {
        "id": "a",
        "text": "sudo"
      },
      {
        "id": "b",
        "text": "runas"
      },
      {
        "id": "c",
        "text": "su"
      },
      {
        "id": "d",
        "text": "admin"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "sudo (superuser do) 允许被授权的用户临时以 root 等其他用户身份执行特定系统指令。",
    "wrongReasons": {
      "b": "runas 是 Windows 系统中以其他用户身份运行程序的命令。",
      "c": "su (Switch User) 用于切换当前用户身份，如果不加命令，会尝试打开一个新的 root 会话，而不是单次临时提权。",
      "d": "admin 不是 Linux 的前置提权命令。"
    },
    "skillTags": [
      "linux",
      "permission",
      "sudo"
    ],
    "relatedCommand": "sudo systemctl restart nginx",
    "estimatedTime": 35,
    "mnemonic": "sudo 单次提权执行；su 是切换身份开新会话。"
  },
  {
    "id": "linux-basic-find",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "搜索文件",
    "prompt": "要在 `/var/log` 目录下查找所有以 `.log` 结尾的文件，可以使用什么命令？",
    "options": [
      {
        "id": "a",
        "text": "locate \"*.log\""
      },
      {
        "id": "b",
        "text": "ls /var/log | grep \".log\""
      },
      {
        "id": "c",
        "text": "find /var/log -name \"*.log\""
      },
      {
        "id": "d",
        "text": "grep \"*.log\" /var/log"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "find 能够递归在目录树中按名字、大小、权限等搜索文件。-name \"*.log\" 代表按文件名通配搜索。",
    "wrongReasons": {
      "d": "grep 用于过滤文件内部的文本，不能直接搜索文件本身。",
      "b": "ls 管道 grep 只能查看 /var/log 的第一层子目录，无法实现多级子目录的递归搜索。",
      "a": "locate 依赖定时更新的数据库，且无法直接限制只搜索指定的 /var/log 路径下的文件。"
    },
    "skillTags": [
      "linux",
      "find",
      "cli"
    ],
    "relatedCommand": "find . -type f -size +100M",
    "estimatedTime": 40,
    "mnemonic": "find 路径 -name 通配，递归找「文件」；grep 找内容。"
  },
  {
    "id": "linux-basic-tail",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "实时监视日志尾部",
    "prompt": "想要实时查看业务日志 `app.log` 的最新滚动输出（随文件写入自动刷新），应该执行？",
    "options": [
      {
        "id": "a",
        "text": "tail -f app.log"
      },
      {
        "id": "b",
        "text": "head -f app.log"
      },
      {
        "id": "c",
        "text": "less app.log"
      },
      {
        "id": "d",
        "text": "cat app.log"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "tail -f (follow) 能够锁定文件末尾，并实时将应用新追加写入的数据打印到终端界面上。",
    "wrongReasons": {
      "b": "head 用于查看文件开头的若干行，不提供滚动监控模式。",
      "d": "cat 会一次性输出全部内容并退出，无法进行实时监控。",
      "c": "less 是翻页阅读器，虽然进入了独立终端页面，但不会默认自动滚动输出新内容。"
    },
    "skillTags": [
      "linux",
      "logs",
      "tail"
    ],
    "relatedCommand": "tail -n 100 -f /var/log/messages",
    "estimatedTime": 35,
    "mnemonic": "tail -f 跟随日志尾部实时刷新；head 看头部。"
  },
  {
    "id": "linux-basic-head",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "查看文件头部",
    "prompt": "只想快速预览文本文件的前 10 行内容，应该执行哪个命令？",
    "options": [
      {
        "id": "a",
        "text": "tail -n 10 filename"
      },
      {
        "id": "b",
        "text": "head -n 10 filename"
      },
      {
        "id": "c",
        "text": "cat -n 10 filename"
      },
      {
        "id": "d",
        "text": "less -n 10 filename"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "head 默认输出文件的前 10 行，使用 -n 参数可以自定义控制输出头部多少行。",
    "wrongReasons": {
      "a": "tail 用于查看文件的倒数 10 行。",
      "c": "cat -n 代表显示所有行号，不支持限制只输出 10 行。",
      "d": "less 命令的参数格式不支持 -n 10 来做截断输出。"
    },
    "skillTags": [
      "linux",
      "cli",
      "files"
    ],
    "relatedCommand": "head -n 5 /etc/passwd",
    "estimatedTime": 35,
    "mnemonic": "head -n N 看前 N 行；tail 看后 N 行。"
  },
  {
    "id": "linux-basic-history",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "历史命令查询",
    "prompt": "想要在 Bash 终端中查询自己最近执行过的历史命令列表，应直接输入？",
    "options": [
      {
        "id": "a",
        "text": "history"
      },
      {
        "id": "b",
        "text": "last"
      },
      {
        "id": "c",
        "text": "ps -e"
      },
      {
        "id": "d",
        "text": "logshow"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "history 命令用于提取和显示当前用户在终端会话中输入过的 Bash 历史指令列表。",
    "wrongReasons": {
      "c": "ps 显示当前后台活动进程，而非历史输入的文本指令。",
      "b": "last 显示最近用户的登录历史和时长记录。",
      "d": "logshow 不是 Linux 的标准命令。"
    },
    "skillTags": [
      "linux",
      "cli",
      "history"
    ],
    "relatedCommand": "history | grep \"ssh\"",
    "estimatedTime": 30,
    "mnemonic": "history 列本会话命令历史；last 看登录历史。"
  },
  {
    "id": "linux-basic-ln",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "创建软链接",
    "prompt": "要在当前目录下创建一个指向目标文件 `/opt/app/bin` 的软链接（快捷方式）并命名为 `run`，应执行？",
    "options": [
      {
        "id": "a",
        "text": "cp -s /opt/app/bin run"
      },
      {
        "id": "b",
        "text": "mklink /opt/app/bin run"
      },
      {
        "id": "c",
        "text": "ln -s /opt/app/bin run"
      },
      {
        "id": "d",
        "text": "ln /opt/app/bin run"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "ln 的 -s 参数代表创建软链接(symbolic link)，等同于快捷方式。如果不加 -s 则会创建硬链接。",
    "wrongReasons": {
      "d": "ln 不加参数创建的是硬链接，在跨分区或指向目录时有限制。",
      "a": "cp -s 不是创建快捷方式的通用 Linux 命令。",
      "b": "mklink 是 Windows 系统中创建符号链接的特有指令。"
    },
    "skillTags": [
      "linux",
      "symlink",
      "cli"
    ],
    "relatedCommand": "ln -s /etc/nginx/nginx.conf nginx_link",
    "estimatedTime": 40,
    "mnemonic": "ln -s 建软链（快捷方式）；不加 -s 是硬链。"
  },
  {
    "id": "linux-basic-uptime",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "查看系统运行状态",
    "prompt": "想要快速得知系统连续运行了多久，以及当前的 1/5/15 分钟系统负载平均值（load average），可以执行？",
    "options": [
      {
        "id": "a",
        "text": "date"
      },
      {
        "id": "b",
        "text": "df"
      },
      {
        "id": "c",
        "text": "free"
      },
      {
        "id": "d",
        "text": "uptime"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "uptime 命令能输出当前系统时间、已运行天数/时间、当前在线用户数以及核心的 3 个周期的系统 CPU/进程队列负载平均值。",
    "wrongReasons": {
      "c": "free 用于显示内存情况。",
      "b": "df 显示磁盘分区空间。",
      "a": "date 仅能查看系统当前的日历与时钟时间。"
    },
    "skillTags": [
      "linux",
      "load",
      "cli"
    ],
    "relatedCommand": "uptime",
    "estimatedTime": 30,
    "mnemonic": "uptime 看运行时长 + 1/5/15 分钟负载。"
  },
  {
    "id": "linux-basic-passwd",
    "category": "linux",
    "type": "command",
    "level": "basic",
    "title": "更改用户密码",
    "prompt": "在当前终端以登录用户身份修改自己的账户密码，应该输入哪个指令？",
    "options": [
      {
        "id": "a",
        "text": "passwd"
      },
      {
        "id": "b",
        "text": "chpasswd"
      },
      {
        "id": "c",
        "text": "userpass"
      },
      {
        "id": "d",
        "text": "password"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "passwd 用于修改用户密码。如果不带参数，则默认修改当前登录用户自身的密码。",
    "wrongReasons": {
      "d": "password 不是 Linux 下的合法命令名。",
      "c": "userpass 没有此进程命令。",
      "b": "chpasswd 是用于管理员批量设置多用户密码的特殊高级指令。"
    },
    "skillTags": [
      "linux",
      "user",
      "security"
    ],
    "relatedCommand": "sudo passwd username",
    "estimatedTime": 30,
    "mnemonic": "passwd 改自己密码；带用户名(需 root)改他人。"
  },
  {
    "id": "network-basic-ip",
    "category": "network",
    "type": "command",
    "level": "basic",
    "title": "查看网卡 IP 地址",
    "prompt": "在现代 Linux 系统中，用于查看所有网络接口 IP 地址配置信息的推荐命令是？",
    "options": [
      {
        "id": "a",
        "text": "ping"
      },
      {
        "id": "b",
        "text": "nslookup"
      },
      {
        "id": "c",
        "text": "netstat"
      },
      {
        "id": "d",
        "text": "ip addr"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "ip addr (或简写 ip a) 是 iproute2 工具集推荐的新命令，用于代替旧的 ifconfig 查看 IP 地址。",
    "wrongReasons": {
      "a": "ping 用于探测与目标主机的网络连通性。",
      "b": "nslookup 用于查询域名的 DNS 解析信息。",
      "c": "netstat 用于展示连接和监听端口状态。"
    },
    "skillTags": [
      "network",
      "cli",
      "ip"
    ],
    "relatedCommand": "ip addr show eth0",
    "estimatedTime": 30,
    "mnemonic": "看 IP 用 ip addr（ip a），取代老旧 ifconfig。"
  },
  {
    "id": "network-basic-ping",
    "category": "network",
    "type": "command",
    "level": "basic",
    "title": "检测主机连通性",
    "prompt": "想要测试本机与外网地址 `8.8.8.8` 在网络三层是否连通，应运行什么指令？",
    "options": [
      {
        "id": "a",
        "text": "telnet 8.8.8.8"
      },
      {
        "id": "b",
        "text": "ping 8.8.8.8"
      },
      {
        "id": "c",
        "text": "ssh 8.8.8.8"
      },
      {
        "id": "d",
        "text": "curl 8.8.8.8"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "ping 命令利用网络层的 ICMP 协议发送请求数据包，用以简单验证节点是否可达与丢包、延迟状态。",
    "wrongReasons": {
      "d": "curl 建立的是 HTTP/HTTPS 四层以上连接，通常不用于基础的底层 IP 可达性测试。",
      "a": "telnet 需要指定端口来建立 TCP 连接，无法做无端口的网络层检测。",
      "c": "ssh 用于发起远程加密终端连接。"
    },
    "skillTags": [
      "network",
      "ping",
      "icmp"
    ],
    "relatedCommand": "ping -c 4 baidu.com",
    "estimatedTime": 30,
    "mnemonic": "ping 走三层 ICMP，验通断/丢包/时延。"
  },
  {
    "id": "network-basic-telnet",
    "category": "network",
    "type": "command",
    "level": "basic",
    "title": "测试 TCP 端口连通性",
    "prompt": "要快速验证远程服务器 `192.168.1.100` 的 `8080` 端口是否处于开启和网络放行状态，应使用？",
    "options": [
      {
        "id": "a",
        "text": "ping 192.168.1.100 8080"
      },
      {
        "id": "b",
        "text": "nslookup 192.168.1.100 8080"
      },
      {
        "id": "c",
        "text": "telnet 192.168.1.100 8080"
      },
      {
        "id": "d",
        "text": "curl 192.168.1.100"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "telnet 格式为 telnet [IP] [Port]，当看到 Connected 时说明四层 TCP 握手成功，端口是通的。",
    "wrongReasons": {
      "a": "ping 命令基于三层 ICMP，不涉及任何特定的 TCP 端口，后面直接带端口号是语法错误。",
      "b": "nslookup 只负责查询 DNS，不支持指定端口测试连接。",
      "d": "curl 默认会请求 80 端口，如果目标是 8080 且直接写 IP，未针对性定义端口且会尝试发起应用层 GET 动作，较繁琐。"
    },
    "skillTags": [
      "network",
      "port",
      "tcp"
    ],
    "relatedCommand": "nc -zv 192.168.1.100 8080",
    "estimatedTime": 35,
    "mnemonic": "测端口通不通：telnet IP 端口，或 nc -zv。"
  },
  {
    "id": "network-basic-curl",
    "category": "network",
    "type": "command",
    "level": "basic",
    "title": "命令行请求 URL",
    "prompt": "要在终端命令行下直接发起一个 HTTP GET 请求去访问网站 `https://api.github.com` 并展示返回的 JSON，应执行？",
    "options": [
      {
        "id": "a",
        "text": "telnet https://api.github.com"
      },
      {
        "id": "b",
        "text": "curl https://api.github.com"
      },
      {
        "id": "c",
        "text": "nslookup https://api.github.com"
      },
      {
        "id": "d",
        "text": "ping https://api.github.com"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "curl 是基于 URL 传输数据的标准终端工具，广泛用于调试 RESTful API 和网站可用性。",
    "wrongReasons": {
      "d": "ping 无法解析 https:// 前缀，也不能理解 URL 协议，它只能直接接受域名或 IP 作为目标。",
      "c": "nslookup 不执行网络传输，只进行域名查询。",
      "a": "telnet 不能处理复杂的 HTTPS 层校验。"
    },
    "skillTags": [
      "network",
      "curl",
      "http"
    ],
    "relatedCommand": "curl -I https://www.google.com",
    "estimatedTime": 35,
    "mnemonic": "curl 调接口/测网站，看返回体和状态码。"
  },
  {
    "id": "network-basic-nslookup",
    "category": "network",
    "type": "command",
    "level": "basic",
    "title": "查询域名 IP",
    "prompt": "想要查询一个域名 `example.com` 此时此刻被解析到了哪些具体的 IP 地址，应使用什么命令？",
    "options": [
      {
        "id": "a",
        "text": "nslookup example.com"
      },
      {
        "id": "b",
        "text": "ip route example.com"
      },
      {
        "id": "c",
        "text": "netstat example.com"
      },
      {
        "id": "d",
        "text": "route add example.com"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "nslookup 是 Name Server Lookup 的缩写，可向默认 DNS 服务器发起解析请求来翻译域名。",
    "wrongReasons": {
      "b": "ip route 用于查看本机的 IP 路由表配置，不能解析域名。",
      "c": "netstat 用于监控网络连接。",
      "d": "route add 用于给系统手动添加路由规则。"
    },
    "skillTags": [
      "network",
      "dns",
      "nslookup"
    ],
    "relatedCommand": "dig example.com",
    "estimatedTime": 35,
    "mnemonic": "查域名解析到哪个 IP：nslookup 或 dig。"
  },
  {
    "id": "network-basic-hosts",
    "category": "network",
    "type": "config",
    "level": "basic",
    "title": "本地静态域名映射",
    "prompt": "Linux 下要在本地强制将域名 `test.local` 指向 `127.0.0.1`，应该修改哪个配置文件？",
    "options": [
      {
        "id": "a",
        "text": "/etc/hostname"
      },
      {
        "id": "b",
        "text": "/etc/networks"
      },
      {
        "id": "c",
        "text": "/etc/hosts"
      },
      {
        "id": "d",
        "text": "/etc/resolv.conf"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "/etc/hosts 是操作系统的本地静态 DNS 解析映射表，其解析顺序默认优于外部 DNS 服务器。",
    "wrongReasons": {
      "d": "/etc/resolv.conf 是用来配置系统指向的外部 DNS 服务器 IP 地址的，不负责具体本地域名的硬解析。",
      "a": "/etc/hostname 仅包含本机的操作系统计算机名称。",
      "b": "/etc/networks 用于配置本机的静态网络别名。"
    },
    "skillTags": [
      "network",
      "dns",
      "hosts"
    ],
    "relatedCommand": "cat /etc/hosts",
    "estimatedTime": 40,
    "mnemonic": "本地强制域名映射改 /etc/hosts，优先于外部 DNS。"
  },
  {
    "id": "network-basic-resolv",
    "category": "network",
    "type": "config",
    "level": "basic",
    "title": "配置 DNS 服务器",
    "prompt": "要为系统指定首选的公网 DNS 解析服务器（例如 8.8.8.8），通常在哪个配置文件中配置 `nameserver`？",
    "options": [
      {
        "id": "a",
        "text": "/etc/resolv.conf"
      },
      {
        "id": "b",
        "text": "/etc/hosts"
      },
      {
        "id": "c",
        "text": "/etc/sysconfig/network"
      },
      {
        "id": "d",
        "text": "/etc/nsswitch.conf"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "/etc/resolv.conf 是 Linux 定义系统 DNS 递归服务器 IP（即 nameserver）的核心配置。",
    "wrongReasons": {
      "b": "/etc/hosts 是静态的 IP-域名 映射表，不能指定上游 DNS 服务器地址。",
      "c": "/etc/sysconfig/network 主要在 RedHat 系中定义全局网络开启和网关，不是通用的 resolv 服务。",
      "d": "/etc/nsswitch.conf 用于控制系统查找用户名、主机等服务的检索顺序选择。"
    },
    "skillTags": [
      "network",
      "dns",
      "config"
    ],
    "relatedCommand": "cat /etc/resolv.conf",
    "estimatedTime": 40,
    "mnemonic": "指定上游 DNS 改 /etc/resolv.conf 的 nameserver。"
  },
  {
    "id": "network-basic-dns-port",
    "category": "network",
    "type": "config",
    "level": "basic",
    "title": "DNS 服务默认端口",
    "prompt": "在标准网络协议中，DNS 域名解析服务默认监听的传输层端口号是？",
    "options": [
      {
        "id": "a",
        "text": "443"
      },
      {
        "id": "b",
        "text": "53"
      },
      {
        "id": "c",
        "text": "80"
      },
      {
        "id": "d",
        "text": "22"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "DNS 解析在绝大多数查询场景下默认使用 UDP 端口 53，必要时（如大包响应）也会使用 TCP 端口 53。",
    "wrongReasons": {
      "c": "80 是标准未加密 HTTP 协议网页服务的监听端口。",
      "a": "443 是标准加密 HTTPS 协议网页服务的监听端口。",
      "d": "22 是 SSH 加密安全 shell 远程管理服务的标准端口。"
    },
    "skillTags": [
      "network",
      "dns",
      "port"
    ],
    "relatedCommand": "ss -lntup | grep :53",
    "estimatedTime": 30,
    "mnemonic": "DNS 端口 53：UDP 为主，大包走 TCP。"
  },
  {
    "id": "network-basic-http-port",
    "category": "network",
    "type": "config",
    "level": "basic",
    "title": "HTTP 服务端口",
    "prompt": "普通的未加密网站网页（HTTP）默认使用的网络端口是？",
    "options": [
      {
        "id": "a",
        "text": "443"
      },
      {
        "id": "b",
        "text": "80"
      },
      {
        "id": "c",
        "text": "21"
      },
      {
        "id": "d",
        "text": "8080"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "HTTP（超文本传输协议）未进行安全 TLS 加密时，默认在 TCP 的 80 端口传输。",
    "wrongReasons": {
      "a": "443 是 HTTPS 安全站点的默认端口。",
      "d": "8080 常用作 Tomcat 或替代 of 非标准 HTTP 开发测试端口。",
      "c": "21 是 FTP 文件传输控制协议的标准端口。"
    },
    "skillTags": [
      "network",
      "http",
      "port"
    ],
    "relatedCommand": "curl -I http://example.com:80",
    "estimatedTime": 30,
    "mnemonic": "HTTP=80，HTTPS=443，记牢这一对。"
  },
  {
    "id": "network-basic-https-port",
    "category": "network",
    "type": "config",
    "level": "basic",
    "title": "HTTPS 加密端口",
    "prompt": "加密的安全站点的超文本协议（HTTPS）默认采用什么端口？",
    "options": [
      {
        "id": "a",
        "text": "3306"
      },
      {
        "id": "b",
        "text": "443"
      },
      {
        "id": "c",
        "text": "80"
      },
      {
        "id": "d",
        "text": "8443"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "HTTPS 基于 TLS/SSL 加密，默认监听并在 TCP 的 443 端口提供页面渲染接入。",
    "wrongReasons": {
      "c": "80 是明文 HTTP 的默认端口。",
      "a": "3306 是 MySQL 关系数据库服务的默认监听端口。",
      "d": "8443 是常用的非标加密服务测试端口。"
    },
    "skillTags": [
      "network",
      "https",
      "port"
    ],
    "relatedCommand": "curl -I https://example.com:443",
    "estimatedTime": 30,
    "mnemonic": "HTTPS=443（TLS 加密）；80 是明文 HTTP。"
  },
  {
    "id": "network-basic-dhcp",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "自动获取 IP 地址",
    "prompt": "哪种网络协议用于在局域网内向连入的主机动态分发 IP 地址、网关和 DNS 代理配置？",
    "options": [
      {
        "id": "a",
        "text": "DNS"
      },
      {
        "id": "b",
        "text": "SMTP"
      },
      {
        "id": "c",
        "text": "DHCP"
      },
      {
        "id": "d",
        "text": "HTTP"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "DHCP (Dynamic Host Configuration Protocol) 用于网络节点联网后自动请求分配 IP 配置，免去了手工静态配 IP。",
    "wrongReasons": {
      "a": "DNS 负责域名到 IP 的名称解析，不用于 IP 的配置分发。",
      "d": "HTTP 用于传输网页及数据。",
      "b": "SMTP 属于简易邮件传输协议，用于发邮件。"
    },
    "skillTags": [
      "network",
      "dhcp",
      "protocol"
    ],
    "relatedCommand": "dhclient -r && dhclient",
    "estimatedTime": 30,
    "mnemonic": "自动发 IP/网关/DNS 的协议是 DHCP。"
  },
  {
    "id": "network-basic-loopback",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "本地回环 IP",
    "prompt": "专用于测试本地网络协议栈，代表本机自身的标准回环（Loopback）IP 地址是？",
    "options": [
      {
        "id": "a",
        "text": "255.255.255.255"
      },
      {
        "id": "b",
        "text": "192.168.1.1"
      },
      {
        "id": "c",
        "text": "127.0.0.1"
      },
      {
        "id": "d",
        "text": "0.0.0.0"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "127.0.0.1 是标准的本地 IPv4 回环地址（localhost），数据包不会发往物理网络介质，直接在协议栈回流。",
    "wrongReasons": {
      "b": "192.168.1.1 通常是局域网内部某个路由器或主机的静态内网地址，不具有全局标准本机的回环语义。",
      "d": "0.0.0.0 代表一个绑定监听中所有本网卡 IP 的占位地址，或者在路由表中代表默认网关路由指向。",
      "a": "255.255.255.255 是 IPv4 的全局局域网广播目标地址。"
    },
    "skillTags": [
      "network",
      "loopback",
      "ip"
    ],
    "relatedCommand": "ping 127.0.0.1",
    "estimatedTime": 30,
    "mnemonic": "127.0.0.1 是回环 localhost，包不出网卡。"
  },
  {
    "id": "network-basic-private-range",
    "category": "network",
    "type": "multiple",
    "level": "basic",
    "title": "标准内网私有 IP 范围",
    "prompt": "根据 RFC 1918 规定，哪些 IPv4 地址网段属于不能在公网路由的私有（内网）IP 范围？",
    "options": [
      {
        "id": "a",
        "text": "172.16.0.0/12"
      },
      {
        "id": "b",
        "text": "8.8.8.0/24"
      },
      {
        "id": "c",
        "text": "192.168.0.0/16"
      },
      {
        "id": "d",
        "text": "10.0.0.0/8"
      }
    ],
    "answer": [
      "a",
      "c",
      "d"
    ],
    "explanation": "内网三大私有保留地址段是：A 类的 10.0.0.0/8、B 类的 172.16.0.0/12 至 172.31.255.255，以及 C 类的 192.168.0.0/16。",
    "wrongReasons": {
      "b": "8.8.8.0/24 属于公网可路由的 IP 段（如 Google 公共 DNS 网段），不属于内网私有段。"
    },
    "skillTags": [
      "network",
      "ip",
      "rfc1918"
    ],
    "relatedCommand": "IP 规划：10.x, 172.16-31.x, 192.168.x",
    "estimatedTime": 40,
    "mnemonic": "私有段三块：10/8、172.16-31、192.168/16。"
  },
  {
    "id": "network-basic-tcp-udp-diff",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "TCP 与 UDP 区别",
    "prompt": "相比于 UDP 协议，TCP 协议最核心的特征是？",
    "options": [
      {
        "id": "a",
        "text": "传输速率更快、无连接开销"
      },
      {
        "id": "b",
        "text": "只支持一对多广播发送"
      },
      {
        "id": "c",
        "text": "面向连接、提供可靠传输和丢包重传"
      },
      {
        "id": "d",
        "text": "不支持任何流控制机制"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "TCP 是一种面向连接的、可靠的传输层协议，通过三次握手、序号确认、流量控制及超时重传确保报文数据准确送达。",
    "wrongReasons": {
      "a": "速率快、无连接、无头部开销是 UDP 协议的典型优点，而不是 TCP 的特征。",
      "b": "TCP 是点对点单播的，不支持多播或广播，UDP 才支持。",
      "d": "TCP 依靠滑动窗口等机制提供了非常完善的流量和拥塞控制。"
    },
    "skillTags": [
      "network",
      "tcp",
      "udp"
    ],
    "relatedCommand": "netstat -antp | grep ESTABLISHED",
    "estimatedTime": 35,
    "mnemonic": "TCP=面向连接可靠重传；UDP=快但不保证到达。"
  },
  {
    "id": "network-basic-gateway",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "默认网关作用",
    "prompt": "在局域网主机中配置“默认网关”（Default Gateway）的核心作用是？",
    "options": [
      {
        "id": "a",
        "text": "代替本地网卡进行光电信号的格式转换"
      },
      {
        "id": "b",
        "text": "指示主机如何将数据包投递给非本地网段的外部目标"
      },
      {
        "id": "c",
        "text": "为本地局域网的主机执行域名和 IP 的互相翻译"
      },
      {
        "id": "d",
        "text": "限制本机最大并发连接数量"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "当目的 IP 不在本机局域网的子网内时，主机不知道如何路由，需要将包统一发给网关（路由器），由其进行下一跳投递。",
    "wrongReasons": {
      "d": "网关不限制主机本机的并发 TCP 连接数。",
      "c": "域名翻译由 DNS 服务器提供，网关仅做路由。",
      "a": "光电信号转换由光猫（收发器）或物理网卡 PHY 芯片完成。"
    },
    "skillTags": [
      "network",
      "routing",
      "gateway"
    ],
    "relatedCommand": "ip route show",
    "estimatedTime": 35,
    "mnemonic": "默认网关=出本网段时找它转发（下一跳）。"
  },
  {
    "id": "cloud-basic-vm",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云服务器实例",
    "prompt": "云平台上的弹性虚拟计算服务器（例如阿里云 ECS、AWS EC2）在运维中通常被称为？",
    "options": [
      {
        "id": "a",
        "text": "安全组 (Security Group)"
      },
      {
        "id": "b",
        "text": "实例 (Instance)"
      },
      {
        "id": "c",
        "text": "镜像 (Image)"
      },
      {
        "id": "d",
        "text": "快照 (Snapshot)"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "实例是由云平台虚拟机管理程序动态分配的、完整的虚拟化服务器运行实体。",
    "wrongReasons": {
      "a": "安全组是虚拟防火墙规则集，控制实例的网络出入流量限制。",
      "c": "镜像用于提供部署实例的预制系统模版文件。",
      "d": "快照是在某一时间点对云盘进行的物理备份快照。"
    },
    "skillTags": [
      "cloud",
      "vm",
      "ecs"
    ],
    "relatedCommand": "Launch new cloud VM instance",
    "estimatedTime": 30,
    "mnemonic": "云上弹性虚拟服务器叫实例(Instance)。"
  },
  {
    "id": "cloud-basic-sg",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云安全组定义",
    "prompt": "云主机（如云服务器）的“安全组”在云架构中扮演的最直接角色是？",
    "options": [
      {
        "id": "a",
        "text": "云主机的 CPU 自动扩缩容控制器"
      },
      {
        "id": "b",
        "text": "作用于云主机网络接口的虚拟分布式防火墙"
      },
      {
        "id": "c",
        "text": "云主机的加密备份策略包"
      },
      {
        "id": "d",
        "text": "云端多租户的身份账号管理平台"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "安全组在云宿主机层通过规则链拦截虚拟机的进出流量，控制特定端口与 IP 网段的访问白名单。",
    "wrongReasons": {
      "c": "备份由快照和备份库机制保障，安全组不管理备份数据。",
      "a": "扩缩容由 Auto Scaling 服务处理，非安全组职责。",
      "d": "身份管理是由 IAM / RAM 服务统一控制的。"
    },
    "skillTags": [
      "cloud",
      "security-group",
      "firewall"
    ],
    "relatedCommand": "Configure security group inbound rules",
    "estimatedTime": 35,
    "mnemonic": "安全组=作用于网卡的虚拟防火墙(进出端口白名单)。"
  },
  {
    "id": "cloud-basic-vpc",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "专有网络 VPC",
    "prompt": "在公共云上，用于隔离和自定义多租户网络拓扑、划分私有子网和控制路由逻辑的云产品是？",
    "options": [
      {
        "id": "a",
        "text": "OSS (Object Storage Service)"
      },
      {
        "id": "b",
        "text": "CDN (Content Delivery Network)"
      },
      {
        "id": "c",
        "text": "VPC (Virtual Private Cloud)"
      },
      {
        "id": "d",
        "text": "RDS (Relational Database Service)"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "VPC 是用户在云端构建的、逻辑上彻底隔离的专用虚拟私有网络空间，支持自行划分网段和添加子网。",
    "wrongReasons": {
      "d": "RDS 是关系型云数据库服务代称。",
      "b": "CDN 用于静态资源全球分发缓存提速。",
      "a": "OSS 是非结构化的云端海量对象存储服务。"
    },
    "skillTags": [
      "cloud",
      "vpc",
      "network"
    ],
    "relatedCommand": "Create VPC subnet and route table",
    "estimatedTime": 35,
    "mnemonic": "VPC=云上隔离的私有网络，自划子网和路由。"
  },
  {
    "id": "cloud-basic-oss",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "对象存储服务",
    "prompt": "在云端存储大量的非结构化数据文件（如图片、视频压缩包、安装包等），最省成本且高可用的服务是？",
    "options": [
      {
        "id": "a",
        "text": "关系数据库 (如 RDS, Aurora)"
      },
      {
        "id": "b",
        "text": "消息队列 (如 RocketMQ, SQS)"
      },
      {
        "id": "c",
        "text": "对象存储 (如阿里云 OSS, AWS S3)"
      },
      {
        "id": "d",
        "text": "云硬盘 (如块存储 EBS, 云盘)"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "对象存储是面向文件的低成本网络存储服务，不依赖操作系统挂载文件系统，支持直接通过 API/HTTP 存取海量大文件。",
    "wrongReasons": {
      "d": "云盘是分配给具体虚拟机的块存储，成本相对较高，且不能多实例并发大容量读写访问（通常只能挂载给单台 VM）。",
      "a": "关系数据库以表结构存储数据，存放大文件极为耗费内存且数据库会迅速膨胀，性能低效。",
      "b": "消息队列用于异步处理消息指令。"
    },
    "skillTags": [
      "cloud",
      "storage",
      "s3"
    ],
    "relatedCommand": "Upload file to OSS bucket",
    "estimatedTime": 40,
    "mnemonic": "海量图片/视频/包用对象存储(OSS/S3)，便宜高可用。"
  },
  {
    "id": "cloud-basic-az",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云地域与可用区",
    "prompt": "在云平台的物理基础设施术语中，“可用区（Availability Zone）”通常是指？",
    "options": [
      {
        "id": "a",
        "text": "同一地域内，电力和网络物理独立的独立数据中心/机房"
      },
      {
        "id": "b",
        "text": "提供免费云产品的服务时限范围"
      },
      {
        "id": "c",
        "text": "某个云主机的控制台操作界面"
      },
      {
        "id": "d",
        "text": "系统支持的 CPU 核心超频范围"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "可用区是在同一城市地域内划分出来的物理隔离的机房，它们拥有独立的供电与空调，但通过超高速低延时内网互联，以实现跨机房灾备。",
    "wrongReasons": {
      "c": "云主机的控制台是图形化的 Web 管理面板。",
      "b": "免费时限通常由云厂商的促销策略决定。",
      "d": "云平台不支持 CPU 的物理人工超频控制。"
    },
    "skillTags": [
      "cloud",
      "datacenter",
      "az"
    ],
    "relatedCommand": "Deploy app across multi-AZ",
    "estimatedTime": 35,
    "mnemonic": "可用区(AZ)=同地域内电力网络独立的机房，跨 AZ 容灾。"
  },
  {
    "id": "cloud-basic-snapshot",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云盘快照备份",
    "prompt": "在云平台上做系统升级前，为了防止升级失败无法回滚，应优先针对系统云盘进行什么操作？",
    "options": [
      {
        "id": "a",
        "text": "开启安全组所有端口规则"
      },
      {
        "id": "b",
        "text": "创建磁盘快照 (Snapshot)"
      },
      {
        "id": "c",
        "text": "修改云主机的实例规格"
      },
      {
        "id": "d",
        "text": "重新绑定弹性公网 IP"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "快照可以捕获某一时刻磁盘的数据状态。一旦升级升级失败，可通过快照秒级将系统盘数据恢复回升级前的正常状态。",
    "wrongReasons": {
      "a": "开启安全组所有端口会暴露严重的安全攻击面，不提供任何数据备份。",
      "d": "重新绑定 IP 不解决本地系统文件损坏的问题。",
      "c": "修改规格仅调整 CPU 和内存资源，不能解决文件被损坏的数据问题。"
    },
    "skillTags": [
      "cloud",
      "backup",
      "snapshot"
    ],
    "relatedCommand": "Create snapshot of disk-xxxx",
    "estimatedTime": 35,
    "mnemonic": "升级前先打快照(Snapshot)，失败可秒级回滚。"
  },
  {
    "id": "cloud-basic-rds",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "托管数据库服务",
    "prompt": "云上的“托管关系型数据库服务”（如 RDS）相比于自己在虚拟机里自建数据库，最显著的区别是？",
    "options": [
      {
        "id": "a",
        "text": "不支持执行 SQL 复杂查询语句"
      },
      {
        "id": "b",
        "text": "数据库完全不计费"
      },
      {
        "id": "c",
        "text": "提供自动备份、高可用架构切换和免运维补丁升级"
      },
      {
        "id": "d",
        "text": "强制不允许使用主外键关系"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "RDS 将底层 OS 运维和数据库的基础备份运维完全托管给云平台，让研发/DBA 可以一键实现高可用容灾架构。",
    "wrongReasons": {
      "b": "托管数据库通常根据存储容量和计算规格计费，价格往往高于普通云服务器。",
      "a": "RDS 使用标准 SQL 查询逻辑，完全支持复杂语法。",
      "d": "外键约束等关系设计在托管 RDBMS 中同样天然支持。"
    },
    "skillTags": [
      "cloud",
      "rds",
      "database"
    ],
    "relatedCommand": "Configure RDS auto-backup policy",
    "estimatedTime": 35,
    "mnemonic": "RDS=托管数据库：自动备份+高可用+免运维补丁。"
  },
  {
    "id": "cloud-basic-billing",
    "category": "cloud",
    "type": "multiple",
    "level": "basic",
    "title": "云资源计费方式",
    "prompt": "企业级云平台服务（如阿里云、腾讯云、AWS）中，最基础的两种资源计费方式为？",
    "options": [
      {
        "id": "a",
        "text": "永久免费授权"
      },
      {
        "id": "b",
        "text": "按量付费（后付费/Pay-as-you-go）"
      },
      {
        "id": "c",
        "text": "包年包月（预付费/Subscription）"
      },
      {
        "id": "d",
        "text": "通过观看广告抵扣扣费"
      }
    ],
    "answer": [
      "b",
      "c"
    ],
    "explanation": "包年包月适合业务量稳定、使用周期长的基线资源；按量付费则以秒/分/小时计费，适合弹性高频变化和临时测试场景。",
    "wrongReasons": {
      "a": "除了部分入门轻量资源有试用额度，企业生产级资源均为收费服务。",
      "d": "企业云服务不提供广告播放抵扣费用的付费机制。"
    },
    "skillTags": [
      "cloud",
      "billing",
      "cost"
    ],
    "relatedCommand": "Manage billing and subscriptions in console",
    "estimatedTime": 35,
    "mnemonic": "两种计费：包年包月(稳定)、按量付费(弹性)。"
  },
  {
    "id": "cloud-basic-iam",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "访问身份控制 IAM",
    "prompt": "企业云账号下要给不同的研发人员开立独立的子账号，并控制他们各自访问云资源的权限级别，应使用？",
    "options": [
      {
        "id": "a",
        "text": "VPC 虚拟专用云"
      },
      {
        "id": "b",
        "text": "CDN 边缘加速"
      },
      {
        "id": "c",
        "text": "IAM / RAM (访问控制服务)"
      },
      {
        "id": "d",
        "text": "DNS 域名路由"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "IAM (Identity and Access Management) 统一控制账号权限边界、多子用户、临时会话授权（Role/STS）。",
    "wrongReasons": {
      "a": "VPC 隔离的是网络边界，不管理账号身份权限。",
      "b": "CDN 用于内容分发提速。",
      "d": "DNS 控制流量的目标 IP 解析路由。"
    },
    "skillTags": [
      "cloud",
      "iam",
      "ram"
    ],
    "relatedCommand": "Create RAM user and attach read-only policy",
    "estimatedTime": 35,
    "mnemonic": "子账号分权用 IAM/RAM。"
  },
  {
    "id": "cloud-basic-elastic-ip",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "弹性公网 IP",
    "prompt": "云平台的“弹性公网 IP（EIP）”最强大的特性是？",
    "options": [
      {
        "id": "a",
        "text": "价格随天气温度高低进行弹性波动"
      },
      {
        "id": "b",
        "text": "可以独立于虚拟机单独购买，并能动态解绑和重新绑定到任意实例上"
      },
      {
        "id": "c",
        "text": "完全不需要路由即可接入物理外网"
      },
      {
        "id": "d",
        "text": "能自动过滤掉所有 SQL 注入攻击"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "EIP 是一种 NAT 公网 IP，其独立生存周期让运维可以在不变更外网 IP 的情况下，随时切换后端挂载的虚拟机或负载均衡器。",
    "wrongReasons": {
      "c": "EIP 同样依靠互联网边界路由器及云平台内部的虚拟路由器进行 NAT 流量分发，而不是绕过路由。",
      "a": "EIP 价格由购买带宽/流量和公网 IP 保留费决定，不受物理天气影响。",
      "d": "公网 IP 无法过滤高级应用层攻击，SQL 注入过滤由 WAF 产品负责。"
    },
    "skillTags": [
      "cloud",
      "eip",
      "ip"
    ],
    "relatedCommand": "Associate EIP eip-xxx with ecs-yyy",
    "estimatedTime": 35,
    "mnemonic": "EIP=可独立购买、随时解绑重绑到任意实例的公网 IP。"
  },
  {
    "id": "cloud-basic-slb",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云负载均衡器",
    "prompt": "当应用服务器访问流量陡增，想要一键将公网流量均匀分发到后端的几台云服务器上，应引入哪个服务？",
    "options": [
      {
        "id": "a",
        "text": "负载均衡 (如 SLB, ALB, ELB)"
      },
      {
        "id": "b",
        "text": "物理机柜托管 (IDC)"
      },
      {
        "id": "c",
        "text": "对象存储服务 (OSS)"
      },
      {
        "id": "d",
        "text": "专有专线接入 (ExpressConnect)"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "负载均衡器作为流量入口，接收客户端连接，并使用内置调度算法分流至健康的后端云服务器集群中。",
    "wrongReasons": {
      "c": "OSS 仅提供静态文件的网络托管。",
      "d": "专有专线用于云端与企业自建机房的高速物理网络打通，不用于公网流量分发。",
      "b": "机柜托管是将硬件机器放入运营商 IDC 机房，与云上自动负载均衡软件分流无关。"
    },
    "skillTags": [
      "cloud",
      "slb",
      "lb"
    ],
    "relatedCommand": "Add backend server to SLB listener",
    "estimatedTime": 35,
    "mnemonic": "流量分发到多台后端用负载均衡(SLB/ALB)。"
  },
  {
    "id": "devops-basic-docker-diff",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "容器与虚拟机区别",
    "prompt": "相比于传统的虚拟机（如 VMware, KVM），Docker 容器技术最主要的轻量优势是？",
    "options": [
      {
        "id": "a",
        "text": "容器共享宿主机的操作系统内核，无需虚拟化 Guest OS"
      },
      {
        "id": "b",
        "text": "容器可以在没有 CPU 的物理设备上开启"
      },
      {
        "id": "c",
        "text": "容器不需要消耗任何内存即可运行"
      },
      {
        "id": "d",
        "text": "容器中运行的文件不会在磁盘中占用任何空间"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "容器底层通过 Linux Namespace 做隔离，通过 Cgroups 做资源限制，核心是直接共享并复用宿主机的内核，因而极快且省空间。",
    "wrongReasons": {
      "c": "容器内运行的进程依然必须占用内存来跑业务代码。",
      "b": "进程的计算天然必须由物理 CPU 执行。",
      "d": "容器镜像层和可写层文件同样物理存放在宿主机的磁盘文件系统中。"
    },
    "skillTags": [
      "docker",
      "container",
      "kernel"
    ],
    "relatedCommand": "docker info",
    "estimatedTime": 35,
    "mnemonic": "容器轻在共享宿主机内核，不装 Guest OS。"
  },
  {
    "id": "devops-basic-image-container",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "镜像与容器的关系",
    "prompt": "在 Docker 容器的技术术语中，关于“镜像（Image）”和“容器（Container）”的关系，以下哪种比喻最贴切？",
    "options": [
      {
        "id": "a",
        "text": "镜像是静态的只读模板（类似于类），容器是镜像的动态运行实例（类似于对象）"
      },
      {
        "id": "b",
        "text": "镜像只能在 Linux 平台运行，容器只能在 Windows 运行"
      },
      {
        "id": "c",
        "text": "容器必须定期保存为镜像才能在物理网络上传输数据"
      },
      {
        "id": "d",
        "text": "镜像是用来解压容器的解压密码"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "镜像是分层的、静态的、不可写的系统/包快照模板。通过 docker run 命令实例化后，Docker 会在镜像顶部加一层可写层，这就是容器。",
    "wrongReasons": {
      "d": "镜像包含了容器所需要的文件系统和启动指令，而不是密码。",
      "c": "容器可以通过标准网络直接通信以传输业务数据，不需要频繁转换归档成镜像文件才能联网。",
      "b": "Docker 容器和镜像在 Linux、Windows 及 macOS 平台上均可支持运行。"
    },
    "skillTags": [
      "docker",
      "image",
      "container"
    ],
    "relatedCommand": "docker images && docker ps",
    "estimatedTime": 40,
    "mnemonic": "镜像=只读模板(类)，容器=运行实例(对象)。"
  },
  {
    "id": "devops-basic-docker-run",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "创建并运行容器",
    "prompt": "要在后台（守护进程模式）运行一个基于 `nginx:alpine` 镜像的容器，应运行？",
    "options": [
      {
        "id": "a",
        "text": "docker run -d nginx:alpine"
      },
      {
        "id": "b",
        "text": "docker exec nginx:alpine"
      },
      {
        "id": "c",
        "text": "docker run -it nginx:alpine"
      },
      {
        "id": "d",
        "text": "docker build nginx:alpine"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "docker run 用于根据镜像生成容器并开启，-d 参数（detach）指示容器在后台默默运行，不占用当前的终端窗口。",
    "wrongReasons": {
      "d": "docker build 用于通过本地 Dockerfile 模板文件构建一个新镜像。",
      "b": "docker exec 用于在已经开启并处于运行状态的容器中执行新的命令。",
      "c": "-it 表示开启交互模式并分配一个终端（interactive + tty），会直接卡在 nginx 进程的前台日志中，不是纯后台运行。"
    },
    "skillTags": [
      "docker",
      "run",
      "cli"
    ],
    "relatedCommand": "docker run -d --name my-nginx nginx:alpine",
    "estimatedTime": 35,
    "mnemonic": "后台跑容器：docker run -d；-it 是前台交互。"
  },
  {
    "id": "devops-basic-docker-ps",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "查看正在运行的容器",
    "prompt": "想要查看当前主机上，有哪些 Docker 容器处于正在运行（Running）的状态，应执行？",
    "options": [
      {
        "id": "a",
        "text": "docker status"
      },
      {
        "id": "b",
        "text": "docker info"
      },
      {
        "id": "c",
        "text": "docker images"
      },
      {
        "id": "d",
        "text": "docker ps"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "docker ps (Process Status) 会以表格形式输出容器 ID、镜像、创建时间、状态、网络映射端口及容器命名。",
    "wrongReasons": {
      "a": "docker 没有 status 这一条基础子命令。",
      "b": "docker info 用于显示整个 Docker 服务引擎的配置信息（版本、驱动等）。",
      "c": "docker images 用于列出本地已经下载或构建的全部只读镜像模板列表。"
    },
    "skillTags": [
      "docker",
      "cli",
      "container"
    ],
    "relatedCommand": "docker ps -a",
    "estimatedTime": 30,
    "mnemonic": "看运行中容器 docker ps；加 -a 看全部。"
  },
  {
    "id": "devops-basic-docker-logs",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "查看容器控制台日志",
    "prompt": "要查看正在运行中、名为 `my-web` 容器的标准输出控制台日志，最基础的指令是？",
    "options": [
      {
        "id": "a",
        "text": "docker tail my-web"
      },
      {
        "id": "b",
        "text": "docker logs my-web"
      },
      {
        "id": "c",
        "text": "docker info my-web"
      },
      {
        "id": "d",
        "text": "docker cat my-web"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "docker logs 能够捕获并在控制台上输出容器内 1 号进程发送给标准输出（stdout）和标准错误（stderr）的数据。",
    "wrongReasons": {
      "d": "docker 命令本身不包含 cat 作为直接子命令。",
      "a": "tail 是系统查看文本尾部的工具，在 docker 的子命令语法中，应使用 docker logs --tail 10 的语法形式，而不是 docker tail。",
      "c": "docker info 用于显示系统平台级配置状态，不接受具体容器名称作为参数。"
    },
    "skillTags": [
      "docker",
      "logs",
      "cli"
    ],
    "relatedCommand": "docker logs -f my-web",
    "estimatedTime": 35,
    "mnemonic": "看容器日志：docker logs <容器>。"
  },
  {
    "id": "devops-basic-docker-port",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "容器端口映射",
    "prompt": "要把容器内的端口 `80` 映射绑定到物理宿主机的端口 `8080` 上以供外部访问，应该使用什么参数？",
    "options": [
      {
        "id": "a",
        "text": "-d 8080:80"
      },
      {
        "id": "b",
        "text": "-v 8080:80"
      },
      {
        "id": "c",
        "text": "-p 8080:80"
      },
      {
        "id": "d",
        "text": "-p 80:8080"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "-p 参数的格式是 -p [宿主机端口]:[容器内端口]，流量打到宿主机 8080 时会自动由 Docker NAT 转发到容器 80 上。",
    "wrongReasons": {
      "d": "这代表将宿主机的 80 端口映射到容器内的 8080，与题目要求反了。",
      "b": "-v 是用来挂载目录或数据卷（volume）的参数。",
      "a": "-d 用于指示容器在后台默默开启（detach），不接受端口映射的配置值形式。"
    },
    "skillTags": [
      "docker",
      "port",
      "cli"
    ],
    "relatedCommand": "docker run -p 80:80 -d nginx",
    "estimatedTime": 35,
    "mnemonic": "端口映射 -p 宿主机:容器（-p 8080:80）。"
  },
  {
    "id": "devops-basic-docker-volume",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "容器目录挂载",
    "prompt": "在开启容器时，要将宿主机的绝对路径 `/data/logs` 挂载映射到容器内 `/var/log` 路径，应使用？",
    "options": [
      {
        "id": "a",
        "text": "--mount-dir /data/logs"
      },
      {
        "id": "b",
        "text": "-p /data/logs:/var/log"
      },
      {
        "id": "c",
        "text": "-d /data/logs:/var/log"
      },
      {
        "id": "d",
        "text": "-v /data/logs:/var/log"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "-v (volume) 参数格式为 -v [宿主机绝对路径]:[容器内绝对路径]，可使容器内进程读写的数据直接持久化沉淀在宿主机磁盘上。",
    "wrongReasons": {
      "b": "-p 用于端口映射转发配置。",
      "a": "--mount-dir 不是 Docker 原生标准支持的挂载选项格式。",
      "c": "-d 用于指示容器在后台启动运行。"
    },
    "skillTags": [
      "docker",
      "volume",
      "cli"
    ],
    "relatedCommand": "docker run -v /opt/data:/app/data -d app:v1",
    "estimatedTime": 35,
    "mnemonic": "挂目录用 -v 宿主机路径:容器路径。"
  },
  {
    "id": "devops-basic-pod",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "Kubernetes Pod 概念",
    "prompt": "在容器编排引擎 Kubernetes (K8s) 中，能够被调度和管理的最小、最基本的计算部署单元是？",
    "options": [
      {
        "id": "a",
        "text": "Service"
      },
      {
        "id": "b",
        "text": "Namespace"
      },
      {
        "id": "c",
        "text": "Pod"
      },
      {
        "id": "d",
        "text": "Node"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "Pod 是 K8s 特有的概念，表示共享网络、存储命名空间的一组紧密协作容器的逻辑组合实体。",
    "wrongReasons": {
      "d": "Node 代表集群中的单个物理机或云服务器节点机器本身，是 Pod 运行的载体。",
      "a": "Service 用于提供 Pod 服务的负载均衡稳定路由入口。",
      "b": "Namespace 用于在逻辑和权限层面做多环境的多租户隔离划分。"
    },
    "skillTags": [
      "kubernetes",
      "pod",
      "k8s"
    ],
    "relatedCommand": "kubectl get pods",
    "estimatedTime": 35,
    "mnemonic": "K8s 最小调度单元=Pod。"
  },
  {
    "id": "devops-basic-k8s-service",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "K8s Service 作用",
    "prompt": "在 Kubernetes 中，由于 Pod 每次重建其内部 IP 地址都会发生变化，为了向外提供统一、稳定的服务访问入口，应定义？",
    "options": [
      {
        "id": "a",
        "text": "DaemonSet"
      },
      {
        "id": "b",
        "text": "ConfigMap"
      },
      {
        "id": "c",
        "text": "Service"
      },
      {
        "id": "d",
        "text": "Secret"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "Service 会分配一个固定的集群虚拟 IP(ClusterIP)，只要客户端请求它，就会自动轮询代理到后端的存活 Pod 上。",
    "wrongReasons": {
      "b": "ConfigMap 用于向容器注入常规配置项或文件，不解决流量路由。",
      "d": "Secret 用于注入加密的敏感认证信息。",
      "a": "DaemonSet 用于确保在集群内每一个宿主机节点上都强制运行一个且仅一个 Pod 守护实例。"
    },
    "skillTags": [
      "kubernetes",
      "service",
      "k8s"
    ],
    "relatedCommand": "kubectl get svc",
    "estimatedTime": 35,
    "mnemonic": "给 Pod 稳定入口=Service（ClusterIP）。"
  },
  {
    "id": "devops-basic-kubectl",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "K8s 命令行客户端",
    "prompt": "用于向 Kubernetes 集群控制面发送指令（如增删改查资源）的官方标准命令行工具是？",
    "options": [
      {
        "id": "a",
        "text": "docker"
      },
      {
        "id": "b",
        "text": "kubectl"
      },
      {
        "id": "c",
        "text": "helm"
      },
      {
        "id": "d",
        "text": "kubeadm"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "kubectl 是与集群的 API Server 服务进行 REST 通信和资源操纵的核心命令行界面客户端程序。",
    "wrongReasons": {
      "a": "docker 命令在容器时代只负责管理单机的容器生命周期，与 K8s 跨节点全局资源管理无涉。",
      "d": "kubeadm 是专门用于一键安装和初始化构建 K8s 集群本身的安装配置工具。",
      "c": "helm 是针对 K8s 复杂的 YAML 配套包进行模板分发和版本管理的包管理器。"
    },
    "skillTags": [
      "kubernetes",
      "kubectl",
      "k8s"
    ],
    "relatedCommand": "kubectl cluster-info",
    "estimatedTime": 35,
    "mnemonic": "操作 K8s 用 kubectl；装集群用 kubeadm。"
  },
  {
    "id": "devops-basic-git-clone",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "克隆远程代码仓库",
    "prompt": "想要将托管在 GitLab/GitHub 上的一个项目代码仓库完整下载到本地主机上，应该使用？",
    "options": [
      {
        "id": "a",
        "text": "git download [URL]"
      },
      {
        "id": "b",
        "text": "git pull [URL]"
      },
      {
        "id": "c",
        "text": "git fetch [URL]"
      },
      {
        "id": "d",
        "text": "git clone [URL]"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "git clone 是建立本地仓库副本最常见的第一步，用于克隆所有的分支和历史 commit 日志。",
    "wrongReasons": {
      "a": "git 协议内不支持名为 download 的子命令。",
      "b": "git pull 用于在已有本地仓库的情况下，拉取并合并上游的最新修改到当前分支上。",
      "c": "git fetch 仅同步远程元数据到本地跟踪分支，不直接合并代码文件到工作目录。"
    },
    "skillTags": [
      "git",
      "cli",
      "repository"
    ],
    "relatedCommand": "git clone https://github.com/kubernetes/kubernetes.git",
    "estimatedTime": 30,
    "mnemonic": "首次下载仓库用 git clone。"
  },
  {
    "id": "middleware-basic-mysql-port",
    "category": "middleware",
    "type": "config",
    "level": "basic",
    "title": "MySQL 默认端口号",
    "prompt": "MySQL 关系型数据库系统默认监听在哪个网络端口，以便接收应用连接？",
    "options": [
      {
        "id": "a",
        "text": "27017"
      },
      {
        "id": "b",
        "text": "6379"
      },
      {
        "id": "c",
        "text": "5432"
      },
      {
        "id": "d",
        "text": "3306"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "MySQL 数据库的 TCP 传输层监听默认规范端口为 3306，运维在云安全组中常对本端 VPC 白名单开放该端口。",
    "wrongReasons": {
      "b": "6379 是 Redis 内存缓存数据库的默认端口。",
      "a": "27017 是 MongoDB 键值/文档型 NoSQL 数据库的默认端口。",
      "c": "5432 是 PostgreSQL 开源关系数据库系统的默认监听端口。"
    },
    "skillTags": [
      "mysql",
      "port",
      "database"
    ],
    "relatedCommand": "mysql -u root -p -h 127.0.0.1 -P 3306",
    "estimatedTime": 30,
    "mnemonic": "MySQL=3306。"
  },
  {
    "id": "middleware-basic-mysql-query",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "SQL 数据查询",
    "prompt": "在一张名为 `users` 的数据库表中，想要检索出所有来自 `Beijing` 城市的用户记录，应使用的 SQL 语句是？",
    "options": [
      {
        "id": "a",
        "text": "SEARCH users FOR city = \"Beijing\";"
      },
      {
        "id": "b",
        "text": "GET * FROM users WHEN city = \"Beijing\";"
      },
      {
        "id": "c",
        "text": "FIND * IN users WITH city = \"Beijing\";"
      },
      {
        "id": "d",
        "text": "SELECT * FROM users WHERE city = \"Beijing\";"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "SELECT 是关系数据库 SQL 规范中查询表行记录的基础关键字，条件筛选使用 WHERE 子句。",
    "wrongReasons": {
      "b": "GET 和 WHEN 不是 SQL 标准标准查询的语法元素。",
      "c": "FIND 不是 SQL 规范中表示过滤表记录的关键字。",
      "a": "SEARCH 属于搜索引擎的语法，在关系型 RDBMS SQL（如 MySQL）中是不受支持的非法语法。"
    },
    "skillTags": [
      "mysql",
      "sql",
      "database"
    ],
    "relatedCommand": "SELECT count(*) FROM users;",
    "estimatedTime": 35,
    "mnemonic": "查询：SELECT 列 FROM 表 WHERE 条件。"
  },
  {
    "id": "middleware-basic-redis-type",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "Redis 缓存的特点",
    "prompt": "相比于传统基于磁盘存储的关系数据库（如 MySQL），Redis 最大的读写性能优势主要来源于？",
    "options": [
      {
        "id": "a",
        "text": "数据完全存放在物理内存（RAM）中进行高速读写"
      },
      {
        "id": "b",
        "text": "Redis 会自动修改物理 CPU 的主频速度"
      },
      {
        "id": "c",
        "text": "Redis 的读写基于浏览器的缓存清理动作触发"
      },
      {
        "id": "d",
        "text": "Redis 把所有数据保存在免费的云端备份网盘里"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "Redis 是一种高性能的内存中数据结构存储系统（In-memory database），内存读写耗时在微秒级，这远远快于需要寻道写入的机械或固态硬盘。",
    "wrongReasons": {
      "b": "没有软件能够动态改变物理硬件的核心运行频率。",
      "d": "Redis 数据保存在本地物理内存中，非免费第三方网盘。",
      "c": "Redis 部署在服务端，客户端浏览器缓存不影响服务端 Redis 数据存储读写原理。"
    },
    "skillTags": [
      "redis",
      "cache",
      "nosql"
    ],
    "relatedCommand": "redis-cli ping",
    "estimatedTime": 35,
    "mnemonic": "Redis 快在数据全在内存(RAM)，微秒级读写。"
  },
  {
    "id": "middleware-basic-redis-port",
    "category": "middleware",
    "type": "config",
    "level": "basic",
    "title": "Redis 默认端口号",
    "prompt": "Redis 内存高速非关系数据库服务，默认监听在哪个网络端口？",
    "options": [
      {
        "id": "a",
        "text": "3306"
      },
      {
        "id": "b",
        "text": "6379"
      },
      {
        "id": "c",
        "text": "9092"
      },
      {
        "id": "d",
        "text": "6380"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "Redis 服务的标准公允监听端口为 6379，多实例部署时也可以自定义分配其他端口。",
    "wrongReasons": {
      "a": "3306 是 MySQL 关系数据库的默认监听端口。",
      "c": "9092 是 Apache Kafka 高吞吐消息队列系统的标准监听端口。",
      "d": "6380 是 Redis 哨兵或者第二个实例常选用的相邻端口。"
    },
    "skillTags": [
      "redis",
      "port",
      "cache"
    ],
    "relatedCommand": "telnet 127.0.0.1 6379",
    "estimatedTime": 30,
    "mnemonic": "Redis=6379。"
  },
  {
    "id": "middleware-basic-nginx-reverse",
    "category": "middleware",
    "type": "config",
    "level": "basic",
    "title": "Nginx 反向代理配置",
    "prompt": "要在 Nginx 配置中把前端流量反向代理路由给本机的后端 Tomcat 服务（假设运行在 8080 端口），应在 server/location 块下配置？",
    "options": [
      {
        "id": "a",
        "text": "redirect_pass http://127.0.0.1:8080;"
      },
      {
        "id": "b",
        "text": "proxy_pass http://127.0.0.1:8080;"
      },
      {
        "id": "c",
        "text": "route_pass http://127.0.0.1:8080;"
      },
      {
        "id": "d",
        "text": "proxy_to http://127.0.0.1:8080;"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "proxy_pass 是 Nginx http/stream 模块里的反向代理底层指令，用于配置上游服务器的具体接入地址。",
    "wrongReasons": {
      "d": "proxy_to 不是 Nginx 内核中的内置配置语法标签。",
      "c": "route_pass 语法为拼造，Nginx 不予识别。",
      "a": "redirect_pass 语法不存在，Nginx 仅能利用 return/rewrite 实现跳转。"
    },
    "skillTags": [
      "nginx",
      "reverse-proxy",
      "config"
    ],
    "relatedCommand": "nginx -t && nginx -s reload",
    "estimatedTime": 40,
    "mnemonic": "Nginx 反向代理指令=proxy_pass。"
  },
  {
    "id": "middleware-basic-nginx-reload",
    "category": "middleware",
    "type": "command",
    "level": "basic",
    "title": "Nginx 热重载配置",
    "prompt": "在不中断现有客户端正在传输连接的前提下，让 Nginx 重新读取并加载修改后的配置文件，应运行？",
    "options": [
      {
        "id": "a",
        "text": "nginx -s reload"
      },
      {
        "id": "b",
        "text": "nginx -s restart"
      },
      {
        "id": "c",
        "text": "nginx reload"
      },
      {
        "id": "d",
        "text": "nginx -s stop"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "nginx -s reload 会向主进程发送 HUP 信号，主进程会生成新的工作进程，老的工作进程处理完现有连接后退出，以实现配置的零停机热重载。",
    "wrongReasons": {
      "d": "nginx -s stop 会直接强制中断所有进程并停机关闭，无法保证“不中断现有连接”。",
      "b": "restart 不是 nginx 原生命令行工具提供的标准信号参数。",
      "c": "如果不带 -s 参数，nginx 会认为是要启动一个新的 nginx 进程，导致因为端口冲突而报错失败。"
    },
    "skillTags": [
      "nginx",
      "reload",
      "cli"
    ],
    "relatedCommand": "systemctl reload nginx",
    "estimatedTime": 40,
    "mnemonic": "改完热加载：nginx -s reload（不断连）。"
  },
  {
    "id": "middleware-basic-mq-role",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "消息队列核心作用",
    "prompt": "在现代分布式微服务架构中，引入消息队列（如 Kafka, RocketMQ, RabbitMQ）带来的最直接的核心架构收益是？",
    "options": [
      {
        "id": "a",
        "text": "实现服务之间的异步解耦、削峰填谷和流量缓冲"
      },
      {
        "id": "b",
        "text": "代替硬盘永久安全存储系统中的核心用户订单数据"
      },
      {
        "id": "c",
        "text": "替代 DNS 实现跨地域网站域名的分布式路由解析"
      },
      {
        "id": "d",
        "text": "自动加快前端网页里 CSS/JavaScript 的解析速度"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "消息队列在服务间引入中间缓冲，解除上游的直接网络调用依赖，并通过削峰避免后端的数据库在大促期间由于瞬间并发请求爆满而瘫痪。",
    "wrongReasons": {
      "b": "消息队列不是关系数据库，通常仅短期保留消息（例如几天），不应当作为数据库用来作数据生命周期永久保存。",
      "d": "消息队列运行在后端服务器侧，不具备干预和优化浏览器前端 CSS/JS 加载性能的功能。",
      "c": "DNS 提供网络寻址映射，MQ 是用于传输和存储离散应用指令数据的。"
    },
    "skillTags": [
      "middleware",
      "message-queue",
      "architecture"
    ],
    "relatedCommand": "Check MQ consumer lag and throughput",
    "estimatedTime": 40,
    "mnemonic": "MQ 三大用：异步解耦、削峰填谷、流量缓冲。"
  },
  {
    "id": "middleware-basic-tomcat-port",
    "category": "middleware",
    "type": "config",
    "level": "basic",
    "title": "Tomcat 默认端口",
    "prompt": "开源的 Java 应用 Web 容器 Apache Tomcat 在默认出厂配置中，其 HTTP 连接器监听的端口是？",
    "options": [
      {
        "id": "a",
        "text": "8080"
      },
      {
        "id": "b",
        "text": "9000"
      },
      {
        "id": "c",
        "text": "80"
      },
      {
        "id": "d",
        "text": "7001"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "Tomcat HTTP Connector 在配置中默认端口绑定为 8080。通常需要在前置位部署 Nginx 反向代理进行分发和 TLS 加密接入。",
    "wrongReasons": {
      "c": "80 是标准未加密 HTTP，Tomcat 默认运行在非特权端口 8080，防范需要 root 权限强占 80。",
      "b": "9000 是 PHP-FPM（FastCGI 处理器）的默认监听端口。",
      "d": "7001 是 Oracle WebLogic 商业应用服务器的默认端口。"
    },
    "skillTags": [
      "tomcat",
      "port",
      "middleware"
    ],
    "relatedCommand": "netstat -lntp | grep :8080",
    "estimatedTime": 30,
    "mnemonic": "Tomcat=8080。"
  },
  {
    "id": "middleware-basic-es-port",
    "category": "middleware",
    "type": "config",
    "level": "basic",
    "title": "Elasticsearch 默认端口",
    "prompt": "分布式搜索和分析索引引擎 Elasticsearch 默认提供 RESTful API 交互的外部端口是？",
    "options": [
      {
        "id": "a",
        "text": "2181"
      },
      {
        "id": "b",
        "text": "80"
      },
      {
        "id": "c",
        "text": "9200"
      },
      {
        "id": "d",
        "text": "9300"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "ES 的 9200 端口用于外部 HTTP 客户端（包括浏览器、Kibana、应用）通过 REST API 交互；9300 则是集群内部节点之间通信所使用的专有端口。",
    "wrongReasons": {
      "d": "9300 仅用在集群内部节点通信（传输层），不负责常规的 HTTP REST 外部访问。",
      "b": "80 是标准网页端口。",
      "a": "2181 是 Apache ZooKeeper 分布式协调服务默认的监听端口。"
    },
    "skillTags": [
      "elasticsearch",
      "port",
      "middleware"
    ],
    "relatedCommand": "curl http://localhost:9200",
    "estimatedTime": 35,
    "mnemonic": "ES 对外 REST=9200，节点间=9300。"
  },
  {
    "id": "middleware-basic-db-pool",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "数据库连接池作用",
    "prompt": "在 Java 等应用中引入“数据库连接池（如 Druid, HikariCP）”最重要的技术作用是？",
    "options": [
      {
        "id": "a",
        "text": "当数据库磁盘空间爆满时，自动把数据转存入内存缓存"
      },
      {
        "id": "b",
        "text": "复用已有连接，避免频繁创建和销毁 TCP/数据库物理连接带来的高额开销"
      },
      {
        "id": "c",
        "text": "防止由于用户输错账号密码导致数据库系统锁死"
      },
      {
        "id": "d",
        "text": "为数据库执行自动分库分表（Sharding）配置"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "数据库物理连接需要建立 TCP 三次握手以及数据库层复杂的认证握手，连接池通过“预先创建、池化复用”极大降低了高并发下的创建和断连损耗。",
    "wrongReasons": {
      "a": "连接池无法干预数据库磁盘文件系统的溢出存储转存逻辑。",
      "d": "分库分表是依靠分片中间件（如 ShardingSphere）来驱动完成的，而不是简单连接池。",
      "c": "输错密码锁死是数据库的用户审计锁定策略，与连接池池化无涉。"
    },
    "skillTags": [
      "middleware",
      "database",
      "connection-pool"
    ],
    "relatedCommand": "Check HikariCP active/idle connection counts",
    "estimatedTime": 35,
    "mnemonic": "连接池=复用连接，省 TCP/认证握手开销。"
  },
  {
    "id": "sre-basic-slo-sli",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "SLA / SLO / SLI 区别",
    "prompt": "在站点可靠性工程 (SRE) 体系中，“SLO”（服务质量目标）与“SLI”（服务质量指标）的基本定义关系是？",
    "options": [
      {
        "id": "a",
        "text": "SLI 是具体测量到的数据指标（如延迟值），SLO 是针对该指标期望达到的目标范围值"
      },
      {
        "id": "b",
        "text": "SLO 是当发生重大系统性崩塌时，赔偿给用户的实际退款比例值"
      },
      {
        "id": "c",
        "text": "SLI 是用来统计项目研发阶段提交的总代码行数的指标"
      },
      {
        "id": "d",
        "text": "SLO 与 SLI 含义完全相同，二者没有任何技术区别"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "SLI 是具体的测量指标值（例如：过去一分钟接口成功率是 99.8%），而 SLO 是我们为这个指标设定的稳定底线目标（例如：要求月度成功率必须 >= 99.9%）。",
    "wrongReasons": {
      "b": "赔偿及法律退款条款属于 SLA (Service Level Agreement) 商业协议范围，而不是内部追求的技术可靠性目标 SLO。",
      "c": "代码行数不代表系统运行时的可靠性状态，不属于 SLI 指标定义。",
      "d": "两者一个代表“测量指标”，一个代表“期望目标”，概念层次不同。"
    },
    "skillTags": [
      "sre",
      "slo",
      "sli"
    ],
    "relatedCommand": "Establish SLO dashboard for key API endpoint",
    "estimatedTime": 40,
    "mnemonic": "SLI=测到的指标值，SLO=给它定的目标范围。"
  },
  {
    "id": "sre-basic-prometheus",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "Prometheus 与 Grafana 作用",
    "prompt": "在现代云原生 SRE 监控监控栈中，Prometheus 和 Grafana 分别扮演的经典角色是？",
    "options": [
      {
        "id": "a",
        "text": "Prometheus 是虚拟路由器；Grafana 是负载均衡器"
      },
      {
        "id": "b",
        "text": "Prometheus 负责指标的采集、存储与报警触发；Grafana 提供图形化的丰富数据面板看板"
      },
      {
        "id": "c",
        "text": "Prometheus 负责代码版本库管理；Grafana 负责自动生成用户文档"
      },
      {
        "id": "d",
        "text": "Prometheus 负责数据库备份；Grafana 负责代码打包"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "Prometheus 是目前主流的时序指标监控数据库，支持多探针拉取指标；Grafana 则以丰富的交互式配置看板著称，用以可视化呈现 Prometheus 收集到的数据。",
    "wrongReasons": {
      "d": "监控工具不干预业务数据的数据库归档和自动化流水线的构建编译动作。",
      "a": "它们都是监控测量工具，不负责转发云端或物理网络层的数据路由报文。",
      "c": "版本管理和文档分别由 Git 及文档生成器处理。"
    },
    "skillTags": [
      "sre",
      "monitoring",
      "prometheus"
    ],
    "relatedCommand": "Access PromQL querying web UI on port 9090",
    "estimatedTime": 40,
    "mnemonic": "Prometheus 采集/存储/告警，Grafana 画看板。"
  },
  {
    "id": "sre-basic-four-signals",
    "category": "sre",
    "type": "multiple",
    "level": "basic",
    "title": "SRE 四大黄金信号",
    "prompt": "根据 Google SRE 最佳实践，用于衡量用户侧系统健康度的“四大黄金信号（Four Golden Signals）”包含哪些指标？",
    "options": [
      {
        "id": "a",
        "text": "饱和度 (Saturation)"
      },
      {
        "id": "b",
        "text": "流量 (Traffic)"
      },
      {
        "id": "c",
        "text": "延迟 (Latency)"
      },
      {
        "id": "d",
        "text": "错误 (Errors)"
      }
    ],
    "answer": [
      "a",
      "b",
      "c",
      "d"
    ],
    "explanation": "黄金四信号全面评估：1. 延迟（耗时）；2. 流量（吞吐并发）；3. 错误（失败请求率）；4. 饱和度（资源瓶颈度，如内存/CPU水位）。",
    "wrongReasons": {},
    "skillTags": [
      "sre",
      "metrics",
      "monitoring"
    ],
    "relatedCommand": "Monitor latency + traffic + errors + saturation",
    "estimatedTime": 40,
    "mnemonic": "黄金四信号：延迟、流量、错误、饱和度。"
  },
  {
    "id": "sre-basic-alert-severity",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "告警严重级别划分",
    "prompt": "在值班运维报警设置中，当某个业务接口的“错误率指标”触发了 `Critical（紧急/严重）` 级别的报警，这意味着？",
    "options": [
      {
        "id": "a",
        "text": "系统即将自动把所有的云端服务器进行一键关机"
      },
      {
        "id": "b",
        "text": "说明 CPU 平均温度在正常合理范围发生微小起伏"
      },
      {
        "id": "c",
        "text": "核心业务受损或故障，必须立即联系或唤醒值班人员进行干预止血"
      },
      {
        "id": "d",
        "text": "系统无任何异常，仅用于记录日常的指标快照"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "Critical（严重）级别的告警直接指向核心稳定性受损，通常会触发值班系统的 Pager/电话，呼叫 On-call 工程师立即响应。",
    "wrongReasons": {
      "d": "快照记录仅需要 Info 或 Warning 级别，不需要发出紧急呼叫。",
      "b": "微小起伏无需触发高紧急级别的 On-call 报警。",
      "a": "报警工具仅发送告警，默认不执行破坏性的全站服务器自动关机动作。"
    },
    "skillTags": [
      "sre",
      "alerting",
      "oncall"
    ],
    "relatedCommand": "Verify active PagerDuty or Alertmanager alerts",
    "estimatedTime": 35,
    "mnemonic": "Critical=核心受损，立即呼叫 on-call 止血。"
  },
  {
    "id": "sre-basic-postmortem-purpose",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "事故复盘的目标",
    "prompt": "生产发生严重故障并被解决后，SRE 团队主持“故障复盘会”（Postmortem）最提倡的文化目标是？",
    "options": [
      {
        "id": "a",
        "text": "在团队内公开点名并羞辱犯错的个人开发或运维成员"
      },
      {
        "id": "b",
        "text": "掩盖故障细节，防止被上层领导获悉导致扣减年终奖"
      },
      {
        "id": "c",
        "text": "还原时间线以找出系统性缺陷，制定改进动作以防止同类故障再次发生"
      },
      {
        "id": "d",
        "text": "直接取消该服务的监控告警，避免以后因类似情况被吵醒"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "优秀 SRE 复盘崇尚“无责复盘（Blameless Postmortem）”，其基本哲学是“人的犯错主要由系统性漏洞导致”，目标是总结技术动作和优化防御以提高未来的系统可用度。",
    "wrongReasons": {
      "a": "公开羞辱成员不仅伤害团队心理安全，还会导致下一次故障被瞒报，这与 SRE 可靠性文化背道而驰。",
      "b": "不公开透明的复盘无法总结出有效的系统加固改进措施，会引发类似事故的恶性循环。",
      "d": "关掉告警是自欺欺人，会使系统暴露在巨大盲区中。"
    },
    "skillTags": [
      "sre",
      "postmortem",
      "incident"
    ],
    "relatedCommand": "Write down incident timeline and action items",
    "estimatedTime": 35,
    "mnemonic": "复盘=还原时间线找系统缺陷，无责改进。"
  },
  {
    "id": "sre-basic-runbook",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "Runbook 的定义",
    "prompt": "On-call 值班工程师收到报警通知后，为了快速得知其排查步骤和安全止血预案，应查阅的指导性文档是？",
    "options": [
      {
        "id": "a",
        "text": "运维排障手册 (Runbook / Playbook)"
      },
      {
        "id": "b",
        "text": "产品经理的产品说明书 (PRD)"
      },
      {
        "id": "c",
        "text": "公司的团建及年会章程"
      },
      {
        "id": "d",
        "text": "个人编写的工作日志周报"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "Runbook 是直接与监控告警对应的、手把手指导值班人员在半夜高压下如何排除对应警报的可执行文档。",
    "wrongReasons": {
      "b": "PRD 用于说明产品设计业务功能，不包含底层基础架构和应急排障运维指令。",
      "c": "团建章程与技术故障抢修无关。",
      "d": "个人周报无标准的可执行预案逻辑，且散乱没有强针对性。"
    },
    "skillTags": [
      "sre",
      "runbook",
      "oncall"
    ],
    "relatedCommand": "Check service deployment runbook",
    "estimatedTime": 35,
    "mnemonic": "告警对应的排障文档=Runbook/Playbook。"
  },
  {
    "id": "sre-basic-spof",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "单点故障 SPOF",
    "prompt": "在可靠性设计中，所谓的“单点故障（SPOF - Single Point of Failure）”是指？",
    "options": [
      {
        "id": "a",
        "text": "系统中的某个关键组件一旦失效，将导致整个系统直接彻底中断瘫痪"
      },
      {
        "id": "b",
        "text": "应用中按钮只有一个圆角被错误渲染的 bug"
      },
      {
        "id": "c",
        "text": "只有一个用户可以成功登录系统的设计逻辑缺陷"
      },
      {
        "id": "d",
        "text": "在所有云主机中，CPU 核心数只有 1 核的轻量级主机规格"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "单点故障说明架构中缺乏多副本或高可用切换兜底机制，是高可靠 SRE 架构设计的核心排查项。",
    "wrongReasons": {
      "c": "并发登录控制是由会话限制策略实现的，不是单点物理系统架构的定义。",
      "d": "这是云服务规格的物理核数，不是系统失效层面的 SPOF 定义。",
      "b": "样式渲染 bug 与系统全局雪崩失效的 SPOF 概念不同。"
    },
    "skillTags": [
      "sre",
      "architecture",
      "spof"
    ],
    "relatedCommand": "Perform SPOF scan across the architecture",
    "estimatedTime": 35,
    "mnemonic": "SPOF=单点失效拖垮全局，需高可用兜底。"
  },
  {
    "id": "sre-basic-uptime-math",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "高可用高标准指标",
    "prompt": "在衡量系统可用性时，常说的“三个 9”（即 99.9% 可用性）意味着？",
    "options": [
      {
        "id": "a",
        "text": "系统在运行中，用户界面只能出现三种颜色的搭配设计限制"
      },
      {
        "id": "b",
        "text": "系统一年内的总停机时间可以达到 999 个小时"
      },
      {
        "id": "c",
        "text": "表示只有在晚上 9 点 9 分 9 秒时系统才需要执行健康探活"
      },
      {
        "id": "d",
        "text": "系统在一年内的总不可用（停机）时间累积不能超过约 8.76 小时"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "3 个 9 可用性：$365 \\text{ 天} \\times 24 \\text{ 小时} \\times (1 - 99.9\\%) = 8.76 \\text{ 小时}$。若是 4 个 9 (99.99%) 则缩短到 52.56 分钟。",
    "wrongReasons": {
      "b": "999 个小时停机相当于 41.6 天不可用，对应的可用性只有大约 88.6%，极低。",
      "a": "界面颜色数与服务物理可用度（Uptime）无关。",
      "c": "探活应该是秒级高频进行的，而不是每天定时只执行一次。"
    },
    "skillTags": [
      "sre",
      "uptime",
      "sla"
    ],
    "relatedCommand": "Calculate annual downtime budget",
    "estimatedTime": 40,
    "mnemonic": "三个 9≈年停机 8.76 小时；四个 9≈52 分钟。"
  },
  {
    "id": "sre-basic-logging-levels",
    "category": "sre",
    "type": "multiple",
    "level": "basic",
    "title": "标准日志级别分类",
    "prompt": "在应用的常规日志收集平台中，标准的日志严重程度等级（Logging Levels）包括哪些？",
    "options": [
      {
        "id": "a",
        "text": "ERROR"
      },
      {
        "id": "b",
        "text": "INFO"
      },
      {
        "id": "c",
        "text": "WARN"
      },
      {
        "id": "d",
        "text": "DEBUG"
      }
    ],
    "answer": [
      "a",
      "b",
      "c",
      "d"
    ],
    "explanation": "标准日志级别从低到高包含：TRACE, DEBUG, INFO, WARN, ERROR, FATAL，不同级别有助于在日志平台上快速分级检索检索和配置触发告警。",
    "wrongReasons": {},
    "skillTags": [
      "sre",
      "logging",
      "observability"
    ],
    "relatedCommand": "tail -f app.log | grep -E \"WARN|ERROR\"",
    "estimatedTime": 35,
    "mnemonic": "日志级别：DEBUG<INFO<WARN<ERROR(<FATAL)。"
  },
  {
    "id": "sre-basic-load-testing",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "压力测试目的",
    "prompt": "在重大活动或电商大促前，SRE 进行“压力测试”（Load Testing）的最核心目的之一是？",
    "options": [
      {
        "id": "a",
        "text": "模拟高并发并发流量，提前探知系统性能瓶颈并验证自动扩容和降级机制的稳定性"
      },
      {
        "id": "b",
        "text": "直接将现有的用户数据库彻底清理以腾出存储空间"
      },
      {
        "id": "c",
        "text": "测试应用控制台的网页按钮在鼠标重复点击后是否会损坏"
      },
      {
        "id": "d",
        "text": "测试机房在断网断电后，发电机能维持运行的物理天数"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "压测通过人工构造大量流量，让系统运行在极限负荷状态下，以便暴露 CPU/IO 瓶颈、内存泄漏、锁竞争，并为容量配置提供数据支撑。",
    "wrongReasons": {
      "b": "清理数据是破坏性的，会导致严重数据事故，这绝不是压测的目的。",
      "d": "机房断电发电机测试属于物理环境灾备演练，不属于软件容量压力测试。",
      "c": "物理鼠标点击寿命是由开关微动寿命决定，应用层压测不测试物理按钮损伤。"
    },
    "skillTags": [
      "sre",
      "load-testing",
      "capacity"
    ],
    "relatedCommand": "Run JMeter / locust stress test scripts",
    "estimatedTime": 40,
    "mnemonic": "压测=模拟高并发，提前找瓶颈、验扩容降级。"
  },
  {
    "id": "network-basic-traceroute",
    "category": "network",
    "type": "command",
    "level": "basic",
    "title": "追踪路由路径",
    "prompt": "在 Linux 终端中，用于追踪数据包到达目标主机所经过的各个路由器节点（下一跳）的命令是？",
    "options": [
      {
        "id": "a",
        "text": "ping"
      },
      {
        "id": "b",
        "text": "route"
      },
      {
        "id": "c",
        "text": "netstat"
      },
      {
        "id": "d",
        "text": "traceroute"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "traceroute (Windows 下为 tracert) 会发送不同 TTL 值的探测包，从而依次获取沿途路由器的 IP 地址。",
    "wrongReasons": {
      "a": "ping 仅检测目标连通性与时延，无法列出中途经过的所有路由节点。",
      "c": "netstat 用于监控本机的网络连接和端口。",
      "b": "route 用于查看或设置本地网卡的静态路由表，而不是主动探测外部链路。"
    },
    "skillTags": [
      "network",
      "routing",
      "cli"
    ],
    "relatedCommand": "traceroute google.com",
    "estimatedTime": 35,
    "mnemonic": "traceroute 看每一跳路由；ping 只看通断。"
  },
  {
    "id": "network-basic-mac",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "物理 MAC 地址",
    "prompt": "网络设备的 MAC 地址通常是指它的什么地址？",
    "options": [
      {
        "id": "a",
        "text": "通过拨号上网时运营商临时分配的公网地址"
      },
      {
        "id": "b",
        "text": "烧录在网卡芯片上的全球唯一物理硬件地址"
      },
      {
        "id": "c",
        "text": "云平台动态生成的局域网虚拟路由地址"
      },
      {
        "id": "d",
        "text": "用户在操作系统中为网卡自定义的别名"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "MAC（Media Access Control）地址是网卡在物理链路层的唯一标识，长 48 位，出厂即烧录。",
    "wrongReasons": {
      "c": "云平台的虚拟网络依旧基于虚拟 MAC 地址，但 MAC 是物理网卡的基本概念。",
      "a": "拨号上网分配的是公网 IP 地址，而不是 MAC 物理地址。",
      "d": "MAC 地址是硬件地址，而非用户自定义的系统主机别名。"
    },
    "skillTags": [
      "network",
      "mac",
      "hardware"
    ],
    "relatedCommand": "ip link show",
    "estimatedTime": 30,
    "mnemonic": "MAC=网卡出厂烧录的 48 位物理地址。"
  },
  {
    "id": "network-basic-ssh-port",
    "category": "network",
    "type": "config",
    "level": "basic",
    "title": "SSH 服务默认端口",
    "prompt": "用于远程加密管理 Linux 主机的 SSH 服务，默认监听的端口号是？",
    "options": [
      {
        "id": "a",
        "text": "22"
      },
      {
        "id": "b",
        "text": "23"
      },
      {
        "id": "c",
        "text": "3389"
      },
      {
        "id": "d",
        "text": "80"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "SSH (Secure Shell) 服务默认监听在 TCP 端口 22，以提供安全的命令行会话。",
    "wrongReasons": {
      "d": "80 是明文 HTTP 协议的默认端口。",
      "b": "23 是古老且不安全的 Telnet 协议的默认端口。",
      "c": "3389 是 Windows 远程桌面协议（RDP）的默认端口。"
    },
    "skillTags": [
      "network",
      "ssh",
      "port"
    ],
    "relatedCommand": "ssh -p 22 user@host",
    "estimatedTime": 30,
    "mnemonic": "SSH=22，Telnet=23（明文，别用）。"
  },
  {
    "id": "network-basic-ftp-port",
    "category": "network",
    "type": "config",
    "level": "basic",
    "title": "FTP 服务控制端口",
    "prompt": "传统的文件传输协议（FTP）在建立连接时，默认使用的控制连接端口是？",
    "options": [
      {
        "id": "a",
        "text": "20"
      },
      {
        "id": "b",
        "text": "25"
      },
      {
        "id": "c",
        "text": "22"
      },
      {
        "id": "d",
        "text": "21"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "FTP 协议默认使用端口 21 来传输控制命令（如登录、列表），而使用端口 20 来传输实际的文件数据。",
    "wrongReasons": {
      "c": "22 是 SSH 的默认端口。",
      "a": "20 是 FTP 用于数据传输（Active 模式）的数据端口，而不是控制连接端口。",
      "b": "25 是简单邮件传输协议（SMTP）的默认端口。"
    },
    "skillTags": [
      "network",
      "ftp",
      "port"
    ],
    "relatedCommand": "ftp 192.168.1.5",
    "estimatedTime": 30,
    "mnemonic": "FTP 控制口 21，数据口 20。"
  },
  {
    "id": "network-basic-cidr",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "CIDR 无类别域间路由",
    "prompt": "在网络划分中，网段 `192.168.1.0/24` 的后缀 `/24` 表示的子网掩码是？",
    "options": [
      {
        "id": "a",
        "text": "255.255.255.255"
      },
      {
        "id": "b",
        "text": "255.0.0.0"
      },
      {
        "id": "c",
        "text": "255.255.0.0"
      },
      {
        "id": "d",
        "text": "255.255.255.0"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "/24 表示子网掩码的高 24 位为 1，即前三个字节为 255，对应 255.255.255.0。",
    "wrongReasons": {
      "c": "255.255.0.0 对应的 CIDR 后缀是 /16。",
      "b": "255.0.0.0 对应的 CIDR 后缀是 /8。",
      "a": "255.255.255.255 对应的 CIDR 后缀是 /32，代表单台主机。"
    },
    "skillTags": [
      "network",
      "cidr",
      "subnet"
    ],
    "relatedCommand": "ip addr show",
    "estimatedTime": 35,
    "mnemonic": "/24=255.255.255.0；/16、/8 依次少一段 255。"
  },
  {
    "id": "network-basic-nat",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "网络地址转换 NAT",
    "prompt": "在网络通信中，NAT（Network Address Translation）的主要技术作用是？",
    "options": [
      {
        "id": "a",
        "text": "在服务器上自动分配虚拟机的 CPU 核心数"
      },
      {
        "id": "b",
        "text": "将私有（内网）IP 地址与公有 IP 地址进行互相转换"
      },
      {
        "id": "c",
        "text": "对传输的数据内容进行高强度对称加密"
      },
      {
        "id": "d",
        "text": "把域名翻译为物理网卡的 MAC 地址"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "NAT 允许多台内网主机共享少量的公网 IP 访问互联网，解决了 IPv4 地址匮乏的问题。",
    "wrongReasons": {
      "d": "域名翻译为 MAC 地址不属于 NAT 的职责，域名翻译为 IP 由 DNS 负责，IP 翻译为 MAC 由 ARP 负责。",
      "c": "加密是由 SSL/TLS 或 IPSec 等安全协议处理，NAT 不负责数据加密。",
      "a": "CPU 核心分配是虚拟化管理软件的职责，与网络 NAT 转换无关。"
    },
    "skillTags": [
      "network",
      "nat",
      "ip"
    ],
    "relatedCommand": "iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j MASQUERADE",
    "estimatedTime": 35,
    "mnemonic": "NAT=内网私有 IP 与公网 IP 互转，省公网地址。"
  },
  {
    "id": "network-basic-arp",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "ARP 协议作用",
    "prompt": "局域网中，用于将已知的“IP 地址”解析翻译为对应网络设备“MAC 地址”的协议是？",
    "options": [
      {
        "id": "a",
        "text": "ICMP"
      },
      {
        "id": "b",
        "text": "ARP"
      },
      {
        "id": "c",
        "text": "DNS"
      },
      {
        "id": "d",
        "text": "DHCP"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "ARP（Address Resolution Protocol）是地址解析协议，负责在以太网局域网中查询 IP 到 MAC 的物理映射。",
    "wrongReasons": {
      "c": "DNS 负责把域名翻译为 IP 地址。",
      "d": "DHCP 负责在网络中动态分配 IP 地址。",
      "a": "ICMP 负责发送差错报告和网络状态控制包（如 ping 探测）。"
    },
    "skillTags": [
      "network",
      "arp",
      "ip"
    ],
    "relatedCommand": "arp -a",
    "estimatedTime": 30,
    "mnemonic": "ARP=已知 IP 求 MAC；DNS=域名求 IP。"
  },
  {
    "id": "network-basic-firewalld",
    "category": "network",
    "type": "command",
    "level": "basic",
    "title": "开启防火墙端口",
    "prompt": "在 CentOS/RHEL 7+ 系统中，使用 firewalld 开启 TCP 端口 80 的正确命令是？",
    "options": [
      {
        "id": "a",
        "text": "firewall-cmd --permanent --add-port=80/tcp && firewall-cmd --reload"
      },
      {
        "id": "b",
        "text": "systemctl stop firewalld"
      },
      {
        "id": "c",
        "text": "iptables -A INPUT -p tcp --dport 80 -j REJECT"
      },
      {
        "id": "d",
        "text": "ufw deny 80/tcp"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "firewall-cmd 是 firewalld 的管理工具，使用 --add-port 可以添加放行端口，--permanent 代表永久生效，重载后生效。",
    "wrongReasons": {
      "c": "iptables REJECT 会拒绝 80 端口流量，而不是开启放行。",
      "d": "ufw deny 是 Ubuntu 下用于禁用/阻断 80 端口的命令。",
      "b": "直接停止防火墙虽然会消除端口拦截，但会导致系统裸奔，属于极不安全的暴力行为，不是正确的安全策略配置命令。"
    },
    "skillTags": [
      "network",
      "firewall",
      "security"
    ],
    "relatedCommand": "firewall-cmd --list-ports",
    "estimatedTime": 40,
    "mnemonic": "firewalld 放行：--permanent --add-port=80/tcp 再 --reload。"
  },
  {
    "id": "network-basic-subnet-mask",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "子网掩码的作用",
    "prompt": "在配置 IP 地址时，必须配置“子网掩码（Subnet Mask）”的直接作用是？",
    "options": [
      {
        "id": "a",
        "text": "将本机的明文数据自动加密后发送"
      },
      {
        "id": "b",
        "text": "为本地主机提供外部域名解析的能力"
      },
      {
        "id": "c",
        "text": "防止病毒木马入侵操作系统的端口"
      },
      {
        "id": "d",
        "text": "划分 IP 地址中的网络部分和主机部分"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "子网掩码通过与 IP 进行按位与（AND）操作，确定该 IP 属于哪个具体的网段，从而指导主机决定是直接进行局域网内投递还是将包发给网关。",
    "wrongReasons": {
      "b": "域名解析能力由 DNS 服务器（而非子网掩码）提供。",
      "a": "子网掩码仅是网络寻址参数，没有任何加密或安全混淆功能。",
      "c": "防范木马是防火墙和杀毒软件的职责，与掩码无涉。"
    },
    "skillTags": [
      "network",
      "subnet",
      "ip"
    ],
    "relatedCommand": "ip addr",
    "estimatedTime": 30,
    "mnemonic": "子网掩码=划分 IP 的网络位和主机位，判断是否同网段。"
  },
  {
    "id": "network-basic-tcpdump",
    "category": "network",
    "type": "command",
    "level": "basic",
    "title": "网络抓包工具",
    "prompt": "在 Linux 终端中，用于捕获网卡收发的网络数据包并进行分析的标准工具命令是？",
    "options": [
      {
        "id": "a",
        "text": "tcpdump"
      },
      {
        "id": "b",
        "text": "netstat"
      },
      {
        "id": "c",
        "text": "curl"
      },
      {
        "id": "d",
        "text": "telnet"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "tcpdump 是 Linux 环境下最著名的命令行抓包工具，支持灵活的过滤表达式来截获网络流量。",
    "wrongReasons": {
      "c": "curl 只能作为 HTTP/FTP 客户端发起网络请求，不具备监听和嗅探底层网卡数据包的功能。",
      "d": "telnet 是远程登录和四层 TCP 连接测试工具。",
      "b": "netstat 用于查看连接的汇总状态，不支持捕获和查看报文的具体字节内容。"
    },
    "skillTags": [
      "network",
      "packet-capture",
      "cli"
    ],
    "relatedCommand": "tcpdump -i eth0 port 80 -nn",
    "estimatedTime": 35,
    "mnemonic": "抓包标准工具 tcpdump，配过滤表达式。"
  },
  {
    "id": "network-basic-osi",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "OSI 七层模型",
    "prompt": "在计算机网络国际标准中，ISO 制定的 OSI 网络参考模型共有多少层？",
    "options": [
      {
        "id": "a",
        "text": "7 层"
      },
      {
        "id": "b",
        "text": "4 层"
      },
      {
        "id": "c",
        "text": "9 层"
      },
      {
        "id": "d",
        "text": "5 层"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "OSI 参考模型从下到上依次为：物理层、数据链路层、网络层、传输层、会话层、表示层、应用层，共 7 层。",
    "wrongReasons": {
      "b": "4 层是 TCP/IP 协议栈概念模型（链路层、网络层、传输层、应用层）的层数。",
      "d": "5 层是教学中常用的折中网络架构体系的层数。",
      "c": "OSI 标准不包含 9 层模型划分。"
    },
    "skillTags": [
      "network",
      "osi",
      "protocol"
    ],
    "relatedCommand": "Understand L2 (MAC), L3 (IP), L4 (TCP/UDP) layers",
    "estimatedTime": 30,
    "mnemonic": "OSI 七层：物链网传会示应；TCP/IP 是四层。"
  },
  {
    "id": "network-basic-packet-loss",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "网络丢包的含义",
    "prompt": "在网络诊断中，所谓的“丢包（Packet Loss）”是指？",
    "options": [
      {
        "id": "a",
        "text": "网卡物理网线的外皮塑料发生了剥落破损"
      },
      {
        "id": "b",
        "text": "服务器由于断电导致内存中的临时数据丢失"
      },
      {
        "id": "c",
        "text": "用户在电脑上不小心删除了自己下载的压缩文件"
      },
      {
        "id": "d",
        "text": "在网络传输中，发送的数据包未能成功到达目标端而被中途丢弃"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "丢包是由于信道干扰、网络拥塞、缓冲区溢出或路由跳数超限，导致数据报文在中途被交换机/路由器抛弃。",
    "wrongReasons": {
      "c": "删除文件是文件系统的删除操作，与网络报文丢包无关。",
      "b": "内存断电丢失数据是物理内存易失性特征。",
      "a": "线缆破损是物理介质损坏，虽然可能引发丢包，但破损本身并不是丢包的直接网络定义。"
    },
    "skillTags": [
      "network",
      "ping",
      "quality"
    ],
    "relatedCommand": "ping -c 100 google.com",
    "estimatedTime": 30,
    "mnemonic": "丢包=数据包中途被丢，没到对端。"
  },
  {
    "id": "network-basic-icmp",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "ICMP 协议定义",
    "prompt": "网络命令 `ping` 依赖于哪种网络协议来进行差错报告和网络状态探测？",
    "options": [
      {
        "id": "a",
        "text": "ICMP"
      },
      {
        "id": "b",
        "text": "IGMP"
      },
      {
        "id": "c",
        "text": "HTTP"
      },
      {
        "id": "d",
        "text": "ARP"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "ICMP（Internet Control Message Protocol）是控制报文协议，与 IP 协议同处网络层，用于发送 Echo Request（回显请求）和 Echo Reply（回显应答）。",
    "wrongReasons": {
      "b": "IGMP 是互联网组管理协议，主要用于多播组关系管理。",
      "c": "HTTP 是应用层超文本传输协议。",
      "d": "ARP 是数据链路层的地址解析协议。"
    },
    "skillTags": [
      "network",
      "icmp",
      "ping"
    ],
    "relatedCommand": "ping -c 4 8.8.8.8",
    "estimatedTime": 30,
    "mnemonic": "ping 靠 ICMP（差错/探测），不是 TCP。"
  },
  {
    "id": "network-basic-vpn",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "虚拟专用网 VPN",
    "prompt": "VPN（Virtual Private Network）在公共互联网上建立通信时，其最核心的技术安全特征是？",
    "options": [
      {
        "id": "a",
        "text": "自动把远程服务器的所有收费云产品变成永久免费"
      },
      {
        "id": "b",
        "text": "能够彻底消除客户端主机的 CPU 发热问题"
      },
      {
        "id": "c",
        "text": "通过物理光纤将数据发送到物理太空卫星上"
      },
      {
        "id": "d",
        "text": "在公共网络上建立加密的安全隧道以传输私有数据"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "VPN 利用隧道技术、加密技术及身份认证，在公网上构建了一条虚拟的、逻辑隔离的安全专用通道。",
    "wrongReasons": {
      "c": "VPN 基于已有物理网络，绝大多数情况通过普通地面光纤或移动网络传输，不代表强制使用太空卫星。",
      "b": "运行加密算法还会小幅增加 CPU 负荷，无法消除 CPU 发热。",
      "a": "云厂商收费是由商业机制决定，VPN 只是网络接入工具。"
    },
    "skillTags": [
      "network",
      "vpn",
      "security"
    ],
    "relatedCommand": "ip link show up",
    "estimatedTime": 30,
    "mnemonic": "VPN=公网上的加密隧道，传私有数据。"
  },
  {
    "id": "network-basic-mtu",
    "category": "network",
    "type": "single",
    "level": "basic",
    "title": "最大传输单元 MTU",
    "prompt": "在以太网配置中，默认的最大传输单元（MTU）大小通常是多少字节？",
    "options": [
      {
        "id": "a",
        "text": "9000 字节"
      },
      {
        "id": "b",
        "text": "64 字节"
      },
      {
        "id": "c",
        "text": "65535 字节"
      },
      {
        "id": "d",
        "text": "1500 字节"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "以太网的标准 MTU 默认是 1500 字节。如果 IP 数据包大于这个值，就需要进行分片传输。",
    "wrongReasons": {
      "a": "9000 字节通常是巨型帧（Jumbo Frame）的 MTU 设置，不是标准以太网默认值。",
      "b": "64 字节是以太网最小帧长度，而非 MTU。",
      "c": "65535 字节是 IPv4 协议报文理论上的最大长度上限。"
    },
    "skillTags": [
      "network",
      "mtu",
      "ip"
    ],
    "relatedCommand": "ifconfig eth0 | grep mtu",
    "estimatedTime": 35,
    "mnemonic": "以太网默认 MTU=1500，超了要分片。"
  },
  {
    "id": "cloud-basic-cdn",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "内容分发网络 CDN",
    "prompt": "为了加速全球不同地域用户访问网站静态资源（如图片、JS 文件）的速度，最直接的云产品是？",
    "options": [
      {
        "id": "a",
        "text": "IAM (身份与访问管理)"
      },
      {
        "id": "b",
        "text": "CDN (内容分发网络)"
      },
      {
        "id": "c",
        "text": "VPC (专有网络)"
      },
      {
        "id": "d",
        "text": "RDS (关系型数据库)"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "CDN 将资源缓存到分布在全球的边缘节点，使用户可以就近获取数据，减少网络传输时延和源站压力。",
    "wrongReasons": {
      "d": "RDS 存储核心业务数据，不加速静态文件的全球边缘分发。",
      "a": "IAM 仅管理访问身份和权限。",
      "c": "VPC 负责隔离私有网络拓扑，不提供全球边缘节点文件缓存加速。"
    },
    "skillTags": [
      "cloud",
      "cdn",
      "cache"
    ],
    "relatedCommand": "Configure CDN domain name CNAME record",
    "estimatedTime": 35,
    "mnemonic": "静态资源全球加速用 CDN(边缘节点就近)。"
  },
  {
    "id": "cloud-basic-ha",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "高可用容灾架构",
    "prompt": "要在云端设计一个能够应对“单个数据中心突然断电”级别的服务，最基本的容灾部署策略是？",
    "options": [
      {
        "id": "a",
        "text": "把所有的静态文件均保存在本地磁盘的 `/tmp` 目录下"
      },
      {
        "id": "b",
        "text": "将应用实例和数据库副本跨多个可用区（Multi-AZ）进行双活部署"
      },
      {
        "id": "c",
        "text": "每天晚上对服务器进行手动重启"
      },
      {
        "id": "d",
        "text": "在同一台云服务器内多开几个 Docker 容器"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "可用区（AZ）之间电力和网络物理隔离。跨 AZ 部署可以确保某一机房整体瘫痪时，其他可用区的健康实例可以继续承接全部流量。",
    "wrongReasons": {
      "d": "若宿主机硬件损坏或所在机房整体断电，该宿主机上的所有容器都会一起挂掉。",
      "a": "/tmp 目录在系统重启时常被清理，且保存在单台机器的本地磁盘不具备跨机房多副本高可用属性。",
      "c": "定时重启只能清理内存泄漏，无法防范机房物理断电或断网等特大灾难事故。"
    },
    "skillTags": [
      "cloud",
      "ha",
      "disaster-recovery"
    ],
    "relatedCommand": "Deploy ELB with target groups in subnet-a and subnet-b",
    "estimatedTime": 35,
    "mnemonic": "防整机房断电=跨多 AZ 双活部署。"
  },
  {
    "id": "cloud-basic-autoscaling",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "弹性伸缩服务",
    "prompt": "当云主机集群的 CPU 平均使用率持续超过 80% 时，自动触发系统新增购买并部署多台云服务器以分流，应配置？",
    "options": [
      {
        "id": "a",
        "text": "域名解析服务 (DNS)"
      },
      {
        "id": "b",
        "text": "安全组 (Security Group)"
      },
      {
        "id": "c",
        "text": "访问控制授权 (RAM)"
      },
      {
        "id": "d",
        "text": "弹性伸缩 (Auto Scaling)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "弹性伸缩服务（Auto Scaling / ESS）会根据实时监控的指标（如 CPU、内存水位），自动增减云服务器数量，以平抑流量波动。",
    "wrongReasons": {
      "b": "安全组是控制端口过滤的防火墙，不负责资源的采购和扩容缩容。",
      "a": "DNS 将域名指向特定 IP，不直接参与虚拟主机的扩缩容调度。",
      "c": "RAM 用于进行多账号的权限配置，不能自动化增减实例。"
    },
    "skillTags": [
      "cloud",
      "auto-scaling",
      "capacity"
    ],
    "relatedCommand": "Create scaling group and define alarm policy",
    "estimatedTime": 35,
    "mnemonic": "按 CPU 水位自动增减实例=弹性伸缩(Auto Scaling)。"
  },
  {
    "id": "cloud-basic-monitor",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云平台基础监控",
    "prompt": "在阿里云或 AWS 上，直接提供开箱即用的云资源（如 ECS CPU 使用率、网络 IO 水平）收集与展示的监控服务是？",
    "options": [
      {
        "id": "a",
        "text": "专有网络 (VPC)"
      },
      {
        "id": "b",
        "text": "云企业网 (CEN)"
      },
      {
        "id": "c",
        "text": "密钥管理服务 (KMS)"
      },
      {
        "id": "d",
        "text": "云监控 (CloudMonitor / CloudWatch)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "各大云厂商均内置了基础监控服务（AWS 称为 CloudWatch，阿里云称为云监控），默认拉取虚拟主机的宿主机级资源指标。",
    "wrongReasons": {
      "a": "VPC 是网络隔离网段划分产品。",
      "c": "KMS 负责保管和管理数据加密的密钥。",
      "b": "CEN 用于跨地域打通不同 VPC 之间的内部高速通道。"
    },
    "skillTags": [
      "cloud",
      "monitoring",
      "cloudwatch"
    ],
    "relatedCommand": "Check CloudWatch ECS CPU utilization metrics",
    "estimatedTime": 35,
    "mnemonic": "云内置资源监控=云监控/CloudWatch。"
  },
  {
    "id": "cloud-basic-bucket",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "对象存储 Bucket 概念",
    "prompt": "在对象存储（如 OSS/S3）中，用来存放对象的顶级逻辑容器名称通常被称为？",
    "options": [
      {
        "id": "a",
        "text": "关系库 (Database)"
      },
      {
        "id": "b",
        "text": "安全组 (Security Group)"
      },
      {
        "id": "c",
        "text": "存储空间 / 桶 (Bucket)"
      },
      {
        "id": "d",
        "text": "实例 (Instance)"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "Bucket（桶/存储空间）是对象存储的顶级目录名，其名称通常需要全球或全地域唯一，用于挂载权限和生命周期策略。",
    "wrongReasons": {
      "d": "Instance 代表一台云服务器虚拟机。",
      "b": "Security Group 代表虚拟防火墙。",
      "a": "Database 关系型数据库的名词。"
    },
    "skillTags": [
      "cloud",
      "s3",
      "bucket"
    ],
    "relatedCommand": "aws s3 mb s3://my-unique-bucket-name",
    "estimatedTime": 30,
    "mnemonic": "对象存储的顶级容器叫桶(Bucket)，名字全局唯一。"
  },
  {
    "id": "cloud-basic-hybrid",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "混合云基础定义",
    "prompt": "当企业将敏感核心数据保存在本地自建机房（私有云），而将弹性高频变化的 Web 前端业务部署在公共云上，这种模式被称为？",
    "options": [
      {
        "id": "a",
        "text": "单机部署"
      },
      {
        "id": "b",
        "text": "公有云 (Public Cloud)"
      },
      {
        "id": "c",
        "text": "私有云 (Private Cloud)"
      },
      {
        "id": "d",
        "text": "混合云 (Hybrid Cloud)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "混合云是将公有云和私有云/本地 IDC 物理网络打通，实现数据分级保存与业务弹性的混合架构模式。",
    "wrongReasons": {
      "b": "公有云是指资源完全托管在外部第三方公共云平台。",
      "c": "私有云是指所有的计算环境物理部署在企业自己控制的局域机房内。",
      "a": "单机部署不属于云架构模式讨论范畴。"
    },
    "skillTags": [
      "cloud",
      "architecture",
      "hybrid-cloud"
    ],
    "relatedCommand": "Set up VPN/DirectConnect connection between IDC and VPC",
    "estimatedTime": 30,
    "mnemonic": "本地私有云+公有云混用=混合云(Hybrid)。"
  },
  {
    "id": "cloud-basic-serverless",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "无服务器计算 Serverless",
    "prompt": "无需管理和购买底层云服务器虚拟机，只需上传函数代码即可由云平台按需执行、按调用量付费的计算模式是？",
    "options": [
      {
        "id": "a",
        "text": "包年包月型虚拟机 (ECS)"
      },
      {
        "id": "b",
        "text": "容器主机集群部署 (Kubernetes)"
      },
      {
        "id": "c",
        "text": "无服务器 / 函数计算 (Serverless / FaaS)"
      },
      {
        "id": "d",
        "text": "自建物理机柜托管 (Colocation)"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "Serverless（如 AWS Lambda、阿里云 FC）允许研发抛开 OS 运维，完全由云平台根据请求事件自动冷启动并运行函数。",
    "wrongReasons": {
      "d": "物理机柜托管需要自行配置真实的服务器硬件、网络交换机并上架。",
      "b": "Kubernetes 依然需要维护和规划底层 Node 节点的资源配置和运行时。",
      "a": "ECS 虚拟机必须人工选择 CPU、内存并为其运行时的闲置时长持续付费。"
    },
    "skillTags": [
      "cloud",
      "serverless",
      "lambda"
    ],
    "relatedCommand": "Deploy Lambda zip function code",
    "estimatedTime": 35,
    "mnemonic": "只传函数代码、按调用付费=Serverless/FaaS。"
  },
  {
    "id": "cloud-basic-metadata",
    "category": "cloud",
    "type": "config",
    "level": "basic",
    "title": "云主机元数据地址",
    "prompt": "在公共云（AWS/阿里云/腾讯云）中，运行在云主机内部的脚本要获取本机当前绑定的公网 IP、实例 ID，可请求的本地默认元数据（Metadata）API IP 地址是？",
    "options": [
      {
        "id": "a",
        "text": "192.168.0.1"
      },
      {
        "id": "b",
        "text": "127.0.0.1"
      },
      {
        "id": "c",
        "text": "169.254.169.254"
      },
      {
        "id": "d",
        "text": "8.8.8.8"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "169.254.169.254 是云平台规范的链路本地元数据服务 IP，云服务器向此 IP 发送 HTTP 请求可免密获取实例自身的元数据。",
    "wrongReasons": {
      "b": "127.0.0.1 是本地回环 IP，不提供云平台控制的实例元数据 API。",
      "d": "8.8.8.8 是谷歌的公网 DNS 解析服务。",
      "a": "192.168.0.1 通常是局域网路由器网关。"
    },
    "skillTags": [
      "cloud",
      "metadata",
      "ecs"
    ],
    "relatedCommand": "curl http://169.254.169.254/latest/meta-data/",
    "estimatedTime": 40,
    "mnemonic": "云内取实例元数据：169.254.169.254。"
  },
  {
    "id": "cloud-basic-storage-tier",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "冷热存储分级",
    "prompt": "在对象存储服务中，针对几乎不怎么读取、主要用于合规性长期存档备份的文件，为了节省存储费用，应选择哪种存储类型？",
    "options": [
      {
        "id": "a",
        "text": "归档存储 / 冷存储 (Archive / Cold)"
      },
      {
        "id": "b",
        "text": "低频访问存储 (Infrequent Access)"
      },
      {
        "id": "c",
        "text": "实时闪存存储 (SSD)"
      },
      {
        "id": "d",
        "text": "标准存储 / 热存储 (Standard / Hot)"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "归档存储（Archive）单位存储单价极低，但不支持秒级获取（通常需要数分钟到数小时的“解冻”时间），适合归档备份。",
    "wrongReasons": {
      "d": "标准存储适合高频读取的文件，单位存储单价是最高的。",
      "b": "低频访问存储处于标准和归档之间，适合一个月只访问几次的数据。",
      "c": "SSD 是块存储的硬件介质，单价极高，不适合做海量静态文件冷存档。"
    },
    "skillTags": [
      "cloud",
      "storage",
      "cost"
    ],
    "relatedCommand": "Change S3 object storage class to Glacier/Archive",
    "estimatedTime": 35,
    "mnemonic": "冷数据长期归档选归档/冷存储，最便宜但取数慢。"
  },
  {
    "id": "cloud-basic-shared-responsibility",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "责任共担模型",
    "prompt": "根据公共云的“责任共担模型（Shared Responsibility Model）”，以下哪项通常属于云平台服务商（如 AWS）的安全职责范围？",
    "options": [
      {
        "id": "a",
        "text": "客户虚拟机内部部署的业务代码逻辑的安全漏洞"
      },
      {
        "id": "b",
        "text": "客户安全组放行所有端口导致的数据泄露"
      },
      {
        "id": "c",
        "text": "物理机房的保安监控以及宿主机底层虚拟化监控管理的安全"
      },
      {
        "id": "d",
        "text": "客户数据库表中用户密码的复杂度校验策略"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "云服务商负责“云本身的安全”（机房、网络硬件、底层虚拟化技术层）；而客户负责“云内部的安全”（虚机内 OS 配置、数据库、账号权限、代码逻辑）。",
    "wrongReasons": {
      "a": "虚拟机内部的业务代码是客户自己开发的，漏洞应由客户自行承担和修复。",
      "d": "数据库内部的数据资产和账户口令安全是客户的管理范畴。",
      "b": "安全组虽然是云产品，但具体的端口开放规则是由客户自主定义的，误开放属于客户配置不当的责任。"
    },
    "skillTags": [
      "cloud",
      "security",
      "compliance"
    ],
    "relatedCommand": "Review AWS Shared Responsibility Model document",
    "estimatedTime": 35,
    "mnemonic": "责任共担：云厂商管机房和底层虚拟化，客户管 OS/数据/权限/代码。"
  },
  {
    "id": "cloud-basic-ebs",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "块存储与对象存储",
    "prompt": "在云平台上，可以直接挂载给云服务器（ECS/EC2）作为本地物理硬盘（例如 C 盘或 D 盘）来格式化并安装操作系统的是？",
    "options": [
      {
        "id": "a",
        "text": "对象存储 (OSS / S3)"
      },
      {
        "id": "b",
        "text": "块存储 / 云盘 (EBS / Cloud Disk)"
      },
      {
        "id": "c",
        "text": "负载均衡 (SLB)"
      },
      {
        "id": "d",
        "text": "内容分发网络 (CDN)"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "块存储以物理扇区为基本存取单元，支持挂载为虚机的本地裸磁盘，用以部署 OS 和高并发读写文件。",
    "wrongReasons": {
      "a": "对象存储属于网络 API 存取存储，不能直接作为宿主机系统盘来引导启动操作系统。",
      "d": "CDN 用于静态文件分发缓存。",
      "c": "SLB 用于分发流量，不提供存储。"
    },
    "skillTags": [
      "cloud",
      "storage",
      "ebs"
    ],
    "relatedCommand": "Attach cloud disk to instance ecs-xxx",
    "estimatedTime": 30,
    "mnemonic": "能挂载装系统的本地盘=块存储/云盘(EBS)。"
  },
  {
    "id": "cloud-basic-nat-gateway",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云上 NAT 网关",
    "prompt": "在云 VPC 中，如果有多台纯内网云服务器没有公网 IP，但都需要访问外网下载软件补丁，通常应该在 VPC 中部署？",
    "options": [
      {
        "id": "a",
        "text": "NAT 网关 (NAT Gateway / SNAT)"
      },
      {
        "id": "b",
        "text": "弹性伸缩 (Auto Scaling)"
      },
      {
        "id": "c",
        "text": "DNS 路由 (Route53)"
      },
      {
        "id": "d",
        "text": "负载均衡 (SLB)"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "NAT 网关的 SNAT 功能可以将内网服务器的私有 IP 转换为公网网关 IP，使内网虚机能够发起向外的互联网连接，但外部公网无法主动侵入发起请求。",
    "wrongReasons": {
      "d": "负载均衡（SLB）处理的是外界向云内部主动发起的入向请求（DNAT 代理），不负责内网服务器向外发起的出向访问路由。",
      "b": "弹性伸缩仅用于增减实例，不解决外网连通性路由问题。",
      "c": "DNS 路由负责解析，不进行网络层 IP 转换。"
    },
    "skillTags": [
      "cloud",
      "vpc",
      "nat-gateway"
    ],
    "relatedCommand": "Configure VPC Route Table to point 0.0.0.0/0 to NAT Gateway",
    "estimatedTime": 40,
    "mnemonic": "内网机出外网用 NAT 网关(SNAT)，外面进不来。"
  },
  {
    "id": "cloud-basic-vpn-gateway",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云上 VPN 网关",
    "prompt": "为了安全打通企业线下办公室到云上 VPC 的私有内网网络通道，且不需要拉物理专线时，经济实惠的方案是部署？",
    "options": [
      {
        "id": "a",
        "text": "云安全中心"
      },
      {
        "id": "b",
        "text": "VPN 网关 (VPN Gateway / IPsec)"
      },
      {
        "id": "c",
        "text": "智能 DNS 解析"
      },
      {
        "id": "d",
        "text": "对象存储归档"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "VPN 网关基于互联网，利用 IPsec 加密协议，能在云上 VPC 和企业自建防火墙之间建立低成本的安全内网加密桥接。",
    "wrongReasons": {
      "c": "DNS 解析只告诉客户端目标 IP，不负责两端真实内网报文的加密传输。",
      "a": "安全中心用于漏洞扫描和主机防入侵告警，不具备内网路由打通能力。",
      "d": "对象存储与内网网络链路架构设计无关。"
    },
    "skillTags": [
      "cloud",
      "network",
      "vpn"
    ],
    "relatedCommand": "Create IPsec Connection and configure Local/Remote subnets",
    "estimatedTime": 35,
    "mnemonic": "不拉专线打通办公室到 VPC，用 VPN 网关(IPsec)。"
  },
  {
    "id": "cloud-basic-migration",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云迁移策略",
    "prompt": "在企业上云迁移中，直接把线下服务器的虚拟机镜像或文件打包，原封不动地重新部署在云主机上运行，这种最省事的迁移策略通常被称为？",
    "options": [
      {
        "id": "a",
        "text": "重构架构 (Refactor / Re-architect)"
      },
      {
        "id": "b",
        "text": "平移 / 重新托管 (Lift and Shift / Rehost)"
      },
      {
        "id": "c",
        "text": "下线废弃 (Retire)"
      },
      {
        "id": "d",
        "text": "SaaS 替代 (Replace / Drop and Shop)"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "Rehost（平移）只做托管环境的平移，不做代码或中间件的深度云原生改造，见效快但无法深度利用云原生的按需伸缩优势。",
    "wrongReasons": {
      "a": "重构架构需要改写业务代码以适配容器微服务或 Serverless 等架构，开发周期长。",
      "d": "SaaS 替代是指放弃自研，直接采购第三方云服务。",
      "c": "下线代表废弃现有系统，不属于系统迁移上云的技术行为。"
    },
    "skillTags": [
      "cloud",
      "migration",
      "strategy"
    ],
    "relatedCommand": "Perform VM import to generate ECS custom image",
    "estimatedTime": 35,
    "mnemonic": "原样平移上云=Lift and Shift/Rehost。"
  },
  {
    "id": "cloud-basic-audit",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云审计日志",
    "prompt": "企业要审计“谁在什么时间调用了哪个云平台 API 删除了生产数据库实例”，应该开启并查询哪个日志服务？",
    "options": [
      {
        "id": "a",
        "text": "云审计日志 (CloudTrail / ActionTrail)"
      },
      {
        "id": "b",
        "text": "前端 Nginx 的接入日志 access.log"
      },
      {
        "id": "c",
        "text": "虚拟机内部的 `/var/log/messages`"
      },
      {
        "id": "d",
        "text": "MySQL 的慢查询日志 slow_query.log"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "云审计（AWS 称 CloudTrail，阿里云称操作审计 ActionTrail）会记录所有的云账号控制台操作及通过 SDK/CLI 发起的所有云 API 请求记录。",
    "wrongReasons": {
      "c": "/var/log/messages 记录的是虚机内部 OS 级别的系统内核及常规进程日志，不包含云平台管理侧 API 的操作记录。",
      "d": "慢查询日志记录执行慢的 SQL 语句，不涉及云平台云服务器/云数据库实例本身资源管理的 API 变更历史。",
      "b": "Nginx 日志记录 HTTP 网页访问流量，同样不覆盖云管控平面层级。"
    },
    "skillTags": [
      "cloud",
      "audit",
      "security"
    ],
    "relatedCommand": "Search CloudTrail event history for eventName=DeleteDBInstance",
    "estimatedTime": 40,
    "mnemonic": "查谁调了哪个云 API 看云审计(CloudTrail/ActionTrail)。"
  },
  {
    "id": "cloud-basic-accesskey",
    "category": "cloud",
    "type": "multiple",
    "level": "basic",
    "title": "云 API 访问密钥",
    "prompt": "当运维在本地编写自动化 Python 脚本需要调用云平台 API 时，为了通过云平台的身份认证，必须在脚本配置中提供哪两个核心密钥参数？",
    "options": [
      {
        "id": "a",
        "text": "Access Key ID (访问密钥 ID)"
      },
      {
        "id": "b",
        "text": "虚拟机登录的 SSH 私钥密钥文件 (.pem)"
      },
      {
        "id": "c",
        "text": "Secret Access Key (访问密钥密匙)"
      },
      {
        "id": "d",
        "text": "云服务器的 VNC 远程登录图形管理密码"
      }
    ],
    "answer": [
      "a",
      "c"
    ],
    "explanation": "AccessKey 对（AK/SK）是云平台分配给用户/角色的 API 调用身份令牌。AK 用于标识身份，SK 用于对请求内容进行不可逆的加密签名校验。",
    "wrongReasons": {
      "b": ".pem 私钥仅用于与虚拟机建立操作系统级的 SSH 连接，与调用云平台侧的管理控制 API（如创建云盘）无关。",
      "d": "VNC 密码是虚拟机控制台死机应急时图形界面管理专用口令。"
    },
    "skillTags": [
      "cloud",
      "security",
      "iam"
    ],
    "relatedCommand": "aws configure",
    "estimatedTime": 35,
    "mnemonic": "调云 API 用 AK/SK：AK 标识身份，SK 签名。"
  },
  {
    "id": "cloud-basic-dns-route53",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云端智能 DNS 路由",
    "prompt": "云平台的智能域名解析服务（例如 AWS Route53、阿里云解析 DNS）相比于常规静态 DNS，最主要的增值技术特性是？",
    "options": [
      {
        "id": "a",
        "text": "可以将原本由 TCP 传输的流量强制变成物理局域网光纤直连"
      },
      {
        "id": "b",
        "text": "不需要分配任何 IP 即可完成全球网络路由"
      },
      {
        "id": "c",
        "text": "完全屏蔽外界的 DDoS 网络流量泛滥攻击"
      },
      {
        "id": "d",
        "text": "支持健康检查，能够自动将解析流量切换到健康的服务器 IP，且支持按访客地理位置就近解析"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "云智能 DNS 支持健康探活、地理位置/权重分流以及跨机房容灾，把 DNS 寻址提升为了高可用的调度手段。",
    "wrongReasons": {
      "a": "DNS 只返回解析记录，不改变真实网络流量在互联网物理光纤链路上的传输物理格式。",
      "c": "常规 DNS 虽有防 DDoS 解析放大能力，但不能全局彻底屏蔽对网站 Web 后端服务器物理 IP 的直接攻击。",
      "b": "DNS 解析依然必须输出合法的 IP 地址（A/AAAA 记录等）以供网络寻址建立连接。"
    },
    "skillTags": [
      "cloud",
      "dns",
      "routing"
    ],
    "relatedCommand": "Configure Route 53 failover routing policy",
    "estimatedTime": 35,
    "mnemonic": "云智能 DNS：健康检查+地理就近+权重切流。"
  },
  {
    "id": "cloud-basic-directconnect",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "云物理专线",
    "prompt": "企业如果对本地数据中心与云端 VPC 之间的网络延迟、抖动以及安全性有极严苛要求，最稳妥的专属物理链路方案是开通？",
    "options": [
      {
        "id": "a",
        "text": "免费租用运营商的普通 ADSL 宽带拨号上网"
      },
      {
        "id": "b",
        "text": "物理专线接入 (如 AWS Direct Connect, 阿里云高速通道)"
      },
      {
        "id": "c",
        "text": "基于公共互联网建立的普通 VPN 通道"
      },
      {
        "id": "d",
        "text": "在手机上开启移动网络共享热点连接"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "专线接入是拉一条物理光纤直接插到云厂商的接入交换机上，独占信道，不经过公共互联网，延迟和安全性具有物理级的保障。",
    "wrongReasons": {
      "c": "VPN 虽然是安全加密隧道，但报文依然跑在公共互联网上，延迟和抖动受公网拥堵影响。",
      "d": "手机热点是消费级无线接入，性能和吞吐率无法满足企业级数据中心互联。",
      "a": "拨号宽带不稳定、延迟高且不具备专线独占物理路由安全性。"
    },
    "skillTags": [
      "cloud",
      "network",
      "expressconnect"
    ],
    "relatedCommand": "Configure dedicated router BGP routing tables",
    "estimatedTime": 40,
    "mnemonic": "极严苛低延迟内网互联拉物理专线(Direct Connect)。"
  },
  {
    "id": "cloud-basic-paas",
    "category": "cloud",
    "type": "single",
    "level": "basic",
    "title": "PaaS 平台即服务",
    "prompt": "在云计算的服务分层中，企业无需操心服务器硬件与操作系统环境，直接获得开箱即用的运行平台软件环境（如托管 Kubernetes 环境、Node.js 运行容器），这种服务模式通常是？",
    "options": [
      {
        "id": "a",
        "text": "PaaS (平台即服务)"
      },
      {
        "id": "b",
        "text": "IaaS (基础设施即服务)"
      },
      {
        "id": "c",
        "text": "SaaS (软件即服务)"
      },
      {
        "id": "d",
        "text": "DaaS (桌面即服务)"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "PaaS（Platform as a Service）向开发者提供运行平台及开发运行环境，免去了客户自己维护虚机系统升级、Docker 运行时等运维开销。",
    "wrongReasons": {
      "b": "IaaS（如纯 ECS 虚拟机）仅提供裸计算和网络资源，操作系统及运行时中间件的安装完全由客户自己维护。",
      "c": "SaaS 是指直接提供给最终用户使用的业务软件产品（如钉钉、微信）。",
      "d": "DaaS 是指虚拟远程桌面云托管服务。"
    },
    "skillTags": [
      "cloud",
      "paas",
      "architecture"
    ],
    "relatedCommand": "Deploy nodejs application code on Heroku/Beanstalk",
    "estimatedTime": 35,
    "mnemonic": "免运维 OS、直接拿运行平台=PaaS。"
  },
  {
    "id": "devops-basic-git-add",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "暂存文件修改",
    "prompt": "在 Git 工作流中，将修改过的新文件 `app.py` 提交添加到暂存区（Stage），应执行？",
    "options": [
      {
        "id": "a",
        "text": "git add app.py"
      },
      {
        "id": "b",
        "text": "git commit app.py"
      },
      {
        "id": "c",
        "text": "git save app.py"
      },
      {
        "id": "d",
        "text": "git push app.py"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "git add 用于将工作区的文件修改记录标记并放入暂存区，为下一步提交做准备。",
    "wrongReasons": {
      "b": "git commit 用于把暂存区的所有改动正式生成一个新的历史版本节点（commit）。",
      "d": "git push 用于把本地的提交同步推送到远程代码仓库。",
      "c": "git 默认不包含名为 save 的子命令。"
    },
    "skillTags": [
      "git",
      "cli",
      "source-control"
    ],
    "relatedCommand": "git add .",
    "estimatedTime": 30,
    "mnemonic": "git add 放暂存区，git commit 存版本。"
  },
  {
    "id": "devops-basic-git-commit",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "提交修改到本地库",
    "prompt": "要将暂存区里的所有改动正式记录并生成本地的版本记录，并备注描述“fix bugs”，应该运行？",
    "options": [
      {
        "id": "a",
        "text": "git commit -m \"fix bugs\""
      },
      {
        "id": "b",
        "text": "git status -m \"fix bugs\""
      },
      {
        "id": "c",
        "text": "git push -m \"fix bugs\""
      },
      {
        "id": "d",
        "text": "git save -m \"fix bugs\""
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "git commit 将暂存区的内容归档到本地版本库中，-m 用于指定该提交的版本注释信息。",
    "wrongReasons": {
      "c": "git push 的 -m 参数是非法的，且它是用于把已存在的 commit 推往上游的指令。",
      "d": "git 不支持 save 命令。",
      "b": "git status 仅展示当前文件的变更状态，不接受 -m 参数作为版本记录备注。"
    },
    "skillTags": [
      "git",
      "cli",
      "source-control"
    ],
    "relatedCommand": "git commit --amend",
    "estimatedTime": 30,
    "mnemonic": "git commit -m \"说明\" 生成版本记录。"
  },
  {
    "id": "devops-basic-git-push",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "推送代码到远程库",
    "prompt": "将本地的 `main` 分支代码和最新 commit 记录同步推送到远程默认仓库 `origin` 上，应运行？",
    "options": [
      {
        "id": "a",
        "text": "git clone origin main"
      },
      {
        "id": "b",
        "text": "git push origin main"
      },
      {
        "id": "c",
        "text": "git pull origin main"
      },
      {
        "id": "d",
        "text": "git fetch origin main"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "git push [远程别名] [分支名] 用于把本地修改推送并合并到远程仓库中。",
    "wrongReasons": {
      "c": "git pull 用于从远程拉取并合并最新代码到本地，与题目要求反了。",
      "d": "git fetch 仅下载远程版本树，不修改本地工作目录文件。",
      "a": "git clone 用于初始化下载代码，不能把本地 commit 逆向推送。"
    },
    "skillTags": [
      "git",
      "cli",
      "source-control"
    ],
    "relatedCommand": "git push -u origin main",
    "estimatedTime": 30,
    "mnemonic": "推代码：git push origin <分支>。"
  },
  {
    "id": "devops-basic-dockerfile",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "Dockerfile 作用",
    "prompt": "在容器开发中，定义了容器分层构建步骤、要执行的命令和需要安装的依赖软件的纯文本模板配置文件通常命名为？",
    "options": [
      {
        "id": "a",
        "text": "Dockerfile"
      },
      {
        "id": "b",
        "text": "docker.yaml"
      },
      {
        "id": "c",
        "text": "kubernetes.json"
      },
      {
        "id": "d",
        "text": "jenkinsfile.xml"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "Dockerfile 是 Docker 构建镜像（docker build）的规范脚本，包含 FROM, RUN, COPY, EXPOSE 等指令。",
    "wrongReasons": {
      "b": "docker.yaml 不是 Docker 官方推荐和支持的镜像构建脚本默认文件名。",
      "c": "Kubernetes 部署配置文件通常使用 YAML 格式，且不是用来做 Docker 底层镜像打包的。",
      "d": "Jenkinsfile 用于描述 CI/CD 流水线，不是用来定义 Docker 镜像的脚本文件。"
    },
    "skillTags": [
      "docker",
      "dockerfile",
      "build"
    ],
    "relatedCommand": "cat Dockerfile",
    "estimatedTime": 30,
    "mnemonic": "构建镜像的脚本文件叫 Dockerfile。"
  },
  {
    "id": "devops-basic-docker-build",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "构建 Docker 镜像",
    "prompt": "利用当前目录下的 Dockerfile 构建一个标签（tag）为 `my-app:v1` 的 Docker 镜像，正确的命令是？",
    "options": [
      {
        "id": "a",
        "text": "docker images my-app:v1"
      },
      {
        "id": "b",
        "text": "docker build -t my-app:v1 ."
      },
      {
        "id": "c",
        "text": "docker push my-app:v1"
      },
      {
        "id": "d",
        "text": "docker run -t my-app:v1 ."
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "docker build 命令的 -t（tag）参数用于指定生成的镜像名及版本号，最后的 `.` 代表使用当前目录作为构建上下文（找 Dockerfile）。",
    "wrongReasons": {
      "d": "docker run 是从已有镜像运行容器，不是根据 Dockerfile 模板文件构建新镜像，末尾接 `.` 是语法错误。",
      "a": "docker images 只能查看本地现存镜像列表，不执行构建。",
      "c": "docker push 用于向 Docker Hub 镜像中心上传镜像。"
    },
    "skillTags": [
      "docker",
      "cli",
      "build"
    ],
    "relatedCommand": "docker build --no-cache -t my-app:v1 .",
    "estimatedTime": 35,
    "mnemonic": "构建镜像：docker build -t 名:tag .（末尾点是上下文）。"
  },
  {
    "id": "devops-basic-docker-pull",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "拉取远程镜像",
    "prompt": "想要从公共镜像中心（如 Docker Hub）将官方的 `redis:7-alpine` 镜像下载到本地，应运行什么指令？",
    "options": [
      {
        "id": "a",
        "text": "docker search redis:7-alpine"
      },
      {
        "id": "b",
        "text": "docker pull redis:7-alpine"
      },
      {
        "id": "c",
        "text": "docker push redis:7-alpine"
      },
      {
        "id": "d",
        "text": "docker get redis:7-alpine"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "docker pull 会从指定的 Registry 中下载缺失的镜像层分发包到本地存储中。",
    "wrongReasons": {
      "c": "docker push 是上传本地镜像到镜像中心库中。",
      "a": "docker search 只会在 Hub 上检索并返回包含特定关键字的镜像列表，并不下载。",
      "d": "docker 不包含 get 作为子命令。"
    },
    "skillTags": [
      "docker",
      "cli",
      "pull"
    ],
    "relatedCommand": "docker pull ubuntu:latest",
    "estimatedTime": 30,
    "mnemonic": "拉镜像 docker pull；推镜像 docker push。"
  },
  {
    "id": "devops-basic-cicd",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "CI/CD 的定义",
    "prompt": "在软件工程和 DevOps 实践中，CI/CD 的标准中文字面含义通常是指？",
    "options": [
      {
        "id": "a",
        "text": "顾客信息与客户关系跟踪 (Customer Info / Client Directory)"
      },
      {
        "id": "b",
        "text": "计算机指令与芯片开发 (Computer Instruction / Chip Design)"
      },
      {
        "id": "c",
        "text": "持续集成与持续交付/部署 (Continuous Integration / Continuous Deployment)"
      },
      {
        "id": "d",
        "text": "代码复制与缓存清理 (Code Copy / Cache Delete)"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "CI/CD 通过自动测试、编译、构建镜像并自动推送到测试/生产环境，实现了软件的高频高质量快速交付发布。",
    "wrongReasons": {
      "b": "芯片开发属于硬件电子学设计，不是 DevOps 自动化流水线。",
      "d": "代码复制和缓存清理是具体操作，不是 CI/CD 工程的战略缩写。",
      "a": "客户管理是 CRM 概念，非 CI/CD。"
    },
    "skillTags": [
      "devops",
      "cicd",
      "automation"
    ],
    "relatedCommand": "Run CI/CD pipeline",
    "estimatedTime": 30,
    "mnemonic": "CI/CD=持续集成 / 持续交付部署。"
  },
  {
    "id": "devops-basic-jenkins",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "自动化集成服务器",
    "prompt": "DevOps 中最常用、拥有极丰富插件生态并用来编写 Pipeline 脚本自动拉代码、测试和发布的经典开源工具是？",
    "options": [
      {
        "id": "a",
        "text": "Vim"
      },
      {
        "id": "b",
        "text": "Nginx"
      },
      {
        "id": "c",
        "text": "VirtualBox"
      },
      {
        "id": "d",
        "text": "Jenkins"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "Jenkins 是一款经典的分布式 Java 自动化构建服务器，支持以 Jenkinsfile 定义 Declarative Pipeline 流水线。",
    "wrongReasons": {
      "a": "Vim 是终端纯文本编辑软件，不是流水线编排调度工具。",
      "c": "VirtualBox 是单机虚拟化管理虚拟机监控软件。",
      "b": "Nginx 是高性能的反向代理与 Web 静态容器。"
    },
    "skillTags": [
      "devops",
      "jenkins",
      "automation"
    ],
    "relatedCommand": "Open Jenkins console web UI on port 8080",
    "estimatedTime": 30,
    "mnemonic": "经典流水线工具=Jenkins（Jenkinsfile 写 Pipeline）。"
  },
  {
    "id": "devops-basic-git-branch",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "Git 分支机制",
    "prompt": "在 Git 中，开发人员要在不干扰已有主干（main）稳定运行的前提下开发新功能，最标准的作法是？",
    "options": [
      {
        "id": "a",
        "text": "让全体同事在今天内都不要保存和上传自己修改的代码"
      },
      {
        "id": "b",
        "text": "直接在物理主机上多复制几个存放项目文件夹的物理硬盘"
      },
      {
        "id": "c",
        "text": "使用 Word 文档对修改过的代码进行人肉保存记录"
      },
      {
        "id": "d",
        "text": "从主干拉出一个独立的新功能分支（Feature Branch）进行开发"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "Git 分支极为轻量（只是一个指向 commit 节点的指针）。开发人员创建并切换分支，可以在完全独立的提交线路上快速演进业务，完成后通过 Merge 合并。",
    "wrongReasons": {
      "b": "物理多重硬盘拷贝极不利于版本差异比对、合并以及协同合作，耗费介质。",
      "a": "限制同事提交是低效的管理方式，违背了版本控制系统的并行多人协作初衷。",
      "c": "Word 文本保存代码无法执行语法校验、编译、自动回溯历史，人肉保存是极不规范的做法。"
    },
    "skillTags": [
      "git",
      "branch",
      "source-control"
    ],
    "relatedCommand": "git branch feature-login",
    "estimatedTime": 30,
    "mnemonic": "开新功能从主干拉 feature 分支，互不干扰。"
  },
  {
    "id": "devops-basic-git-checkout",
    "category": "devops",
    "type": "command",
    "level": "basic",
    "title": "新建并切换分支",
    "prompt": "要在本地仓库中创建一个名为 `dev` 的新分支，并当场切换过去，正确的快捷命令是？",
    "options": [
      {
        "id": "a",
        "text": "git checkout -b dev"
      },
      {
        "id": "b",
        "text": "git branch dev"
      },
      {
        "id": "c",
        "text": "git status -b dev"
      },
      {
        "id": "d",
        "text": "git switch dev"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "git checkout 的 -b 参数能够新建分支并实现当场 checkout 切换。",
    "wrongReasons": {
      "b": "git branch dev 仅会创建一个新分支，但你的工作状态仍然会停留在当前的老分支上，不会发生自动跳转。",
      "c": "git status 仅展示工作目录状态，不接受 -b 参数新建分支。",
      "d": "git switch dev 可以切换分支，但必须是在 dev 分支已经存在的前提下，无法快捷在新建时自动合并切换（除非使用 git switch -c dev）。"
    },
    "skillTags": [
      "git",
      "cli",
      "branch"
    ],
    "relatedCommand": "git checkout -b dev",
    "estimatedTime": 35,
    "mnemonic": "新建并切分支：git checkout -b <名>（或 git switch -c）。"
  },
  {
    "id": "devops-basic-k8s-deployment",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "K8s Deployment 作用",
    "prompt": "在 Kubernetes 中，用来声明式管理 Pod 无状态多副本集、自动控制滚动更新和升级回滚的资源控制器是？",
    "options": [
      {
        "id": "a",
        "text": "Service"
      },
      {
        "id": "b",
        "text": "Deployment"
      },
      {
        "id": "c",
        "text": "ConfigMap"
      },
      {
        "id": "d",
        "text": "StatefulSet"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "Deployment 封装了 ReplicaSet。只要声明所需要的副本数，它就会驱动集群状态向期望状态对齐，实现零停机的滚动发版。",
    "wrongReasons": {
      "c": "ConfigMap 存储非机密的应用配置文件信息。",
      "a": "Service 提供容器群访问的网络负载均衡路由，不管理容器实例生命周期扩缩容。",
      "d": "StatefulSet 专门负责有状态应用（如 MySQL 集群）的顺序部署和固定标识管理。"
    },
    "skillTags": [
      "kubernetes",
      "deployment",
      "k8s"
    ],
    "relatedCommand": "kubectl apply -f deployment.yaml",
    "estimatedTime": 35,
    "mnemonic": "无状态多副本+滚动更新用 Deployment。"
  },
  {
    "id": "devops-basic-k8s-namespace",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "K8s 命名空间隔离",
    "prompt": "在同一个 K8s 物理集群内，为了把开发环境（dev）和测试环境（test）的 Pod 容器进行逻辑隔离、权限分区，应为它们划分不同的？",
    "options": [
      {
        "id": "a",
        "text": "Node (物理节点)"
      },
      {
        "id": "b",
        "text": "Ingress (边缘反向代理)"
      },
      {
        "id": "c",
        "text": "Namespace (命名空间)"
      },
      {
        "id": "d",
        "text": "Volume (共享存储卷)"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "Namespace（命名空间）提供了一种在集群内部实现资源逻辑分组隔离的机制，可以让不同命名空间存在重名的服务。",
    "wrongReasons": {
      "a": "Node 代表宿主机，在 Node 级别做物理划分成本极高且不利于集群资源的高密池化共享。",
      "d": "Volume 是容器的文件系统挂载插件。",
      "b": "Ingress 负责处理外部 HTTP/HTTPS 入向流量的路由分流。"
    },
    "skillTags": [
      "kubernetes",
      "namespace",
      "k8s"
    ],
    "relatedCommand": "kubectl get pods -n dev",
    "estimatedTime": 35,
    "mnemonic": "环境逻辑隔离用 Namespace。"
  },
  {
    "id": "devops-basic-k8s-configmap",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "K8s ConfigMap 与 Secret",
    "prompt": "在 Kubernetes 环境中，为了防止敏感的“数据库登录密码”在 Git 版本控制中明文泄露，应将密码以哪种 K8s 资源进行保管和注入？",
    "options": [
      {
        "id": "a",
        "text": "ConfigMap"
      },
      {
        "id": "b",
        "text": "Secret"
      },
      {
        "id": "c",
        "text": "Deployment"
      },
      {
        "id": "d",
        "text": "Service"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "Secret 专门用于存放敏感数据（如密码、API Key、数字证书），默认以 Base64 进行简单混淆，并限制集群内的非必要读取权限。",
    "wrongReasons": {
      "a": "ConfigMap 专用于管理普通的明文配置文件，放在这里有被误读取明文泄露的风险。",
      "c": "Deployment 是无状态 Pod 调度控制器，不适合存放离散凭据。",
      "d": "Service 处理路由。"
    },
    "skillTags": [
      "kubernetes",
      "secret",
      "security"
    ],
    "relatedCommand": "kubectl create secret generic db-pass --from-literal=password=123",
    "estimatedTime": 35,
    "mnemonic": "K8s 存密码用 Secret；普通配置用 ConfigMap。"
  },
  {
    "id": "devops-basic-git-merge",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "Git 分支合并",
    "prompt": "将分支 `feature-user` 中的最新开发成果彻底并入当前所在的 `main` 分支中，通常运行？",
    "options": [
      {
        "id": "a",
        "text": "git clone feature-user"
      },
      {
        "id": "b",
        "text": "git merge feature-user"
      },
      {
        "id": "c",
        "text": "git init feature-user"
      },
      {
        "id": "d",
        "text": "git branch feature-user"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "git merge [分支名] 会尝试将指定分支的 commits 合并进当前的活动 HEAD 分支。",
    "wrongReasons": {
      "d": "git branch 仅能列出或新建分支，不能执行分支代码的融合合并动作。",
      "a": "git clone 用于下载网络仓库到本地物理硬盘。",
      "c": "git init 用于初始化新建一个空的 Git 本地物理代码库目录。"
    },
    "skillTags": [
      "git",
      "cli",
      "merge"
    ],
    "relatedCommand": "git merge --no-ff dev",
    "estimatedTime": 30,
    "mnemonic": "合并分支：git merge <分支>。"
  },
  {
    "id": "devops-basic-docker-states",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "Docker 容器状态",
    "prompt": "如果 Docker 容器内的 1 号进程（主应用）由于内存溢出或意外崩溃退出，该容器在 `docker ps -a` 列表中通常会呈现什么状态？",
    "options": [
      {
        "id": "a",
        "text": "Exited (退出状态)"
      },
      {
        "id": "b",
        "text": "Paused (暂停挂起状态)"
      },
      {
        "id": "c",
        "text": "Up / Running (正在运行)"
      },
      {
        "id": "d",
        "text": "Starting (正在启动)"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "Docker 容器的生命周期与它内部的 1 号进程绑定。只要主进程挂掉或正常执行结束，容器就会自动转为 Exited（退出）并释放 CPU/RAM。",
    "wrongReasons": {
      "c": "1 号进程已死，容器无法保持正常的 Running 运行态。",
      "b": "Paused 状态需要运维手动调用 docker pause 发送 SIGSTOP 信号暂停，应用挂掉不会自主进入暂停。",
      "d": "Starting 仅发生在容器初次初始化建立进程时。"
    },
    "skillTags": [
      "docker",
      "lifecycle",
      "diagnostics"
    ],
    "relatedCommand": "docker inspect my-container | grep State",
    "estimatedTime": 35,
    "mnemonic": "1 号进程退出，容器变 Exited。"
  },
  {
    "id": "devops-basic-docker-rm",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "删除容器与删除镜像",
    "prompt": "关于 Docker 命令 `docker rm` 与 `docker rmi` 的区别，以下哪个描述是正确的？",
    "options": [
      {
        "id": "a",
        "text": "两者用法完全相同，互为同义别名"
      },
      {
        "id": "b",
        "text": "docker rm 用于删除容器，docker rmi 用于删除本地的只读镜像"
      },
      {
        "id": "c",
        "text": "docker rm 专门用来重新开机启动容器"
      },
      {
        "id": "d",
        "text": "docker rm 用于删除只读镜像，docker rmi 用于删除宿主机物理网卡"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "rm 代表 Remove Container（删除容器），rmi 代表 Remove Image（删除镜像，这里的 i 即 image 缩写）。",
    "wrongReasons": {
      "d": "rmi 后缀 i 代表 image，而不是 network interface 网卡，软件命令也无法删除物理机器物理卡。",
      "a": "一个管理容器，一个管理镜像，接收的参数和处理的数据对象截然不同。",
      "c": "开启容器使用 docker start，而不是删除 rm。"
    },
    "skillTags": [
      "docker",
      "cli",
      "clean"
    ],
    "relatedCommand": "docker rm container_id && docker rmi image_name",
    "estimatedTime": 35,
    "mnemonic": "docker rm 删容器，rmi 删镜像(i=image)。"
  },
  {
    "id": "devops-basic-registry",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "Docker 镜像中心仓库",
    "prompt": "企业为了安全保管、统一分发和版本拉取自己打包的内部 Docker 业务镜像，需要部署和维护哪个平台？",
    "options": [
      {
        "id": "a",
        "text": "代码托管平台 (GitLab / GitHub)"
      },
      {
        "id": "b",
        "text": "关系数据库集群 (MySQL RDS)"
      },
      {
        "id": "c",
        "text": "边缘分发网络 (CDN)"
      },
      {
        "id": "d",
        "text": "私有镜像中心 / 镜像仓库 (Registry / Harbor)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "Docker Registry（如 Harbor、Nexus、阿里云容器镜像服务 ACR）负责存储打包好的物理镜像层文件，并提供 pull/push 协议控制。",
    "wrongReasons": {
      "a": "GitLab 负责存放纯文本的源代码并进行历史 commit 跟踪，虽然有些集成了 registry 插件，但代码托管本身不能直接当作专用的 Docker 镜像仓库。",
      "b": "MySQL 是结构化数据存储，不适合存放动辄几百 MB 甚至是几 GB 的大型分层二进制镜像文件包。",
      "c": "CDN 仅是静态资源分发的加速代理缓存。"
    },
    "skillTags": [
      "docker",
      "harbor",
      "registry"
    ],
    "relatedCommand": "docker login harbor.mycompany.com",
    "estimatedTime": 35,
    "mnemonic": "私有镜像统一分发用 Registry/Harbor。"
  },
  {
    "id": "devops-basic-iac",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "基础设施即代码 IaC",
    "prompt": "抛弃人肉在云控制台用鼠标点击按钮，而是把所需要的 VPC、ECS、RDS 规格写在声明式配置文件中，通过运行脚本自动在多区域秒级开辟一整套网络和主机的工程技术是？",
    "options": [
      {
        "id": "a",
        "text": "代码单元测试与语法检查工具 (ESLint)"
      },
      {
        "id": "b",
        "text": "用户关系客户关系管理软件 (SaaS / Salesforce)"
      },
      {
        "id": "c",
        "text": "前端交互响应式样式设计 (Tailwind CSS)"
      },
      {
        "id": "d",
        "text": "基础设施即代码 (IaC - Infrastructure as Code / Terraform)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "IaC 使得硬件资源的开辟和销毁可以和代码一样享受版本控制、协作审批和自动化执行，极大地减少了人为误操作风险。最著名的工具是 Terraform。",
    "wrongReasons": {
      "c": "Tailwind CSS 仅用于浏览器前端界面排版布局样式开发。",
      "b": "CRM 软件用于销售管理和客户关系梳理。",
      "a": "ESLint 用于静态校验 JS/TS 的语法和格式错误，不管理物理硬件的开辟。"
    },
    "skillTags": [
      "devops",
      "iac",
      "terraform"
    ],
    "relatedCommand": "terraform apply",
    "estimatedTime": 40,
    "mnemonic": "声明式开资源=IaC（Terraform）。"
  },
  {
    "id": "devops-basic-git-pr",
    "category": "devops",
    "type": "single",
    "level": "basic",
    "title": "合并请求 PR / MR",
    "prompt": "在团队协作开发中，研发人员将分支代码编写测试完后，要并入主干 `main`，提倡在代码托管平台上提交什么请求，以便由资深架构师进行 Code Review（代码审查）？",
    "options": [
      {
        "id": "a",
        "text": "云账号权限划拨请求 (IAM Policy)"
      },
      {
        "id": "b",
        "text": "故障工单派单通知 (Ticket)"
      },
      {
        "id": "c",
        "text": "合并请求 / 拉取请求 (Pull Request / Merge Request)"
      },
      {
        "id": "d",
        "text": "网络连通性探测通知"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "PR/MR 提供了一个网页端的差异审查界面，允许团队成员对变更代码写行级批注、讨论，确认无误且 CI 门槛测试通过后再予以正式 merge 并入。",
    "wrongReasons": {
      "b": "Ticket 工单用于反馈生产故障，不用于日常研发团队的源码合分支审批管理。",
      "a": "IAM 权限申请是运维向安全部门要账号权限的行为。",
      "d": "网络探测仅测试网络联通。"
    },
    "skillTags": [
      "git",
      "github",
      "collaboration"
    ],
    "relatedCommand": "Submit Pull Request on GitHub UI",
    "estimatedTime": 30,
    "mnemonic": "并主干前提 Code Review，提 PR/MR。"
  },
  {
    "id": "middleware-basic-http-codes",
    "category": "middleware",
    "type": "multiple",
    "level": "basic",
    "title": "经典 HTTP 状态码",
    "prompt": "在排查前端和 Nginx 反向代理报错时，以下哪三个 HTTP 状态码的含义与其相对应？",
    "options": [
      {
        "id": "a",
        "text": "500 Internal Server Error (后端业务代码抛出未捕获异常崩溃)"
      },
      {
        "id": "b",
        "text": "404 Not Found (服务器上找不到该 URL 请求的物理资源)"
      },
      {
        "id": "c",
        "text": "200 OK (请求成功且正常返回数据)"
      },
      {
        "id": "d",
        "text": "3306 Redirect (网页成功重定向到 MySQL)"
      }
    ],
    "answer": [
      "a",
      "b",
      "c"
    ],
    "explanation": "状态码分类：2xx 代表成功；3xx 代表重定向；4xx 代表客户端错误（找不到页面等）；5xx 代表服务端业务组件报错或超时。",
    "wrongReasons": {
      "d": "3306 是 MySQL 默认网络通信端口，完全不属于 HTTP 协议定义的状态码集合中，3306 没有任何重定向含义。"
    },
    "skillTags": [
      "http",
      "nginx",
      "troubleshooting"
    ],
    "relatedCommand": "tail -f /var/log/nginx/access.log | awk '{print $9}'",
    "estimatedTime": 35,
    "mnemonic": "状态码：2xx 成功、3xx 重定向、4xx 客户端错、5xx 服务端错。"
  },
  {
    "id": "middleware-basic-redis-get-set",
    "category": "middleware",
    "type": "command",
    "level": "basic",
    "title": "Redis 键值基础命令",
    "prompt": "在 redis-cli 中，将键 `user_1` 的值设置为 `Alice`，并随后读取出来的正确操作命令是？",
    "options": [
      {
        "id": "a",
        "text": "SET user_1 Alice 紧接 GET user_1"
      },
      {
        "id": "b",
        "text": "ADD user_1 Alice 紧接 PRINT user_1"
      },
      {
        "id": "c",
        "text": "PUT user_1 Alice 紧接 READ user_1"
      },
      {
        "id": "d",
        "text": "INSERT user_1 Alice 紧接 SELECT user_1"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "Redis 缓存的 String 类型中，SET 用于写入或更新 key，GET 用于读取已存在的键。",
    "wrongReasons": {
      "c": "PUT 和 READ 不是 Redis 原生的基本键值操作指令。",
      "b": "ADD 通常是 Hash/Set 的某些子操作或者其他库语法，PRINT 也无法获取键值内容。",
      "d": "INSERT 和 SELECT 是关系数据库 SQL 规范的关键字，Redis 不支持该形式 SQL 命令。"
    },
    "skillTags": [
      "redis",
      "cli",
      "cache"
    ],
    "relatedCommand": "redis-cli SET key value && redis-cli GET key",
    "estimatedTime": 30,
    "mnemonic": "Redis：SET 写，GET 读。"
  },
  {
    "id": "middleware-basic-sql-insert",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "SQL 数据插入",
    "prompt": "在关系型数据库中，往名为 `logs` 的数据表中新插入一行记录的正确 SQL 语法是？",
    "options": [
      {
        "id": "a",
        "text": "ADD TO logs SET level=\"ERROR\", message=\"Disk Full\";"
      },
      {
        "id": "b",
        "text": "CREATE ROW IN logs VALUES (\"ERROR\", \"Disk Full\");"
      },
      {
        "id": "c",
        "text": "SELECT * FROM logs INSERT VALUES (\"ERROR\", \"Disk Full\");"
      },
      {
        "id": "d",
        "text": "INSERT INTO logs (level, message) VALUES (\"ERROR\", \"Disk Full\");"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "INSERT INTO [表名] (列名...) VALUES (具体值...) 是 SQL 标准写入语法。",
    "wrongReasons": {
      "a": "ADD TO 不是标准的 SQL 插入关键字。",
      "b": "CREATE ROW 是不符合 SQL 语法规范的乱拼造句。",
      "c": "SELECT 用于查询，不能在此结构后直接拼接插入动作。"
    },
    "skillTags": [
      "mysql",
      "sql",
      "database"
    ],
    "relatedCommand": "INSERT INTO user (name) VALUES (\"Tom\");",
    "estimatedTime": 35,
    "mnemonic": "插入：INSERT INTO 表(列) VALUES(值)。"
  },
  {
    "id": "middleware-basic-sql-update",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "SQL 数据更新",
    "prompt": "要将数据库表 `users` 中，用户名 `Tom` 的状态字段 `status` 更新修改为 `active`，应执行？",
    "options": [
      {
        "id": "a",
        "text": "SET users VALUE status = \"active\" IF name = Tom;"
      },
      {
        "id": "b",
        "text": "UPDATE users VALUE status = \"active\" WHEN name = \"Tom\";"
      },
      {
        "id": "c",
        "text": "CHANGE users SET status = \"active\" WHERE name = \"Tom\";"
      },
      {
        "id": "d",
        "text": "UPDATE users SET status = \"active\" WHERE name = \"Tom\";"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "SQL 修改语法结构为 UPDATE [表名] SET [列名=新值] WHERE [条件]，如果遗漏 WHERE 条件会导致全表数据被误修改。",
    "wrongReasons": {
      "b": "UPDATE 不使用 VALUE 和 WHEN 语法，应该用 SET 和 WHERE。",
      "c": "CHANGE 用于修改列定义（DDL）或者在特定数据库中，不是更新行记录的 SQL 语法字。",
      "a": "语法错误，SET 不能作为 DML 修改语句的首部前导词。"
    },
    "skillTags": [
      "mysql",
      "sql",
      "database"
    ],
    "relatedCommand": "UPDATE config SET val=\"8080\" WHERE key=\"port\";",
    "estimatedTime": 35,
    "mnemonic": "更新：UPDATE 表 SET 列=值 WHERE 条件（别漏 WHERE）。"
  },
  {
    "id": "middleware-basic-sql-delete",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "SQL 数据删除",
    "prompt": "要从数据库表 `orders` 中删除订单号 `ID` 为 `1001` 的那一行数据，应执行什么 SQL 语句？",
    "options": [
      {
        "id": "a",
        "text": "DROP ROW FROM orders WITH ID = 1001;"
      },
      {
        "id": "b",
        "text": "REMOVE FROM orders WHERE ID = 1001;"
      },
      {
        "id": "c",
        "text": "DELETE * FROM orders WHERE ID = 1001;"
      },
      {
        "id": "d",
        "text": "DELETE FROM orders WHERE ID = 1001;"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "DELETE FROM [表名] WHERE [条件] 是标准的删除数据行语法。",
    "wrongReasons": {
      "b": "REMOVE 不是 SQL 数据操纵语言（DML）的合法删除关键字。",
      "a": "DROP 通常用于物理删除整个表（DROP TABLE）或整个数据库，不用于过滤删除行。",
      "c": "DELETE 后面不需要加星号（*），加星号是严重的 SQL 语法错误。"
    },
    "skillTags": [
      "mysql",
      "sql",
      "database"
    ],
    "relatedCommand": "DELETE FROM temp_logs WHERE created_at < \"2026-01-01\";",
    "estimatedTime": 35,
    "mnemonic": "删除：DELETE FROM 表 WHERE 条件（不加 *）。"
  },
  {
    "id": "middleware-basic-db-index",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "数据库索引作用",
    "prompt": "在一张拥有一千万行记录的表中执行 `SELECT` 查询极慢，给条件查询列创建“索引（Index）”带来的最主要技术收益是？",
    "options": [
      {
        "id": "a",
        "text": "自动对保存在磁盘上的表数据进行无损体积压缩"
      },
      {
        "id": "b",
        "text": "让数据库在服务器发生突然断电时绝对不会丢失一秒的数据"
      },
      {
        "id": "c",
        "text": "能够彻底消除开发人员编写的所有错别字 SQL 语法错误"
      },
      {
        "id": "d",
        "text": "使数据库无需全表物理扫描，通过索引结构（如 B+ 树）秒级定位到匹配行"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "索引相当于书本的目录，通过建立高效的排序数据结构，能将全表扫描（时间复杂度 O(N)）降低为二分查找级（O(log N)）。",
    "wrongReasons": {
      "a": "索引本身会占用额外磁盘空间，不仅不压缩，反而会使磁盘总物理大小有所膨胀。",
      "b": "数据不丢失是靠双写缓冲区、Redo Log 刷盘策略（如 fsync）保障，索引不负责掉电防丢失。",
      "c": "如果 SQL 写错，数据库解析器依然会报错拒绝执行，索引无法修正错别字。"
    },
    "skillTags": [
      "mysql",
      "index",
      "performance"
    ],
    "relatedCommand": "CREATE INDEX idx_user_id ON orders(user_id);",
    "estimatedTime": 40,
    "mnemonic": "索引=目录，免全表扫描，B+ 树秒级定位。"
  },
  {
    "id": "middleware-basic-db-primary-key",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "数据库主键定义",
    "prompt": "在设计关系型数据库表时，被指定为“主键（Primary Key）”的字段，其数据约束特征是？",
    "options": [
      {
        "id": "a",
        "text": "主键值会自动在用户的浏览器端进行离线备份"
      },
      {
        "id": "b",
        "text": "主键只能用来保存英文文本"
      },
      {
        "id": "c",
        "text": "值必须全局唯一且绝对不允许为 NULL（空）"
      },
      {
        "id": "d",
        "text": "值可以任意重复但不能是整数类型"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "主键是表中每行记录的唯一物理标识，必须具有非空（NOT NULL）和唯一（UNIQUE）约束。",
    "wrongReasons": {
      "d": "主键绝对不允许重复，且最常采用自增的整数（INT/BIGINT）作为物理主键。",
      "a": "主键仅存在于服务端数据库引擎中，浏览器端不会自动离线备份。",
      "b": "主键可以采用整数、UUID 或者是自定义序列号，不是仅能保存英文。"
    },
    "skillTags": [
      "mysql",
      "database",
      "schema"
    ],
    "relatedCommand": "ALTER TABLE users ADD PRIMARY KEY (id);",
    "estimatedTime": 30,
    "mnemonic": "主键=唯一且非空(NOT NULL + UNIQUE)。"
  },
  {
    "id": "middleware-basic-db-acid",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "数据库事务 ACID",
    "prompt": "在数据库事务管理中，ACID 中的“A”（Atomicity - 原子性）指的是？",
    "options": [
      {
        "id": "a",
        "text": "表示数据库的物理机柜由原子能发电机进行供电"
      },
      {
        "id": "b",
        "text": "数据库会自动把所有的中文转码为原子编码"
      },
      {
        "id": "c",
        "text": "事务中的所有操作要么全部成功执行，要么全部失败回滚（如同一个不可分割的原子）"
      },
      {
        "id": "d",
        "text": "保证每一个 CPU 核心都在运行同一个数据库脚本"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "原子性确保事务操作的完整。如果银行转账在中途崩溃，扣钱成功但加钱失败，数据库会利用 Undo Log 自动回滚，确保要么两步都成功，要么像没发生过一样。",
    "wrongReasons": {
      "a": "物理机电属于民用设施电力，不是数据库事务的原子性（Atomicity）学术含义。",
      "d": "CPU 核心调度属于系统内核的线程调度逻辑，不定义事务特性。",
      "b": "转码由数据库字符集（如 UTF8）处理。"
    },
    "skillTags": [
      "mysql",
      "transaction",
      "acid"
    ],
    "relatedCommand": "START TRANSACTION; ... COMMIT; ROLLBACK;",
    "estimatedTime": 35,
    "mnemonic": "ACID 的 A=原子性：要么全成，要么全回滚。"
  },
  {
    "id": "middleware-basic-jvm-role",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "JVM 的基本作用",
    "prompt": "在运行 Java 应用（如 Spring Boot 后端服务）时，JVM（Java 虚拟机）的核心职责是？",
    "options": [
      {
        "id": "a",
        "text": "提供解释并执行编译好的 Java 字节码（.class 文件）的跨平台运行环境"
      },
      {
        "id": "b",
        "text": "物理连接多台服务器网线以扩充带宽"
      },
      {
        "id": "c",
        "text": "代替前端浏览器对 HTML 页面进行渲染排版"
      },
      {
        "id": "d",
        "text": "在网络上直接阻挡黑客发起的 DDoS 洪水流量"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "JVM（Java Virtual Machine）使得 Java 实现了“一次编写，到处运行（Write Once, Run Anywhere）”，将字节码翻译为特定宿主机的机器码执行。",
    "wrongReasons": {
      "d": "DDoS 防范由防火墙或云平台的 Anti-DDoS 硬件和高防 IP 提供，JVM 处于应用内，无法防堵。",
      "c": "浏览器渲染（Blink / WebKit 内核）运行在客户端计算机上，不是运行在服务端的 JVM 的功能。",
      "b": "网线是物理线路接入，JVM 属于软件虚拟机软件，无法连接物理实体网卡水晶头。"
    },
    "skillTags": [
      "java",
      "jvm",
      "runtime"
    ],
    "relatedCommand": "java -jar app.jar",
    "estimatedTime": 30,
    "mnemonic": "JVM=跨平台执行 Java 字节码的运行环境。"
  },
  {
    "id": "middleware-basic-kafka-topic",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "Kafka Topic 概念",
    "prompt": "在 Apache Kafka 分布式流平台中，用于对发送的数据流进行逻辑分类的归类主题通道名称是？",
    "options": [
      {
        "id": "a",
        "text": "消费者组 (Consumer Group)"
      },
      {
        "id": "b",
        "text": "代理 (Broker)"
      },
      {
        "id": "c",
        "text": "主题 (Topic)"
      },
      {
        "id": "d",
        "text": "分区 (Partition)"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "Topic 是 Kafka 划分消息的逻辑分类。生产者将消息发布到特定 Topic，消费者订阅对应的 Topic 来拉取数据。",
    "wrongReasons": {
      "a": "Consumer Group 是一组共享消费进度、实现并发消费消费的客户端群。",
      "d": "Partition 是 Topic 的物理分区切片，用于横向扩容分布式并行吞吐。",
      "b": "Broker 代表运行了 Kafka 服务进程的一个具体的物理/虚拟节点服务器实例。"
    },
    "skillTags": [
      "kafka",
      "middleware",
      "message-queue"
    ],
    "relatedCommand": "kafka-topics.sh --create --topic user-login-events --bootstrap-server localhost:9092",
    "estimatedTime": 35,
    "mnemonic": "Kafka 逻辑分类=Topic；物理切片=Partition。"
  },
  {
    "id": "middleware-basic-mq-pubsub",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "发布订阅 PubSub 模型",
    "prompt": "在消息队列中，发布/订阅（Publish/Subscribe）模型的核心通信特征是？",
    "options": [
      {
        "id": "a",
        "text": "一条消息在消费后，必须由用户在控制台手动点击确认才能发送下一条"
      },
      {
        "id": "b",
        "text": "消息只能从网页浏览器发送，不能通过后端代码发送"
      },
      {
        "id": "c",
        "text": "一条消息发布后，可以被多个不同的订阅消费者服务同时接收消费"
      },
      {
        "id": "d",
        "text": "发送方和接收方必须建立强同步的实时网络连接，否则会当场报错退出"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "发布订阅支持一对多广播。例如：订单创建消息发出后，积分服务、邮件服务、库存服务均能订阅并各自处理各自的逻辑。",
    "wrongReasons": {
      "a": "ACK 确认是客户端代码 API 自动驱动的（如 autoAck 或手工批量 ACK），不是人肉在控制台手动点击。",
      "d": "消息队列提供了异步性缓冲，发布者投递后即可返回，接收者即使此时宕机下线，消息依然会保存在 MQ 中，等接收者上线后再消费，实现了“解耦”。",
      "b": "消息几乎全是由后端的业务应用代码产生和发送的。"
    },
    "skillTags": [
      "middleware",
      "message-queue",
      "architecture"
    ],
    "relatedCommand": "Check RabbitMQ exchange bindings",
    "estimatedTime": 35,
    "mnemonic": "发布订阅=一条消息多个订阅者都能收。"
  },
  {
    "id": "middleware-basic-nginx-logs",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "Nginx 日志种类",
    "prompt": "在排查 Nginx 反向代理返回的网页“404 Not Found”或者“502 Bad Gateway”时，应该优先查看哪个 Nginx 日志文件？",
    "options": [
      {
        "id": "a",
        "text": "MySQL 的二进制增量事务日志 binlog"
      },
      {
        "id": "b",
        "text": "运行接入与错误日志 (access.log / error.log)"
      },
      {
        "id": "c",
        "text": "系统的垃圾回收日志 gc.log"
      },
      {
        "id": "d",
        "text": "内核的系统启动记录 /var/log/dmesg"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "access.log 会记录每一个请求的客户端 IP、URL、状态码（如 404/502）；error.log 记录 Nginx 自身的错误上下文和反向代理连接被拒细节。",
    "wrongReasons": {
      "c": "gc.log 是 Java 虚机 JVM 进行垃圾内存回收的日志，与 Nginx（C 语言编写且无 JVM）无关。",
      "d": "dmesg 记录 Linux 引导硬件及核心驱动状态，不包含 HTTP 请求状态。",
      "a": "binlog 是 MySQL 记录增删改事务以用于主从同步的，与 Nginx 代理报错无关。"
    },
    "skillTags": [
      "nginx",
      "logs",
      "troubleshooting"
    ],
    "relatedCommand": "tail -f /var/log/nginx/error.log",
    "estimatedTime": 35,
    "mnemonic": "Nginx 报错看 access.log / error.log。"
  },
  {
    "id": "middleware-basic-zookeeper",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "Zookeeper 协调服务",
    "prompt": "在老一代分布式集群或 Kafka 元数据管理中，常常用作分布式配置中心、集群节点命名与元数据注册的组件是？",
    "options": [
      {
        "id": "a",
        "text": "Nginx"
      },
      {
        "id": "b",
        "text": "Logstash"
      },
      {
        "id": "c",
        "text": "Apache ZooKeeper"
      },
      {
        "id": "d",
        "text": "Tomcat"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "ZooKeeper 提供强一致性（Paxos 派生的 ZAB 算法）的节点树状存储，常用作服务注册、发现及分布式锁。",
    "wrongReasons": {
      "a": "Nginx 负责反向代理和网页容器，不用于强一致性分布式锁与节点名称管理注册。",
      "d": "Tomcat 是普通的 Java Servlet 网页容器。",
      "b": "Logstash 是 ELK 中用于收集和过滤日志的管道组件。"
    },
    "skillTags": [
      "zookeeper",
      "middleware",
      "distributed-systems"
    ],
    "relatedCommand": "zkCli.sh -server 127.0.0.1:2181",
    "estimatedTime": 35,
    "mnemonic": "分布式协调/元数据注册用 ZooKeeper。"
  },
  {
    "id": "middleware-basic-redis-structs",
    "category": "middleware",
    "type": "multiple",
    "level": "basic",
    "title": "Redis 常用数据结构",
    "prompt": "在开发和运维配置中，Redis 原生支持并高频使用的三个经典数据结构类型是？",
    "options": [
      {
        "id": "a",
        "text": "字符串 (String)"
      },
      {
        "id": "b",
        "text": "关系数据库的表物理索引 (Primary Table)"
      },
      {
        "id": "c",
        "text": "哈希 (Hash)"
      },
      {
        "id": "d",
        "text": "列表 (List)"
      }
    ],
    "answer": [
      "a",
      "c",
      "d"
    ],
    "explanation": "Redis 提供了极其丰富的数据结构，除 String、Hash、List 外，还有 Set（无序集合）、ZSet（有序集合）、Bitmap 等。",
    "wrongReasons": {
      "b": "Redis 是 NoSQL 键值缓存，底层不管理任何关系数据库表的物理索引记录，不使用该术语定义。"
    },
    "skillTags": [
      "redis",
      "cache",
      "types"
    ],
    "relatedCommand": "redis-cli TYPE mykey",
    "estimatedTime": 35,
    "mnemonic": "Redis 常用结构：String/Hash/List（还有 Set/ZSet）。"
  },
  {
    "id": "middleware-basic-postgres-port",
    "category": "middleware",
    "type": "config",
    "level": "basic",
    "title": "PostgreSQL 默认端口",
    "prompt": "著名的开源对象关系型数据库系统 PostgreSQL 默认的监听连接端口号是？",
    "options": [
      {
        "id": "a",
        "text": "5432"
      },
      {
        "id": "b",
        "text": "1521"
      },
      {
        "id": "c",
        "text": "6379"
      },
      {
        "id": "d",
        "text": "3306"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "PostgreSQL 默认配置的网络监听端口是 TCP 5432。",
    "wrongReasons": {
      "d": "3306 是 MySQL 的默认端口。",
      "c": "6379 是 Redis 的默认端口。",
      "b": "1521 是 Oracle 甲骨文商业数据库的标准端口。"
    },
    "skillTags": [
      "postgresql",
      "port",
      "database"
    ],
    "relatedCommand": "pg_isready -h localhost -p 5432",
    "estimatedTime": 30,
    "mnemonic": "PostgreSQL=5432。"
  },
  {
    "id": "middleware-basic-nosql-diff",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "NoSQL 与关系库区别",
    "prompt": "相比于传统关系型数据库（如 MySQL），像 MongoDB、Redis 这类 NoSQL 非关系数据库最核心的模式特征是？",
    "options": [
      {
        "id": "a",
        "text": "必须且强依赖于购买 IBM 的专用大型物理主机"
      },
      {
        "id": "b",
        "text": "完全不允许通过网络进行远程连接访问"
      },
      {
        "id": "c",
        "text": "只能用来保存数字，绝对不能存储任何中文字符"
      },
      {
        "id": "d",
        "text": "通常不使用严格的表和列关联结构，支持更灵活的无 Schema/键值/文档存储"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "NoSQL（Not Only SQL）抛弃了传统的二维表严密约束（Schema），这使得它们极易水平扩容、极度适合多变数据和高并发的高速存取场景。",
    "wrongReasons": {
      "b": "NoSQL 都基于标准的 TCP/IP 套接字通信，完全且天然支持高并发的网络远程访问。",
      "a": "NoSQL 主要部署在普通的 x86 PC 架构或 ARM 服务器上，甚至单机即可启动。",
      "c": "它们支持存储 JSON 字符串、字节流，完全支持复杂的 Unicode 中文字符数据。"
    },
    "skillTags": [
      "nosql",
      "mongodb",
      "database"
    ],
    "relatedCommand": "redis-cli && mongosh",
    "estimatedTime": 35,
    "mnemonic": "NoSQL=无严格 Schema，灵活键值/文档，易水平扩。"
  },
  {
    "id": "middleware-basic-db-readwrite",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "读写分离架构",
    "prompt": "当应用系统的“查询请求量”远大于“写入请求量”，导致数据库实例被频繁查询拖垮时，最常见的基础架构调优方案是实现？",
    "options": [
      {
        "id": "a",
        "text": "禁止所有普通用户的查询请求，仅允许写入"
      },
      {
        "id": "b",
        "text": "将所有数据库表物理复制进 Nginx 服务器内存里"
      },
      {
        "id": "c",
        "text": "直接将数据库的主键字段全部删掉以提速"
      },
      {
        "id": "d",
        "text": "数据库读写分离（写主库，读从库群）"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "主从架构中，主库负责事务写改并实时同步日志给多个从库（Read Replica），读取流量打到只读的从库群上，以实现分流提速。",
    "wrongReasons": {
      "a": "禁止查询属于破坏业务使用体验的恶劣行为，不能作为调优架构。",
      "b": "Nginx 是反向代理代理，其内存空间无法作为数据库直接替代关系表运算。",
      "c": "删除主键会破坏行唯一索引定位，不仅不加速，反而会导致修改和查询因全表扫描变得极其低下。"
    },
    "skillTags": [
      "mysql",
      "architecture",
      "read-write-split"
    ],
    "relatedCommand": "Check master/slave replication status via SHOW REPLICA STATUS",
    "estimatedTime": 40,
    "mnemonic": "读多写少用读写分离：写主库、读从库。"
  },
  {
    "id": "middleware-basic-nginx-algorithms",
    "category": "middleware",
    "type": "multiple",
    "level": "basic",
    "title": "Nginx 负载均衡算法",
    "prompt": "在 Nginx 负载均衡（upstream）中，以下哪两个算法是最经典常用的流量分配方式？",
    "options": [
      {
        "id": "a",
        "text": "轮询 (Round Robin - 默认算法，按请求顺序循环分配)"
      },
      {
        "id": "b",
        "text": "AI 人工智能人脸识别负载分流"
      },
      {
        "id": "c",
        "text": "物理机网线电信号交叉检测法"
      },
      {
        "id": "d",
        "text": "源 IP 哈希 (ip_hash - 相同的客户端 IP 固定代理分配给同一台后端，解决会话 Session 共享问题)"
      }
    ],
    "answer": [
      "a",
      "d"
    ],
    "explanation": "轮询适合后端处理性能相仿的无状态容器；ip_hash 基于 IP 的哈希结果分发，能让单 IP 的客户端每次打到同一后端以保全缓存或会话。",
    "wrongReasons": {
      "c": "Nginx 是纯软件，不监测机房硬件网线交叉等电位波长。",
      "b": "四/七层软负载均衡器不需要使用人脸数据进行网络端口转发分配调度。"
    },
    "skillTags": [
      "nginx",
      "load-balancing",
      "config"
    ],
    "relatedCommand": "upstream backend { ip_hash; server 10.0.0.1; server 10.0.0.2; }",
    "estimatedTime": 35,
    "mnemonic": "Nginx 负载：轮询(默认) + ip_hash(会话保持)。"
  },
  {
    "id": "middleware-basic-memory-leak",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "内存泄漏定义",
    "prompt": "在程序运行中，所谓的“内存泄漏（Memory Leak）”是指？",
    "options": [
      {
        "id": "a",
        "text": "已分配的物理内存由于未能被代码正常释放，导致程序占用内存只增不减，最终耗尽系统资源"
      },
      {
        "id": "b",
        "text": "内存条的外部塑料外壳漏出了少量的电子保护液"
      },
      {
        "id": "c",
        "text": "程序在执行除以 0 时引发的浮点数运算错误"
      },
      {
        "id": "d",
        "text": "数据库在执行备份时，数据被黑客远程打包带走"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "内存泄漏导致这部分已死的内存既不能复用，也不能被系统重新划分，累积到极限会导致系统级 OOM（Out Of Memory）崩溃被系统强制杀死。",
    "wrongReasons": {
      "b": "内存条属于固态电子芯片，没有化学液态电子液的封装，这是荒谬的物理描述。",
      "d": "黑客拖库属于数据安全泄露，不属于进程运行层面的内存泄漏定义。",
      "c": "除以 0 会抛出 ZeroDivisionError 算术异常，不是内存空间回收的问题。"
    },
    "skillTags": [
      "middleware",
      "memory",
      "performance"
    ],
    "relatedCommand": "jmap -dump:format=b,file=heap.hprof <pid>",
    "estimatedTime": 35,
    "mnemonic": "内存泄漏=内存只增不减，最终 OOM。"
  },
  {
    "id": "middleware-basic-jvm-gc",
    "category": "middleware",
    "type": "single",
    "level": "basic",
    "title": "JVM 垃圾回收",
    "prompt": "在 Java 中，自动识别并清理内存中不再被引用的无用对象、释放内存空间的技术是？",
    "options": [
      {
        "id": "a",
        "text": "容器日志定期轮转 (Logrotate)"
      },
      {
        "id": "b",
        "text": "垃圾回收机制 (Garbage Collection / GC)"
      },
      {
        "id": "c",
        "text": "物理硬盘格式化工具 (format)"
      },
      {
        "id": "d",
        "text": "代码缓存静态编译机制"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "GC 是 JVM 的核心守护线程，自动追踪并判定内存中不被引用的死对象，从而释放堆空间，减轻了 Java 开发者手动 delete 释放内存的负担。",
    "wrongReasons": {
      "c": "硬盘格式化是擦除整个磁盘文件系统的物理操作，不作用于程序运行时内存的变量。",
      "a": "Logrotate 是 Linux 用来压缩和轮转清理磁盘上庞大日志文件的脚本工具。",
      "d": "编译机制将源码转化为可执行码，不负责运行中废弃对象的实时垃圾内存标记与清理。"
    },
    "skillTags": [
      "java",
      "gc",
      "jvm"
    ],
    "relatedCommand": "jstat -gcutil <pid> 1000",
    "estimatedTime": 35,
    "mnemonic": "Java 自动回收无用对象=GC。"
  },
  {
    "id": "sre-basic-oncall",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "On-call 值班定义",
    "prompt": "在 SRE 团队中，常说的“On-call”岗位职责是指？",
    "options": [
      {
        "id": "a",
        "text": "专门在上级来视察工作时代表大家上前大声发言问候"
      },
      {
        "id": "b",
        "text": "负责帮全体办公室的开发同事接听日常的快递推销电话"
      },
      {
        "id": "c",
        "text": "负责把公司的所有服务器搬运到大巴车里带去团建现场"
      },
      {
        "id": "d",
        "text": "在值班轮值期间，必须保持手机和警报系统畅通，随时响应并处理突发的生产故障告警"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "On-call 工程师是系统稳定性的第一防线。值班期间如果收到监控系统自动触发的紧急报警，必须在规定的时效（SLA 响应时长，如 5-15 分钟）内上线干预止血。",
    "wrongReasons": {
      "b": "快递管理属于前台或行政后勤的岗位范围，不是 SRE 技术值班的核心。",
      "c": "服务器部署在数据中心，不进行物理大巴搬运团建。",
      "a": "代表发言与 On-call 线上稳定性技术保障无涉。"
    },
    "skillTags": [
      "sre",
      "oncall",
      "incident"
    ],
    "relatedCommand": "Acknowledge pager alert",
    "estimatedTime": 35,
    "mnemonic": "On-call=值班期告警畅通，按时响应止血。"
  },
  {
    "id": "sre-basic-error-budget",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "错误预算 Error Budget",
    "prompt": "在 SRE 稳定性管理中，基于 SLO 指标计算得出的“错误预算（Error Budget）”最核心的指导含义是？",
    "options": [
      {
        "id": "a",
        "text": "用于为机房购买备用发电机所允许支出的财务采购限额"
      },
      {
        "id": "b",
        "text": "购买杀毒软件和防木马防火墙被批准的专用商业发票报销上限"
      },
      {
        "id": "c",
        "text": "系统允许发生故障和停机的余量额度，预算余额足时可加速功能发版，预算超支时应冻结发布、专攻稳定性"
      },
      {
        "id": "d",
        "text": "因为代码写错导致被行政扣减的总绩效资金额度"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "Error Budget = $100\\% - \\text{SLO}$。它是把研发（要快）和 SRE（要稳）绑在一起进行协同的量化指标，当错误预算超支，新功能发布会被自动拦截，转而消灭稳定性缺陷。",
    "wrongReasons": {
      "d": "这是科学的稳定性容忍上限指标，不等于行政扣罚员工工资的财务账目。",
      "a": "发电机属于物理设备资产采购，不是错误预算的含义。",
      "b": "杀毒软件预算由网络安全/财务部门的 IT 开支控制。"
    },
    "skillTags": [
      "sre",
      "error-budget",
      "slo"
    ],
    "relatedCommand": "Check Remaining Error Budget metrics",
    "estimatedTime": 40,
    "mnemonic": "错误预算=100%-SLO：有余量可发版，超支冻结发布。"
  },
  {
    "id": "sre-basic-mttr",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "平均恢复时间 MTTR",
    "prompt": "事故处理中，用于衡量 SRE 故障定位、抢修和系统恢复时效的核心稳定性度量指标是？",
    "options": [
      {
        "id": "a",
        "text": "MTTR (平均恢复/修复时间 - Mean Time To Repair)"
      },
      {
        "id": "b",
        "text": "CPU Utilization (物理核心使用率)"
      },
      {
        "id": "c",
        "text": "MTTD (平均检测时间 - Mean Time To Detect)"
      },
      {
        "id": "d",
        "text": "MTBF (平均无故障时间 - Mean Time Between Failures)"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "MTTR 代表从故障正式发生/确认开始，到系统被成功抢修、服务功能完全恢复的平均耗时，这个值越小说明恢复应急能力越快。",
    "wrongReasons": {
      "c": "MTTD 仅度量从故障发生到监控发现或值班人员收到报警响应并确认的检测时间差，不包括后续抢修恢复耗时。",
      "d": "MTBF 衡量系统两次故障之间的平均连续稳定运行时长，反映的是系统的可靠性基线。",
      "b": "CPU 使用率是物理资源占用指标，不反映故障抢修耗时。"
    },
    "skillTags": [
      "sre",
      "incident",
      "mttr"
    ],
    "relatedCommand": "Measure MTTR = Total Downtime / Incident Count",
    "estimatedTime": 35,
    "mnemonic": "MTTR=平均恢复/修复时间(越小越好)。"
  },
  {
    "id": "sre-basic-mttd",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "平均检测时间 MTTD",
    "prompt": "为了评估监控系统是否足够敏锐，从发生故障到值班运维人员收到并确认告警，这段时间差通常使用什么指标度量？",
    "options": [
      {
        "id": "a",
        "text": "MTTR (平均修复时间)"
      },
      {
        "id": "b",
        "text": "QPS (每秒查询并发率)"
      },
      {
        "id": "c",
        "text": "MTBF (平均无故障时间)"
      },
      {
        "id": "d",
        "text": "MTTD (平均检测时间)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "MTTD (Mean Time to Detect) 专门考核告警的灵敏度和值班工程师的响应时间，越小说明告警越及时。",
    "wrongReasons": {
      "a": "MTTR 覆盖了整个故障的处理全生命周期。",
      "c": "MTBF 关注两次故障之间的平均无故障间隔时间长。",
      "b": "QPS 是吞吐性能指标。"
    },
    "skillTags": [
      "sre",
      "monitoring",
      "mttd"
    ],
    "relatedCommand": "Calculate MTTD of target alarms",
    "estimatedTime": 30,
    "mnemonic": "MTTD=平均检测时间(多快发现告警)。"
  },
  {
    "id": "sre-basic-rca",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "根因分析 RCA",
    "prompt": "在事故复盘中，为了透过表面现象（如接口报错），一步步追溯追查到最深层的技术或管理根源，这一方法论在 SRE 中被称为？",
    "options": [
      {
        "id": "a",
        "text": "数据库静态性能审计"
      },
      {
        "id": "b",
        "text": "根因分析 (RCA - Root Cause Analysis)"
      },
      {
        "id": "c",
        "text": "代码自动编译脚本"
      },
      {
        "id": "d",
        "text": "错题复习 (Mistake Reviews)"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "RCA 常配合使用“5个为什么（5 Whys）”工具，深入排查最终的链路破损，旨在从根本上做架构加固和流程升级，而不是只做临时重启止血。",
    "wrongReasons": {
      "d": "错题复习是考生刷题学习系统中的备考学习行为。",
      "c": "编译脚本仅将代码转换为执行包。",
      "a": "性能审计是 SQL 的优化和配置审计，只属于 RCA 可借助的具体专项工具手段之一，不是方法论的通称。"
    },
    "skillTags": [
      "sre",
      "postmortem",
      "rca"
    ],
    "relatedCommand": "Conduct 5 Whys analysis in postmortem doc",
    "estimatedTime": 35,
    "mnemonic": "根因分析=RCA，常配 5 Whys。"
  },
  {
    "id": "sre-basic-dr",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "灾难恢复与防灾",
    "prompt": "当面对诸如地震、机房断网等灾难性事件时，企业为了保证业务数据的安全和系统生存能力，制定的技术灾备恢复工程被称为？",
    "options": [
      {
        "id": "a",
        "text": "容灾恢复 / 灾难恢复 (DR - Disaster Recovery / 灾备)"
      },
      {
        "id": "b",
        "text": "员工日常出勤打卡签到"
      },
      {
        "id": "c",
        "text": "项目功能测试与打包 (CI/CD)"
      },
      {
        "id": "d",
        "text": "微服务代码重构与解耦"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "DR（灾难恢复）包含跨地域物理异地备份、物理多活机房切换以及定期的容灾实战演练，旨在防范极端自然与社会灾难。",
    "wrongReasons": {
      "c": "功能打包仅确保应用程序能通过基本的代码编译及流水线分发。",
      "d": "代码重构能解决应用开发质量，但物理机房断电或地震断网等灾难仍必须依靠物理异地备灾架构来兜底。",
      "b": "打卡签到是行政出勤管理。"
    },
    "skillTags": [
      "sre",
      "disaster-recovery",
      "availability"
    ],
    "relatedCommand": "Trigger multi-active region traffic switchover",
    "estimatedTime": 35,
    "mnemonic": "灾难恢复=DR：异地备份+多活+演练。"
  },
  {
    "id": "sre-basic-rto",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "恢复时间目标 RTO",
    "prompt": "在灾备与业务连续性指标中，“RTO”（Recovery Time Objective - 恢复时间目标）具体代表？",
    "options": [
      {
        "id": "a",
        "text": "给全体运维工程师发放的每年年终奖财务计算周期"
      },
      {
        "id": "b",
        "text": "发生故障前，系统能够持续保持无故障运行的最短时长界限"
      },
      {
        "id": "c",
        "text": "灾难发生后，系统必须被成功抢修并恢复提供服务的最大允许时间窗口"
      },
      {
        "id": "d",
        "text": "在备份数据中，允许丢失的最大历史数据时间跨度"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "RTO 关注“业务停顿多久”。例如：定下的 RTO 为 2 小时，说明若发生主数据中心损坏，必须在 2 小时内将备用机房挂起并提供访问，否则就算灾备建设不达标。",
    "wrongReasons": {
      "b": "这是无故障运行时长，由 MTBF 度量。",
      "d": "数据丢失跨度是 RPO（Recovery Point Objective，恢复点目标）的定义。",
      "a": "财务年终奖周期由企业人事薪酬部门决定，不是技术灾备参数 RTO 的定义。"
    },
    "skillTags": [
      "sre",
      "disaster-recovery",
      "rto"
    ],
    "relatedCommand": "Verify RTO recovery window for main service group",
    "estimatedTime": 40,
    "mnemonic": "RTO=允许停机多久(时间窗口)。"
  },
  {
    "id": "sre-basic-rpo",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "恢复点目标 RPO",
    "prompt": "在灾备指标中，用于衡量在灾难中“由于备份频率限制而允许丢失的最大历史数据时长”的指标是？",
    "options": [
      {
        "id": "a",
        "text": "SLA (服务级别协议)"
      },
      {
        "id": "b",
        "text": "RTO (Recovery Time Objective - 恢复时间目标)"
      },
      {
        "id": "c",
        "text": "MTTR (平均修复时间)"
      },
      {
        "id": "d",
        "text": "RPO (Recovery Point Objective - 恢复点目标)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "RPO 关注“丢失多少数据”。如果每天凌晨做一次备份，若中午发生灾难数据盘物理损坏且不可修复，那么将丢失前天半夜到今天中午的数据，RPO 最大可能为 24 小时。",
    "wrongReasons": {
      "b": "RTO 衡量系统停机的时限跨度，不关注具体的数据丢失丢失截止点。",
      "c": "MTTR 是常规警报抢修的平均耗时指标。",
      "a": "SLA 是对客户的商业赔偿与可用度服务承诺范围。"
    },
    "skillTags": [
      "sre",
      "disaster-recovery",
      "rpo"
    ],
    "relatedCommand": "Configure replica log sync delay to lower RPO",
    "estimatedTime": 40,
    "mnemonic": "RPO=允许丢多少数据(数据时间点)。"
  },
  {
    "id": "sre-basic-circuit-breaker",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "熔断保护模式",
    "prompt": "为了防范分布式系统雪崩，当下游第三方支付接口频繁响应极其缓慢甚至大量超时报错时，本地业务快速切断对该第三方的调用、直接返回本地的降级兜底数据，这种防护设计是？",
    "options": [
      {
        "id": "a",
        "text": "修改数据库的端口号为随机高端口"
      },
      {
        "id": "b",
        "text": "将服务器网线拔掉让应用彻底停止关机"
      },
      {
        "id": "c",
        "text": "直接用脚本去无限暴力重试发起网络访问"
      },
      {
        "id": "d",
        "text": "熔断器 / 熔断降级模式 (Circuit Breaker)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "熔断器模拟物理电表，当检测到失败率或超时达到水位阈值，会自动断开（Open 状态），阻止新流量打过去拖垮本地调用线程，一段时间后再尝试半开（Half-Open）恢复。",
    "wrongReasons": {
      "c": "无限暴力重试会在下游已经雪崩的情况下，进一步发送海量垃圾流量，导致下游彻底无法恢复，同时也卡死本端线程。",
      "b": "暴力拔线关机会使整个业务全盘瘫痪，这绝不是高可靠的在线降级自愈技术。",
      "a": "端口修改不能阻止应用内 RPC 超时卡死问题。"
    },
    "skillTags": [
      "sre",
      "architecture",
      "circuit-breaker"
    ],
    "relatedCommand": "Check Sentinel/Resilience4j dashboard metrics",
    "estimatedTime": 40,
    "mnemonic": "下游频繁超时就熔断降级=Circuit Breaker。"
  },
  {
    "id": "sre-basic-canary",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "金丝雀发布定义",
    "prompt": "发布新功能代码时，先单独切 1% 的真实用户小流量打到新版本容器上，观察一段时间无告警报错后，再逐步扩容至 100%，这种安全发布策略是？",
    "options": [
      {
        "id": "a",
        "text": "将所有数据库的所有历史数据彻底抹除后部署"
      },
      {
        "id": "b",
        "text": "直接将新版本全量覆盖替换掉所有运行中的旧容器"
      },
      {
        "id": "c",
        "text": "金丝雀发布 / 灰度发布 (Canary Deployment)"
      },
      {
        "id": "d",
        "text": "把代码的文字注释全部翻译成英文后再发版"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "金丝雀（Canary）得名于煤矿工人用金丝雀检测有毒气体。通过极小比例灰度分流，一旦发现新版本有严重 bug 阻断，仅影响 1% 流量，可秒级回滚。",
    "wrongReasons": {
      "b": "全量直接覆盖属于暴力发版，一旦新代码有灾难性报错，全站会当场彻底瘫痪，回滚极慢。",
      "d": "翻译英文注释是编码规范问题，与发布阶段的流量灰度风控策略无关。",
      "a": "抹除数据库是毁灭性破坏，不是安全发布的策略。"
    },
    "skillTags": [
      "sre",
      "deployment",
      "canary"
    ],
    "relatedCommand": "Update ingress-nginx route annotation weight=10",
    "estimatedTime": 35,
    "mnemonic": "小流量先发再放量=金丝雀/灰度发布。"
  },
  {
    "id": "sre-basic-rate-limit",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "限流与防刷",
    "prompt": "面对恶意的爬虫强刷接口或突发的爆满抢购流量，系统为了自我保护，将单 IP 每秒的最大访问频次强制限制为不超过 10 次，超出直接丢弃，这种策略被称为？",
    "options": [
      {
        "id": "a",
        "text": "灾难数据备份 (Backup)"
      },
      {
        "id": "b",
        "text": "限流 / 节流 (Rate Limiting / Throttling)"
      },
      {
        "id": "c",
        "text": "链路智能解析 (DNS)"
      },
      {
        "id": "d",
        "text": "负载均衡 (Load Balancing)"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "限流（如令牌桶/漏桶算法）限制了进入系统的最大吞吐请求数，确保即使遭受外界爬虫恶意轰炸，系统仍然能保持稳定，为已接入的正常用户提供响应。",
    "wrongReasons": {
      "d": "负载均衡负责将流量均匀分给后端主机，不限制总的请求频次。",
      "a": "备份是数据容灾，不能在实时链路上限流防护高并发。",
      "c": "DNS 路由负责域名解析，不识别单个 Web HTTP 接口的应用级请求频次拦截。"
    },
    "skillTags": [
      "sre",
      "security",
      "rate-limiting"
    ],
    "relatedCommand": "Configure nginx limit_req_zone",
    "estimatedTime": 35,
    "mnemonic": "限单位时间请求数自保=限流(令牌桶/漏桶)。"
  },
  {
    "id": "sre-basic-graceful-shutdown",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "优雅停机 grace",
    "prompt": "在容器重新部署或进程关闭时，应用必须先停止接收新请求，并将内存中已经接收的现有业务请求处理完毕后再退出，这一流程是？",
    "options": [
      {
        "id": "a",
        "text": "暴力断电杀死 (kill -9)"
      },
      {
        "id": "b",
        "text": "全库数据表强行置为只读模式"
      },
      {
        "id": "c",
        "text": "虚拟机突然拔网线物理隔离"
      },
      {
        "id": "d",
        "text": "优雅关闭 / 优雅停机 (Graceful Shutdown)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "优雅停机能避免正在执行转账或订单结算的用户请求因为服务器发布重启而突然被拦腰截断报错，是保证发布质量和一致性的基本要求。",
    "wrongReasons": {
      "a": "kill -9 会立即终止进程释放内存，正在执行事务的线程会突然死亡，导致数据不一致或用户收到报错。",
      "c": "拔网线和 kill -9 一样会导致运行中的请求被异常阻断。",
      "b": "数据库只读属于数据库维护状态，不能解决应用服务器 JVM 线程被中途强杀的问题。"
    },
    "skillTags": [
      "sre",
      "lifecycle",
      "graceful-shutdown"
    ],
    "relatedCommand": "kubectl deployment spec preStop lifecycle hooks",
    "estimatedTime": 35,
    "mnemonic": "停新请求、处理完再退=优雅停机。"
  },
  {
    "id": "sre-basic-monitoring-types",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "白盒与黑盒监控",
    "prompt": "不涉及系统内部状态，仅从外部模拟用户网络请求来探测服务的可用性（如定期对接口发起 HTTP GET 探测），这种监控手段属于？",
    "options": [
      {
        "id": "a",
        "text": "静态代码安全审计 (SAST)"
      },
      {
        "id": "b",
        "text": "黑盒监控 (Blackbox Monitoring)"
      },
      {
        "id": "c",
        "text": "白盒监控 (Whitebox Monitoring)"
      },
      {
        "id": "d",
        "text": "性能分析监控 (Profiling)"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "黑盒监控（如 Prometheus Blackbox Exporter、Pingdom）不依赖系统内部的指标上报，仅从外部链路真实调用以评估可用性；白盒监控则分析系统内部数据（如虚机 CPU、JVM 堆大小、数据库锁）。",
    "wrongReasons": {
      "c": "白盒监控必须读取和依赖系统内部透出的核心健康指标。",
      "d": "性能分析用于追踪内存堆栈调用瓶颈，与外部网络可用性探测不同。",
      "a": "安全审计是离线扫描源码安全隐患，不进行在线网络探活动作。"
    },
    "skillTags": [
      "sre",
      "monitoring",
      "blackbox"
    ],
    "relatedCommand": "Run prometheus blackbox-exporter probe",
    "estimatedTime": 35,
    "mnemonic": "只从外部探活=黑盒；看内部指标=白盒。"
  },
  {
    "id": "sre-basic-backup-test",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "备份可用性验证",
    "prompt": "为了防范“备份文件损坏，导致发生故障时备份根本无法用于恢复数据”的隐蔽隐患，SRE 提倡的最稳妥策略是？",
    "options": [
      {
        "id": "a",
        "text": "将同一个备份文件复制一百万份并堆放在同一个硬盘上"
      },
      {
        "id": "b",
        "text": "定期对备份数据进行实际的还原演练和完整性校验校验验证"
      },
      {
        "id": "c",
        "text": "强制让研发用纯手写的方式重新编写历史交易流水记录"
      },
      {
        "id": "d",
        "text": "彻底不再对任何系统和数据库做任何物理数据备份"
      }
    ],
    "answer": [
      "b"
    ],
    "explanation": "没有经过验证的备份等于没有备份。很多企业在发生严重敲诈病毒或硬件损坏后才发现备份文件早已在半年前就写入报错损坏了。定期还原演练是验证可用性的唯一准绳。",
    "wrongReasons": {
      "a": "备份文件损坏若是源头导致的，复制一万份也依然是坏的，且堆放在单块硬盘上如果该硬盘物理损坏，所有副本会一次性全部丢失。",
      "d": "放弃备份会使企业在遭遇敲诈病毒时彻底倒闭，属于极度危险和不负责任的技术决策。",
      "c": "手写历史流水不现实，耗时且无法恢复精确到毫秒的数据一致性状态。"
    },
    "skillTags": [
      "sre",
      "backup",
      "disaster-recovery"
    ],
    "relatedCommand": "Run MySQL test restore from backup dump",
    "estimatedTime": 40,
    "mnemonic": "备份必做恢复演练+校验，没验证=没备份。"
  },
  {
    "id": "sre-basic-chaos",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "混沌工程基础",
    "prompt": "主动且有控制地在生产环境中注入故障（如随机杀死容器节点、注入网络丢包延迟），以此验证系统自身的弹性自愈能力并发现隐患的稳定性工程技术被称为？",
    "options": [
      {
        "id": "a",
        "text": "商业数据库分表设计规范"
      },
      {
        "id": "b",
        "text": "用户界面图形样式调整 (CSS)"
      },
      {
        "id": "c",
        "text": "软件工程版本编译控制"
      },
      {
        "id": "d",
        "text": "混沌工程 (Chaos Engineering / Chaos Monkey)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "混沌工程通过在生产中制造可控混乱，强迫系统暴露弱点（如没有配置熔断导致超时拖垮上游），进而提前对其修复加固，防患于未然。",
    "wrongReasons": {
      "c": "版本编译用于控制源码的构建版本演进。",
      "b": "界面样式调整是前端渲染行为。",
      "a": "分表设计属于数据库存储架构扩展方案。"
    },
    "skillTags": [
      "sre",
      "chaos-engineering",
      "reliability"
    ],
    "relatedCommand": "Run Chaos Mesh or Litmus experiments",
    "estimatedTime": 35,
    "mnemonic": "主动注入故障验自愈=混沌工程。"
  },
  {
    "id": "sre-basic-elk",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "集中式日志平台",
    "prompt": "由于分布式集群有几十台服务器，On-call 工程师不可能一台台登录上去看日志，为了统一查询和检索所有主机的业务日志，运维通常会搭建？",
    "options": [
      {
        "id": "a",
        "text": "每台机器上开启多个 SSH 会话"
      },
      {
        "id": "b",
        "text": "本地 Excel 表格人肉拷贝"
      },
      {
        "id": "c",
        "text": "集中式日志收集分析平台 (如 ELK / Elasticsearch + Logstash + Kibana Stack)"
      },
      {
        "id": "d",
        "text": "MySQL 全表无规则写入系统"
      }
    ],
    "answer": [
      "c"
    ],
    "explanation": "ELK/EFK/PLG 栈通过日志采集 Agent（如 Filebeat/Promtail）实时向后台数据库输送日志，提供统一搜索与可视化报警。",
    "wrongReasons": {
      "a": "开几十个 SSH 会话在并发故障下无法做到跨多主机的联合检索、报错关联。",
      "b": "人肉拷贝延迟大、人工成本高，完全无法应对高并发生产日志的秒级查询要求。",
      "d": "直接往 MySQL 存海量文本日志会因为并发量大迅速写满连接池并拖垮主库物理磁盘。"
    },
    "skillTags": [
      "sre",
      "logging",
      "elk"
    ],
    "relatedCommand": "Search keywords in Kibana query bar",
    "estimatedTime": 35,
    "mnemonic": "集中查日志搭 ELK(ES+Logstash+Kibana)。"
  },
  {
    "id": "sre-basic-grafana-dash",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "监控可视化看板",
    "prompt": "SRE 值班大屏上展示的 CPU 水位、延迟走势折线图、当前成功率仪表盘，这一图形化呈现通常是基于什么工具配置的？",
    "options": [
      {
        "id": "a",
        "text": "Excel 原生报表文件"
      },
      {
        "id": "b",
        "text": "Vim 文本编辑器控制台"
      },
      {
        "id": "c",
        "text": "Windows 自带的画图软件"
      },
      {
        "id": "d",
        "text": "Grafana 仪表盘 (Dashboard)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "Grafana 提供了卓越的可视化指标大屏面板，能够原生接入 Prometheus、ES 等多种数据源以绘制实时动态看板。",
    "wrongReasons": {
      "b": "Vim 是用来进行文本代码编写编辑的，不用于绘制前端监控折线图大屏。",
      "c": "画图软件是离线的手动绘图工具，无法接入动态生产时序监控数据流。",
      "a": "Excel 不提供高频（秒级）实时刷新的动态网络时序图。"
    },
    "skillTags": [
      "sre",
      "grafana",
      "monitoring"
    ],
    "relatedCommand": "Import Grafana dashboard JSON template",
    "estimatedTime": 30,
    "mnemonic": "监控大屏看板=Grafana。"
  },
  {
    "id": "sre-basic-alert-fatigue",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "告警风暴与疲劳",
    "prompt": "如果监控平台配置不合理，每天向值班工程师发送数千条无关紧要的手机短信警报，这容易在值班团队中引发什么负面技术效应？",
    "options": [
      {
        "id": "a",
        "text": "服务器 CPU 水位自动发生百分之百的溢出"
      },
      {
        "id": "b",
        "text": "云平台计费系统自动给企业的账户里退款"
      },
      {
        "id": "c",
        "text": "全体研发工程师会当场提交离职信"
      },
      {
        "id": "d",
        "text": "告警疲劳 (Alert Fatigue - 对警报产生麻木，进而漏看漏处理真正的核心事故)"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "告警疲劳是 On-call 的隐形杀手。过多的非紧急告警会噪声化，导致关键的严重告警发生时被埋没或被值班人忽略，引发重大系统故障。",
    "wrongReasons": {
      "a": "告警灵敏度与硬件 CPU 的负荷状态无技术上的直接决定性因果关系。",
      "c": "虽然增加焦虑，但不会导致在发告警的一瞬间“全体当场离职”这种极端的现实事件发生。",
      "b": "短信告警是由云厂商正常计费的，不会退款，反而会因为发出海量短信而产生巨额账单开销。"
    },
    "skillTags": [
      "sre",
      "alerting",
      "oncall"
    ],
    "relatedCommand": "Configure alert inhibition and aggregation rules in Alertmanager",
    "estimatedTime": 35,
    "mnemonic": "告警太多致麻木漏看=告警疲劳。"
  },
  {
    "id": "sre-basic-escalation",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "告警升级策略",
    "prompt": "如果一线 On-call 值班人员在收到严重级别报警后 15 分钟内没有处理或确认，告警自动电话呼叫通知二线经理或资深专家，这一规则被称为？",
    "options": [
      {
        "id": "a",
        "text": "告警升级策略 (Escalation Policy)"
      },
      {
        "id": "b",
        "text": "告警屏蔽过滤策略 (Mute Policy)"
      },
      {
        "id": "c",
        "text": "用户注册登录协议"
      },
      {
        "id": "d",
        "text": "团队年假轮换排班制度"
      }
    ],
    "answer": [
      "a"
    ],
    "explanation": "升级策略（Escalation）防止了一线值班人因为睡死、手机断电或发生意外导致事故被撂荒，保障了故障能被上层兜底介入。",
    "wrongReasons": {
      "b": "屏蔽（Mute/Silence）用于在计划变更或维护期间暂停报警发送，不提供超时呼叫升级。",
      "c": "登录协议是面向最终消费者的法律说明。",
      "d": "年假排班属于企业休假福利，不是生产实时响应抢修机制。"
    },
    "skillTags": [
      "sre",
      "alerting",
      "oncall"
    ],
    "relatedCommand": "Set up escalation chain in PagerDuty/Opsgenie",
    "estimatedTime": 35,
    "mnemonic": "超时未响应自动升级二线=Escalation 策略。"
  },
  {
    "id": "sre-basic-blameless",
    "category": "sre",
    "type": "single",
    "level": "basic",
    "title": "无责任复盘文化",
    "prompt": "在 Google SRE 可靠性文化中，倡导在故障复盘中采用“无责任复盘（Blameless Postmortem）”，其根本目的是？",
    "options": [
      {
        "id": "a",
        "text": "当系统挂掉时，运维可以安心睡觉不用管任何业务"
      },
      {
        "id": "b",
        "text": "彻底关掉所有监控的屏幕以隐藏所有的系统报错"
      },
      {
        "id": "c",
        "text": "完全不需要人去解决故障，只等故障自己恢复"
      },
      {
        "id": "d",
        "text": "鼓励团队成员坦诚还原事故真实线索，以便从机制和架构上做加固避免同类故障复发，而不是追责惩罚个人"
      }
    ],
    "answer": [
      "d"
    ],
    "explanation": "无责复盘的核心理念是：如果一个人通过某个按钮就导致了系统崩坏，这属于系统设计防护的缺陷。追责个人会导致员工隐瞒故障或甩锅，不利于整体系统的坚韧性演进。",
    "wrongReasons": {
      "c": "SRE 需要主动出击和架构优化，而不是被动不作为。",
      "a": "On-call 人员值班必须迅速止血。",
      "b": "隐藏报错相当于掩耳盗铃，对业务稳定性是致命的伤害。"
    },
    "skillTags": [
      "sre",
      "culture",
      "postmortem"
    ],
    "relatedCommand": "Publish postmortem report internally",
    "estimatedTime": 35,
    "mnemonic": "无责复盘=坦诚还原、机制加固，不追责个人。"
  }
];
