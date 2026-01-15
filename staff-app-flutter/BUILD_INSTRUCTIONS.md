# تعليمات بناء تطبيق Windows EXE

## المتطلبات الأساسية

### 1. Flutter SDK
```powershell
# التحقق من تثبيت Flutter
flutter --version

# يجب أن يكون Flutter 3.16+
```

### 2. Visual Studio 2022 (مطلوب - لا يعمل مع 2019)
تحميل من: https://visualstudio.microsoft.com/

**مهم جداً:** 
- يجب استخدام **Visual Studio 2022** (ليس 2019)
- Firebase C++ SDK يتطلب Visual Studio 2022 مع C++20
- يجب تثبيت:
  - Desktop development with C++
  - Windows 10/11 SDK (أحدث إصدار)
  - C++ CMake tools for Windows

### 3. تفعيل Windows Desktop
```powershell
flutter config --enable-windows-desktop
flutter doctor
```

## خطوات البناء

### الخطوة 1: استنساخ المشروع
```powershell
cd C:\Users\HP\Desktop\sham-coffee\staff-app-flutter
```

### الخطوة 2: تثبيت Firebase CLI (إذا لم يكن مثبتاً)
```powershell
npm install -g firebase-tools
firebase login
```

### الخطوة 3: تهيئة FlutterFire (اختياري - للحصول على إعدادات جديدة)
```powershell
dart pub global activate flutterfire_cli
flutterfire configure --project=sham-coffee
```

### الخطوة 4: تثبيت Dependencies
```powershell
flutter pub get
```

### الخطوة 5: تشغيل في وضع التطوير
```powershell
flutter run -d windows
```

### الخطوة 6: بناء ملف EXE للإنتاج
```powershell
flutter build windows --release
```

## موقع ملف EXE

بعد البناء، ستجد ملف EXE في:
```
build\windows\x64\runner\Release\sham_coffee_staff.exe
```

## محتويات مجلد Release
```
Release/
├── sham_coffee_staff.exe      # الملف التنفيذي الرئيسي
├── flutter_windows.dll         # مكتبة Flutter
├── data/                       # الموارد
│   ├── flutter_assets/
│   └── ...
└── *.dll                       # مكتبات إضافية
```

## إنشاء مثبّت (Installer)

### باستخدام Inno Setup
1. تحميل Inno Setup: https://jrsoftware.org/isinfo.php
2. إنشاء سكريبت التثبيت:

```iss
[Setup]
AppName=Sham Coffee Staff
AppVersion=1.0.0
DefaultDirName={autopf}\ShamCoffeeStaff
DefaultGroupName=Sham Coffee
OutputDir=installer
OutputBaseFilename=ShamCoffeeStaffSetup

[Files]
Source: "build\windows\x64\runner\Release\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
Name: "{group}\Sham Coffee Staff"; Filename: "{app}\sham_coffee_staff.exe"
Name: "{commondesktop}\Sham Coffee Staff"; Filename: "{app}\sham_coffee_staff.exe"
```

## استكشاف الأخطاء

### خطأ: unresolved external symbol __std_init_once_link_alternate_names_and_abort
**السبب:** استخدام Visual Studio 2019 بدلاً من 2022

**الحل:**
1. قم بتثبيت **Visual Studio 2022** (Community Edition مجاني)
2. تأكد من تثبيت "Desktop development with C++"
3. أعد تشغيل PowerShell/CMD
4. امسح البناء القديم:
   ```powershell
   flutter clean
   flutter pub get
   flutter build windows --release
   ```

### خطأ: Missing Visual Studio
```
تأكد من تثبيت Visual Studio 2022 مع "Desktop development with C++"
```

### خطأ: Firebase not initialized
```powershell
# أعد تشغيل التطبيق أو تحقق من اتصال الإنترنت
```

### خطأ: Dart SDK not found
```powershell
flutter doctor --verbose
```

## الخطوط العربية

تم تضمين خط IBM Plex Sans Arabic. تأكد من وجود الملفات في:
```
assets/fonts/
├── IBMPlexSansArabic-Regular.ttf
├── IBMPlexSansArabic-Medium.ttf
├── IBMPlexSansArabic-SemiBold.ttf
└── IBMPlexSansArabic-Bold.ttf
```

يمكنك تحميلها من: https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic

## ملاحظات مهمة

1. **Firebase على Windows**: يستخدم Firebase Web SDK لأن Firebase Native غير متاح على Windows Desktop.

2. **الاتصال بالإنترنت**: التطبيق يحتاج اتصال إنترنت للعمل مع Firebase.

3. **الأمان**: لا تشارك ملف `firebase_options.dart` علنياً لأنه يحتوي على مفاتيح API.

