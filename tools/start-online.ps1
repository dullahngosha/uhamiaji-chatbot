$ErrorActionPreference = 'Stop'

$projectPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$localPath = Join-Path $projectPath '.local'
$backendLog = Join-Path $localPath 'backend-online.log'
$backendErrorLog = Join-Path $localPath 'backend-online-error.log'
$tunnelLog = Join-Path $localPath 'tunnel-online.log'
$tunnelErrorLog = Join-Path $localPath 'tunnel-online-error.log'
$fallbackTunnelLog = Join-Path $localPath 'tunnel-fallback.log'
$fallbackTunnelErrorLog = Join-Path $localPath 'tunnel-fallback-error.log'
$embedPath = Join-Path $projectPath 'embed.js'
$batchPath = Join-Path $projectPath 'WASHA-MR-HAMAHAMA-ONLINE.bat'
$startupPath = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupPath 'Mr HamaHama Online.lnk'

New-Item -ItemType Directory -Force -Path $localPath | Out-Null

function Wait-Until([scriptblock]$Condition, [int]$Seconds, [string]$FailureMessage) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    do {
        if (& $Condition) { return }
        Start-Sleep -Milliseconds 750
    } while ((Get-Date) -lt $deadline)
    throw $FailureMessage
}

Write-Host 'Mr. HamaHama: inaanza...' -ForegroundColor Cyan

if (-not (Test-Path -LiteralPath $shortcutPath)) {
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $batchPath
    $shortcut.WorkingDirectory = $projectPath
    $shortcut.WindowStyle = 7
    $shortcut.Save()
    Write-Host 'Imeongezwa Windows Startup; itawaka yenyewe ukiingia Windows.' -ForegroundColor Green
}

try {
    Invoke-RestMethod 'http://127.0.0.1:11434/api/tags' -TimeoutSec 3 | Out-Null
} catch {
    Write-Host 'Nawasha Ollama...' -ForegroundColor Yellow
    Start-Process -FilePath 'ollama' -ArgumentList 'serve' -WindowStyle Hidden
    Wait-Until { try { Invoke-RestMethod 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2 | Out-Null; $true } catch { $false } } 30 'Ollama haikuwaka ndani ya sekunde 30.'
}

$listener = Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    Write-Host 'Nawasha AI backend...' -ForegroundColor Yellow
    Remove-Item -LiteralPath $backendLog -Force -ErrorAction SilentlyContinue
    Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $projectPath 'start-ai.ps1')) -WorkingDirectory $projectPath -WindowStyle Hidden -RedirectStandardOutput $backendLog -RedirectStandardError $backendErrorLog
}
Wait-Until { try { (Invoke-RestMethod 'http://127.0.0.1:8765/health' -TimeoutSec 2).status -eq 'ok' } catch { $false } } 60 'AI backend haikuwaka ndani ya sekunde 60. Angalia .local\backend-online.log.'
Write-Host 'AI backend iko tayari.' -ForegroundColor Green

