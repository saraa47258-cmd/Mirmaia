# Building Windows Installer for Sham Coffee Worker

## Prerequisites

1. **Inno Setup** (Free, recommended): Download from https://jrsoftware.org/isdl.php
   - Download Inno Setup 6.x
   - Install it on your Windows machine

## Quick Build Steps

### Option 1: Using Inno Setup GUI (Recommended)

1. Build the Flutter app:
   ```powershell
   .\fix_firebase_cmake.ps1  # Fix Firebase SDK CMake issue
   flutter build windows --release
   ```

2. Package the files:
   ```powershell
   .\build_windows_installer.ps1
   ```

3. Open `installer.iss` in Inno Setup Compiler (ISCC.exe)

4. Click "Build" → "Compile" (or press F9)

5. The installer will be created in: `build\installer_output\ShamCoffeeWorker_Setup_v1.2.0.exe`

### Option 2: Using Command Line

```powershell
# Navigate to Inno Setup installation directory (usually C:\Program Files (x86)\Inno Setup 6)
cd "C:\Program Files (x86)\Inno Setup 6"

# Compile the installer
.\ISCC.exe "C:\Users\HP\Desktop\sham-coffee\sham_coffee_worker\installer.iss"
```

## Manual Build Process

If you prefer manual steps:

1. **Fix Firebase SDK CMake issue** (first time only):
   ```powershell
   .\fix_firebase_cmake.ps1
   ```

2. **Build Flutter app**:
   ```powershell
   flutter build windows --release
   ```

3. **Package files**:
   ```powershell
   .\build_windows_installer.ps1
   ```

4. **Create installer** using Inno Setup with `installer.iss`

## Output

The installer file will be:
- **Location**: `build\installer_output\ShamCoffeeWorker_Setup_v1.2.0.exe`
- **Type**: Windows Executable Installer
- **Size**: ~50-100 MB (includes all dependencies)

## Installation

Users can:
1. Run `ShamCoffeeWorker_Setup_v1.2.0.exe`
2. Follow the installation wizard
3. The app will be installed in: `C:\Program Files\Sham Coffee - Staff App\`
4. Desktop shortcut will be created (if selected)
5. Start Menu entry will be added

## Distribution

The installer is standalone and includes all dependencies:
- Flutter runtime
- Firebase SDK
- All required DLLs
- Application assets

Users don't need to install anything else - just run the installer!
