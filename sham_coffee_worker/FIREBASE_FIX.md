# إصلاح مشكلة Firebase Database على Windows

## المشكلة
```
حدث خطأ في الاتصال : [firebase_database/unknown] 
Unable to establish connection on channel: "dev.flutter.pigeon.firebase_"
```

## السبب
على Windows، Firebase Database يحتاج إلى `databaseURL` صريح عند التهيئة. بدون ذلك، لا يستطيع إنشاء الاتصال.

## الحل
تم إنشاء خدمة `FirebaseService` التي:
1. تحصل على `databaseURL` من `firebase_options.dart`
2. تهيئ `FirebaseDatabase` مع `databaseURL` صريح
3. تستخدم `FirebaseDatabase.instanceFor()` بدلاً من `FirebaseDatabase.instance`

## الملفات المعدلة
- ✅ `lib/services/firebase_service.dart` (جديد)
- ✅ `lib/screens/login_screen.dart`
- ✅ `lib/screens/menu_screen.dart`
- ✅ `lib/screens/cart_screen.dart`

## الاستخدام
```dart
// بدلاً من:
final database = FirebaseDatabase.instance;

// استخدم:
final database = FirebaseService.getDatabase();
```

## التحقق
1. شغّل التطبيق
2. يجب أن يعمل الاتصال بـ Firebase Database بدون أخطاء
3. تحقق من Console - يجب أن ترى رسائل نجاح بدلاً من أخطاء الاتصال
