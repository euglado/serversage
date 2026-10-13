@echo off
setlocal
cd /d "%~dp0"
title ServerSage setup

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Install Node.js 24.17 or newer from https://nodejs.org/
  echo Then close this window, open it again, and double-click this file.
  pause
  exit /b 1
)

node -e "const v=process.versions.node.split('.').map(Number); process.exit(v[0] > 24 || (v[0] === 24 && v[1] >= 17) ? 0 : 1)"
if errorlevel 1 (
  echo ServerSage needs Node.js 24.17 or newer.
  echo Your installed version is:
  node --version
  echo Install a newer version from https://nodejs.org/ and run setup again.
  pause
  exit /b 1
)

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Created .env from the example file.
)

echo Installing ServerSage packages...
npm ci
if errorlevel 1 (
  echo Package installation did not finish. Check your internet connection and try again.
  pause
  exit /b 1
)

echo.
echo Setup is ready. Open .env in Notepad and add your Discord token and application ID.
echo Keep .env private. Never upload it or paste the token into a public chat.
pause
