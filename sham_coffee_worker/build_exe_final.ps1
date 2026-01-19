# Build Final EXE Package for Distribution
Write-Host "Building Final EXE Package..." -ForegroundColor Cyan

# Build Release version
Write-Host "`nStep 1: Building Release version..." -ForegroundColor Yellow
flutter build windows --release 2>&1 | Out-Null

# Check if build succeeded (even if INSTALL failed)
$releaseExe = "build\windows\x64\runner\Release\sham_coffee_worker.exe"
if (-not (Test-Path $releaseExe)) {
    Write-Host "ERROR: Release build failed!" -ForegroundColor Red
    Write-Host "Trying Debug build instead..." -ForegroundColor Yellow
    flutter build windows --debug 2>&1 | Out-Null
    $releaseExe = "build\windows\x64\runner\Debug\sham_coffee_worker.exe"
}

if (-not (Test-Path $releaseExe)) {
    Write-Host "ERROR: Build failed completely!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build successful!" -ForegroundColor Green

# Step 2: Copy app.so for Release
if (Test-Path "build\windows\app.so") {
    $dataDir = "build\windows\x64\runner\Release\data"
    if (-not (Test-Path $dataDir)) {
        New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    }
    Copy-Item -Path "build\windows\app.so" -Destination "$dataDir\" -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Copied app.so" -ForegroundColor Green
}

# Step 3: Create final EXE package
Write-Host "`nStep 2: Creating EXE package..." -ForegroundColor Yellow

$finalPackageDir = "build\EXE_Package"
if (Test-Path $finalPackageDir) {
    Remove-Item -Path $finalPackageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $finalPackageDir -Force | Out-Null

# Determine source directory
if (Test-Path "build\windows\x64\runner\Release") {
    $sourceDir = "build\windows\x64\runner\Release"
} else {
    $sourceDir = "build\windows\x64\runner\Debug"
}

# Copy all files
Write-Host "Copying application files..." -ForegroundColor Yellow
Copy-Item -Path "$sourceDir\*" -Destination $finalPackageDir -Recurse -Force

# Ensure app.so exists in data folder
if (-not (Test-Path "$finalPackageDir\data\app.so")) {
    if (Test-Path "build\windows\app.so") {
        if (-not (Test-Path "$finalPackageDir\data")) {
            New-Item -ItemType Directory -Path "$finalPackageDir\data" -Force | Out-Null
        }
        Copy-Item -Path "build\windows\app.so" -Destination "$finalPackageDir\data\" -Force
        Write-Host "✓ Added app.so to package" -ForegroundColor Green
    }
}

# Create README
$readmeContent = @"
═══════════════════════════════════════════════════
Sham Coffee - Staff App
Version 1.2.0
═══════════════════════════════════════════════════

EXE Package - Ready to Run!

═══════════════════════════════════════════════════
HOW TO USE / كيفية الاستخدام:

1. Extract this folder to any location
   استخرج هذا المجلد إلى أي مكان

2. Double-click: sham_coffee_worker.exe
   انقر نقراً مزدوجاً على: sham_coffee_worker.exe

3. The app will start immediately!
   سيبدأ التطبيق فوراً!

═══════════════════════════════════════════════════

NO INSTALLATION NEEDED!
لا يحتاج تثبيت!

You can:
- Run from USB drive
- Copy to any folder
- Move anywhere
- No admin rights needed

═══════════════════════════════════════════════════
"@

Set-Content -Path "$finalPackageDir\README.txt" -Value $readmeContent -Encoding UTF8

# Create ZIP
$finalZip = "build\ShamCoffeeWorker_EXE_Final.zip"
if (Test-Path $finalZip) {
    Remove-Item $finalZip -Force
}

Write-Host "Creating ZIP package..." -ForegroundColor Yellow
Compress-Archive -Path "$finalPackageDir\*" -DestinationPath $finalZip -Force

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "EXE Package Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package location:" -ForegroundColor Cyan
Write-Host "  Folder: $finalPackageDir" -ForegroundColor White
Write-Host "  ZIP: $finalZip" -ForegroundColor White
Write-Host ""
$size = (Get-Item $finalZip).Length / 1MB
Write-Host "Package size: $([math]::Round($size, 2)) MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "Main EXE file:" -ForegroundColor Cyan
Write-Host "  $finalPackageDir\sham_coffee_worker.exe" -ForegroundColor White
Write-Host ""
Write-Host "✅ Ready for distribution!" -ForegroundColor Green
Write-Host "Users can extract and run sham_coffee_worker.exe directly!" -ForegroundColor Cyan
Write-Host ""
