$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host 'Starting Mr. HamaHama local AI API...' -ForegroundColor Cyan
Write-Host 'Health: http://127.0.0.1:8765/health'
Write-Host 'Press Ctrl+C to stop.'

Set-Location -LiteralPath $projectPath
python -m uvicorn server.app:app --host 127.0.0.1 --port 8765
