/// عملة النظام: الريال العُماني (من Firebase)
const String kCurrency = 'ر.ع';

/// تنسيق السعر بالريال العُماني (3 منازل عادة)
String formatPrice(num? value, {bool hideFinancial = false}) {
  if (hideFinancial) return '---';
  if (value == null) return '0.000 $kCurrency';
  return '${value.toStringAsFixed(3)} $kCurrency';
}

/// تنسيق السعر بدون العملة (للعرض المختصر)
String formatPriceShort(num? value, {bool hideFinancial = false}) {
  if (hideFinancial) return '---';
  if (value == null) return '0.000';
  return value.toStringAsFixed(3);
}
