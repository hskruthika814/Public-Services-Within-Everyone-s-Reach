@echo off
set URL="https://hskruthika814.github.io/Public-Services-Within-Everyone-s-Reach/"

if exist "C:\Program Files\Mozilla Firefox\firefox.exe" (
    start "" "C:\Program Files\Mozilla Firefox\firefox.exe" %URL%
    exit /b
)
if exist "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" (
    start "" "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" %URL%
    exit /b
)

:: If Firefox is not installed, automatically open in Chrome / Default Browser so it ALWAYS works
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" %URL%
    exit /b
)

start "" %URL%
