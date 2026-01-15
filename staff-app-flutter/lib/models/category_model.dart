class CategoryModel {
  final String id;
  final String name;
  final String? nameEn;
  final String? icon;
  final int order;
  final bool active;
  final String? imageUrl;
  final DateTime? createdAt;

  CategoryModel({
    required this.id,
    required this.name,
    this.nameEn,
    this.icon,
    this.order = 0,
    this.active = true,
    this.imageUrl,
    this.createdAt,
  });

  factory CategoryModel.fromMap(String id, Map<String, dynamic> map) {
    return CategoryModel(
      id: id,
      name: map['name'] ?? map['nameAr'] ?? '',
      nameEn: map['nameEn'],
      icon: map['icon'],
      order: map['order'] ?? map['sortOrder'] ?? 0,
      active: map['active'] ?? true,
      imageUrl: map['imageUrl'],
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'nameEn': nameEn,
      'icon': icon,
      'order': order,
      'active': active,
      'imageUrl': imageUrl,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

