# Windows Installer Instructions

## ✅ Application is Ready!

The Windows application has been successfully built. You have **two options** for distribution:

---

## Option 1: Portable Version (Easiest - Already Created!)

### ✅ Ready to Use:
- **Location**: `build\ShamCoffeeWorker_v1.2.0_Portable.zip`
- **Type**: Portable ZIP file
- **Usage**: Extract and run `sham_coffee_worker.exe`

### How to Distribute:
1. The ZIP file is ready in: `build\ShamCoffeeWorker_v1.2.0_Portable.zip`
2. Send this ZIP file to users
3. Users extract it and run `sham_coffee_worker.exe`
4. **No installation required** - fully portable!

### Pros:
- ✅ No installation needed
- ✅ Can run from USB drive
- ✅ Easy to update (just replace files)
- ✅ Already created and ready!

---

## Option 2: Windows Installer (.exe Setup) - Recommended for Distribution

### To Create Installer:

1. **Install Inno Setup** (Free):
   - Download: https://jrsoftware.org/isdl.php
   - Install Inno Setup 6.x

2. **Open the script**:
   - File: `installer.iss`
   - Double-click to open in Inno Setup Compiler

3. **Build the installer**:
   - Press F9 or click "Build" → "Compile"
   - Output: `build\installer_output\ShamCoffeeWorker_Setup_v1.2.0.exe`

### Installer Features:
- ✅ Professional Windows installer
- ✅ Creates Start Menu shortcuts
- ✅ Desktop shortcut option
- ✅ Uninstaller included
- ✅ Installation wizard in Arabic/English
- ✅ Installs to Program Files

---

## Quick Commands

### Rebuild Everything:
```powershell
# Fix Firebase (if needed)
.\fix_firebase_cmake.ps1

# Build Flutter app
flutter build windows --release

# Package files
.\build_windows_installer.ps1

# Create portable ZIP
.\create_portable.ps1

# Create installer (requires Inno Setup)
# Open installer.iss in Inno Setup Compiler and press F9
```

---

## File Locations

- **Executable**: `build\installer_package\sham_coffee_worker.exe`
- **Portable ZIP**: `build\ShamCoffeeWorker_v1.2.0_Portable.zip`
- **Installer** (if created): `build\installer_output\ShamCoffeeWorker_Setup_v1.2.0.exe`

---

## Recommendation

**For quick distribution**: Use the **Portable ZIP** (already created!)

**For professional deployment**: Create the **Installer** using Inno Setup.

---

## Support

For issues or questions, visit: https://sham-coffee.web.app
