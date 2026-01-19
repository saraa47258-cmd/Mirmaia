/// Product model for POS system
class ProductModel {

  ProductModel({
    required this.id,
    required this.name,
    required this.nameAr,
    this.description,
    required this.categoryId,
    required this.price,
    this.imageUrl,
    this.emoji,
    this.isAvailable = true,
    this.variants = const [],
    this.addons = const [],
  });

  factory ProductModel.fromMap(String id, Map<String, dynamic> data) {
    return ProductModel(
      id: id,
      name: data['name'] ?? data['nameEn'] ?? '',
      nameAr: data['nameAr'] ?? data['name'] ?? '',
      description: data['description'],
      categoryId: data['categoryId'] ?? data['category'] ?? '',
      price: (data['price'] ?? 0).toDouble(),
      imageUrl: data['image'] ?? data['imageUrl'],
      emoji: data['emoji'],
      isAvailable: data['available'] ?? data['isAvailable'] ?? true,
      variants: (data['variants'] as List<dynamic>?)
              ?.map((v) => ProductVariant.fromMap(v))
              .toList() ??
          [],
      addons: (data['addons'] as List<dynamic>?)
              ?.map((a) => ProductAddon.fromMap(a))
              .toList() ??
          [],
    );
  }

  /// Factory for Realtime Database format (object maps instead of arrays)
  factory ProductModel.fromRTDB(String id, Map<String, dynamic> data) {
    // Parse variants - RTDB may store as object map or array
    List<ProductVariant> variants = [];
    final variantsData = data['variants'] ?? data['variations'] ?? data['sizes'];
    if (variantsData != null) {
      if (variantsData is Map) {
        // Convert object map to list: { key1: {...}, key2: {...} }
        variants = variantsData.entries
            .map((entry) {
              final value = entry.value as Map<String, dynamic>? ?? {};
              return ProductVariant.fromMap({'id': entry.key, ...value});
            })
            .where((v) => v.isDefault != false) // Filter inactive
            .toList();
      } else if (variantsData is List) {
        variants = variantsData
            .map((v) => ProductVariant.fromMap(v as Map<String, dynamic>))
            .toList();
      }
    }

    // Parse addons - RTDB may store as object map or array
    List<ProductAddon> addons = [];
    final addonsData = data['addons'];
    if (addonsData != null) {
      if (addonsData is Map) {
        addons = addonsData.entries
            .map((entry) {
              final value = entry.value as Map<String, dynamic>? ?? {};
              return ProductAddon.fromMap({'id': entry.key, ...value});
            })
            .toList();
      } else if (addonsData is List) {
        addons = addonsData
            .map((a) => ProductAddon.fromMap(a as Map<String, dynamic>))
            .toList();
      }
    }

    return ProductModel(
      id: id,
      name: data['name'] ?? data['nameEn'] ?? '',
      nameAr: data['nameAr'] ?? data['name'] ?? '',
      description: data['description'] ?? data['descriptionAr'],
      categoryId: data['categoryId'] ?? data['category'] ?? '',
      price: _parseDouble(data['price']),
      imageUrl: data['image'] ?? data['imageUrl'],
      emoji: data['emoji'],
      isAvailable: data['available'] ?? data['isAvailable'] ?? data['active'] ?? true,
      variants: variants,
      addons: addons,
    );
  }
  final String id;
  final String name;
  final String nameAr;
  final String? description;
  final String categoryId;
  final double price;
  final String? imageUrl;
  final String? emoji;
  final bool isAvailable;
  final List<ProductVariant> variants;
  final List<ProductAddon> addons;

  bool get hasVariants => variants.isNotEmpty;
  bool get hasAddons => addons.isNotEmpty;
  bool get hasOptions => hasVariants || hasAddons;

  /// Get minimum price considering variants
  double get minPrice {
    if (variants.isEmpty) return price;
    final prices = variants.map((v) => price + v.priceModifier);
    return prices.reduce((a, b) => a < b ? a : b);
  }

  /// Get default variant
  ProductVariant? get defaultVariation {
    if (variants.isEmpty) return null;
    // Try to find one marked as default, otherwise return first
    return variants.firstWhere(
      (v) => v.isDefault,
      orElse: () => variants.first,
    );
  }

  /// Helper to parse double from various types
  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'nameAr': nameAr,
      'description': description,
      'categoryId': categoryId,
      'price': price,
      'imageUrl': imageUrl,
      'emoji': emoji,
      'isAvailable': isAvailable,
      'variants': variants.map((v) => v.toMap()).toList(),
      'addons': addons.map((a) => a.toMap()).toList(),
    };
  }
}

/// Product variant (e.g., Small, Medium, Large)
class ProductVariant {

  ProductVariant({
    required this.id,
    required this.name,
    required this.nameAr,
    this.priceModifier = 0,
    this.isDefault = false,
  });

  factory ProductVariant.fromMap(Map<String, dynamic> data) {
    return ProductVariant(
      id: data['id'] ?? '',
      name: data['name'] ?? '',
      nameAr: data['nameAr'] ?? data['name'] ?? '',
      priceModifier: (data['priceModifier'] ?? data['price'] ?? 0).toDouble(),
      isDefault: data['isDefault'] ?? data['default'] ?? false,
    );
  }
  final String id;
  final String name;
  final String nameAr;
  final double priceModifier;
  final bool isDefault;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'nameAr': nameAr,
      'priceModifier': priceModifier,
      'isDefault': isDefault,
    };
  }
}

/// Product addon (e.g., Extra cheese, Extra shot)
class ProductAddon {

  ProductAddon({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.price,
  });

  factory ProductAddon.fromMap(Map<String, dynamic> data) {
    return ProductAddon(
      id: data['id'] ?? '',
      name: data['name'] ?? '',
      nameAr: data['nameAr'] ?? data['name'] ?? '',
      price: (data['price'] ?? 0).toDouble(),
    );
  }
  final String id;
  final String name;
  final String nameAr;
  final double price;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'nameAr': nameAr,
      'price': price,
    };
  }
}

