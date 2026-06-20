// Content patch for the devops category (review Phase 2, batch 4).
import fs from 'node:fs'
import path from 'node:path'

const QFILE = 'functions/_shared/questions.js'
const AUDIO_DIR = 'public/audio'
const { questions } = await import(`../${QFILE}`)

const patches = {
  'devops-docker-image-runtime': {
    mnemonic: '容器起来就退：看 docker logs + 退出码 + ENTRYPOINT/CMD + 环境变量。',
  },
  'devops-container-resource-limit': {
    mnemonic: 'OOMKilled=内存超限：查 limit、内存曲线、GC/堆、近期流量与发布。',
    options: [
      { id: 'a', text: '关闭监控让 OOM 告警消失' },
      { id: 'b', text: '换一个更大的基础镜像重建' },
      { id: 'c', text: '反复重启容器期望自愈' },
      { id: 'd', text: '容器 memory limit、应用内存曲线、GC/堆配置和近期流量或发布变化' },
    ],
    wrongReasons: {
      a: '关掉监控只是看不到 OOM，内存问题依旧存在。',
      b: '换基础镜像不改变应用自身内存占用，OOM 会复现。',
      c: '重启只是临时拉起，没有定位内存增长的根因。',
    },
  },
  'devops-k8s-crashloop': {
    mnemonic: 'CrashLoopBackOff：describe 看事件 + logs --previous 看退出前日志。',
    explanation: '排查不是只看 Pod 状态，而要拿到退出前日志、事件、探针和配置变更证据：kubectl describe 看事件和退出码，kubectl logs --previous 看上一次崩溃日志。',
  },
  'devops-k8s-readiness': {
    mnemonic: 'readinessProbe=就绪才接 Service 流量，挡住半启动实例。',
  },
  'devops-k8s-service-selector': {
    mnemonic: 'Service 没 endpoints：先核对 selector 与 Pod labels 是否匹配。',
    options: [
      { id: 'a', text: 'Service 的 type 设成了 ClusterIP' },
      { id: 'b', text: '镜像 tag 用了 latest' },
      { id: 'c', text: 'Deployment 副本数设为 1' },
      { id: 'd', text: 'Service selector 与 Pod labels 不匹配' },
    ],
    wrongReasons: {
      a: 'Service type 决定暴露方式，不影响 endpoints 是否生成。',
      b: '镜像 tag 影响拉取，与 selector/labels 匹配无关。',
      c: '副本数为 1 也会产生 endpoint，数量不是 endpoints 为空的原因。',
    },
  },
  'devops-image-pull-secret': {
    mnemonic: 'ImagePullBackOff：查镜像名/tag/仓库地址/网络/imagePullSecrets。',
  },
  'devops-helm-rollback': {
    mnemonic: '发布出问题：停放量、留证据、按 release revision 回滚上一稳定版。',
    explanation: '发布要可回滚：Helm revision、发布日志、指标和错误率是判断是否回滚的核心证据，先停放量保留现场，再回滚到上一稳定版本。',
  },
  'devops-jenkins-pipeline': {
    mnemonic: '生产流水线：构建→测试→制品→镜像扫描→审批→灰度→回滚→通知。',
    explanation: '流水线的价值是把交付风险工程化：覆盖构建、测试、制品版本、镜像扫描、发布审批，并配套灰度、健康检查、回滚、凭据安全和审计。',
  },
  'devops-ansible-idempotent': {
    mnemonic: 'Ansible 核心=幂等：重复执行结果一致，失败重试也安全。',
    options: [
      { id: 'a', text: '永远不用 inventory' },
      { id: 'b', text: '每次执行结果都不一样才算灵活' },
      { id: 'c', text: '幂等：重复执行不会把系统推向未知状态' },
      { id: 'd', text: '只在生产直接试命令' },
    ],
    wrongReasons: {
      b: '结果不确定意味着不可复现、不可审计，与自动化要的可预测背道而驰。',
    },
  },
  'devops-secret-config': {
    mnemonic: '敏感配置进 Secret/KMS + 权限控制，别放 ConfigMap/镜像/明文。',
    explanation: '敏感数据要和普通配置分离，并纳入权限、加密和审计：放 Secret 或外部密钥管理系统，而不是明文配置或镜像里。',
    options: [
      { id: 'a', text: 'ConfigMap 明文公开' },
      { id: 'b', text: 'Secret 或外部密钥管理系统，并配合权限控制' },
      { id: 'c', text: '硬编码进应用启动参数' },
      { id: 'd', text: '镜像 Dockerfile 明文写死' },
    ],
    wrongReasons: {
      a: 'ConfigMap 适合非敏感配置，放密码有明文泄露风险。',
      c: '写进启动参数会出现在进程列表和日志里，等同明文泄露。',
      d: '写进镜像会永久泄露到制品层。',
    },
  },
  'devops-hpa-metrics': {
    mnemonic: 'HPA unknown metrics：查 metrics-server 或自定义指标链路是否异常。',
  },
  'devops-pvc-pending': {
    mnemonic: 'PVC Pending：查 StorageClass、动态供给器、PV 匹配、容量、accessModes。',
    options: [
      { id: 'a', text: 'StorageClass、动态供给器、PV 匹配、容量和 accessModes' },
      { id: 'b', text: 'Ingress host 拼写' },
      { id: 'c', text: 'Service ClusterIP' },
      { id: 'd', text: 'Pod 的 restartPolicy 取值' },
    ],
    wrongReasons: {
      d: 'restartPolicy 影响容器重启行为，与 PVC 能否绑定存储无关。',
    },
  },

  // --- 30 basic devops questions: mnemonic only ---
  'devops-basic-docker-diff': { mnemonic: '容器轻在共享宿主机内核，不装 Guest OS。' },
  'devops-basic-image-container': { mnemonic: '镜像=只读模板(类)，容器=运行实例(对象)。' },
  'devops-basic-docker-run': { mnemonic: '后台跑容器：docker run -d；-it 是前台交互。' },
  'devops-basic-docker-ps': { mnemonic: '看运行中容器 docker ps；加 -a 看全部。' },
  'devops-basic-docker-logs': { mnemonic: '看容器日志：docker logs <容器>。' },
  'devops-basic-docker-port': { mnemonic: '端口映射 -p 宿主机:容器（-p 8080:80）。' },
  'devops-basic-docker-volume': { mnemonic: '挂目录用 -v 宿主机路径:容器路径。' },
  'devops-basic-pod': { mnemonic: 'K8s 最小调度单元=Pod。' },
  'devops-basic-k8s-service': { mnemonic: '给 Pod 稳定入口=Service（ClusterIP）。' },
  'devops-basic-kubectl': { mnemonic: '操作 K8s 用 kubectl；装集群用 kubeadm。' },
  'devops-basic-git-clone': { mnemonic: '首次下载仓库用 git clone。' },
  'devops-basic-git-add': { mnemonic: 'git add 放暂存区，git commit 存版本。' },
  'devops-basic-git-commit': { mnemonic: 'git commit -m "说明" 生成版本记录。' },
  'devops-basic-git-push': { mnemonic: '推代码：git push origin <分支>。' },
  'devops-basic-dockerfile': { mnemonic: '构建镜像的脚本文件叫 Dockerfile。' },
  'devops-basic-docker-build': { mnemonic: '构建镜像：docker build -t 名:tag .（末尾点是上下文）。' },
  'devops-basic-docker-pull': { mnemonic: '拉镜像 docker pull；推镜像 docker push。' },
  'devops-basic-cicd': { mnemonic: 'CI/CD=持续集成 / 持续交付部署。' },
  'devops-basic-jenkins': { mnemonic: '经典流水线工具=Jenkins（Jenkinsfile 写 Pipeline）。' },
  'devops-basic-git-branch': { mnemonic: '开新功能从主干拉 feature 分支，互不干扰。' },
  'devops-basic-git-checkout': { mnemonic: '新建并切分支：git checkout -b <名>（或 git switch -c）。' },
  'devops-basic-k8s-deployment': { mnemonic: '无状态多副本+滚动更新用 Deployment。' },
  'devops-basic-k8s-namespace': { mnemonic: '环境逻辑隔离用 Namespace。' },
  'devops-basic-k8s-configmap': { mnemonic: 'K8s 存密码用 Secret；普通配置用 ConfigMap。' },
  'devops-basic-git-merge': { mnemonic: '合并分支：git merge <分支>。' },
  'devops-basic-docker-states': { mnemonic: '1 号进程退出，容器变 Exited。' },
  'devops-basic-docker-rm': { mnemonic: 'docker rm 删容器，rmi 删镜像(i=image)。' },
  'devops-basic-registry': { mnemonic: '私有镜像统一分发用 Registry/Harbor。' },
  'devops-basic-iac': { mnemonic: '声明式开资源=IaC（Terraform）。' },
  'devops-basic-git-pr': { mnemonic: '并主干前提 Code Review，提 PR/MR。' },
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
console.log(`已改写 devops 题目: ${changed}`)
console.log(`需失效的旧音频: ${staleAudio.size}，实际删除: ${deleted}`)
