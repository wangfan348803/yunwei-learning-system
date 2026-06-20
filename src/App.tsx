import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { categories, questions } from './data/questions'
import { evaluateAnswer } from './logic/answer'
import {
  canAdvanceAfterAnswer,
  getAdjacentQuestion,
  shouldEvaluateSelection,
} from './logic/answerFlow'
import { buildFeedbackDetails } from './logic/feedbackDetails'
import { accuracy, recordAnswer } from './logic/progress'
import { getUserId, loadProgress, saveProgress, setUserId, writeProgressLocal } from './storage'
import {
  fetchRemoteProgress,
  reconcileProgress,
  scheduleProgressSync,
  sendAnswerEvent,
  subscribeSyncStatus,
  type SyncStatus,
} from './sync'
import type { AnswerResult, CategoryId, LearningProgress, Question } from './types'
import { isExecutableCommand } from './logic/commandClassify'
import { audioUrl } from './logic/audioAssets'
import { playClickSound, playSuccessSound, playFailureSound, speakText, stopSpeech } from './logic/soundEffects'
import { getLevelInfo, calculateXpGain, checkNewAchievements, achievements } from './logic/gamification'

// Heavy, below-the-fold / on-demand UI is code-split out of the initial bundle.
const JobBoard = lazy(() => import('./components/JobBoard'))
const TerminalPreview = lazy(() => import('./components/TerminalPreview'))
import {
  clearImportedQuestions,
  createQuestionImportTemplate,
  loadImportedQuestions,
  parseImportedQuestions,
  saveImportedQuestions,
} from './logic/questionImport'

type TrainingMode = CategoryId | 'all' | 'mistakes'

const levelLabel = {
  basic: '基础',
  intermediate: '进阶',
  advanced: '高级',
}

const typeLabel = {
  single: '单选',
  multiple: '多选',
  command: '命令',
  'log-analysis': '日志',
  config: '配置',
  scenario: '场景',
}

function getInitialQuestion(
  mode: TrainingMode,
  subMode: 'basic' | 'advanced',
  progress: LearningProgress,
  questionPool: Question[],
): Question {
  if (mode === 'mistakes') {
    const pool = questionPool.filter((question) =>
      progress.mistakes.some((mistake) => mistake.questionId === question.id),
    )
    return pool[0] ?? questionPool[0]
  }

  const pool = (mode === 'all' ? questionPool : questionPool.filter((question) => question.category === mode)).filter((question) =>
    subMode === 'basic' ? question.level === 'basic' : question.level !== 'basic',
  )
  return pool[0] ?? questionPool[0]
}

function formatBodyText(text: string) {
  if (!text) return ''
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1)
      return (
        <code key={index} className="inline-code">
          {code}
        </code>
      )
    }
    return part
  })
}

function mergeImportedQuestionBatch(existingImported: Question[], incoming: Question[]) {
  const builtInIds = new Set(questions.map((question) => question.id))
  const merged = new Map(existingImported.map((question) => [question.id, question]))
  const usedIds = new Set([...builtInIds, ...merged.keys()])
  let firstImportedId = ''

  incoming.forEach((question, index) => {
    const baseId = builtInIds.has(question.id) ? `custom-${question.id}` : question.id
    let nextId = baseId
    let suffix = 2

    while (usedIds.has(nextId)) {
      nextId = `${baseId}-${suffix}`
      suffix += 1
    }

    usedIds.add(nextId)
    merged.set(nextId, { ...question, id: nextId })
    if (index === 0) firstImportedId = nextId
  })

  return {
    firstImportedId,
    questions: Array.from(merged.values()),
  }
}

