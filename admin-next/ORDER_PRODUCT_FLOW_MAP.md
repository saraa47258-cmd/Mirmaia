# خارطة الطلب والمنتج — Mirmaia

هذه وثيقة تشرح مسار **المنتج** من الإنشاء حتى الظهور في الطلبات، ومسار **الطلب** من الإنشائه حتى الدفع والإغلاق.

---

## ١. هيكل Firebase

```
restaurant-system/
├── categories/{restaurantId}     ← التصنيفات (قهوة، شاي، كيك...)
├── menu/{restaurantId}           ← المنتجات (نفسها = القائمة)
├── orders/{restaurantId}         ← الطلبات
├── invoices/{restaurantId}       ← الفواتير (بعد الدفع)
├── tables/{restaurantId}         ← الطاولات
├── rooms/{restaurantId}          ← الغرف
├── workers/{restaurantId}        ← العمال والصلاحيات
└── daily_closings/{restaurantId} ← إغلاق اليوم (كاشير)
```

**ملاحظة:** `restaurantId` غالباً `mirmaia-1`. المنتجات مخزّنة تحت `menu` وليست `products`.

---

## ٢. مسار المنتج (من الإنشاء إلى الطلب)

### ٢.١ إنشاء التصنيفات

| الخطوة | الوصف | أين | Firebase |
|--------|--------|-----|----------|
| 1 | الأدمن يضيف تصنيفاً (مثلاً: قهوة، شاي) | `/admin/products` أو إدارة التصنيفات | `categories/{id}` |

- الحقول: `name`, `nameEn`, `icon`/`emoji`, `order`, `active`, `createdAt`.

### ٢.٢ إنشاء المنتجات

| الخطوة | الوصف | أين | Firebase |
|--------|--------|-----|----------|
| 1 | الأدمن يضيف منتجاً | `/admin/products` | `menu/{productId}` |
| 2 | يربط المنتج بتصنيف | حقل `category` / `categoryId` | نفس المسار |
| 3 | يضيف سعراً أساسياً واختيارياً variations (حجم، نوع) | واجهة المنتج | `menu/{id}.variations[]` |

**أهم حقول المنتج:**

- `id`, `name`, `nameEn`, `description`, `descriptionEn`
- `price` أو `basePrice` — السعر الأساسي
- `category` / `categoryId` — التصنيف
- `imageUrl` / `image`, `emoji`
- `active` / `isActive`
- `variations[]` — كل variation له: `id`, `name`, `price`, `isDefault`, `isActive`, `sortOrder`

### ٢.٣ قراءة المنتجات (القائمة)

| المصدر | الوظيفة | المسار Firebase |
|--------|---------|------------------|
| لوحة الأدمن | `getProducts()` ← تقرأ من `menu` | `restaurant-system/menu/{restaurantId}` |
| مَنِيو الموظفين (ويب) | نفس `getProducts` + فلترة فعالة | نفس المسار |
| مَنِيو الموظفين (Flutter) | `getMenuItems()` من Firebase | نفس المسار |
| كاشير | `getPOSProducts()` ← من `getProducts` ثم فلترة فعالة | نفس المسار |

يتم فلترة المنتجات غير الفعالة (`active` / `isActive`) في الواجهات أو في دوال الـ POS.

### ٢.٤ ملخص مسار المنتج

```
إنشاء تصنيف (الأدمن) → categories
        ↓
إنشاء منتج وربطه بالتصنيف (الأدمن) → menu
        ↓
عرض القائمة (أدمن / عامل / كاشير) ← من menu
        ↓
المستخدم يختار منتجات (+ variations) ويضيفها للسلة
        ↓
تُحوَّل إلى عناصر طلب (items) عند إنشاء الطلب
```

---

## ٣. مسار الطلب (من الإنشاء إلى الدفع والإغلاق)

هناك **مصدران** لإنشاء الطلبات:

1. **مَنِيو الموظفين (Staff Menu)** — طلب طاولة بدون دفع فوري.
2. **الكاشير (POS)** — طلب مع إمكانية «طلب فقط» أو «دفع فوراً».

---

