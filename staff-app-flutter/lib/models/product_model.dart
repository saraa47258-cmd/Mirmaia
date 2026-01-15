class ProductVariation {
  final String id;
  final String name;
  final double price;
  final bool isActive;
  final bool isDefault;
  final int sortOrder;

  ProductVariation({
    required this.id,
    required this.name,
    required this.price,
    this.isActive = true,
    this.isDefault = false,
    this.sortOrder = 0,
  });

  factory ProductVariation.fromMap(String id, Map<String, dynamic> map) {
    return ProductVariation(
      id: id,
      name: map['name'] ?? '',
      price: (map['price'] ?? 0).toDouble(),
      isActive: map['isActive'] ?? true,
      isDefault: map['isDefault'] ?? false,
      sortOrder: map['sortOrder'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'isActive': isActive,
      'isDefault': isDefault,
      'sortOrder': sortOrder,
    };
  }
}

class ProductModel {
  final String id;
  final String name;
  final String? nameEn;
  final double price;
  final String category;
  final String? categoryId;
  final String? description;
  final String? imageUrl;
  final String? emoji;
  final bool active;
  final List<ProductVariation> variations;
  final DateTime? createdAt;

  ProductModel({
    required this.id,
    required this.name,
    this.nameEn,
    required this.price,
    required this.category,
    this.categoryId,
    this.description,
    this.imageUrl,
    this.emoji,
    this.active = true,
    this.variations = const [],
    this.createdAt,
  });

  factory ProductModel.fromMap(String id, Map<String, dynamic> map) {
    // Parse variations
    List<ProductVariation> variationsList = [];
    if (map['variations'] != null) {
      if (map['variations'] is List) {
        variationsList = (map['variations'] as List)
            .asMap()
            .entries
            .map((entry) => ProductVariation.fromMap(
                  entry.value['id'] ?? 'var_${entry.key}',
                  entry.value as Map<String, dynamic>,
                ))
            .where((v) => v.isActive)
            .toList();
      } else if (map['variations'] is Map) {
        (map['variations'] as Map).forEach((key, value) {
          final variation = ProductVariation.fromMap(
            key.toString(),
            value as Map<String, dynamic>,
          );
          if (variation.isActive) {
            variationsList.add(variation);
          }
        });
      }
    }
    
    // Sort variations by sortOrder
    variationsList.sort((a, b) => a.sortOrder.compareTo(b.sortOrder));

    return ProductModel(
      id: id,
      name: map['name'] ?? '',
      nameEn: map['nameEn'],
      price: (map['price'] ?? 0).toDouble(),
      category: map['category'] ?? map['categoryId'] ?? '',
      categoryId: map['categoryId'] ?? map['category'],
      description: map['description'],
      imageUrl: map['imageUrl'] ?? map['image'],
      emoji: map['emoji'],
      active: map['active'] ?? map['isActive'] ?? true,
      variations: variationsList,
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'nameEn': nameEn,
      'price': price,
      'category': category,
      'categoryId': categoryId,
      'description': description,
      'imageUrl': imageUrl,
      'emoji': emoji,
      'active': active,
      'variations': variations.map((v) => v.toMap()).toList(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  bool get hasVariations => variations.isNotEmpty;

  double get minPrice {
    if (variations.isEmpty) return price;
    return variations.map((v) => v.price).reduce((a, b) => a < b ? a : b);
  }

  ProductVariation? get defaultVariation {
    if (variations.isEmpty) return null;
    return variations.firstWhere(
      (v) => v.isDefault,
      orElse: () => variations.first,
    );
  }
}