function getSectionConfig(title: string) {
  switch (title) {
    case '先记住结论':
      return {
        className: 'conclusion',
        icon: (
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
      }
    case '为什么这样判断':
      return {
        className: 'theory',
        icon: (
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <line x1="9" y1="18" x2="15" y2="18" />
            <line x1="10" y1="22" x2="14" y2="22" />
          </svg>
        ),
      }
    case '口诀':
      return {
        className: 'memory',
        icon: (
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
        ),
      }
    case '这次错在哪里':
      return {
        className: 'error-reason',
        icon: (
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      }
    default:
      return {
        className: '',
        icon: null,
      }
  }
}

interface DailyTip {
  title: string
  content: string
}

const dailyTips: Record<CategoryId, DailyTip[]> = {
  linux: [
    { title: "端口排查", content: "使用 `lsof -i :<port>` 或 `ss -lntp` 可以快速查出是哪个进程占用了指定的网络端口。" },
    { title: "系统性能监控", content: "用 `vmstat 1` 可以实时监控 CPU 上下文切换、中断数、内存和系统负载变化。" },
    { title: "内核报错监控", content: "通过 `dmesg -T | tail -n 20` 或监控 `/var/log/messages` 能快速捕获 OOM 等系统内核级报错。" },
    { title: "磁盘 I/O 排查", content: "用 `iostat -xz 1` 监控磁盘吞吐量与活跃队列，`await` 超过 10ms 通常意味着磁盘 I/O 遭遇瓶颈。" }
  ],
  network: [
    { title: "线上抓包分析", content: "排查连接重置/异常丢包时，可用 `tcpdump -i any port <port> -nnvv` 抓包并保存为 `.pcap` 配合 Wireshark 分析。" },
    { title: "协议栈溢出排查", content: "`netstat -s` 或 `ss -s` 能展示协议栈全局统计，若看到 `SYNs to LISTEN sockets dropped` 说明半连接队列已满溢出。" },
    { title: "内核网络调优", content: "在高并发大吞吐量场景下，建议增大 Linux 内核 of `net.core.somaxconn` 和 `net.ipv4.tcp_max_syn_backlog` 参数值。" }
  ],
  cloud: [
    { title: "多可用区高可用", content: "云上多可用区（Multi-AZ）部署是规避单点数据中心断电断网灾难、保证服务 99.99% 可靠性的基石。" },
    { title: "存储降本策略", content: "为云对象存储（如 OSS/S3）配置合理的生命周期规则（Lifecycle Rules），自动归档历史冷数据以节约大量开销。" },
    { title: "云安全最小特权", content: "精细化配置云端 IAM 角色与权限，遵循“最小特权原则”（Least Privilege Principle），严禁在代码中硬编码 Root Access Key。" }
  ],
  devops: [
    { title: "容器镜像瘦身", content: "镜像打包推荐采用多阶段构建（Multi-stage build），并使用 `distroless` 或 `alpine` 作为运行时基础镜像，以减小体积并收敛安全漏洞。" },
    { title: "K8s 资源流控", content: "Kubernetes 中务必为 Pod 显式配置合理的 `resources.limits` 和 `resources.requests`，防止宿主机发生物理内存耗尽（OOM）触发驱逐。" },
    { title: "CI/CD 安全左移", content: "在 CI/CD 交付流水线中，应尽早集成静态代码分析（如 SonarQube）以及容器镜像安全漏洞扫描（如 Trivy）。" }
  ],
  middleware: [
    { title: "数据库长事务", content: "数据库长事务是引发大量行锁冲突、Undo Log 暴涨甚至数据库连接池卡死的元凶，生产环境应严格限制事务执行时长。" },
    { title: "Redis 生产红线", content: "Redis 生产环境严禁使用全局阻塞性的 `KEYS *` 命令，这会导致单线程引擎长时间假死，应使用无害的 `SCAN` 逐步迭代。" },
    { title: "连接池生命周期", content: "应用端数据库连接池的 `Max Lifetime`（最大连接寿命）应设置得比数据库端的 `wait_timeout` 略小，防止获取到已失效的半连接导致连接重置报错。" }
  ],
  sre: [
    { title: "故障应急“止血”", content: "SRE 的首要职责是缩短故障平均修复时间（MTTR）。线上故障爆发时，应优先考虑重启、扩容、回滚或限流“止血”，切忌在线上花大量时间慢速排查定位代码 Bug。" },
    { title: "雪崩防护机制", content: "客户端合理设置超时时间（Timeout）与带有随机抖动的指数退避重试（Exponential Backoff with Jitter），是应对分布式系统级联雪崩的铁律。" },
    { title: "可靠性指标度量", content: "通过制定合理的 SLO 和 SLI，利用“错误预算”（Error Budget）科学量化系统可靠性，能有效协调业务迭代速度与稳定保障之间的冲突。" }
  ]
}

function App() {
  const [progress, setProgress] = useState<LearningProgress>(() => loadProgress())
  const [importedQuestions, setImportedQuestions] = useState<Question[]>(() => loadImportedQuestions())
  const [mode, setMode] = useState<TrainingMode>('all')
  const [subMode, setSubMode] = useState<'basic' | 'advanced'>('basic')
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() =>
    getInitialQuestion('all', 'basic', progress, [...questions, ...importedQuestions]),
  )
  const recordedQuestionIdsRef = useRef(new Set<string>())
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [importMessage, setImportMessage] = useState<string>('')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedCmd, setCopiedCmd] = useState(false)

  const [unlockedAchievementNotification, setUnlockedAchievementNotification] = useState<string | null>(null)
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null)
  const achievementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const levelUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current)
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current)
    }
  }, [])

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [userId, setUserIdState] = useState<string>(() => getUserId())
  const [syncCodeInput, setSyncCodeInput] = useState('')
  const [syncMessage, setSyncMessage] = useState('')

  useEffect(() => subscribeSyncStatus(setSyncStatus), [])

  // On mount, reconcile the local snapshot with the cloud (last-write-wins) once.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const local = loadProgress()
      const remote = await fetchRemoteProgress()
      if (cancelled) return
      const chosen = reconcileProgress(local, remote)
      if (chosen && chosen !== local) {
        // Remote snapshot is newer — adopt it without re-stamping/re-pushing.
        writeProgressLocal(chosen)
        setProgress(chosen)
      } else if (local.updatedAt) {
        // Local is authoritative (or the only side with data) — make sure the cloud has it.
        scheduleProgressSync(local)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(userId)
    setSyncMessage('同步码已复制，可在其他设备粘贴后拉取进度')
  }

  const handleApplySyncCode = async () => {
    const nextCode = syncCodeInput.trim()
    if (!nextCode || nextCode === userId) {
      setSyncMessage('请输入与当前不同的同步码')
      return
    }
    setUserId(nextCode)
    setUserIdState(nextCode)
    setSyncCodeInput('')
    setSyncMessage('正在用该同步码拉取云端进度…')
    const remote = await fetchRemoteProgress(nextCode)
    if (remote) {
      writeProgressLocal(remote)
      setProgress(remote)
      recordedQuestionIdsRef.current = new Set()
      setSyncMessage('已切换并载入该同步码的云端进度')
    } else {
      // No cloud data for this code yet — claim it by pushing the current local progress.
      scheduleProgressSync(loadProgress())
      setSyncMessage('该同步码暂无云端进度，已绑定当前本地进度')
    }
  }

  const levelInfo = useMemo(() => getLevelInfo(progress.xp ?? 0), [progress.xp])

  const [tipIndex, setTipIndex] = useState(0)
  const questionBank = useMemo(() => [...questions, ...importedQuestions], [importedQuestions])

  const currentCategoryTips = useMemo(() => {
    return dailyTips[currentQuestion.category] || dailyTips.linux
  }, [currentQuestion.category])

  const activeTip = useMemo(() => {
    return currentCategoryTips[tipIndex % currentCategoryTips.length]
  }, [currentCategoryTips, tipIndex])

  const triggerNotification = (type: 'achievement' | 'level', value: string | number) => {
    if (type === 'achievement') {
      if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current)
      setUnlockedAchievementNotification(String(value))
      achievementTimerRef.current = setTimeout(() => setUnlockedAchievementNotification(null), 4000)
    } else {
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current)
      setLevelUpNotification(Number(value))
      levelUpTimerRef.current = setTimeout(() => setLevelUpNotification(null), 4000)
    }
  }

  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isPlayingExplanation, setIsPlayingExplanation] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlayingAudio(false)
    setIsPlayingExplanation(false)
    stopSpeech()
  }, [])

  const resetQuestionViewState = () => {
    stopAudio()
    setTipIndex(0)
  }

  const toggleAudio = () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
      return
    }

    stopAudio()

    let nextSoundEnabled = progress.soundEnabled ?? true
    if (!progress.soundEnabled) {
      nextSoundEnabled = true
      const nextProgress = { ...progress, soundEnabled: true }
      setProgress(nextProgress)
      saveProgress(nextProgress)
    }

    const audio = new Audio(audioUrl(`${currentQuestion.id}.mp3`))
    audioRef.current = audio
    setIsPlayingAudio(true)

    audio.play().catch((err) => {
      console.warn('播放音频失败, 降级为 TTS 朗读:', err)
      if (nextSoundEnabled) {
        speakText(currentQuestion.prompt, () => setIsPlayingAudio(false))
      } else {
        setIsPlayingAudio(false)
      }
    })

    audio.onended = () => {
      setIsPlayingAudio(false)
    }
  }

  const toggleExplanationAudio = () => {
    if (isPlayingExplanation && audioRef.current) {
      audioRef.current.pause()
      setIsPlayingExplanation(false)
      return
    }

    stopAudio()

    let nextSoundEnabled = progress.soundEnabled ?? true
    if (!progress.soundEnabled) {
      nextSoundEnabled = true
      const nextProgress = { ...progress, soundEnabled: true }
      setProgress(nextProgress)
      saveProgress(nextProgress)
    }

    const audio = new Audio(audioUrl(`${currentQuestion.id}-explanation.mp3`))
    audioRef.current = audio
    setIsPlayingExplanation(true)

    audio.play().catch((err) => {
      console.warn('播放解析音频失败, 降级为 TTS 朗读:', err)
      if (nextSoundEnabled) {
        const textToSpeak = feedbackDetails?.sections.map(s => `${s.title}：${s.body}`).join('。') || currentQuestion.explanation
        speakText(textToSpeak, () => setIsPlayingExplanation(false))
      } else {
        setIsPlayingExplanation(false)
      }
    })

    audio.onended = () => {
      setIsPlayingExplanation(false)
    }
  }

  const closeFeedback = () => {
    setFeedbackOpen(false)
    stopAudio()
  }

  const drawerCloseRef = useRef<HTMLButtonElement | null>(null)
  const drawerReturnFocusRef = useRef<HTMLElement | null>(null)

  // Close the feedback drawer on Escape and move focus into it on open (focus management)
  useEffect(() => {
    if (!feedbackOpen) return

    drawerReturnFocusRef.current = document.activeElement as HTMLElement | null
    drawerCloseRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setFeedbackOpen(false)
        stopAudio()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the control that opened the drawer
      drawerReturnFocusRef.current?.focus?.()
    }
  }, [feedbackOpen, stopAudio])

  const changeSubMode = (nextSubMode: 'basic' | 'advanced') => {
    setSubMode(nextSubMode)
    const nextQuestion = getInitialQuestion(mode, nextSubMode, progress, questionBank)
    setCurrentQuestion(nextQuestion)
    resetQuestionViewState()
    setSelected([])
    setResult(null)
    setFeedbackOpen(false)
    setCopied(false)
    setCopiedCmd(false)
  }

  const handleCopy = (text: string, isCommand: boolean) => {
    navigator.clipboard.writeText(text)
    if (isCommand) {
      setCopiedCmd(true)
      setTimeout(() => setCopiedCmd(false), 1500)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const switchToQuestion = (question: Question) => {
    setCurrentQuestion(question)
    resetQuestionViewState()
    setSelected([])
    setResult(null)
    setFeedbackOpen(false)
    setCopied(false)
    setCopiedCmd(false)
  }

  const handleImportQuestions = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const payload = JSON.parse(await file.text()) as unknown
      const parsed = parseImportedQuestions(payload)

      if (parsed.errors.length > 0) {
        const preview = parsed.errors.slice(0, 3).join('；')
        const rest = parsed.errors.length > 3 ? `；另有 ${parsed.errors.length - 3} 处错误` : ''
        setImportMessage(`导入失败：${preview}${rest}`)
        return
      }

      const merged = mergeImportedQuestionBatch(importedQuestions, parsed.questions)
      setImportedQuestions(merged.questions)
      saveImportedQuestions(merged.questions)

      const firstQuestion = merged.questions.find((question) => question.id === merged.firstImportedId)
      if (firstQuestion) {
        setMode('all')
        setSubMode(firstQuestion.level === 'basic' ? 'basic' : 'advanced')
        switchToQuestion(firstQuestion)
      }

      setImportMessage(`已导入 ${parsed.questions.length} 题，本地自定义题库共 ${merged.questions.length} 题`)
    } catch (error) {
      console.warn('Failed to import questions:', error)
      setImportMessage('导入失败：文件必须是合法 JSON，请先下载模板对照字段')
    }
  }

  const downloadQuestionTemplate = () => {
    const blob = new Blob([JSON.stringify(createQuestionImportTemplate(), null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'yunwei-question-import-template.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setImportMessage('已生成导入模板，可按模板补充自己的资料习题')
  }

  const handleClearImportedQuestions = () => {
    clearImportedQuestions()
    setImportedQuestions([])
    setImportMessage('已清空本地导入题库')

    if (!questions.some((question) => question.id === currentQuestion.id)) {
      switchToQuestion(getInitialQuestion(mode, subMode, progress, questions))
    }
  }

  const activePool = useMemo(() => {
    if (mode === 'mistakes') {
      const mistakeIds = new Set(progress.mistakes.map((mistake) => mistake.questionId))
      return questionBank.filter((question) => mistakeIds.has(question.id))
    }

    const categoryPool = mode === 'all' ? questionBank : questionBank.filter((question) => question.category === mode)
    return categoryPool.filter((question) =>
      subMode === 'basic' ? question.level === 'basic' : question.level !== 'basic',
    )
  }, [mode, subMode, progress.mistakes, questionBank])

  const currentIndex = Math.max(
    0,
    activePool.findIndex((question) => question.id === currentQuestion.id),
  )
  const chooseMode = (nextMode: TrainingMode) => {
    const nextQuestion = getInitialQuestion(nextMode, subMode, progress, questionBank)
    setMode(nextMode)
    setCurrentQuestion(nextQuestion)
    resetQuestionViewState()
    setSelected([])
    setResult(null)
    setFeedbackOpen(false)
    setCopied(false)
    setCopiedCmd(false)
  }

  const recordEvaluatedAnswer = (evaluated: AnswerResult, nextSelected: string[]) => {
    if (recordedQuestionIdsRef.current.has(currentQuestion.id)) {
      return
    }

    const answerEvent = {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      isCorrect: evaluated.isCorrect,
      selected: nextSelected,
      answeredAt: new Date().toISOString(),
    }
    const nextProgress = recordAnswer(progress, answerEvent)
    sendAnswerEvent(answerEvent)

    // Calculate gamification updates
    const xpGain = calculateXpGain(evaluated.isCorrect, nextProgress.streak)
    const nextXp = (progress.xp ?? 0) + xpGain
    const lvInfo = getLevelInfo(nextXp)
    const nextLevel = lvInfo.level

    // Update progress object properties
    nextProgress.xp = nextXp
    nextProgress.level = nextLevel
    nextProgress.soundEnabled = progress.soundEnabled ?? true

    // Check for achievements
    const newUnlocked = checkNewAchievements(nextProgress)
    if (newUnlocked.length > 0) {
      const allUnlocked = [
        ...(progress.unlockedAchievements || []),
        ...newUnlocked
      ]
      nextProgress.unlockedAchievements = allUnlocked
      
      const firstBadge = achievements.find(a => a.id === newUnlocked[0])
      if (firstBadge) {
        triggerNotification('achievement', firstBadge.title)
      }
    } else {
      nextProgress.unlockedAchievements = progress.unlockedAchievements || []
    }

    if (nextLevel > (progress.level ?? 1)) {
      triggerNotification('level', nextLevel)
    }

    recordedQuestionIdsRef.current.add(currentQuestion.id)
    setProgress(nextProgress)
    saveProgress(nextProgress)
  }

  const playClickAndSpeak = (label: string, action: () => void) => {
    if (progress.soundEnabled ?? true) {
      playClickSound()
      if (result && result.isCorrect) {
        speakText(label)
      }
    }
    action()
  }

  const playAudioOrTTS = (audioUrl: string, fallbackText: string) => {
    stopAudio()
    if (!(progress.soundEnabled ?? true)) return
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.play().catch((err) => {
      console.warn(`Pre-recorded audio failed, falling back to TTS:`, err)
      if (progress.soundEnabled ?? true) {
        speakText(fallbackText)
      }
    })
  }

  const toggleOption = (optionId: string) => {
    // 1. Every option button click makes a click sound
    if (progress.soundEnabled ?? true) {
      playClickSound()
    }

    // If the question has already been answered correctly, just read the clicked option
    if (result && result.isCorrect) {
      const option = currentQuestion.options.find((o) => o.id === optionId)
      if (option) {
        const optionAudioUrl = audioUrl(`${currentQuestion.id}-option-${optionId}.mp3`)
        const optionSpeechText = `${option.id.toUpperCase()}。${option.text}`
        playAudioOrTTS(optionAudioUrl, optionSpeechText)
      }
      return
    }

    let nextSelected: string[]
    if (currentQuestion.type === 'multiple') {
      nextSelected = selected.includes(optionId)
        ? selected.filter((item) => item !== optionId)
        : [...selected, optionId]
    } else {
      nextSelected = [optionId]
    }

    setSelected(nextSelected)
    if (!shouldEvaluateSelection(currentQuestion, nextSelected)) {
      setResult(null)
      setFeedbackOpen(false)
      return
    }

    const evaluated = evaluateAnswer(currentQuestion, nextSelected)
    setResult(evaluated)
    setFeedbackOpen(false)
    recordEvaluatedAnswer(evaluated, nextSelected)

    // 2. Play feedback sound on submission
    if (evaluated.isCorrect) {
      if (progress.soundEnabled ?? true) {
        playSuccessSound()
      }
      // Read the correct answer(s)
      const correctIds = currentQuestion.answer
      const correctOptions = currentQuestion.options.filter((o) => correctIds.includes(o.id))
      const correctOptionsText = correctOptions.map((o) => `${o.id.toUpperCase()}。${o.text}`).join('。')
      
      const correctAudioUrl = audioUrl(`${currentQuestion.id}-correct.mp3`)
      const correctSpeechText = `正确答案是：${correctIds.join('、').toUpperCase()}。${correctOptionsText}`
      playAudioOrTTS(correctAudioUrl, correctSpeechText)
    } else {
      if (progress.soundEnabled ?? true) {
        playFailureSound()
      }
    }
  }

  const moveQuestion = (direction: 'previous' | 'next') => {
    if (activePool.length === 0) return
    const next = getAdjacentQuestion(activePool, currentQuestion.id, direction)
    if (!next) return
    setCurrentQuestion(next)
    resetQuestionViewState()
    setSelected([])
    setResult(null)
    setFeedbackOpen(false)
    setCopied(false)
    setCopiedCmd(false)
  }

  const mistakeQuestions = questionBank.filter((question) =>
    progress.mistakes.some((mistake) => mistake.questionId === question.id),
  )
  const feedbackDetails = result ? buildFeedbackDetails(currentQuestion, result) : null
  const questionCountByCategory = useMemo(() => {
    return questionBank.reduce((counts, question) => {
      const matchLevel = subMode === 'basic' ? question.level === 'basic' : question.level !== 'basic'
      if (matchLevel) {
        counts.set(question.category, (counts.get(question.category) ?? 0) + 1)
      }
      return counts
    }, new Map<CategoryId, number>())
  }, [subMode, questionBank])

  const totalCount = useMemo(() => {
    return questionBank.filter((q) =>
      subMode === 'basic' ? q.level === 'basic' : q.level !== 'basic',
    ).length
  }, [subMode, questionBank])

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-label="学习概览">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span>ops</span>
          </div>
          <div>
            <h1>运维一点通</h1>
            <p>基于真实招聘要求的运维、云平台、DevOps 与 SRE 实战训练</p>
            <div className="level-xp-container">
              <div className="level-info">
                <span className="level-badge">LV.{levelInfo.level}</span>
                <span className="level-title">{levelInfo.title}</span>
                <span className="xp-text">{levelInfo.totalXp} XP (本级: {levelInfo.currentLevelXp}/{levelInfo.nextLevelXp})</span>
              </div>
              <div className="xp-progress-bar-bg">
                <div className="xp-progress-bar-fill" style={{ width: `${levelInfo.percent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-metrics" aria-label="今日学习数据">
          <Metric label="已答" value={progress.answered.toString()} />
          <Metric label="正确率" value={`${accuracy(progress)}%`} />
          <Metric label="连对" value={progress.streak.toString()} isStreak streakCount={progress.streak} />
          <Metric label="错题" value={progress.mistakes.length.toString()} />
        </div>
      </section>

      <section className="dashboard-grid">
        <aside className="control-rail" aria-label="训练分类">
          <div className="section-heading">
            <h2>训练路径</h2>
            <span>{totalCount} 题</span>
          </div>
          <button
            className={`category-button ${mode === 'all' ? 'active' : ''}`}
            onClick={() => chooseMode('all')}
          >
            <span className="category-dot all-dot" />
            <span>
              全部训练
              <small>{totalCount} 题完整题库</small>
            </span>
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-button ${mode === category.id ? 'active' : ''}`}
              onClick={() => chooseMode(category.id)}
            >
              <span className="category-dot" style={{ backgroundColor: category.accent }} />
              <span>
                {category.name}
                <small>
                  {questionCountByCategory.get(category.id) ?? 0} 题 · {category.description}
                </small>
              </span>
            </button>
          ))}
          <button
            className={`category-button mistake-button ${mode === 'mistakes' ? 'active' : ''}`}
            onClick={() => chooseMode('mistakes')}
          >
            <span className="category-dot mistake-dot" />
            错题复习
            <small>{mistakeQuestions.length} 道待复盘</small>
          </button>

          <input
            ref={importInputRef}
            className="question-import-input"
            type="file"
            accept=".json,application/json"
            onChange={handleImportQuestions}
          />

          <div className="question-import-panel" aria-label="题目导入">
            <div className="question-import-header">
              <strong>题目导入</strong>
              <span>{importedQuestions.length} 题</span>
            </div>
            <div className="question-import-actions">
              <button type="button" onClick={() => importInputRef.current?.click()}>
                导入 JSON
              </button>
              <button type="button" onClick={downloadQuestionTemplate}>
                模板
              </button>
              <button type="button" onClick={handleClearImportedQuestions} disabled={importedQuestions.length === 0}>
                清空
              </button>
            </div>
            <p className="question-import-message" role="status" aria-live="polite">{importMessage}</p>
          </div>

          <div className="sync-panel" aria-label="云同步">
            <div className="sync-panel-header">
              <strong>云同步</strong>
              <span className={`sync-status sync-status-${syncStatus}`}>
                {syncStatus === 'syncing' && '同步中…'}
                {syncStatus === 'synced' && '已同步'}
                {syncStatus === 'offline' && '离线'}
                {syncStatus === 'idle' && '本地'}
              </span>
            </div>
            <p className="sync-code-line">
              同步码：<code className="sync-code">{userId.slice(0, 8)}…</code>
              <button type="button" onClick={handleCopySyncCode}>复制</button>
            </p>
            <div className="sync-code-input-row">
              <input
                type="text"
                value={syncCodeInput}
                onChange={(event) => setSyncCodeInput(event.target.value)}
                placeholder="粘贴其他设备的同步码"
                aria-label="输入同步码"
              />
              <button type="button" onClick={handleApplySyncCode} disabled={!syncCodeInput.trim()}>
                载入
              </button>
            </div>
            {syncMessage && <p className="question-import-message" role="status" aria-live="polite">{syncMessage}</p>}
          </div>

          <div className="achievements-sidebar-section">
            <div className="section-heading">
              <h2>成就勋章</h2>
              <span>{(progress.unlockedAchievements || []).length}/{achievements.length}</span>
            </div>
            <div className="badge-grid">
              {achievements.map((badge) => {
                const isUnlocked = (progress.unlockedAchievements || []).includes(badge.id)
                return (
                  <div
                    key={badge.id}
                    className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                  >
                    <span className="badge-icon">{badge.icon}</span>
                    <div className="badge-tooltip">
                      <strong>{badge.title}</strong>
                      <p>{badge.description}</p>
                      <small>条件: {badge.conditionDesc}</small>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        <section className="question-stage" aria-label="当前题目">
          <div className="question-toolbar">
            <div>
              <span className="question-kicker">
                {typeLabel[currentQuestion.type]} / {levelLabel[currentQuestion.level]}
              </span>
              <h2>{currentQuestion.title}</h2>
            </div>
            {mode !== 'mistakes' && (
              <div className="difficulty-tabs">
                <button
                  className={`tab-btn ${subMode === 'basic' ? 'active' : ''}`}
                  onClick={() => changeSubMode('basic')}
                >
                  基础
                </button>
                <button
                  className={`tab-btn ${subMode === 'advanced' ? 'active' : ''}`}
                  onClick={() => changeSubMode('advanced')}
                >
                  进阶
                </button>
              </div>
            )}
            <span className="question-count">
              {activePool.length ? currentIndex + 1 : 0}/{activePool.length}
            </span>
          </div>

          {currentQuestion.context && (
            <div className="terminal-container">
              <div className="terminal-header">
                <div className="terminal-controls">
                  <span className="terminal-dot close" />
                  <span className="terminal-dot minimize" />
                  <span className="terminal-dot maximize" />
                </div>
                <span className="terminal-title">ops-terminal ~ {currentQuestion.id}.sh</span>
                <button
                  className={`terminal-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={() => handleCopy(currentQuestion.context || '', false)}
                  aria-label="复制代码"
                >
                  {copied ? '已复制 ✓' : '复制代码'}
                </button>
              </div>
              <pre className="context-block">{currentQuestion.context}</pre>
            </div>
          )}

          <div className="prompt-container">
            <p className="prompt">{formatBodyText(currentQuestion.prompt)}</p>
            <button
              className={`audio-play-btn ${isPlayingAudio ? 'playing' : ''}`}
              onClick={toggleAudio}
              title={isPlayingAudio ? '暂停朗读' : '语音朗读'}
              aria-label="语音朗读"
            >
              {isPlayingAudio ? (
                <svg className="audio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className="sound-wave wave-1" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className="sound-wave wave-2" />
                </svg>
              ) : (
                <svg className="audio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" opacity="0.4" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity="0.4" />
                </svg>
              )}
            </button>
          </div>

          <div className="option-grid">
            {currentQuestion.options.map((option) => {
              const isSelected = selected.includes(option.id)
              const isCorrect = result && (result.isCorrect || feedbackOpen) && result.correctAnswer.includes(option.id)
              const isWrong = result && isSelected && !result.correctAnswer.includes(option.id)
              return (
                <button
                  key={option.id}
                  className={`option-card ${isSelected ? 'selected' : ''} ${
                    isCorrect ? 'correct' : ''
                  } ${isWrong ? 'wrong' : ''}`}
                  onClick={() => toggleOption(option.id)}
                  aria-pressed={isSelected}
                >
                  <span>{option.id.toUpperCase()}</span>
                  <div className="option-text-content">{formatBodyText(option.text)}</div>
                </button>
              )
            })}
          </div>

          <div className="action-row">
            <button className="secondary-action" onClick={() => playClickAndSpeak('上一题', () => moveQuestion('previous'))}>
              上一题
            </button>
            <button
              className={`primary-action ${canAdvanceAfterAnswer(result) ? 'ready' : ''}`}
              onClick={() => playClickAndSpeak('下一题', () => moveQuestion('next'))}
              disabled={!canAdvanceAfterAnswer(result)}
            >
              下一题
            </button>
            {result && (
              <button
                className={`feedback-action ${result.isCorrect ? 'pass' : 'fail'}`}
                onClick={() => playClickAndSpeak(result.isCorrect ? '判断正确' : '需要复盘', () => setFeedbackOpen(true))}
              >
                {result.isCorrect ? '判断正确' : '需要复盘'}
              </button>
            )}
          </div>

          {result === null && activeTip && (
            <div className="daily-tip-card">
              <div className="tip-header">
                <span className="tip-badge">💡 SRE 专家法则 · {activeTip.title}</span>
                <button
                  className="tip-rotate-btn"
                  onClick={() => setTipIndex(prev => prev + 1)}
                  title="切换下一个提示"
                >
                  换一个 ↻
                </button>
              </div>
              <p className="tip-content">{formatBodyText(activeTip.content)}</p>
            </div>
          )}

          <Suspense fallback={<div className="job-board-loading">加载岗位样本…</div>}>
            <JobBoard />
          </Suspense>

        </section>
      </section>

      {result && feedbackDetails && feedbackOpen && (
        <div className="drawer-layer" role="presentation">
          <button
            className="drawer-scrim"
            aria-label="关闭解析"
            onClick={() => playClickAndSpeak('关闭解析', closeFeedback)}
          />
          <aside
            className={`answer-drawer ${result.isCorrect ? 'pass' : 'fail'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="answer-drawer-title"
          >
            <div className="drawer-heading">
              <div>
                <span>{currentQuestion.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 id="answer-drawer-title">{feedbackDetails.statusTitle}</h3>
                  <button
                    className={`audio-play-btn ${isPlayingExplanation ? 'playing' : ''}`}
                    onClick={toggleExplanationAudio}
                    title={isPlayingExplanation ? '暂停朗读' : '朗读解析'}
                    aria-label="朗读解析"
                    style={{ width: '36px', height: '36px' }}
                  >
                    {isPlayingExplanation ? (
                      <svg className="audio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className="sound-wave wave-1" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className="sound-wave wave-2" />
                      </svg>
                    ) : (
                      <svg className="audio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" opacity="0.4" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity="0.4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button ref={drawerCloseRef} className="drawer-close" onClick={() => playClickAndSpeak('关闭', closeFeedback)}>
                关闭
              </button>
            </div>
            <div className="answer-overview">
              <div>
                <span>正确答案</span>
                <strong>{feedbackDetails.correctAnswerText}</strong>
              </div>
              {result.relatedCommand && (
                isExecutableCommand(result.relatedCommand) ? (
                  <div className="command-wrapper">
                    <code>{result.relatedCommand}</code>
                    <button
                      className={`command-copy-btn ${copiedCmd ? 'copied' : ''}`}
                      onClick={() => handleCopy(result.relatedCommand || '', true)}
                      aria-label="复制相关命令"
                    >
                      {copiedCmd ? '已复制 ✓' : '复制命令'}
                    </button>
                  </div>
                ) : (
                  <div className="conceptual-wrapper">
                    <span>核心概念 / 运维流程</span>
                    <strong>{result.relatedCommand}</strong>
                  </div>
                )
              )}
            </div>

            {result.relatedCommand && isExecutableCommand(result.relatedCommand) && (
              <Suspense fallback={<div className="terminal-preview-loading">加载命令预览…</div>}>
                <TerminalPreview relatedCommand={result.relatedCommand} />
              </Suspense>
            )}

            <div className="feedback-section-grid">
              {feedbackDetails.sections.map((section) => {
                const config = getSectionConfig(section.title)
                return (
                  <section key={section.title} className={`feedback-section ${config.className}`}>
                    <div className="section-title-wrapper">
                      {config.icon}
                      <h4>{section.title}</h4>
                    </div>
                    <p>{formatBodyText(section.body)}</p>
                  </section>
                )
              })}
            </div>
          </aside>
        </div>
      )}
      {/* Sound Toggle Button */}
      <button
        className={`sound-toggle-fab ${progress.soundEnabled ?? true ? 'enabled' : 'disabled'}`}
        onClick={() => {
          const nextProgress = { ...progress, soundEnabled: !(progress.soundEnabled ?? true) }
          if (!nextProgress.soundEnabled) {
            stopAudio()
          }
          setProgress(nextProgress)
          saveProgress(nextProgress)
        }}
        title={progress.soundEnabled ?? true ? '关闭音效与朗读' : '开启音效与朗读'}
        aria-label="切换音效"
      >
        {progress.soundEnabled ?? true ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="fab-icon" style={{ width: '20px', height: '20px' }}>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="fab-icon" style={{ width: '20px', height: '20px' }}>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>

      {/* Toast Notifications */}
      {unlockedAchievementNotification && (
        <div className="toast-notification achievement-toast" role="status" aria-live="polite">
          <div className="toast-icon">🏆</div>
          <div className="toast-body">
            <h4>解锁新成就！</h4>
            <p>{unlockedAchievementNotification}</p>
          </div>
        </div>
      )}

      {levelUpNotification !== null && (
        <div className="toast-notification levelup-toast" role="status" aria-live="polite">
          <div className="toast-icon">✨</div>
          <div className="toast-body">
            <h4>等级提升！</h4>
            <p>恭喜升级到 LV.{levelUpNotification}！</p>
          </div>
        </div>
      )}
    </main>
  )
}

function Metric({ label, value, isStreak, streakCount }: { label: string; value: string; isStreak?: boolean; streakCount?: number }) {
  const hasFlame = isStreak && streakCount !== undefined && streakCount >= 3
  return (
    <div className={`metric ${hasFlame ? 'streak-active' : ''}`}>
      <span>{label}</span>
      <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {value}
        {hasFlame && <span className="streak-flame" title="连对火花燃烧中！">🔥</span>}
      </strong>
    </div>
  )
}

export default App
