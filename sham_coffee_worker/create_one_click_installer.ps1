# Create One-Click Installer - Single File Install
Write-Host "Creating One-Click Installer..." -ForegroundColor Cyan

$packageDir = "build\installer_package"
$installerExe = "build\ShamCoffeeWorker_Install.exe"
$appName = "Sham Coffee - Staff App"

# Check if PS2EXE is available (to create .exe from PowerShell)
$ps2exe = Get-Command Convert-PowerShellToExe -ErrorAction SilentlyContinue

if (-not $ps2exe) {
    Write-Host "Note: Creating batch installer instead..." -ForegroundColor Yellow
    
    # Create batch installer
    $batchInstaller = @'
@echo off
REM Sham Coffee Worker - One-Click Installer
REM Run this file to install the application

echo ========================================
echo Sham Coffee - Staff App Installer
echo Version 1.2.0
echo ========================================
echo.

REM Check admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer requires administrator privileges.
    echo Please right-click and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

REM Get script directory
set "SCRIPT_DIR=%~dp0"
set "FILES_DIR=%SCRIPT_DIR%files"
set "INSTALL_DIR=%ProgramFiles%\Sham Coffee - Staff App"

echo Installing to: %INSTALL_DIR%
echo.

REM Remove existing installation
if exist "%INSTALL_DIR%" (
    echo Removing existing installation...
    rmdir /s /q "%INSTALL_DIR%"
)

REM Create installation directory
mkdir "%INSTALL_DIR%"

REM Copy files
echo Copying files...
xcopy /E /I /Y "%FILES_DIR%\*" "%INSTALL_DIR%\" >nul

REM Create Start Menu shortcut
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs"
powershell -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%START_MENU%\Sham Coffee - Staff App.lnk'); $s.TargetPath='%INSTALL_DIR%\sham_coffee_worker.exe'; $s.WorkingDirectory='%INSTALL_DIR%'; $s.Save()" >nul 2>&1

REM Create Desktop shortcut
set "DESKTOP=%USERPROFILE%\Desktop"
powershell -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%DESKTOP%\Sham Coffee - Staff App.lnk'); $s.TargetPath='%INSTALL_DIR%\sham_coffee_worker.exe'; $s.WorkingDirectory='%INSTALL_DIR%'; $s.Save()" >nul 2>&1

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Application installed to: %INSTALL_DIR%
echo.
echo You can launch from Start Menu or Desktop shortcut.
echo.
pause
'@

    $batchPath = "build\ShamCoffeeWorker_Install.bat"
    Set-Content -Path $batchPath -Value $batchInstaller -Encoding ASCII
    
    # Create files directory
    $filesDir = "build\installer_files"
    if (Test-Path $filesDir) {
        Remove-Item -Path $filesDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $filesDir -Force | Out-Null
    Copy-Item -Path "$packageDir\*" -Destination $filesDir -Recurse -Force
    
    # Create final ZIP
    $finalZip = "build\ShamCoffeeWorker_Install_Package.zip"
    if (Test-Path $finalZip) {
        Remove-Item $finalZip -Force
    }
    
    Compress-Archive -Path $batchPath, $filesDir -DestinationPath $finalZip -Force
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "One-Click Installer Created!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Package: $finalZip" -ForegroundColor Cyan
    $size = (Get-Item $finalZip).Length / 1MB
    Write-Host "Size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To install:" -ForegroundColor Yellow
    Write-Host "1. Extract the ZIP file" -ForegroundColor White
    Write-Host "2. Right-click 'ShamCoffeeWorker_Install.bat'" -ForegroundColor White
    Write-Host "3. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "4. Done! Application will be installed automatically" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "PS2EXE found - creating .exe installer..." -ForegroundColor Green
    # Use PS2EXE to create executable
}
