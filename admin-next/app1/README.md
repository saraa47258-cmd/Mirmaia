# تطبيق app1 - WebView لصفحات العمال

تطبيق Flutter يعرض صفحات العمال من الويب في WebView مع تنقل سهل.

## المميزات

- ✅ عرض صفحات العمال في WebView
- ✅ تنقل سهل عبر Bottom Navigation
- ✅ دعم الصفحات التالية:
  - الرئيسية (`/worker`)
  - المنيو (`/worker/menu`)
  - الطلبات (`/worker/orders`)
  - الكاشير (`/worker/cashier`)
  - الطاولات (`/worker/tables`)

## المتطلبات

- Flutter SDK 3.10.3 أو أحدث
- Dart SDK 3.10.3 أو أحدث
- تطبيق الويب يعمل على `http://localhost:3000` (أو غيّر `baseUrl` في `main.dart`)

## التثبيت

1. انتقل إلى مجلد المشروع:
```bash
cd app1
```

2. احصل على التبعيات:
```bash
flutter pub get
```

## التشغيل

### Android (محاكي أو جهاز)
```bash
flutter run
```

### iOS (يتطلب Mac)
```bash
flutter run
```

### Web
```bash
flutter run -d chrome
```

## إعداد URL

افتح `lib/main.dart` وعدّل `baseUrl`:

```dart
static const String baseUrl = 'http://localhost:3000';
// أو للإنتاج:
// static const String baseUrl = 'https://your-domain.com';
```

**ملاحظة:** للجوال، استخدم IP جهاز الكمبيوتر بدلاً من `localhost`:
```dart
static const String baseUrl = 'http://192.168.1.100:3000'; // استبدل بـ IP جهازك
```

## بناء APK

```bash
flutter build apk --release
```

الملف: `build/app/outputs/flutter-apk/app-release.apk`

## هيكل المشروع

```
lib/
└── main.dart          # التطبيق الرئيسي مع WebView
```

## الاستخدام

1. تأكد أن تطبيق الويب يعمل على `http://localhost:3000` (أو URL المحدد)
2. شغّل التطبيق
3. استخدم القائمة السفلية للتنقل بين الصفحات

## ملاحظات

- التطبيق يعرض صفحات الويب مباشرة في WebView
- كل صفحة لها WebView منفصل (IndexedStack) للحفاظ على الحالة
- يمكن إضافة صفحات أخرى بسهولة في `_urls` و `_buildNavItem`

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.

---

**تم التطوير بواسطة:** Auto (Cursor AI)  
**التاريخ:** 2026-01-23
