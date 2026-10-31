@echo off
title PLACEearly Unified Development Server
echo ================================================================
echo    PLACEearly - Campus Placement Operating System
echo    Starting Backend (Port 5001) and Frontend (Port 5173)...
echo ================================================================
echo.

cd /d "%~dp0"
node scripts\dev.js

pause
