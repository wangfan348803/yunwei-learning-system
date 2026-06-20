# 运维一点通

面向运维、网络安全、云平台、容器 DevOps、数据库中间件和 SRE 交付闭环的实战答题学习系统。当前题库按 BOSS 运维招聘高频要求彻底重构，不再把招聘要求做成孤立专题，而是融入每一个核心能力域。

## 功能

- 分类训练：Linux 自动化、网络安全、云平台数据中心、容器 DevOps、数据库中间件、SRE 交付闭环，每类 42 题，共 252 题。
- 难度三档：基础 / 进阶 / 高级。训练页按「基础」与「进阶+高级」两个子模式切换。
- 题型覆盖：单选、多选、命令题、日志分析题、配置题、场景排障题。
- 招聘调研融入题库：基于 2026-06-02 已登录 BOSS 直聘“西安 运维工程师”当前在招岗位样本，抓取 46 个岗位入口、36 个详情页，其中 34 个详情页有可提炼要求；高频要求被重构进 Linux、网络、云平台、DevOps、中间件和 SRE 六个能力域。
- 本地学习进度：已答、正确率、连对、错题复习（localStorage 离线优先）。
- 云同步：每个浏览器首次访问生成一个「同步码」（UUID）。进度（含 XP、成就、错题）作为完整快照同步到 D1，采用「最后写入获胜」策略。在其他设备粘贴同一同步码即可拉取进度，无需账号密码。
- 服务端接口：Cloudflare Pages Functions 提供题库、判题、进度快照读写和错题接口。
- D1 数据库：`answer_events` 记录答题分析事件，`mistakes` 记录错题，`user_progress` 保存每个同步码的完整进度快照。

## 本地开发

```bash
npm install
npm run dev
```

`npm run dev` 只起前端（Vite，端口 5173），不运行 Pages Functions，因此云同步会显示「离线」、仅本地存储生效——这不影响答题。要在本地联调含后端的完整链路（含 `/api/*` 与 D1），用：

```bash
npx wrangler d1 migrations apply yunwei_learning_db --local
npx wrangler pages dev -- npm run dev
```

常用质量检查：

```bash
npm run lint
npm test -- --run
npm run typecheck:functions
npm run build
```

## Cloudflare 部署

本项目应使用独立 Cloudflare 账号部署，不要和英语项目混用。

1. 登录单独的 Cloudflare 账号：

```bash
npx wrangler login
```

2. 创建 D1 数据库：

```bash
npx wrangler d1 create yunwei_learning_db
```

3. 把命令输出里的 `database_id` 填入 `wrangler.toml`：

```toml
database_id = "你的 D1 database_id"
```

4. 执行远端迁移：

```bash
npm run db:migrate
```

5. 部署 Pages：

```bash
npm run deploy:cloudflare
```

如果使用 API Token，不要写进仓库。只在当前终端会话设置环境变量。

## 音频资产

题目语音共 ~1764 个 mp3、约 83MB，存放在 `public/audio/`，随 `dist` 一起部署。前端音频地址通过 `audioUrl()`（`src/logic/audioAssets.ts`）解析，默认走同源 `/audio`，播放失败时自动降级为浏览器 TTS 朗读。

> 注意：`public/audio/` 体积较大且未纳入 Git 版本控制，请自行做好备份。

### 改题后重新生成语音

预生成的 mp3 与题目文字是绑定的：一旦改了某题的选项或解析文字，对应的旧 mp3 就会"念旧、显新"对不上（只有文件缺失时前端才会降级为实时 TTS）。因此约定改文字时删掉对应旧 mp3，再用 edge-tts 按当前题库补齐：

```bash
pip install edge-tts            # 需要 edge-tts CLI
node scripts/regen-audio.mjs    # 只补缺失文件；默认发音 zh-CN-XiaoxiaoNeural
```

可用环境变量覆盖：`TTS_VOICE`（发音人）、`EDGE_TTS`（edge-tts 可执行文件路径）。每个文件念的文本与 `src/App.tsx` 的 TTS 降级一致：`<id>.mp3`=题干、`-explanation.mp3`=解析、`-option-<x>.mp3`=「字母。选项」、`-correct.mp3`=正确答案播报。

### 可选：迁移到 R2（瘦身部署包）

若希望部署包不再打包这 83MB，可改为从 Cloudflare R2 提供音频：

1. 给 API Token 增加权限 `Workers R2 Storage: Edit`，创建桶并开启 Public Access：

```bash
npx wrangler r2 bucket create yunwei-audio
```

2. 上传音频（脚本默认从 `public/audio/` 读取；如改放别处需同步修改脚本路径）：

```bash
npm run audio:upload
```

3. 部署时设置 `VITE_AUDIO_BASE_URL` 指向 R2 公开域名下的 `/audio` 前缀，并把 `public/audio/` 移出构建目录以瘦身：

```bash
VITE_AUDIO_BASE_URL="https://你的-r2公开域名/audio" npm run deploy:cloudflare
```

迁移前请先确认 R2 上音频可正常访问，否则线上会降级为 TTS。

## 目录结构

```text
src/                 前端应用、题库、判题、进度与云同步逻辑
functions/api/       Cloudflare Pages Functions 接口
functions/_shared/   服务端共享判题逻辑和题库
migrations/          D1 数据库迁移
public/audio/        题目语音 mp3（随 dist 部署）
scripts/             BOSS 同步与 R2 音频上传脚本
```

## 后续扩展

- 将题库从本地 TypeScript 数据迁到 D1 后台管理。
- 增加账号系统和跨设备同步。
- 增加模拟终端、Kubernetes YAML 诊断和事故复盘模式。
