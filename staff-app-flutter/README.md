# Sham Coffee - Staff App (Flutter Windows Desktop)

تطبيق سطح المكتب للموظفين - قهوة الشام

## المتطلبات

- Flutter SDK 3.16+
- Windows 10/11
- Visual Studio 2022 with C++ Desktop Development workload

## التثبيت

### 1. تفعيل Windows Desktop

```bash
flutter config --enable-windows-desktop
flutter doctor
```

### 2. تثبيت Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 3. تهيئة FlutterFire

```bash
dart pub global activate flutterfire_cli
flutterfire configure --project=sham-coffee
```

### 4. تثبيت الـ Dependencies

```bash
cd staff-app-flutter
flutter pub get
```

### 5. تشغيل التطبيق

```bash
flutter run -d windows
```

### 6. بناء ملف EXE

```bash
flutter build windows --release
```

الملف الناتج سيكون في:
`build/windows/x64/runner/Release/sham_coffee_staff.exe`

## هيكل المشروع

```
lib/
├── main.dart                 # نقطة البداية
├── app.dart                  # تهيئة التطبيق
├── config/
│   └── firebase_options.dart # إعدادات Firebase
├── models/
│   ├── user_model.dart       # نموذج المستخدم
│   ├── product_model.dart    # نموذج المنتج
│   ├── category_model.dart   # نموذج التصنيف
│   └── order_model.dart      # نموذج الطلب
├── services/
│   ├── auth_service.dart     # خدمة المصادقة
│   └── firestore_service.dart # خدمة Firestore
├── providers/
│   ├── auth_provider.dart    # مزود المصادقة
│   └── cart_provider.dart    # مزود السلة
├── screens/
│   ├── splash_screen.dart    # شاشة البداية
│   ├── login_screen.dart     # شاشة تسجيل الدخول
│   ├── home_screen.dart      # الشاشة الرئيسية
│   ├── staff_menu_screen.dart # منيو الموظفين
│   ├── cashier_screen.dart   # الكاشير
│   ├── tables_screen.dart    # الطاولات
│   └── room_orders_screen.dart # طلبات الغرف
├── widgets/
│   ├── product_card.dart     # بطاقة المنتج
│   ├── cart_sidebar.dart     # سلة الطلب
│   ├── variation_dialog.dart # نافذة الخيارات
│   └── loading_widget.dart   # مؤشر التحميل
└── theme/
    └── app_theme.dart        # ثيم التطبيق
```

## الصلاحيات

| الصلاحية | الوصف |
|----------|-------|
| staffMenu | منيو الموظفين |
| cashier | الكاشير |
| tables | الطاولات |
| roomOrders | طلبات الغرف |

## Firestore Structure

```
users/{uid}:
  - fullName: string
  - username: string
  - email: string
  - role: "staff" | "cashier" | "admin"
  - permissions: { staffMenu: bool, cashier: bool, ... }
  - isActive: bool

categories/{categoryId}:
  - name: string
  - icon: string
  - order: number
  - active: bool

products/{productId}:
  - name: string
  - price: number
  - category: string
  - description: string
  - imageUrl: string
  - active: bool
  - variations: [{ id, name, price, isActive }]

orders/{orderId}:
  - items: []
  - total: number
  - status: string
  - source: string
  - createdBy: string
  - createdAt: timestamp
```