### ٣.١ الطلب من مَنِيو الموظفين (Staff Menu)

| الخطوة | الوصف | الواجهة | الدالة / المسار |
|--------|--------|---------|------------------|
| 1 | المستخدم يتصفح المنتجات (من `menu`) | `/admin/staff-menu` أو `/worker/menu` أو Flutter | - |
| 2 | يضيف منتجات للسلة (مع variations إن وجدت) | نفس الصفحة | محلياً (state) |
| 3 | يُدخل رقم الطاولة (أو الغرفة حسب التنفيذ) | سايدبار السلة | - |
| 4 | يضغط «إرسال الطلب» | نفس الصفحة | `createOrder()` |

**استدعاء `createOrder` (مثال):**

```ts
createOrder({
  items: [ { id, name, price, quantity, itemTotal, emoji?, note? }, ... ],
  total,
  status: 'pending',
  tableNumber: '5',
  orderType: 'table',
  source: 'staff-menu',
  restaurantId: 'mirmaia-1',
  createdAt,
});
```

**ما يحدث في Firebase:**

- يُنشأ سجل جديد تحت `orders/{orderId}`.
- إن وُجدت طاولة مطابقة لـ `tableNumber`: تُحدَّث حالة الطاولة إلى `occupied` وربطها بـ `orderId`.
- الطلب يبقى `status: 'pending'`, `paymentStatus: 'pending'` حتى يتم الدفع من الكاشير.

**بعد الإرسال:**

- الطلب يظهر في:
  - `/admin/orders` و/أو `/worker/orders`
  - قائمة «طلبات اليوم المعلقة» في الكاشير (`getTodayPendingOrders`).
- يمكن تغيير الحالة: **معلق → قيد التحضير → جاهز → مكتمل** (أو **ملغي**).

---

### ٣.٢ الطلب من الكاشير (POS)

| الخطوة | الوصف | الواجهة | الدالة / المسار |
|--------|--------|---------|------------------|
| 1 | المستخدم يتصفح منتجات الـ POS (نفس `menu` مع فلترة) | `/admin/cashier` أو `/worker/cashier` | `getPOSProducts()` |
| 2 | يضيف منتجات للسلة (مع variations إن وجدت) | واجهة الكاشير | محلياً |
| 3 | يختار: طاولة / غرفة / تيك أواي | نفس الصفحة | `orderType`, `tableId`/`roomId`... |
| 4 | إما «إنشاء طلب» فقط أو «دفع الآن» | نفس الصفحة | `createPOSOrder` و/أو `payAndCloseOrder` |

**السيناريو أ: إنشاء طلب فقط (يدفع لاحقاً)**

- `createPOSOrder(order, userId, userName)`
- يُنشأ الطلب في `orders/{orderId}` بحالة `pending`.
- إن الطلب لطاولة/غرفة: تُحدَّث حالة الطاولة/الغرفة إلى `occupied`.

**السيناريو ب: دفع فوراً (طلب + دفع)**

1. `createPOSOrder(...)` — إنشاء الطلب.
2. `payAndCloseOrder(orderId, payment, userId, userName)` — الدفع وإغلاق الطلب.

**السيناريو ج: دفع طلب معلّق (من مَنِيو أو كاشير سابق)**

- المستخدم يفتح «طلبات اليوم المعلقة» في الكاشير.
- يختار طلباً ثم «دفع».
- يُستدعى `payAndCloseOrder` فقط (الطلب موجود مسبقاً).

**ما يحدث عند `payAndCloseOrder`:**

- إنشاء فاتورة في `invoices/{invoiceId}`.
- تحديث الطلب: `status: 'completed'`, `paymentStatus: 'paid'`, `paymentMethod`, `paidAt`.
- إن الطلب مرتبط بـ طاولة/غرفة: إعادتها إلى `available`.

---

