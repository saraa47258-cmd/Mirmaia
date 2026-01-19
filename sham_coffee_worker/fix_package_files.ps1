# Fix Package Files - Copy app.so and all required files
Write-Host "Fixing package files..." -ForegroundColor Cyan

$packageDir = "build\installer_package"
$buildDir = "build\windows\x64\runner\Release"
$dataDir = Join-Path $packageDir "data"

# Ensure data directory exists
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

# Check if app.so exists in build directory
$appSoPaths = @(
    "build\windows\app.so",
    "build\windows\x64\app.so",
    "$buildDir\app.so",
    "$buildDir\data\app.so"
)

$appSo = $null
foreach ($path in $appSoPaths) {
    if (Test-Path $path) {
        $appSo = $path
        Write-Host "Found app.so at: $appSo" -ForegroundColor Green
        break
    }
}

# Copy app.so if found
if ($appSo) {
    Copy-Item -Path $appSo -Destination $dataDir -Force
    Write-Host "Copied app.so to data directory" -ForegroundColor Green
} else {
    Write-Host "WARNING: app.so not found! Trying to rebuild..." -ForegroundColor Yellow
    
    # Try to build app.so manually or use debug version
    Write-Host "The application may need to be rebuilt with 'flutter build windows --release'" -ForegroundColor Yellow
    Write-Host "Or try building in debug mode which doesn't require app.so" -ForegroundColor Yellow
}

# Verify current package files
Write-Host ""
Write-Host "Package files check:" -ForegroundColor Cyan
$files = @(
    @{Path="$packageDir\sham_coffee_worker.exe"; Name="Executable"},
    @{Path="$packageDir\flutter_windows.dll"; Name="Flutter DLL"},
    @{Path="$dataDir\icudtl.dat"; Name="ICU Data"},
    @{Path="$dataDir\flutter_assets"; Name="Flutter Assets"},
    @{Path="$dataDir\app.so"; Name="AOT Library (app.so)"}
)

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        Write-Host "  ✓ $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Name) - MISSING!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "If app.so is missing, the app may not run in Release mode." -ForegroundColor Yellow
Write-Host "Try: flutter build windows --debug (for testing)" -ForegroundColor Yellow
Write-Host "Or fix the Release build issue" -ForegroundColor Yellow
