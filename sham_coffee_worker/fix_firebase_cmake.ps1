# Script to fix Firebase SDK CMakeLists.txt CMake version issue
$firebaseSdkPath = "build\windows\x64\extracted\firebase_cpp_sdk_windows\CMakeLists.txt"

if (Test-Path $firebaseSdkPath) {
    Write-Host "Fixing Firebase SDK CMakeLists.txt..."
    $content = Get-Content $firebaseSdkPath -Raw
    # Replace cmake_minimum_required(VERSION ...) with 3.14 or higher
    $content = $content -replace 'cmake_minimum_required\(VERSION\s+[0-9.]+\)', 'cmake_minimum_required(VERSION 3.14)'
    Set-Content $firebaseSdkPath -Value $content -NoNewline
    Write-Host "Fixed!"
} else {
    Write-Host "Firebase SDK path not found, will be fixed after extraction"
}
