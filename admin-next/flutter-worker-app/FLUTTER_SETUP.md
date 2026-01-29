# دليل إعداد تطبيق Flutter Worker

## الخطوات المطلوبة

### 1. تثبيت Flutter

إذا لم يكن Flutter مثبتاً:

1. قم بتحميل Flutter من: https://flutter.dev/docs/get-started/install
2. أضف Flutter إلى PATH
3. تحقق من التثبيت:
```bash
flutter doctor
```

### 2. إعداد المشروع

```bash
cd flutter-worker-app
flutter pub get
```

### 3. إعداد Firebase

التطبيق مُعد مسبقاً للاتصال بـ Firebase. لا حاجة لإعدادات إضافية.

### 4. تشغيل التطبيق

#### Android
```bash
flutter run
```

#### iOS (يتطلب Mac)
```bash
flutter run
```

#### Web
```bash
flutter run -d chrome
```

## إنشاء حساب عامل للاختبار

1. افتح لوحة التحكم: `/admin/workers`
2. أضف عامل جديد
3. حدد الصلاحيات المطلوبة
4. استخدم اسم المستخدم وكلمة المرور لتسجيل الدخول في التطبيق

## الصلاحيات المدعومة

- `staff-menu` - منيو الموظفين
- `orders` - الطلبات
- `tables` - الطاولات
- `rooms` - الغرف
- `cashier` - الكاشير

## استكشاف الأخطاء

### خطأ: "No devices found"
- تأكد من تشغيل محاكي Android/iOS
- أو قم بتوصيل جهاز حقيقي

### خطأ: "Firebase not initialized"
- تأكد من أن Firebase project موجود
- تحقق من إعدادات Firebase في `main.dart`

### خطأ: "Permission denied"
- تأكد من أن العامل لديه الصلاحيات المطلوبة
- تحقق من Firebase Database Rules

## البناء للإنتاج

### Android APK
```bash
flutter build apk --release
```

### Android App Bundle
```bash
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

### Web
```bash
flutter build web --release
```

---

**ملاحظة:** تأكد من تحديث إعدادات Firebase قبل البناء للإنتاج.
