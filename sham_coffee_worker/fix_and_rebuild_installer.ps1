# Fix and Rebuild Installer with All Files
Write-Host "Rebuilding installer with all files..." -ForegroundColor Cyan

$packageDir = "build\installer_package"
$installerDir = "build\installer_output_final"

# Clean old installer
if (Test-Path $installerDir) {
    Remove-Item -Path $installerDir -Recurse -Force
}
New-Item -ItemType Directory -Path $installerDir -Force | Out-Null

# Verify package directory has files
if (-not (Test-Path "$packageDir\sham_coffee_worker.exe")) {
    Write-Host "ERROR: Application files not found in $packageDir" -ForegroundColor Red
    Write-Host "Please run: .\build_windows_installer.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Copy all files to installer directory as "files" folder
$filesDir = Join-Path $installerDir "files"
Copy-Item -Path "$packageDir\*" -Destination $filesDir -Recurse -Force
Write-Host "Files copied to installer directory" -ForegroundColor Green

# Create improved batch installer
$batchInstaller = @"
@echo off
chcp 65001 >nul
REM Sham Coffee Worker - One-Click Installer
REM Run this file to install the application

echo ========================================
echo Sham Coffee - Staff App Installer
echo Version 1.2.0
echo ========================================
echo.

REM Get script directory
set "SCRIPT_DIR=%~dp0"
set "FILES_DIR=%SCRIPT_DIR%files"

REM Verify files exist
if not exist "%FILES_DIR%\sham_coffee_worker.exe" (
    echo ERROR: Application files not found!
    echo Expected location: %FILES_DIR%
    echo.
    echo Please make sure you extracted all files from the ZIP.
    echo.
    pause
    exit /b 1
)

REM Check if running as admin
net session >nul 2>&1
set IS_ADMIN=%%errorLevel%%

if %%IS_ADMIN%% equ 0 (
    REM Running as admin - install to Program Files
    set "INSTALL_DIR=%ProgramFiles%\Sham Coffee - Staff App"
    set "USE_ADMIN=1"
    echo Installing to Program Files (Administrator mode)...
) else (
    REM Not admin - install to user's AppData
    set "INSTALL_DIR=%LOCALAPPDATA%\Sham Coffee - Staff App"
    set "USE_ADMIN=0"
    echo Installing to user folder (No admin required)...
    echo Location: %INSTALL_DIR%
)

echo.

REM Remove existing installation
if exist "%INSTALL_DIR%" (
    echo Removing existing installation...
    rmdir /s /q "%INSTALL_DIR%" 2>nul
)

REM Create installation directory
mkdir "%INSTALL_DIR%" 2>nul

REM Copy files
echo Copying files...
xcopy /E /I /Y "%FILES_DIR%\*" "%INSTALL_DIR%\" >nul
if %%errorLevel%% neq 0 (
    echo ERROR: Failed to copy files!
    echo.
    pause
    exit /b 1
)

REM Verify installation
if not exist "%INSTALL_DIR%\sham_coffee_worker.exe" (
    echo ERROR: Installation failed - executable not found!
    echo.
    pause
    exit /b 1
)

REM Create Start Menu shortcut (always in user's start menu)
echo Creating shortcuts...
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"

powershell -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%START_MENU%\Sham Coffee - Staff App.lnk'); $s.TargetPath='%INSTALL_DIR%\sham_coffee_worker.exe'; $s.WorkingDirectory='%INSTALL_DIR%'; $s.Description='Sham Coffee - Staff Application'; $s.Save()" >nul 2>&1

REM Create Desktop shortcut
set "DESKTOP=%USERPROFILE%\Desktop"
powershell -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%DESKTOP%\Sham Coffee - Staff App.lnk'); $s.TargetPath='%INSTALL_DIR%\sham_coffee_worker.exe'; $s.WorkingDirectory='%INSTALL_DIR%'; $s.Description='Sham Coffee - Staff Application'; $s.Save()" >nul 2>&1

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Application installed to: %INSTALL_DIR%
echo.
echo You can launch from:
echo   - Start Menu
echo   - Desktop shortcut
echo   - Or run: %INSTALL_DIR%\sham_coffee_worker.exe
echo.

if %%USE_ADMIN%% equ 0 (
    echo Note: Installed to user folder (no admin rights needed)
    echo If you want to install to Program Files, run as Administrator.
    echo.
)

pause
"@

$batchPath = Join-Path $installerDir "ShamCoffeeWorker_Install.bat"
Set-Content -Path $batchPath -Value $batchInstaller -Encoding ASCII

Write-Host "Installer script created" -ForegroundColor Green

# Verify files
$fileCount = (Get-ChildItem -Path $filesDir -Recurse -File).Count
Write-Host "Files in package: $fileCount" -ForegroundColor Cyan

# Create final ZIP
$finalZip = "build\ShamCoffeeWorker_Install_Package.zip"
if (Test-Path $finalZip) {
    Remove-Item $finalZip -Force
}

Compress-Archive -Path "$installerDir\*" -DestinationPath $finalZip -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installer Rebuilt Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package: $finalZip" -ForegroundColor Cyan
$size = (Get-Item $finalZip).Length / 1MB
Write-Host "Size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
Write-Host "Files included: $fileCount" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to distribute!" -ForegroundColor Green
Write-Host ""
