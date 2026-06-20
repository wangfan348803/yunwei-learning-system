param(
  [switch]$AllowPublic,
  [switch]$Headed
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$LogDir = Join-Path $RepoRoot "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$TranscriptPath = Join-Path $LogDir "boss-sync-deploy-$Timestamp.log"

Start-Transcript -Path $TranscriptPath | Out-Null

try {
  Set-Location $RepoRoot

  if (-not $env:CLOUDFLARE_API_TOKEN) {
    throw "Missing CLOUDFLARE_API_TOKEN. Set it as a user environment variable before installing the scheduled task."
  }

  if (-not $env:CLOUDFLARE_ACCOUNT_ID) {
    throw "Missing CLOUDFLARE_ACCOUNT_ID. Set it as a user environment variable before installing the scheduled task."
  }

  $syncArgs = @("scripts/sync-boss-jobs.mjs")
  if ($AllowPublic) { $syncArgs += "--allow-public" }
  if ($Headed) { $syncArgs += "--headed" }

  Write-Host "Running BOSS sync..."
  node @syncArgs

  Write-Host "Running lint..."
  npm run lint

  Write-Host "Running tests..."
  npm test

  Write-Host "Building..."
  npm run build

  Write-Host "Deploying to Cloudflare Pages..."
  npx wrangler pages deploy dist --project-name=yunwei-learning-system --branch=main --commit-dirty=true

  Write-Host "BOSS sync and deployment completed."
}
finally {
  Stop-Transcript | Out-Null
  Write-Host "Log: $TranscriptPath"
}
