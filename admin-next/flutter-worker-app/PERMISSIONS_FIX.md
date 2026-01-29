# إصلاح نظام الصلاحيات

## المشكلة
التطبيق لا يلتزم بالصلاحيات المعطاة من لوحة الإدارة.

## الحلول المطبقة

### 1. دعم Actions (الإجراءات)
تم إضافة دعم للتحقق من `actions` في `detailedPermissions`:
- `createOrder` - إنشاء طلب
- `editOrder` - تعديل طلب
- `cancelOrder` - إلغاء طلب
- `processPayment` - معالجة الدفع
- `applyDiscount` - تطبيق خصم
- `viewFinancials` - عرض البيانات المالية
- `manageProducts` - إدارة المنتجات
- `manageTables` - إدارة الطاولات
- `manageRooms` - إدارة الغرف
- `dailyClosing` - إغلاق يومي

### 2. إخفاء البيانات المالية
عندما يكون `viewFinancials: false`:
- يتم إخفاء جميع الأسعار (تعرض "---")
- يتم إخفاء الإجماليات
- يتم إخفاء التقارير المالية

### 3. التحقق من الصلاحيات
الكود يتحقق من:
1. `detailedPermissions.modules` - للوصول للأقسام
2. `detailedPermissions.actions` - للإجراءات المسموحة
3. `viewFinancials` - لإخفاء/إظهار البيانات المالية

## كيفية التحقق

### 1. تأكد من حفظ الصلاحيات
في لوحة الإدارة (`/admin/permissions`):
- حدد الموظف
- فعّل/عطّل الصلاحيات المطلوبة
- اضغط "حفظ الصلاحيات" ✅

### 2. تأكد من بنية البيانات في Firebase
يجب أن تكون الصلاحيات بهذا الشكل:
```json
{
  "detailedPermissions": {
    "modules": {
      "staffMenu": true,
      "orders": true,
      "tables": false,
      "rooms": false,
      "cashier": true,
      "inventory": true,
      "reports": false,
      "products": false
    },
    "actions": {
      "createOrder": true,
      "editOrder": true,
      "cancelOrder": true,
      "processPayment": true,
      "applyDiscount": true,
      "viewFinancials": false,
      "manageProducts": false,
      "manageTables": false,
      "manageRooms": false,
      "dailyClosing": true
    }
  }
}
```

### 3. تسجيل الخروج وإعادة الدخول
بعد تحديث الصلاحيات:
1. سجّل الخروج من التطبيق
2. سجّل الدخول مرة أخرى
3. سيتم جلب أحدث الصلاحيات من Firebase

## الأقسام المتاحة حسب الصلاحيات

- **staffMenu** → منيو الموظفين
- **orders** → الطلبات
- **tables** → الطاولات
- **rooms** → الغرف
- **cashier** → الكاشير
- **inventory** → المخزون
- **reports** → التقارير
- **products** → المنتجات

## ملاحظات مهمة

1. **البيانات المالية**: إذا كان `viewFinancials: false`، سيتم إخفاء جميع الأسعار والإجماليات
2. **تحديث الصلاحيات**: يجب تسجيل الخروج وإعادة الدخول بعد تحديث الصلاحيات
3. **Admin**: المدير لديه جميع الصلاحيات تلقائياً
