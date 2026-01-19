# Create Professional EXE Installer using PowerShell
Write-Host "Creating Professional EXE Installer..." -ForegroundColor Cyan

$packageDir = "build\installer_package"
$installerScript = "build\ShamCoffeeWorker_Installer.ps1"
$appName = "Sham Coffee - Staff App"
$version = "1.2.0"

# Verify package exists
if (-not (Test-Path "$packageDir\sham_coffee_worker.exe")) {
    Write-Host "ERROR: Application files not found!" -ForegroundColor Red
    Write-Host "Please ensure build\installer_package contains all files" -ForegroundColor Yellow
    exit 1
}

# Create PowerShell installer script that will be embedded
$installerContent = @'
# Sham Coffee Worker - Professional Installer
# This script installs the application automatically

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sham Coffee - Staff App Installer" -ForegroundColor Cyan
Write-Host "Version 1.2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current script location
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$filesDir = Join-Path $scriptPath "files"

# Verify files exist
if (-not (Test-Path "$filesDir\sham_coffee_worker.exe")) {
    Write-Host "ERROR: Application files not found!" -ForegroundColor Red
    Write-Host "Expected: $filesDir" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check admin status
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    $installDir = "$env:ProgramFiles\Sham Coffee - Staff App"
    Write-Host "Installing to Program Files (Administrator mode)..." -ForegroundColor Yellow
} else {
    $installDir = "$env:LOCALAPPDATA\Sham Coffee - Staff App"
    Write-Host "Installing to user folder (No admin required)..." -ForegroundColor Yellow
    Write-Host "Location: $installDir" -ForegroundColor Cyan
}
Write-Host ""

# Remove existing installation
if (Test-Path $installDir) {
    Write-Host "Removing existing installation..." -ForegroundColor Yellow
    Remove-Item -Path $installDir -Recurse -Force -ErrorAction SilentlyContinue
}

# Create installation directory
New-Item -ItemType Directory -Path $installDir -Force | Out-Null

# Copy files
Write-Host "Copying application files..." -ForegroundColor Yellow
Copy-Item -Path "$filesDir\*" -Destination $installDir -Recurse -Force
Write-Host "Files copied successfully!" -ForegroundColor Green

# Verify installation
if (-not (Test-Path "$installDir\sham_coffee_worker.exe")) {
    Write-Host "ERROR: Installation failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create Start Menu shortcut
Write-Host "Creating shortcuts..." -ForegroundColor Yellow
$startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
$startMenuShortcut = Join-Path $startMenuPath "Sham Coffee - Staff App.lnk"
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($startMenuShortcut)
$Shortcut.TargetPath = "$installDir\sham_coffee_worker.exe"
$Shortcut.WorkingDirectory = $installDir
$Shortcut.Description = "Sham Coffee - Staff Application"
$Shortcut.Save()

# Create Desktop shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$desktopShortcut = Join-Path $desktopPath "Sham Coffee - Staff App.lnk"
$Shortcut = $WshShell.CreateShortcut($desktopShortcut)
$Shortcut.TargetPath = "$installDir\sham_coffee_worker.exe"
$Shortcut.WorkingDirectory = $installDir
$Shortcut.Description = "Sham Coffee - Staff Application"
$Shortcut.Save()

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application installed to: $installDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can launch from:" -ForegroundColor Yellow
Write-Host "  - Start Menu" -ForegroundColor White
Write-Host "  - Desktop shortcut" -ForegroundColor White
Write-Host "  - Or run: $installDir\sham_coffee_worker.exe" -ForegroundColor White
Write-Host ""

if (-not $isAdmin) {
    Write-Host "Note: Installed to user folder (no admin rights needed)" -ForegroundColor Gray
    Write-Host "To install to Program Files, run as Administrator" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Press Enter to exit..."
$null = Read-Host
'@

# Save installer script
Set-Content -Path $installerScript -Value $installerContent -Encoding UTF8
Write-Host "Installer script created" -ForegroundColor Green

# Create installer package directory
$installerPackageDir = "build\installer_package_final"
if (Test-Path $installerPackageDir) {
    Remove-Item -Path $installerPackageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $installerPackageDir -Force | Out-Null

# Copy files folder
$filesDir = Join-Path $installerPackageDir "files"
Copy-Item -Path "$packageDir\*" -Destination $filesDir -Recurse -Force

# Copy installer script
Copy-Item -Path $installerScript -Destination $installerPackageDir -Force

# Create README
$readmeContent = @"
═══════════════════════════════════════════════════
Sham Coffee - Staff App
Installer Package v1.2.0
═══════════════════════════════════════════════════

INSTRUCTIONS / التعليمات:

1. Right-click on "ShamCoffeeWorker_Installer.ps1"
   انقر بالزر الأيمن على الملف
   
2. Select "Run with PowerShell"
   اختر "Run with PowerShell"
   
3. Follow the installation wizard
   اتبع معالج التثبيت

That's it! The app will be installed automatically.
هذا كل شيء! سيتم تثبيت التطبيق تلقائياً.

═══════════════════════════════════════════════════
"@

Set-Content -Path (Join-Path $installerPackageDir "README.txt") -Value $readmeContent -Encoding UTF8

# Create ZIP
$finalZip = "build\ShamCoffeeWorker_Install_Package.zip"
if (Test-Path $finalZip) {
    Remove-Item $finalZip -Force
}

Compress-Archive -Path "$installerPackageDir\*" -DestinationPath $finalZip -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Professional Installer Created!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package: $finalZip" -ForegroundColor Cyan
$size = (Get-Item $finalZip).Length / 1MB
Write-Host "Size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "To install:" -ForegroundColor Yellow
Write-Host "1. Extract the ZIP" -ForegroundColor White
Write-Host "2. Right-click ShamCoffeeWorker_Installer.ps1" -ForegroundColor White
Write-Host "3. Select 'Run with PowerShell'" -ForegroundColor White
Write-Host "4. Done! No admin needed!" -ForegroundColor Green
Write-Host ""
