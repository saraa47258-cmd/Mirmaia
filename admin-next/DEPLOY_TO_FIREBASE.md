# رفع صفحات العمال إلى Firebase Hosting

هذا الدليل يشرح كيفية رفع صفحات العمال إلى Firebase Hosting.

---

## الخطوة 1: تثبيت Firebase CLI

### Windows (PowerShell)
```powershell
npm install -g firebase-tools
```

### التحقق من التثبيت
```bash
firebase --version
```

---

## الخطوة 2: تسجيل الدخول إلى Firebase

```bash
firebase login
```

سيتم فتح المتصفح لتسجيل الدخول بحساب Google المرتبط بمشروع Firebase.

---

## الخطوة 3: بناء المشروع

```bash
npm run build
```

سيتم إنشاء مجلد `build` يحتوي على الملفات الثابتة.

---

## الخطوة 4: رفع الملفات إلى Firebase Hosting

### رفع أول مرة (إعداد Hosting)
```bash
firebase init hosting
```

**اختر:**
- Use an existing project: `mirmaia-33acc`
- What do you want to use as your public directory? `build`
- Configure as a single-page app? `No` (لأن Next.js يتعامل مع الرو팅)
- Set up automatic builds and deploys with GitHub? `No` (اختياري)

### رفع الملفات
```bash
firebase deploy --only hosting
```

---

## الخطوة 5: الوصول إلى الموقع

بعد الرفع، ستحصل على URL مثل:
```
https://mirmaia-33acc.web.app
```
أو
```
https://mirmaia-33acc.firebaseapp.com
```

---

## تحديث الموقع (بعد التعديلات)

1. **بناء المشروع:**
```bash
npm run build
```

2. **رفع التحديثات:**
```bash
firebase deploy --only hosting
```

---

## إعدادات Firebase

### `firebase.json`
تم إعداد الملف لاستخدام:
- **Public directory:** `build` (مجلد البناء)
- **Rewrites:** جميع المسارات تُعاد إلى `index.html` (لـ Next.js routing)

### `.firebaserc`
تم إعداد الملف لاستخدام:
- **Project ID:** `mirmaia-33acc`

---

## ملاحظات مهمة

1. **البيئة:** تأكد من أن متغيرات البيئة في `.env.production` صحيحة.
2. **Base URL:** بعد الرفع، قد تحتاج إلى تحديث `baseUrl` في تطبيق `app1` (WebView) ليشير إلى URL Firebase.
3. **HTTPS:** Firebase Hosting يستخدم HTTPS تلقائياً.
4. **Custom Domain:** يمكن إضافة domain مخصص من Firebase Console.

---

## استكشاف الأخطاء

### خطأ: "Firebase CLI not found"
- تأكد من تثبيت Firebase CLI: `npm install -g firebase-tools`

### خطأ: "Build folder not found"
- تأكد من تشغيل `npm run build` أولاً

### خطأ: "Permission denied"
- تأكد من تسجيل الدخول: `firebase login`
- تأكد من أنك تملك صلاحيات المشروع

### الموقع لا يعمل بشكل صحيح
- تأكد من أن `firebase.json` يحتوي على `rewrites` لجميع المسارات
- تأكد من أن Next.js مُعد لـ `output: 'export'` في `next.config.ts`

---

## أوامر سريعة

```bash
# بناء المشروع
npm run build

# رفع إلى Firebase
firebase deploy --only hosting

# معاينة قبل الرفع (اختياري)
firebase hosting:channel:deploy preview
```

---

## بعد الرفع

بعد رفع الملفات بنجاح:

1. **تحديث تطبيق app1 (WebView):**
   - افتح `app1/lib/main.dart`
   - غيّر `baseUrl` إلى URL Firebase:
   ```dart
   static const String baseUrl = 'https://mirmaia-33acc.web.app';
   ```

2. **اختبار الصفحات:**
   - افتح `https://mirmaia-33acc.web.app/worker/login`
   - تأكد من أن جميع الصفحات تعمل

---

**تم التطوير بواسطة:** Auto (Cursor AI)  
**التاريخ:** 2026-01-23
