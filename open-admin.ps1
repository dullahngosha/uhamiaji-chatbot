$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$tokenPath = Join-Path $projectPath '.local\admin-token.txt'

if (-not (Test-Path -LiteralPath $tokenPath)) {
    Write-Host 'Admin token haijapatikana. Washa start-ai.ps1 kwanza.' -ForegroundColor Yellow
    exit 1
}

$token = (Get-Content -Raw -LiteralPath $tokenPath).Trim()
if ($token -notmatch '^[a-f0-9]{64}$') { throw 'Admin token si sahihi. Endesha start-ai.ps1 kutengeneza token mpya.' }

Start-Process -FilePath "http://127.0.0.1:8765/admin.html#token=$token"
Write-Host 'Admin page limefunguliwa bila kuandika token.' -ForegroundColor Green
