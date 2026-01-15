# الخطوط العربية

## IBM Plex Sans Arabic

قم بتحميل الخطوط من:
https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic

### الملفات المطلوبة:

1. `IBMPlexSansArabic-Regular.ttf`
2. `IBMPlexSansArabic-Medium.ttf`
3. `IBMPlexSansArabic-SemiBold.ttf`
4. `IBMPlexSansArabic-Bold.ttf`

### خطوات التحميل:

1. اذهب إلى الرابط أعلاه
2. اضغط على "Download family"
3. فك الضغط عن الملف
4. انسخ الملفات المطلوبة إلى هذا المجلد

### بديل - استخدام Google Fonts Package

إذا لم ترد تضمين الخطوط محلياً، يمكنك استخدام `google_fonts` package:

```dart
import 'package:google_fonts/google_fonts.dart';

// في theme
textTheme: GoogleFonts.ibmPlexSansArabicTextTheme(),
```

ولكن هذا يتطلب اتصال إنترنت عند التشغيل الأول.

