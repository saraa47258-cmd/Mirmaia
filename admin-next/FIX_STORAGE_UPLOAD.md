# إصلاح مشكلة رفع الصور في Firebase Storage

## المشكلة
عند محاولة رفع صورة، يظهر خطأ مثل:
- "ليس لديك صلاحية لرفع الصور"
- "storage/unauthorized"
- "حدث خطأ في رفع الصورة"

## الحل: تعديل Firebase Storage Rules

### الخطوة 1: افتح Firebase Console
1. اذهب إلى: https://console.firebase.google.com/
2. اختر المشروع: **mirmaia-33acc**

### الخطوة 2: تعديل Storage Rules
1. من القائمة الجانبية، اختر **Storage**
2. اضغط على تبويب **Rules**
3. استبدل القواعد الحالية بهذه القواعد:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to products images
    match /products/{restaurantId}/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to categories images
    match /categories/{restaurantId}/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. اضغط **Publish** لحفظ التغييرات

---

## الحل البديل: قواعد أكثر أماناً (للإنتاج)

إذا كنت تريد قواعد أكثر أماناً، استخدم:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all authenticated users
    // Allow write access only to authenticated users
    match /products/{restaurantId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /categories/{restaurantId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## التحسينات المطبقة في الكود

تم تحسين كود رفع الصور ليشمل:

1. ✅ **معالجة أفضل للأخطاء** - رسائل خطأ واضحة بالعربية
2. ✅ **التحقق من نوع الملف** - فقط الصور مسموحة
3. ✅ **التحقق من حجم الملف** - الحد الأقصى 10 ميجابايت
4. ✅ **التحقق من امتداد الملف** - JPG, PNG, GIF, WEBP فقط
5. ✅ **سجلات تفصيلية** - لتسهيل التشخيص
6. ✅ **رسائل خطأ محددة** - لكل نوع خطأ رسالة مناسبة

---

## أنواع الأخطاء المدعومة

- `storage/unauthorized` - ليس لديك صلاحية
- `storage/canceled` - تم إلغاء العملية
- `storage/unknown` - خطأ غير معروف
- `storage/invalid-argument` - ملف غير صالح
- `storage/object-not-found` - الصورة غير موجودة
- `storage/quota-exceeded` - تجاوز المساحة المتاحة

---

## بعد إصلاح القواعد

1. أعد تحميل الصفحة
2. جرّب رفع صورة مرة أخرى
3. يجب أن تعمل الآن بدون مشاكل

---

## ملاحظات أمنية

⚠️ **تحذير:** القواعد الأولى تسمح بالوصول الكامل. في الإنتاج، يجب:
- استخدام Firebase Authentication
- تقييد الصلاحيات حسب المستخدم
- استخدام قواعد أكثر أماناً

---

**تم الإصلاح بواسطة:** Auto (Cursor AI)
**التاريخ:** 2026-01-23
