@echo off
REM Jenga data ya Mr. HamaHama: nyaraka rasmi za immigration.go.tz + sheria zako (data\sheria.json)
chcp 65001 >nul
set PYTHONUTF8=1
cd /d "%~dp0"
set "SHERIA=%USERPROFILE%\Desktop\SHERIA ZA UHAMIAJI"
set "HAMAHAMA=%USERPROFILE%\Desktop\hamahama"
echo Inasakinisha pypdf na python-docx (mara ya kwanza tu)...
python -m pip install --quiet pypdf python-docx
echo.
echo [1/2] Inapakua nyaraka rasmi kutoka immigration.go.tz ...
python tools\fetch_official.py
echo.
echo [2/2] Inasoma nyaraka zote na kuruka zinazojirudia ...
set "FOLDERS=rasmi"
if exist "%SHERIA%" set FOLDERS=%FOLDERS% "%SHERIA%"
if exist "%HAMAHAMA%" set FOLDERS=%FOLDERS% "%HAMAHAMA%"
python tools\build_kb.py %FOLDERS%
echo.
echo Imekamilika. Fanya commit na push ya data\sheria.json na data\knowledge.json
pause
