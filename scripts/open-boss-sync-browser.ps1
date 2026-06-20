$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ProfileDir = Join-Path $RepoRoot "scratch\boss-browser-profile"
$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$Url = "https://www.zhipin.com/web/geek/jobs?query=%E8%BF%90%E7%BB%B4%E5%B7%A5%E7%A8%8B%E5%B8%88&city=101110100"

if (-not (Test-Path $Chrome)) {
  throw "Chrome not found: $Chrome"
}

New-Item -ItemType Directory -Force -Path $ProfileDir | Out-Null

Start-Process -FilePath $Chrome -ArgumentList @(
  "--user-data-dir=$ProfileDir",
  "--remote-debugging-port=9223",
  "--no-first-run",
  "--new-window",
  $Url
)

Write-Host "Opened BOSS sync browser."
Write-Host "Profile: $ProfileDir"
Write-Host "Complete BOSS login/security verification in that window, then rerun: npm run boss:deploy"
