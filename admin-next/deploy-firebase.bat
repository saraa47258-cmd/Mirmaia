@echo off
echo ========================================
echo رفع صفحات العمال إلى Firebase Hosting
echo ========================================
echo.

echo [1/3] بناء المشروع...
call npm run build
if errorlevel 1 (
    echo خطأ في البناء!
    pause
    exit /b 1
)

echo.
echo [2/3] التحقق من تسجيل الدخول إلى Firebase...
firebase login --no-localhost
if errorlevel 1 (
    echo خطأ في تسجيل الدخول!
    pause
    exit /b 1
)

echo.
echo [3/3] رفع الملفات إلى Firebase Hosting...
firebase deploy --only hosting
if errorlevel 1 (
    echo خطأ في الرفع!
    pause
    exit /b 1
)

echo.
echo ========================================
echo تم الرفع بنجاح!
echo ========================================
echo.
echo الموقع متاح على:
echo https://mirmaia-33acc.web.app
echo أو
echo https://mirmaia-33acc.firebaseapp.com
echo.
pause
