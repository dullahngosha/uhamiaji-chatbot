$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$localPath = Join-Path $projectPath '.local'
$tokenPath = Join-Path $localPath 'admin-token.txt'
New-Item -ItemType Directory -Force -Path $localPath | Out-Null
if (-not (Test-Path -LiteralPath $tokenPath)) {
    $bytes = New-Object byte[] 32
    $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
    ([BitConverter]::ToString($bytes) -replace '-', '').ToLowerInvariant() | Set-Content -LiteralPath $tokenPath -NoNewline
}
$env:ADMIN_TOKEN = Get-Content -Raw -LiteralPath $tokenPath
if (-not $env:CHAT_MODEL) {
    $installedModels = (& ollama list 2>$null | Out-String)
    $env:CHAT_MODEL = if ($installedModels -match '(?m)^qwen3:8b\s') { 'qwen3:8b' } elseif ($installedModels -match '(?m)^qwen3:0\.6b\s') { 'qwen3:0.6b' } else { 'gemma3:12b' }
}

Write-Host 'Starting Mr. HamaHama local AI API...' -ForegroundColor Cyan
Write-Host 'Health: http://127.0.0.1:8765/health'
Write-Host "Chat model: $($env:CHAT_MODEL)"
Write-Host 'Chatbot: http://127.0.0.1:8765/'
Write-Host 'Admin:   http://127.0.0.1:8765/admin.html'
Write-Host "Admin token: $($env:ADMIN_TOKEN)" -ForegroundColor Yellow
Write-Host 'Easy admin: run .\open-admin.ps1' -ForegroundColor Green
Write-Host 'Press Ctrl+C to stop.'

Set-Location -LiteralPath $projectPath
python -m uvicorn server.app:app --host 127.0.0.1 --port 8765
