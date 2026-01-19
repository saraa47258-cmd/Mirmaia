import 'product_model.dart';

/// Cart item model
class CartItem {

  CartItem({
    required this.id,
    required this.product,
    this.selectedVariant,
    this.selectedAddons = const [],
    this.quantity = 1,
    this.notes,
  });
  final String id;
  final ProductModel product;
  final ProductVariant? selectedVariant;
  final List<ProductAddon> selectedAddons;
  int quantity;
  String? notes;

  /// Calculate item price including variant and addons
  double get unitPrice {
    double price = product.price;
    if (selectedVariant != null) {
      price += selectedVariant!.priceModifier;
    }
    for (final addon in selectedAddons) {
      price += addon.price;
    }
    return price;
  }

  /// Total price for this cart item
  double get totalPrice => unitPrice * quantity;

  /// Get display name with variant
  String get displayName {
    if (selectedVariant != null) {
      return '${product.nameAr} (${selectedVariant!.nameAr})';
    }
    return product.nameAr;
  }

  /// Get addons summary
  String get addonsSummary {
    if (selectedAddons.isEmpty) return '';
    return selectedAddons.map((a) => a.nameAr).join('، ');
  }

  /// Create a copy with updated fields
  CartItem copyWith({
    String? id,
    ProductModel? product,
    ProductVariant? selectedVariant,
    List<ProductAddon>? selectedAddons,
    int? quantity,
    String? notes,
  }) {
    return CartItem(
      id: id ?? this.id,
      product: product ?? this.product,
      selectedVariant: selectedVariant ?? this.selectedVariant,
      selectedAddons: selectedAddons ?? this.selectedAddons,
      quantity: quantity ?? this.quantity,
      notes: notes ?? this.notes,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'productId': product.id,
      'productName': product.nameAr,
      'variant': selectedVariant?.toMap(),
      'addons': selectedAddons.map((a) => a.toMap()).toList(),
      'quantity': quantity,
      'unitPrice': unitPrice,
      'totalPrice': totalPrice,
      'notes': notes,
    };
  }
}

/// Cart model
class Cart {

  Cart({
    this.items = const [],
    this.taxRate = 0.15, // 15% VAT
    this.discountPercent = 0,
    this.discountAmount = 0,
  });
  final List<CartItem> items;
  final double taxRate;
  final double discountPercent;
  final double discountAmount;

  /// Subtotal before tax and discounts
  double get subtotal => items.fold(0, (sum, item) => sum + item.totalPrice);

  /// Total discount amount
  double get totalDiscount {
    if (discountPercent > 0) {
      return subtotal * (discountPercent / 100);
    }
    return discountAmount;
  }

  /// Subtotal after discount
  double get subtotalAfterDiscount => subtotal - totalDiscount;

  /// Tax amount
  double get taxAmount => subtotalAfterDiscount * taxRate;

  /// Grand total
  double get grandTotal => subtotalAfterDiscount + taxAmount;

  /// Number of items
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  /// Check if cart is empty
  bool get isEmpty => items.isEmpty;

  /// Create a copy with updated fields
  Cart copyWith({
    List<CartItem>? items,
    double? taxRate,
    double? discountPercent,
    double? discountAmount,
  }) {
    return Cart(
      items: items ?? this.items,
      taxRate: taxRate ?? this.taxRate,
      discountPercent: discountPercent ?? this.discountPercent,
      discountAmount: discountAmount ?? this.discountAmount,
    );
  }
}



