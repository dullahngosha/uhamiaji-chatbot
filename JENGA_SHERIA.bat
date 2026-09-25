@echo off
REM Geuza sheria zote za Uhamiaji kuwa data ya Mr. HamaHama (data\sheria.json)
chcp 65001 >nul
set PYTHONUTF8=1
cd /d "%~dp0"
set "SHERIA=%USERPROFILE%\Desktop\SHERIA ZA UHAMIAJI"
set "HAMAHAMA=%USERPROFILE%\Desktop\hamahama"
echo Inasakinisha pypdf na python-docx (mara ya kwanza tu)...
python -m pip install --quiet pypdf python-docx
if exist "%HAMAHAMA%" (
  python tools\build_kb.py "%SHERIA%" "%HAMAHAMA%"
) else (
  python tools\build_kb.py "%SHERIA%"
)
echo.
echo Imekamilika. Kagua orodha hapo juu, kisha fanya commit na push ya data\sheria.json
pause
