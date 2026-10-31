@echo off
title PLACEearly Test Suite Runner
echo ================================================================
echo    PLACEearly - Automated Test Suite Runner (330 Tests)
echo ================================================================
echo.

cd /d "%~dp0"
npm test

echo.
echo ================================================================
echo Execution finished. Press any key to close.
echo ================================================================
pause >nul
