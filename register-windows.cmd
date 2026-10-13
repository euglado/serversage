@echo off
setlocal
cd /d "%~dp0"
title Register ServerSage commands

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

npm run commands:register
if errorlevel 1 (
  echo.
  echo Command registration failed. Check the values in .env and the troubleshooting guide.
  pause
  exit /b 1
)

echo.
echo The slash command is registered. Double-click start-windows.cmd to run ServerSage.
pause
