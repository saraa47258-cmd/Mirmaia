# Create Simple Windows Installer using PowerShell
Write-Host "Creating Windows Installer..." -ForegroundColor Cyan

$packageDir = "build\installer_package"
$installerPath = "build\ShamCoffeeWorker_Installer.ps1"
$appName = "Sham Coffee - Staff App"
$version = "1.2.0"

# Create installer script
$installerScript = @'
# Windows Installer for Sham Coffee Worker
# Run this script to install the application

param(
    [string]$InstallPath = "$env:ProgramFiles\Sham Coffee - Staff App",
    [switch]$CreateDesktopShortcut = $true,
    [switch]$CreateStartMenuShortcut = $true
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sham Coffee - Staff App Installer" -ForegroundColor Cyan
Write-Host "Version 1.2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This installer requires administrator privileges." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Get script directory (where installer is located)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceDir = Join-Path $scriptDir "files"

if (-not (Test-Path $sourceDir)) {
    Write-Host "ERROR: Application files not found!" -ForegroundColor Red
    Write-Host "Expected location: $sourceDir" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Installing to: $InstallPath" -ForegroundColor Yellow
Write-Host ""

# Create installation directory
if (Test-Path $InstallPath) {
    Write-Host "Removing existing installation..." -ForegroundColor Yellow
    Remove-Item -Path $InstallPath -Recurse -Force
}

New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
Write-Host "Created installation directory" -ForegroundColor Green

# Copy all files
Write-Host "Copying application files..." -ForegroundColor Yellow
Copy-Item -Path "$sourceDir\*" -Destination $InstallPath -Recurse -Force
Write-Host "Files copied successfully" -ForegroundColor Green

# Create Start Menu shortcut
if ($CreateStartMenuShortcut) {
    $startMenuPath = "$env:ProgramData\Microsoft\Windows\Start Menu\Programs"
    $shortcutPath = Join-Path $startMenuPath "Sham Coffee - Staff App.lnk"
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = Join-Path $InstallPath "sham_coffee_worker.exe"
    $Shortcut.WorkingDirectory = $InstallPath
    $Shortcut.Description = "Sham Coffee - Staff Application"
    $Shortcut.Save()
    
    Write-Host "Start Menu shortcut created" -ForegroundColor Green
}

# Create Desktop shortcut
if ($CreateDesktopShortcut) {
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "Sham Coffee - Staff App.lnk"
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = Join-Path $InstallPath "sham_coffee_worker.exe"
    $Shortcut.WorkingDirectory = $InstallPath
    $Shortcut.Description = "Sham Coffee - Staff Application"
    $Shortcut.Save()
    
    Write-Host "Desktop shortcut created" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application installed to: $InstallPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now launch the application from:" -ForegroundColor Yellow
Write-Host "  - Start Menu" -ForegroundColor White
Write-Host "  - Desktop shortcut" -ForegroundColor White
Write-Host "  - Or run: $InstallPath\sham_coffee_worker.exe" -ForegroundColor White
Write-Host ""
pause
'@

# Create files directory and copy package there
$filesDir = "build\installer_files"
if (Test-Path $filesDir) {
    Remove-Item -Path $filesDir -Recurse -Force
}
New-Item -ItemType Directory -Path $filesDir -Force | Out-Null

Copy-Item -Path "$packageDir\*" -Destination $filesDir -Recurse -Force
Write-Host "Application files prepared" -ForegroundColor Green

# Save installer script
Set-Content -Path $installerPath -Value $installerScript -Encoding UTF8
Write-Host "Installer script created: $installerPath" -ForegroundColor Green

# Create final ZIP with installer and files
$finalZip = "build\ShamCoffeeWorker_Install_Package.zip"
if (Test-Path $finalZip) {
    Remove-Item $finalZip -Force
}

Compress-Archive -Path "$installerPath", $filesDir -DestinationPath $finalZip -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installer Package Created!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package: $finalZip" -ForegroundColor Cyan
$size = (Get-Item $finalZip).Length / 1MB
Write-Host "Size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "To install:" -ForegroundColor Yellow
Write-Host "1. Extract the ZIP file" -ForegroundColor White
Write-Host "2. Right-click 'ShamCoffeeWorker_Installer.ps1'" -ForegroundColor White
Write-Host "3. Select 'Run with PowerShell'" -ForegroundColor White
Write-Host "4. Or run PowerShell as Admin and execute the script" -ForegroundColor White
Write-Host ""
