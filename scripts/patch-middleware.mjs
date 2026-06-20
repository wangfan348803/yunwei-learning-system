// Content patch for the middleware category (review Phase 2, batch 5).
import fs from 'node:fs'
import path from 'node:path'

const QFILE = 'functions/_shared/questions.js'
const AUDIO_DIR = 'public/audio'
const { questions } = await import(`../${QFILE}`)

const patches = {
  'middleware-mysql-slow-query': {
    mnemonic: '慢查询升高查五样：慢 SQL、执行计划、索引、锁等待、近期发布。',
    explanation: '慢查询要结合慢 SQL、执行计划、索引、锁等待、连接数和发布变更一起分析，不能只看 CPU 高就盲目加资源。',
    options: [
      { id: 'a', text: '重启应用服务器清掉连接' },
      { id: 'b', text: '给数据库实例直接扩容 CPU' },
      { id: 'c', text: '调大连接池上限掩盖慢查询' },
      { id: 'd', text: '分析慢 SQL、执行计划、索引、锁等待和近期发布变更' },
    ],
    wrongReasons: {
      a: '重启只是临时断开连接，慢 SQL 和锁等待会很快复现。',
      b: '盲目扩 CPU 不解决慢 SQL 与索引问题，成本高且治标。',
      c: '调大连接池会让更多慢查询并发挤压数据库，加重而非缓解。',
    },
  },
  'middleware-redis-hit-rate': {
    mnemonic: 'Redis 命中掉、压力回库：查过期策略、热点 key、淘汰、穿透/击穿。',
    options: [
      { id: 'a', text: 'key 过期策略、热点 key、内存淘汰、发布变更和缓存穿透/击穿' },
      { id: 'b', text: '把所有 key 过期时间统一设短' },
      { id: 'c', text: '关闭数据库慢日志' },
      { id: 'd', text: '只清空 Redis' },
    ],
    wrongReasons: {
      b: '统一设短会让大批 key 同时失效，反而引发缓存雪崩。',
    },
  },
  'middleware-nginx-upstream-timeout': {
    mnemonic: 'upstream timed out 顺链路：上游耗时、连接数、依赖(库/缓存)、超时配置。',
    options: [
      { id: 'a', text: 'Nginx 访问日志的切割周期' },
      { id: 'b', text: '上游响应时间、连接数、应用日志、数据库/缓存依赖和超时配置' },
      { id: 'c', text: '前端页面的静态资源大小' },
      { id: 'd', text: 'Nginx 配置文件的注释格式' },
    ],
    wrongReasons: {
      a: '日志切割周期与上游是否超时无关。',
      c: '静态资源大小不影响到上游的连接与响应耗时。',
      d: '注释格式不影响运行，不是超时证据。',
    },
  },
  'middleware-kafka-lag': {
    mnemonic: 'consumer lag 涨：比生产/消费速率，看分区数、实例数、错误重试、下游。',
  },
  'middleware-mq-dead-letter': {
    mnemonic: '死信不是垃圾桶：查失败原因、重试次数、消息内容、幂等、下游状态。',
    options: [
      { id: 'a', text: '消费失败原因、重试次数、消息内容、幂等性和下游服务状态' },
      { id: 'b', text: '直接给队列扩容更多分区' },
      { id: 'c', text: '把消费重试次数调到无限' },
      { id: 'd', text: '直接丢弃所有死信' },
    ],
    wrongReasons: {
      b: '扩分区不解决消费失败本身，失败消息仍会进死信。',
      c: '无限重试会放大故障并堆积，应先定位失败原因。',
      d: '直接丢弃可能造成业务数据丢失。',
    },
  },
  'middleware-jvm-gc': {
    mnemonic: 'GC 毛刺收证据：GC 日志、堆使用、线程栈、接口延迟、发布流量。',
    explanation: 'GC 排障要结合 GC 日志、堆使用、停顿时长、线程栈、接口延迟和发布/流量变化，扩容只能缓解不能定位根因。',
    options: [
      { id: 'a', text: '删除 GC 日志' },
      { id: 'b', text: 'GC 日志、堆使用、线程栈、接口延迟和发布/流量变化' },
      { id: 'c', text: '直接调大堆内存掩盖问题' },
      { id: 'd', text: '只增加副本，不看 JVM' },
    ],
    wrongReasons: {
      c: '盲目加堆可能延后 GC，但不定位毛刺根因，还可能拉长单次停顿。',
    },
  },
  'middleware-connection-pool': {
    mnemonic: '连接池耗尽两侧查：慢 SQL/连接泄漏/池大小 + 库 max_connections。',
    options: [
      { id: 'a', text: '应用的日志打印级别' },
      { id: 'b', text: '前端请求的 User-Agent' },
      { id: 'c', text: '代码里的注释行数' },
      { id: 'd', text: '慢查询、连接泄漏、池大小、数据库 max_connections 和流量变化' },
    ],
    wrongReasons: {
      a: '日志级别不决定连接是否被占满或泄漏。',
      b: '请求头 UA 与数据库连接资源无关。',
      c: '注释不影响运行时连接占用。',
    },
  },
  'middleware-es-shard': {
    mnemonic: 'ES yellow/red：分片分配、磁盘水位、副本、节点状态，看 allocation explain。',
    options: [
      { id: 'a', text: '只删除索引' },
      { id: 'b', text: '重启随机一个数据节点试试' },
      { id: 'c', text: '关闭集群健康检查' },
      { id: 'd', text: '分片分配、节点磁盘水位、索引副本、节点状态和集群事件' },
    ],
    wrongReasons: {
      b: '未定位未分配分片就重启节点，可能触发更多分片迁移，加剧 red。',
    },
  },
  'middleware-db-migration-validate': {
    mnemonic: '迁移要闭环：数据量+校验和+主从延迟+抽样，留回滚和旧库下线计划。',
    explanation: '迁移成功不是任务结束，而是数据一致、应用可用、性能稳定、回滚可控的闭环：校验数据量、校验和、主从延迟和关键表抽样，并准备回滚入口和旧库下线计划。',
  },
  'middleware-cache-avalanche': {
    mnemonic: '防缓存雪崩：过期加随机抖动 + 热点保护 + 限流降级 + 预热。',
    options: [
      { id: 'a', text: '所有 key 设置同一过期时间' },
      { id: 'b', text: '过期时间加随机抖动、热点保护、限流降级和预热' },
      { id: 'c', text: '把所有缓存过期时间统一调到更长' },
      { id: 'd', text: '雪崩时直接重启数据库' },
    ],
    wrongReasons: {
      a: '同一过期时间会让大量 key 同时失效，放大雪崩风险。',
      c: '统一调长只是推迟集中失效，到点仍会同时过期引发雪崩。',
      d: '重启数据库会中断服务，且缓存集中到期的问题依旧。',
    },
  },
  'middleware-observability-correlation': {
    mnemonic: '跨服务关联靠 traceId/requestId，统一字段胜过海量日志。',
    options: [
      { id: 'a', text: '只保留单机的本地文件日志' },
      { id: 'b', text: '错误码、上游耗时和依赖组件状态' },
      { id: 'c', text: '服务名、版本、时间戳和实例 IP' },
      { id: 'd', text: 'traceId/requestId' },
    ],
    wrongReasons: {
      a: '只看单机本地日志无法跨服务关联，缺统一字段链路就断了。',
    },
  },
  'middleware-ai-gpu-runtime': {
    mnemonic: 'GPU 生产信号：驱动/CUDA/CuDNN/框架版本 + 显存/利用率/温度 + 模型版本。',
  },

  // --- 30 basic middleware questions: mnemonic only ---
  'middleware-basic-mysql-port': { mnemonic: 'MySQL=3306。' },
  'middleware-basic-mysql-query': { mnemonic: '查询：SELECT 列 FROM 表 WHERE 条件。' },
  'middleware-basic-redis-type': { mnemonic: 'Redis 快在数据全在内存(RAM)，微秒级读写。' },
  'middleware-basic-redis-port': { mnemonic: 'Redis=6379。' },
  'middleware-basic-nginx-reverse': { mnemonic: 'Nginx 反向代理指令=proxy_pass。' },
  'middleware-basic-nginx-reload': { mnemonic: '改完热加载：nginx -s reload（不断连）。' },
  'middleware-basic-mq-role': { mnemonic: 'MQ 三大用：异步解耦、削峰填谷、流量缓冲。' },
  'middleware-basic-tomcat-port': { mnemonic: 'Tomcat=8080。' },
  'middleware-basic-es-port': { mnemonic: 'ES 对外 REST=9200，节点间=9300。' },
  'middleware-basic-db-pool': { mnemonic: '连接池=复用连接，省 TCP/认证握手开销。' },
  'middleware-basic-http-codes': { mnemonic: '状态码：2xx 成功、3xx 重定向、4xx 客户端错、5xx 服务端错。' },
  'middleware-basic-redis-get-set': { mnemonic: 'Redis：SET 写，GET 读。' },
  'middleware-basic-sql-insert': { mnemonic: '插入：INSERT INTO 表(列) VALUES(值)。' },
  'middleware-basic-sql-update': { mnemonic: '更新：UPDATE 表 SET 列=值 WHERE 条件（别漏 WHERE）。' },
  'middleware-basic-sql-delete': { mnemonic: '删除：DELETE FROM 表 WHERE 条件（不加 *）。' },
  'middleware-basic-db-index': { mnemonic: '索引=目录，免全表扫描，B+ 树秒级定位。' },
  'middleware-basic-db-primary-key': { mnemonic: '主键=唯一且非空(NOT NULL + UNIQUE)。' },
  'middleware-basic-db-acid': { mnemonic: 'ACID 的 A=原子性：要么全成，要么全回滚。' },
  'middleware-basic-jvm-role': { mnemonic: 'JVM=跨平台执行 Java 字节码的运行环境。' },
  'middleware-basic-kafka-topic': { mnemonic: 'Kafka 逻辑分类=Topic；物理切片=Partition。' },
  'middleware-basic-mq-pubsub': { mnemonic: '发布订阅=一条消息多个订阅者都能收。' },
  'middleware-basic-nginx-logs': { mnemonic: 'Nginx 报错看 access.log / error.log。' },
  'middleware-basic-zookeeper': { mnemonic: '分布式协调/元数据注册用 ZooKeeper。' },
  'middleware-basic-redis-structs': { mnemonic: 'Redis 常用结构：String/Hash/List（还有 Set/ZSet）。' },
  'middleware-basic-postgres-port': { mnemonic: 'PostgreSQL=5432。' },
  'middleware-basic-nosql-diff': { mnemonic: 'NoSQL=无严格 Schema，灵活键值/文档，易水平扩。' },
  'middleware-basic-db-readwrite': { mnemonic: '读多写少用读写分离：写主库、读从库。' },
  'middleware-basic-nginx-algorithms': { mnemonic: 'Nginx 负载：轮询(默认) + ip_hash(会话保持)。' },
  'middleware-basic-memory-leak': { mnemonic: '内存泄漏=内存只增不减，最终 OOM。' },
  'middleware-basic-jvm-gc': { mnemonic: 'Java 自动回收无用对象=GC。' },
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
console.log(`已改写 middleware 题目: ${changed}`)
console.log(`需失效的旧音频: ${staleAudio.size}，实际删除: ${deleted}`)
