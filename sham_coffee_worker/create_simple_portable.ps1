# Create Simple Portable Version - Easiest Solution
Write-Host "Creating Simple Portable Version..." -ForegroundColor Cyan

$packageDir = "build\installer_package"
$portableDir = "build\ShamCoffeeWorker_Portable"
$portableZip = "build\ShamCoffeeWorker_Portable_v1.2.0.zip"

# Clean previous portable
if (Test-Path $portableDir) {
    Remove-Item -Path $portableDir -Recurse -Force
}
if (Test-Path $portableZip) {
    Remove-Item $portableZip -Force
}

# Verify package exists
if (-not (Test-Path "$packageDir\sham_coffee_worker.exe")) {
    Write-Host "ERROR: Application files not found!" -ForegroundColor Red
    exit 1
}

# Copy all files to portable directory
Copy-Item -Path "$packageDir\*" -Destination $portableDir -Recurse -Force

# Create simple launcher script
$launcherScript = @"
@echo off
REM Sham Coffee Worker - Portable Launcher
REM Double-click this file to run the application

cd /d "%~dp0"
start "" "sham_coffee_worker.exe"
"@

$launcherPath = Join-Path $portableDir "Start_ShamCoffee.bat"
Set-Content -Path $launcherPath -Value $launcherScript -Encoding ASCII

# Create README
$readmeContent = @"
═══════════════════════════════════════════════════
Sham Coffee - Staff App (Portable Version)
Version 1.2.0
═══════════════════════════════════════════════════

EASIEST INSTALLATION / أسهل طريقة للتثبيت:

Option 1 (Recommended):
1. Extract this ZIP file to any folder
   (e.g., C:\ShamCoffeeWorker)
2. Double-click "Start_ShamCoffee.bat"
3. Done! Application will start immediately

Option 2:
1. Extract this ZIP file
2. Double-click "sham_coffee_worker.exe"
3. Application will run

═══════════════════════════════════════════════════

NO INSTALLATION NEEDED!
You can:
- Run from USB drive
- Copy to any folder
- Move anywhere you want
- No admin rights needed
- No installation required

═══════════════════════════════════════════════════

System Requirements:
- Windows 10 or later
- 64-bit only

For support: https://sham-coffee.web.app
═══════════════════════════════════════════════════
"@

Set-Content -Path (Join-Path $portableDir "README.txt") -Value $readmeContent -Encoding UTF8

# Create ZIP
Compress-Archive -Path "$portableDir\*" -DestinationPath $portableZip -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Portable Version Created!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Portable ZIP: $portableZip" -ForegroundColor Cyan
$size = (Get-Item $portableZip).Length / 1MB
Write-Host "Size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "THIS IS THE SIMPLEST SOLUTION!" -ForegroundColor Green
Write-Host ""
Write-Host "Users just need to:" -ForegroundColor Yellow
Write-Host "1. Extract ZIP" -ForegroundColor White
Write-Host "2. Double-click Start_ShamCoffee.bat" -ForegroundColor White
Write-Host "3. Done! No installation needed!" -ForegroundColor Green
Write-Host ""
