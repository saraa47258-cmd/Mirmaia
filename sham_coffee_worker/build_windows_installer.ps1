# Build Windows Installer for Sham Coffee Worker App
Write-Host "Building Windows Installer Package for Sham Coffee Worker..." -ForegroundColor Cyan

$buildDir = "build\windows\x64"
$runnerRelease = "$buildDir\runner\Release"
$packageDir = "build\installer_package"
$appName = "ShamCoffeeWorker"
$version = "1.2.0"

# Clean previous package
if (Test-Path $packageDir) {
    Remove-Item -Recurse -Force $packageDir
}

New-Item -ItemType Directory -Path $packageDir -Force | Out-Null
Write-Host "Created package directory: $packageDir" -ForegroundColor Green

# Copy executable
$exePath = "$runnerRelease\sham_coffee_worker.exe"
if (Test-Path $exePath) {
    Copy-Item -Path $exePath -Destination $packageDir -Force
    Write-Host "✓ Copied executable" -ForegroundColor Green
} else {
    Write-Host "ERROR: Executable not found at $exePath" -ForegroundColor Red
    exit 1
}

# Copy flutter_assets from build directory
$flutterAssets = Get-ChildItem -Path $buildDir -Recurse -Directory | Where-Object { $_.Name -eq "flutter_assets" } | Select-Object -First 1
if ($flutterAssets) {
    Copy-Item -Path $flutterAssets.FullName -Destination "$packageDir\data\flutter_assets" -Recurse -Force
    Write-Host "✓ Copied flutter_assets" -ForegroundColor Green
} else {
    # Try from ephemeral directory
    $ephemeralAssets = "windows\flutter\ephemeral\flutter_assets"
    if (Test-Path $ephemeralAssets) {
        New-Item -ItemType Directory -Path "$packageDir\data" -Force | Out-Null
        Copy-Item -Path $ephemeralAssets -Destination "$packageDir\data\flutter_assets" -Recurse -Force
        Write-Host "✓ Copied flutter_assets from ephemeral" -ForegroundColor Green
    }
}

# Copy icudtl.dat
$icudtl = Get-ChildItem -Path $buildDir -Recurse -Filter "icudtl.dat" | Select-Object -First 1
if ($icudtl) {
    if (-not (Test-Path "$packageDir\data")) { New-Item -ItemType Directory -Path "$packageDir\data" -Force | Out-Null }
    Copy-Item -Path $icudtl.FullName -Destination "$packageDir\data\" -Force
    Write-Host "✓ Copied icudtl.dat" -ForegroundColor Green
} else {
    $ephemeralIcu = "windows\flutter\ephemeral\icudtl.dat"
    if (Test-Path $ephemeralIcu) {
        if (-not (Test-Path "$packageDir\data")) { New-Item -ItemType Directory -Path "$packageDir\data" -Force | Out-Null }
        Copy-Item -Path $ephemeralIcu -Destination "$packageDir\data\" -Force
        Write-Host "✓ Copied icudtl.dat from ephemeral" -ForegroundColor Green
    }
}

# Copy flutter_windows.dll
$flutterDll = Get-ChildItem -Path $buildDir -Recurse -Filter "flutter_windows.dll" | Select-Object -First 1
if ($flutterDll) {
    Copy-Item -Path $flutterDll.FullName -Destination $packageDir -Force
    Write-Host "✓ Copied flutter_windows.dll" -ForegroundColor Green
} else {
    $ephemeralDll = "windows\flutter\ephemeral\flutter_windows.dll"
    if (Test-Path $ephemeralDll) {
        Copy-Item -Path $ephemeralDll -Destination $packageDir -Force
        Write-Host "✓ Copied flutter_windows.dll from ephemeral" -ForegroundColor Green
    }
}

# Copy any plugin DLLs
$pluginDlls = Get-ChildItem -Path $buildDir -Recurse -Filter "*.dll" | Where-Object { $_.Name -ne "flutter_windows.dll" -and $_.Directory.Name -ne "Release" }
foreach ($dll in $pluginDlls) {
    $dllName = $dll.Name
    # Skip if already copied
    if (-not (Test-Path "$packageDir\$dllName")) {
        Copy-Item -Path $dll.FullName -Destination $packageDir -Force -ErrorAction SilentlyContinue
        if ($?) { Write-Host "✓ Copied $dllName" -ForegroundColor Green }
    }
}

Write-Host ""
Write-Host "✓ Package created successfully!" -ForegroundColor Green
Write-Host "Package directory: $packageDir" -ForegroundColor Cyan
$totalSize = (Get-ChildItem -Path $packageDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Total size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Yellow
