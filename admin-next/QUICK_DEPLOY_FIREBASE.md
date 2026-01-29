# رفع سريع إلى Firebase Hosting

## الطريقة السريعة

### 1. تسجيل الدخول (مرة واحدة فقط)
```bash
firebase login
```

### 2. بناء ورفع
```bash
npm run build
firebase deploy --only hosting
```

أو استخدم السكريبت:
```bash
deploy-firebase.bat
```

---

## بعد الرفع

### تحديث تطبيق app1 (WebView)

افتح `app1/lib/main.dart` وعدّل:

```dart
static const String baseUrl = 'https://mirmaia-33acc.web.app';
```

ثم أعد بناء تطبيق app1:
```bash
cd app1
flutter build apk --release
```

---

## URLs المتاحة

بعد الرفع، الصفحات ستكون متاحة على:

- الرئيسية: `https://mirmaia-33acc.web.app/worker`
- تسجيل الدخول: `https://mirmaia-33acc.web.app/worker/login`
- المنيو: `https://mirmaia-33acc.web.app/worker/menu`
- الطلبات: `https://mirmaia-33acc.web.app/worker/orders`
- الكاشير: `https://mirmaia-33acc.web.app/worker/cashier`
- الطاولات: `https://mirmaia-33acc.web.app/worker/tables`
- الغرف: `https://mirmaia-33acc.web.app/worker/rooms`
- المخزون: `https://mirmaia-33acc.web.app/worker/inventory`
- التقارير: `https://mirmaia-33acc.web.app/worker/reports`
- المنتجات: `https://mirmaia-33acc.web.app/worker/products`

---

## ملاحظات

- ✅ المشروع مُعد بالفعل لـ static export (`output: 'export'` في `next.config.ts`)
- ✅ `firebase.json` مُعد لاستخدام مجلد `build`
- ✅ `.firebaserc` مُعد لمشروع `mirmaia-33acc`
- ✅ البناء تم بنجاح (30 صفحة)

---

## استكشاف الأخطاء

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "Not logged in"
```bash
firebase login
```

### "Build folder not found"
```bash
npm run build
```

---

**جاهز للرفع!** 🚀
