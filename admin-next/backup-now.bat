@echo off
echo.
echo ========================================
echo   Sham Coffee - Firebase Backup
echo   النسخ الاحتياطي لبيانات Firebase
echo ========================================
echo.

cd /d "%~dp0"
node scripts/backup-firebase.js

echo.
echo Press any key to exit...
pause >nul
