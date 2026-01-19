# Create Portable ZIP Package
Write-Host "Creating portable ZIP package..." -ForegroundColor Cyan

$packageDir = "build\installer_package"
$zipPath = "build\ShamCoffeeWorker_v1.2.0_Portable.zip"
$readmePath = "$packageDir\README.txt"

# Create README
$readmeContent = @"
قهوة الشام - تطبيق الموظفين (إصدار محمول)
Sham Coffee - Staff Application (Portable Version)
Version: 1.2.0

═══════════════════════════════════════════════════

تعليمات الاستخدام / Usage Instructions:

1. استخرج جميع الملفات إلى مجلد (مثل: C:\ShamCoffeeWorker)
   Extract all files to a folder (e.g., C:\ShamCoffeeWorker)

2. انقر نقراً مزدوجاً على sham_coffee_worker.exe للبدء
   Double-click sham_coffee_worker.exe to start

3. التطبيق لا يحتاج إلى تثبيت - يمكنك نقله إلى أي مكان
   The app doesn't need installation - you can move it anywhere

═══════════════════════════════════════════════════

متطلبات النظام / System Requirements:
- Windows 10 أو أحدث / Windows 10 or later
- 64-bit فقط / 64-bit only

═══════════════════════════════════════════════════

لمساعدة الدعم الفني، يرجى زيارة:
For support, please visit:
https://sham-coffee.web.app

═══════════════════════════════════════════════════
"@

Set-Content -Path $readmePath -Value $readmeContent -Encoding UTF8

# Create ZIP
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$packageDir\*" -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "Portable ZIP created: $zipPath" -ForegroundColor Green
Write-Host ""
Write-Host "File size:" -ForegroundColor Yellow
$size = (Get-Item $zipPath).Length / 1MB
Write-Host "  $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can distribute this ZIP file!" -ForegroundColor Green
