class CategoryModel {

  CategoryModel({
    required this.id,
    required this.name,
    String? nameAr,
    this.nameEn,
    this.icon,
    this.color,
    this.order = 0,
    this.sortOrder = 0,
    this.active = true,
    this.imageUrl,
    this.createdAt,
  }) : _nameAr = nameAr ?? name;

  factory CategoryModel.fromMap(String id, Map<String, dynamic> map) {
    return CategoryModel(
      id: id,
      name: map['name'] ?? map['nameAr'] ?? '',
      nameEn: map['nameEn'],
      icon: map['icon'],
      color: map['color'],
      order: map['order'] ?? map['sortOrder'] ?? 0,
      sortOrder: map['sortOrder'] ?? map['order'] ?? 0,
      active: map['active'] ?? true,
      imageUrl: map['imageUrl'],
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt'].toString())
          : null,
    );
  }
  final String id;
  final String name;
  final String _nameAr;
  final String? nameEn;
  final String? icon;
  final String? color;
  final int order;
  final int sortOrder;
  final bool active;
  final String? imageUrl;
  final DateTime? createdAt;

  /// Arabic name (defaults to name if not provided)
  String get nameAr => _nameAr;

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'nameEn': nameEn,
      'icon': icon,
      'color': color,
      'order': order,
      'sortOrder': sortOrder,
      'active': active,
      'imageUrl': imageUrl,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}



