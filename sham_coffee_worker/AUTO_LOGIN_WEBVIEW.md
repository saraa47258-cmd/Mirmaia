# تسجيل الدخول التلقائي في WebView

## ✅ تمت الإضافة بنجاح!

### الميزات:
- ✅ **تسجيل دخول تلقائي** - يمرر معلومات العامل تلقائياً
- ✅ **Query Parameters** - يضيف معلومات العامل في URL
- ✅ **JavaScript Injection** - يحقن كود JavaScript لتسجيل الدخول
- ✅ **localStorage** - يحفظ معلومات العامل في localStorage
- ✅ **Auto-fill Forms** - يملأ حقول تسجيل الدخول تلقائياً

### المعلومات الممررة:
- `workerId` - معرف العامل
- `workerUsername` - اسم المستخدم
- `workerName` - اسم العامل الكامل
- `autoLogin=true` - علامة تسجيل الدخول التلقائي
- `source=worker-app` - مصدر الطلب

### كيفية العمل:
1. **عند فتح WebView:**
   - يحصل على معلومات العامل من `SharedPreferences`
   - يضيفها كـ query parameters في URL
   - مثال: `https://sham-coffee.web.app?workerId=xxx&workerUsername=test&autoLogin=true`

2. **بعد تحميل الصفحة:**
   - يحقن JavaScript تلقائياً
   - يحفظ المعلومات في `localStorage`
   - يرسل حدث `workerAutoLogin` للموقع
   - يحاول ملء حقول تسجيل الدخول تلقائياً
   - يحاول الضغط على زر تسجيل الدخول

3. **في الموقع:**
   - يمكن للموقع الاستماع لحدث `workerAutoLogin`
   - يمكن قراءة المعلومات من `localStorage`
   - يمكن قراءة query parameters من URL

### مثال على الاستخدام في الموقع:
```javascript
// الاستماع لحدث تسجيل الدخول التلقائي
window.addEventListener('workerAutoLogin', (event) => {
  const { workerId, workerUsername, workerName } = event.detail;
  // تسجيل الدخول تلقائياً
  loginWorker(workerUsername, workerId);
});

// أو قراءة من localStorage
const workerId = localStorage.getItem('worker_id');
const workerUsername = localStorage.getItem('worker_username');
if (workerId && workerUsername) {
  // تسجيل الدخول
}
```

### الملفات المعدلة:
- ✅ `lib/screens/webview_screen.dart` - إضافة auto-login
- ✅ `lib/screens/menu_screen.dart` - تمرير معلومات العامل
