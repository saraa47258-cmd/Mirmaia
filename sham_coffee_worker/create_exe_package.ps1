# Create EXE Package for Distribution
Write-Host "Creating EXE Package..." -ForegroundColor Cyan

# Check if EXE exists
$releaseExe = "build\windows\x64\runner\Release\sham_coffee_worker.exe"
$debugExe = "build\windows\x64\runner\Debug\sham_coffee_worker.exe"

if (Test-Path $releaseExe) {
    $sourceDir = "build\windows\x64\runner\Release"
    Write-Host "Using Release build" -ForegroundColor Green
} elseif (Test-Path $debugExe) {
    $sourceDir = "build\windows\x64\runner\Debug"
    Write-Host "Using Debug build" -ForegroundColor Yellow
} else {
    Write-Host "ERROR: EXE not found! Please build first: flutter build windows --release" -ForegroundColor Red
    exit 1
}

# Create package directory
$packageDir = "build\EXE_Package"
if (Test-Path $packageDir) {
    Remove-Item -Path $packageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy all files from Release/Debug
Copy-Item -Path "$sourceDir\*" -Destination $packageDir -Recurse -Force

# Copy flutter_windows.dll from ephemeral directory (REQUIRED!)
$flutterDll = "windows\flutter\ephemeral\flutter_windows.dll"
if (Test-Path $flutterDll) {
    Copy-Item -Path $flutterDll -Destination $packageDir -Force
    Write-Host "Copied flutter_windows.dll" -ForegroundColor Green
} else {
    Write-Host "WARNING: flutter_windows.dll not found!" -ForegroundColor Red
}

# Copy icudtl.dat from ephemeral directory (REQUIRED!)
$icuData = "windows\flutter\ephemeral\icudtl.dat"
if (Test-Path $icuData) {
    if (-not (Test-Path "$packageDir\data")) {
        New-Item -ItemType Directory -Path "$packageDir\data" -Force | Out-Null
    }
    Copy-Item -Path $icuData -Destination "$packageDir\data\" -Force
    Write-Host "Copied icudtl.dat" -ForegroundColor Green
}

# Ensure app.so exists
if (-not (Test-Path "$packageDir\data\app.so")) {
    if (Test-Path "build\windows\app.so") {
        if (-not (Test-Path "$packageDir\data")) {
            New-Item -ItemType Directory -Path "$packageDir\data" -Force | Out-Null
        }
        Copy-Item -Path "build\windows\app.so" -Destination "$packageDir\data\" -Force
        Write-Host "Added app.so" -ForegroundColor Green
    }
}

# Copy flutter_assets (REQUIRED!)
$assetsSource = "build\flutter_assets"
$assetsDest = "$packageDir\data\flutter_assets"
if (Test-Path $assetsSource) {
    if (-not (Test-Path $assetsDest)) {
        New-Item -ItemType Directory -Path $assetsDest -Force | Out-Null
    }
    Copy-Item -Path "$assetsSource\*" -Destination $assetsDest -Recurse -Force
    Write-Host "Copied flutter_assets" -ForegroundColor Green
} else {
    $altSource = "build\windows\flutter_assets"
    if (Test-Path $altSource) {
        if (-not (Test-Path $assetsDest)) {
            New-Item -ItemType Directory -Path $assetsDest -Force | Out-Null
        }
        Copy-Item -Path "$altSource\*" -Destination $assetsDest -Recurse -Force
        Write-Host "Copied flutter_assets from alternative location" -ForegroundColor Green
    } else {
        Write-Host "WARNING: flutter_assets not found!" -ForegroundColor Yellow
    }
}

# Create ZIP
$zipFile = "build\ShamCoffeeWorker_EXE_Final.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Write-Host "Creating ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "$packageDir\*" -DestinationPath $zipFile -Force

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "EXE Package Created!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package folder: $packageDir" -ForegroundColor Cyan
Write-Host "ZIP file: $zipFile" -ForegroundColor Cyan
$size = (Get-Item $zipFile).Length / 1MB
Write-Host "Size: $([math]::Round($size, 2)) MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "Main EXE: $packageDir\sham_coffee_worker.exe" -ForegroundColor White
Write-Host ""
Write-Host "Ready for distribution!" -ForegroundColor Green
Write-Host ""
