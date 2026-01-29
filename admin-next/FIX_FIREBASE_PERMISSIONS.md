# إصلاح مشكلة صلاحيات Firebase

المشكلة الحالية: Firebase Realtime Database Rules تمنع الوصول من client-side و API routes.

## الحل السريع: تعديل Firebase Rules

### الخطوة 1: افتح Firebase Console
1. اذهب إلى: https://console.firebase.google.com/
2. اختر المشروع: **mirmaia-33acc**

### الخطوة 2: تعديل Database Rules
1. من القائمة الجانبية، اختر **Realtime Database**
2. اضغط على تبويب **Rules**
3. استبدل القواعد الحالية بهذه القواعد:

```json
{
  "rules": {
    "restaurant-system": {
      "workers": {
        "$restaurantId": {
          ".read": true,
          ".write": true
        }
      },
      "restaurants": {
        ".read": true,
        ".write": true
      },
      "orders": {
        "$restaurantId": {
          ".read": true,
          ".write": true
        }
      },
      "menu": {
        "$restaurantId": {
          ".read": true,
          ".write": true
        }
      },
      "categories": {
        "$restaurantId": {
          ".read": true,
          ".write": true
        }
      },
      "tables": {
        "$restaurantId": {
          ".read": true,
          ".write": true
        }
      },
      "rooms": {
        "$restaurantId": {
          ".read": true,
          ".write": true
        }
      },
      "daily_closings": {
        "$restaurantId": {
          ".read": true,
          ".write": true
        }
      }
    },
    "sessions": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. اضغط **Publish** لحفظ التغييرات

---

## الحل البديل: إنشاء حساب الأدمن من Firebase Console

إذا لم تستطع تعديل القواعد، يمكنك إنشاء حساب الأدمن مباشرة من Firebase Console:

### الخطوة 1: افتح Firebase Console
1. اذهب إلى: https://console.firebase.google.com/
2. اختر المشروع: **mirmaia-33acc**

### الخطوة 2: إنشاء حساب الأدمن
1. من القائمة الجانبية، اختر **Realtime Database**
2. اضغط على **Data** tab
3. اذهب إلى المسار: `restaurant-system/workers/mirmaia-1`
4. اضغط على **+** لإضافة child جديد
5. أدخل البيانات التالية:

```json
{
  "uid": "admin-001",
  "fullName": "مدير النظام",
  "name": "مدير النظام",
  "username": "admin",
  "password": "admin123",
  "role": "admin",
  "isActive": true,
  "active": true,
  "position": "مدير",
  "permissions": [
    "dashboard",
    "staff-menu",
    "cashier",
    "orders",
    "tables",
    "rooms",
    "room-orders",
    "products",
    "menu",
    "inventory",
    "workers",
    "reports"
  ],
  "createdAt": "2026-01-23T00:00:00.000Z",
  "createdBy": "system"
}
```

6. اضغط **Save**

### الخطوة 3: تسجيل الدخول
- اسم المستخدم: `admin`
- كلمة المرور: `admin123`

---

## الحل الثالث: استخدام السكريبت (Node.js)

إذا كان لديك Node.js مثبت، يمكنك استخدام السكريبت:

```bash
cd c:\Users\HP\Desktop\mer\Mirmaia\admin-next
npm run add-admin
```

**ملاحظة:** السكريبت قد يحتاج إلى تعديل Firebase Rules أيضاً.

---

## بعد إصلاح الصلاحيات

بعد تعديل Firebase Rules:
1. أعد تحميل صفحة `/setup-admin`
2. املأ البيانات وأنشئ حساب الأدمن
3. سجّل الدخول بالبيانات الجديدة

---

## ملاحظات أمنية

⚠️ **تحذير:** القواعد المذكورة أعلاه تسمح بالوصول الكامل. في الإنتاج، يجب:
- استخدام Firebase Authentication
- تقييد الصلاحيات حسب المستخدم
- استخدام Firebase Admin SDK في API routes

للإنتاج، استخدم قواعد مثل:

```json
{
  "rules": {
    "restaurant-system": {
      "workers": {
        "$restaurantId": {
          ".read": "auth != null",
          ".write": "auth != null && root.child('restaurant-system/workers/' + $restaurantId + '/' + auth.uid + '/role').val() == 'admin'"
        }
      }
    }
  }
}
```
