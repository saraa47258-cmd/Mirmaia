# رفع صفحات العمال فقط - دليل سريع

## 🚀 رفع سريع (خطوتين)

### 1. تسجيل الدخول (مرة واحدة فقط)
```bash
firebase login
```

### 2. بناء ورفع
```bash
npm run deploy:worker
```

أو:
```bash
deploy-worker.bat
```

---

## ✅ ما يتم رفعه

- ✅ **صفحات العمال فقط:** `/worker/*`
- ✅ **الملفات المشتركة:** `_next`, assets, favicon
- ❌ **صفحات الأدمن:** لا يتم رفعها (تبقى محلية)

---

## 📱 URLs بعد الرفع

```
https://mirmaia-33acc.web.app/worker
https://mirmaia-33acc.web.app/worker/login
https://mirmaia-33acc.web.app/worker/menu
https://mirmaia-33acc.web.app/worker/orders
https://mirmaia-33acc.web.app/worker/cashier
https://mirmaia-33acc.web.app/worker/tables
```

---

## 🔄 تحديث الموقع

```bash
npm run deploy:worker
```

---

## 📝 الملفات

- `build-worker/` - مجلد صفحات العمال فقط
- `firebase-worker.json` - إعدادات Firebase لصفحات العمال
- `deploy-worker.bat` - سكريبت Windows للرفع

---

**جاهز!** 🚀
