# رفع صفحات العمال فقط إلى Firebase Hosting

هذا الدليل يشرح كيفية رفع **صفحات العمال فقط** (`/worker/*`) إلى Firebase Hosting **بدون التأثير على صفحات الأدمن**.

---

## ✅ ما يتم رفعه

- ✅ صفحات العمال: `/worker/*` (login, menu, orders, cashier, tables, rooms, inventory, reports, products)
- ✅ الملفات المشتركة: `_next`, assets, favicon, etc.
- ❌ صفحات الأدمن: `/admin/*` (لا يتم رفعها)
- ❌ صفحات أخرى: `/login`, `/setup-admin` (لا يتم رفعها)

---

## 🚀 الطريقة السريعة

### 1. تسجيل الدخول (مرة واحدة فقط)
```bash
firebase login
```

### 2. بناء ورفع صفحات العمال فقط
```bash
npm run deploy:worker
```

أو استخدم السكريبت:
```bash
deploy-worker.bat
```

---

## 📋 الخطوات التفصيلية

### الخطوة 1: بناء المشروع
```bash
npm run build
```

### الخطوة 2: إعداد build-worker (صفحات العمال فقط)
```bash
npm run build:worker
```

أو مباشرة:
```bash
node scripts/prepare-worker-build.js
```

**ما يحدث:**
- يتم نسخ صفحات `worker/` فقط
- يتم نسخ الملفات المشتركة (`_next`, assets, etc.)
- يتم إنشاء مجلد `build-worker/`

### الخطوة 3: رفع إلى Firebase
```bash
firebase deploy --only hosting --config firebase-worker.json
```

---

## 📁 الملفات المُنشأة

| الملف | الوصف |
|------|-------|
| `build-worker/` | مجلد يحتوي على صفحات العمال فقط |
| `firebase-worker.json` | إعدادات Firebase Hosting لصفحات العمال |
| `scripts/prepare-worker-build.js` | سكريبت نسخ صفحات worker فقط |
| `deploy-worker.bat` | سكريبت Windows للرفع السريع |

---

## 🔧 الإعدادات

### `firebase-worker.json`
- **Public directory:** `build-worker` (بدلاً من `build`)
- **Rewrites:** جميع المسارات تُعاد إلى `/worker/index.html`
- **Ignore:** صفحات `admin/`, `login/`, `setup-admin/` لا يتم رفعها

### `package.json` - السكريبتات الجديدة
- `npm run build:worker` - بناء + إعداد build-worker
- `npm run deploy:worker` - بناء + إعداد + رفع

---

## 🌐 URLs بعد الرفع

بعد الرفع، صفحات العمال ستكون متاحة على:

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

**ملاحظة:** صفحات الأدمن (`/admin/*`) **لن تكون متاحة** على Firebase Hosting.

---

## 🔄 تحديث الموقع

بعد أي تعديلات على صفحات العمال:

```bash
npm run deploy:worker
```

أو:
```bash
deploy-worker.bat
```

---

## ⚠️ ملاحظات مهمة

1. **صفحات الأدمن:** تبقى محلية فقط (لا يتم رفعها)
2. **البناء الكامل:** يتم بناء كل المشروع أولاً، ثم نسخ صفحات worker فقط
3. **الملفات المشتركة:** `_next` و assets يتم نسخها لأنها مطلوبة لصفحات worker
4. **firebase.json الأصلي:** يبقى كما هو (لرفع كل المشروع إذا احتجت لاحقاً)

---

## 🎯 تحديث تطبيق app1 (WebView)

بعد الرفع، حدّث `app1/lib/main.dart`:

```dart
static const String baseUrl = 'https://mirmaia-33acc.web.app';
```

---

## 📝 أوامر سريعة

```bash
# بناء + إعداد build-worker
npm run build:worker

# بناء + إعداد + رفع
npm run deploy:worker

# أو استخدم السكريبت
deploy-worker.bat
```

---

## ✅ التحقق من الرفع

بعد الرفع، افتح:
- ✅ `https://mirmaia-33acc.web.app/worker/login` ← يجب أن يعمل
- ❌ `https://mirmaia-33acc.web.app/admin` ← يجب أن يعطي 404 أو redirect

---

**جاهز للرفع!** 🚀

**تم التطوير بواسطة:** Auto (Cursor AI)  
**التاريخ:** 2026-01-23
