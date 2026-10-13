@echo off
setlocal
cd /d "%~dp0"
title ServerSage

if not exist ".env" (
  echo .env was not found. Double-click setup-windows.cmd first.
  pause
  exit /b 1
)

if not exist "node_modules\discord.js\package.json" (
  echo Required packages were not installed. Double-click setup-windows.cmd first.
  pause
  exit /b 1
)

npm start
if errorlevel 1 (
  echo.
  echo ServerSage stopped with an error. Use the troubleshooting guide in README.md.
  pause
)
