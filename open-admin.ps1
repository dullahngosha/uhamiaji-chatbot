$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$tokenPath = Join-Path $projectPath '.local\admin-token.txt'

if (-not (Test-Path -LiteralPath $tokenPath)) {
    Write-Host 'Admin token haijapatikana. Washa start-ai.ps1 kwanza.' -ForegroundColor Yellow
    exit 1
}

$staticServer = Get-NetTCPConnection -LocalPort 8099 -State Listen -ErrorAction SilentlyContinue
if (-not $staticServer) {
    $serverArgs = @('-m', 'http.server', '8099', '--bind', '127.0.0.1', '--directory', ('"' + $projectPath + '"'))
    Start-Process -FilePath 'python' -ArgumentList $serverArgs -WindowStyle Hidden
    $deadline = (Get-Date).AddSeconds(8)
    do {
        Start-Sleep -Milliseconds 250
        $staticServer = Get-NetTCPConnection -LocalPort 8099 -State Listen -ErrorAction SilentlyContinue
    } until ($staticServer -or (Get-Date) -ge $deadline)
    if (-not $staticServer) { throw 'Imeshindikana kuwasha admin web server kwenye port 8099.' }
}

$token = (Get-Content -Raw -LiteralPath $tokenPath).Trim()
if ($token -notmatch '^[a-f0-9]{64}$') { throw 'Admin token si sahihi. Endesha start-ai.ps1 kutengeneza token mpya.' }

Start-Process -FilePath "http://127.0.0.1:8099/admin.html#token=$token"
Write-Host 'Admin page limefunguliwa bila kuandika token.' -ForegroundColor Green