### ٣.٣ دورة حياة الطلب (الحالات)

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                      إنشاء الطلب                         │
                    │  (Staff Menu: createOrder | Cashier: createPOSOrder)     │
                    └───────────────────────────┬─────────────────────────────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │   pending    │  ← معلّق
                                         └──────┬───────┘
                                                │
                        ┌───────────────────────┼───────────────────────┐
                        │                       │                       │
                        ▼                       ▼                       ▼
                 ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
                 │  preparing   │        │   cancelled  │        │  payAndClose │
                 │ قيد التحضير  │        │    ملغي      │        │  (كاشير)     │
                 └──────┬───────┘        └──────────────┘        └──────┬───────┘
                        │                                               │
                        ▼                                               │
                 ┌──────────────┐                                       │
                 │    ready     │                                       │
                 │    جاهز      │                                       │
                 └──────┬───────┘                                       │
                        │                                               │
                        ▼                                               ▼
                 ┌──────────────┐                                ┌──────────────┐
                 │  completed   │                                │  completed   │
                 │ (بدون دفع)   │                                │  + paid      │
                 └──────────────┘                                └──────────────┘
```

- **pending:** طلب جديد، لم يُدفع.
- **preparing:** قيد التحضير (يُحدَّث من شاشة الطلبات).
- **ready:** جاهز للتسليم.
- **completed:** منتهٍ (بعد «مكتمل» أو بعد الدفع).
- **cancelled:** ملغي.
- **paid:** يُميَّز عادة عبر `paymentStatus: 'paid'` أو `status: 'paid'` حسب التنفيذ.

---

### ٣.٤ عناصر الطلب (Order Items)

كل طلب يحتوي على `items[]`. كل عنصر يشبه:

```ts
{
  id: string;        // productId أو variation id
  name: string;      // "قهوة - كبير" أو "بسبوسة"
  price: number;     // سعر الوحدة
  quantity: number;
  itemTotal?: number;
  emoji?: string;
  note?: string;
}
```

- في **Staff Menu**: يُجمَع من السلة (منتج + variation إن وجد) ثم يُمرَّر لـ `createOrder`.
- في **Cashier**: يُجمَع من سلة الـ POS ثم يُحوَّل إلى نفس الشكل في `createPOSOrder`.

---

## ٤. خلاصة سريعة

| الموضوع | الملخص |
|---------|--------|
| **المنتج** | يُنشأ في `menu`، يُربط بـ `categories`، يُقرأ من `menu` في المَنِيو والكاشير. |
| **التصنيف** | يُنشأ في `categories`، يُستخدم لفلترة وعرض المنتجات. |
| **الطلب من المَنِيو** | `createOrder` → `orders`، `pending`، ربط طاولة، ثم تحديث الحالة أو الدفع من الكاشير. |
| **الطلب من الكاشير** | `createPOSOrder` → `orders`؛ ثم إما دفع لاحقاً أو `payAndCloseOrder` فوراً. |
| **الدفع** | `payAndCloseOrder` → فاتورة في `invoices`، تحديث الطلب إلى `completed` + `paid`، تحرير الطاولة/الغرفة. |
| **حالات الطلب** | `pending` → `preparing` → `ready` → `completed`، أو `cancelled`، أو دفع مباشر إلى `completed` + `paid`. |

---

## ٥. أماكن التنفيذ في المشروع

| الوظيفة | الملف / المسار |
|---------|-----------------|
| `createOrder` | `lib/firebase/database.ts` |
| `createPOSOrder`, `payAndCloseOrder` | `lib/pos.ts` |
| `getProducts` (من menu) | `lib/firebase/database.ts` |
| Staff Menu (ويب) | `app/admin/staff-menu/page.tsx`, `app/worker/menu/page.tsx` |
| Cashier (ويب) | `app/admin/cashier/page.tsx`, `app/worker/cashier/page.tsx` |
| Flutter: إنشاء طلب مَنِيو | `flutter-worker-app/lib/services/firebase_service.dart` → `createOrder` |
| Flutter: كاشير | `flutter-worker-app/lib/screens/cashier_screen.dart` |
| Flutter: عرض القائمة | `flutter-worker-app/lib/screens/staff_menu_screen.dart` |

هذه الخارطة تغطي مسار **المنتج** من الإنشاء إلى الظهور في الطلبات، ومسار **الطلب** من الإنشاء حتى الدفع والإغلاق، مع الإشارة إلى Firebase والأكواد ذات الصلة.
