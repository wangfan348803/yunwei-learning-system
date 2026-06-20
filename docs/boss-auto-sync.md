# BOSS 运维岗位自动同步

本项目的岗位区数据来自 `src/data/bossJobSnapshots.ts`。自动同步方案在本机运行：

1. 用专用 Chrome 配置登录 BOSS。
2. 采集西安、北京、上海、深圳、杭州、成都的“运维工程师”职位列表。
3. 写入 `src/data/bossJobSnapshots.ts`。
4. 执行 `lint`、`test`、`build`。
5. 部署到 Cloudflare Pages。

## 首次登录

```powershell
npm run boss:login
```

命令会打开一个专用 Chrome 窗口。请在这个窗口里登录 BOSS，并完成安全验证。它使用的登录态目录是：

```text
scratch/boss-browser-profile
```

不要删除这个目录，否则自动任务会丢失登录态。

如果只是想打开专用同步浏览器重新做一次 BOSS 安全验证：

```powershell
npm run boss:open
```

BOSS 偶尔会弹出图形安全验证。这个验证必须人工完成；脚本不会绕过验证。遇到验证时，同步任务会失败并保留旧数据，同时在 `logs/` 写入失败截图和诊断 JSON。

## 手动同步并部署

```powershell
npm run boss:deploy
```

默认要求检测到 BOSS 登录态。若 BOSS 登录过期，脚本会失败并保留旧数据，不会把空数据部署到线上。

只同步不部署：

```powershell
npm run boss:sync
```

如果临时允许公开列表样本，不要求登录态：

```powershell
node scripts/sync-boss-jobs.mjs --allow-public
```

## 安装每日任务

需要先配置 Cloudflare 环境变量：

```powershell
[Environment]::SetEnvironmentVariable("CLOUDFLARE_API_TOKEN", "<你的 Cloudflare API Token>", "User")
[Environment]::SetEnvironmentVariable("CLOUDFLARE_ACCOUNT_ID", "<你的 Cloudflare Account ID>", "User")
```

安装每天 08:30 运行的任务：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-boss-sync-task.ps1 -At 08:30
```

任务名默认是 `YunweiBossDailySync`。

也可以使用 npm 脚本安装默认 08:30 的任务：

```powershell
npm run boss:task:install
```

## 查看日志

同步和部署日志在：

```text
logs/
```

常见失败原因：

- BOSS 要求重新登录或安全验证。
- BOSS 页面结构变化，职位卡片无法解析。
- Cloudflare Token 失效。
- 测试或构建失败。

## 卸载每日任务

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/uninstall-boss-sync-task.ps1
```

或：

```powershell
npm run boss:task:uninstall
```
