@echo off
chcp 65001 >nul
echo ========================================
echo رفع صفحات العمال فقط إلى Firebase Hosting
echo ========================================
echo.

echo [1/4] بناء المشروع...
call npm run build
if errorlevel 1 (
    echo ❌ خطأ في البناء!
    pause
    exit /b 1
)

echo.
echo [2/4] إعداد build-worker (صفحات العمال فقط)...
node scripts/prepare-worker-build.js
if errorlevel 1 (
    echo ❌ خطأ في إعداد build-worker!
    pause
    exit /b 1
)

echo.
echo [3/4] التحقق من تسجيل الدخول إلى Firebase...
firebase login --no-localhost
if errorlevel 1 (
    echo ❌ خطأ في تسجيل الدخول!
    pause
    exit /b 1
)

echo.
echo [4/4] رفع صفحات العمال إلى Firebase Hosting...
firebase deploy --only hosting --config firebase-worker.json
if errorlevel 1 (
    echo ❌ خطأ في الرفع!
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ تم الرفع بنجاح!
echo ========================================
echo.
echo 📱 صفحات العمال متاحة على:
echo    https://mirmaia-33acc.web.app/worker
echo    https://mirmaia-33acc.web.app/worker/login
echo    https://mirmaia-33acc.web.app/worker/menu
echo    https://mirmaia-33acc.web.app/worker/orders
echo    https://mirmaia-33acc.web.app/worker/cashier
echo    https://mirmaia-33acc.web.app/worker/tables
echo.
echo ⚠️  ملاحظة: صفحات الأدمن لم يتم رفعها (محلية فقط)
echo.
pause