$cloudflared = (Get-Command 'cloudflared' -ErrorAction Stop).Source
$script:tunnelUrl = ''
$tunnelReady = $false
for ($attempt = 1; $attempt -le 3 -and -not $tunnelReady; $attempt++) {
    Get-CimInstance Win32_Process -Filter "Name='cloudflared.exe'" |
        Where-Object { $_.CommandLine -match 'tunnel.+127\.0\.0\.1:8765' } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
    Remove-Item -LiteralPath $tunnelLog, $tunnelErrorLog -Force -ErrorAction SilentlyContinue
    Write-Host "Nawasha HTTPS tunnel (jaribio $attempt/3)..." -ForegroundColor Yellow
    Start-Process -FilePath $cloudflared -ArgumentList @('tunnel', '--url', 'http://127.0.0.1:8765', '--no-autoupdate') -WorkingDirectory $projectPath -WindowStyle Hidden -RedirectStandardOutput $tunnelLog -RedirectStandardError $tunnelErrorLog
    $script:tunnelUrl = ''
    try {
        Wait-Until {
            $combinedLog = ((Get-Content -Raw -LiteralPath $tunnelLog -ErrorAction SilentlyContinue) + (Get-Content -Raw -LiteralPath $tunnelErrorLog -ErrorAction SilentlyContinue))
            if ($combinedLog) {
                $match = [regex]::Match($combinedLog, 'https://[a-z0-9-]+\.trycloudflare\.com')
                if ($match.Success) { $script:tunnelUrl = $match.Value; return $true }
            }
            $false
        } 60 'HTTPS tunnel haikutoa URL.'
        $healthDeadline = (Get-Date).AddSeconds(15)
        do {
            try { $tunnelReady = (Invoke-RestMethod "$script:tunnelUrl/health" -TimeoutSec 5).status -eq 'ok' } catch { $tunnelReady = $false }
            if (-not $tunnelReady) { Start-Sleep -Seconds 2 }
        } while (-not $tunnelReady -and (Get-Date) -lt $healthDeadline)
    } catch {
        Write-Warning $_.Exception.Message
    }
}
if (-not $tunnelReady) {
    Write-Warning 'Cloudflare quick tunnel haijafanya kazi; natumia HTTPS fallback.'
    Get-CimInstance Win32_Process -Filter "Name='ssh.exe'" |
        Where-Object { $_.CommandLine -match 'localhost\.run.+127\.0\.0\.1:8765|127\.0\.0\.1:8765.+localhost\.run' } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
    Remove-Item -LiteralPath $fallbackTunnelLog, $fallbackTunnelErrorLog -Force -ErrorAction SilentlyContinue
    Start-Process -FilePath 'ssh.exe' -ArgumentList @('-T', '-o', 'StrictHostKeyChecking=no', '-o', 'ServerAliveInterval=30', '-R', '80:127.0.0.1:8765', 'nokey@localhost.run') -WorkingDirectory $projectPath -WindowStyle Hidden -RedirectStandardOutput $fallbackTunnelLog -RedirectStandardError $fallbackTunnelErrorLog
    Wait-Until {
        $combinedLog = ((Get-Content -Raw -LiteralPath $fallbackTunnelLog -ErrorAction SilentlyContinue) + (Get-Content -Raw -LiteralPath $fallbackTunnelErrorLog -ErrorAction SilentlyContinue))
        $match = [regex]::Match($combinedLog, 'https://[a-z0-9-]+\.lhr\.life')
        if ($match.Success) { $script:tunnelUrl = $match.Value; return $true }
        $false
    } 60 'HTTPS fallback haikutoa URL.'
    Wait-Until { try { (Invoke-RestMethod "$script:tunnelUrl/health" -TimeoutSec 5).status -eq 'ok' } catch { $false } } 60 'HTTPS fallback imeundwa lakini health check imeshindwa.'
    $tunnelReady = $true
}
Write-Host "Tunnel: $script:tunnelUrl" -ForegroundColor Green

$embed = Get-Content -Raw -LiteralPath $embedPath
$replacement = "if(!endpoint&&location.hostname==='uhamiajihabari.blogspot.com')endpoint='$script:tunnelUrl/api/chat';"
$updated = [regex]::Replace($embed, "if\(!endpoint&&location\.hostname==='uhamiajihabari\.blogspot\.com'\)endpoint='https://[a-z0-9.-]+/(?:api/chat)?';", $replacement)
if ($updated -eq $embed -and $embed -notmatch [regex]::Escape($replacement)) {
    throw 'Mstari wa Blogspot endpoint haukupatikana ndani ya embed.js.'
}

if ($updated -ne $embed) {
    Set-Content -LiteralPath $embedPath -Value $updated -Encoding utf8 -NoNewline
    Push-Location $projectPath
    try {
        & git add embed.js
        & git commit -m "Update live AI tunnel endpoint"
        if ($LASTEXITCODE -ne 0) { throw 'Git commit imeshindwa.' }
        & git push origin main
        if ($LASTEXITCODE -ne 0) { throw 'Git push imeshindwa. Hakikisha GitHub login ipo.' }
    } finally {
        Pop-Location
    }
}

Write-Host ''
Write-Host 'MR. HAMAHAMA YUKO ONLINE.' -ForegroundColor Green
Write-Host 'Website: https://uhamiajihabari.blogspot.com/'
Write-Host 'Usifunge Ollama, AI backend au cloudflared kupitia Task Manager.'
Write-Host 'Laptop na internet lazima viendelee kuwaka.' -ForegroundColor Yellow
