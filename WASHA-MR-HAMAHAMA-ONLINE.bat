@echo off
setlocal
title Mr. HamaHama Online Starter
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\start-online.ps1"
echo.
echo Bonyeza kitufe chochote kufunga dirisha hili.
pause >nul

