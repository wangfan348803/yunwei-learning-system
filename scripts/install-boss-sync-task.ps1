param(
  [string]$At = "08:30",
  [string]$TaskName = "YunweiBossDailySync",
  [switch]$AllowPublic
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$DeployScript = Join-Path $RepoRoot "scripts\sync-boss-jobs-and-deploy.ps1"

if (-not (Test-Path $DeployScript)) {
  throw "Deploy script not found: $DeployScript"
}

if (-not $env:CLOUDFLARE_API_TOKEN) {
  throw "Missing CLOUDFLARE_API_TOKEN. Set it in the current user environment first."
}

if (-not $env:CLOUDFLARE_ACCOUNT_ID) {
  throw "Missing CLOUDFLARE_ACCOUNT_ID. Set it in the current user environment first."
}

$taskArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$DeployScript`""
if ($AllowPublic) {
  $taskArgs += " -AllowPublic"
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $taskArgs -WorkingDirectory $RepoRoot
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Daily BOSS ops jobs sync and Cloudflare Pages deployment for yunwei-learning-system." `
  -Force | Out-Null

Write-Host "Installed scheduled task: $TaskName"
Write-Host "Daily time: $At"
Write-Host "Command: powershell.exe $taskArgs"
