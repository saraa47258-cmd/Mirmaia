/// Table model for Firebase Realtime Database
class TableModel {

  TableModel({
    required this.id,
    required this.tableNumber,
    this.name,
    required this.area,
    required this.status,
    this.activeOrderId,
    this.reservedBy,
    this.reservedAt,
    this.createdAt,
    this.updatedAt,
  });

  /// Create from RTDB map
  factory TableModel.fromRTDB(String id, Map<String, dynamic> data) {
    return TableModel(
      id: id,
      tableNumber: data['tableNumber']?.toString() ?? '',
      name: data['name']?.toString(),
      area: data['area']?.toString() ?? 'داخلي',
      status: data['status']?.toString() ?? 'available',
      activeOrderId: data['activeOrderId']?.toString(),
      reservedBy: data['reservedBy']?.toString(),
      reservedAt: data['reservedAt']?.toString(),
      createdAt: data['createdAt']?.toString(),
      updatedAt: data['updatedAt']?.toString(),
    );
  }
  final String id;
  final String tableNumber;
  final String? name;
  final String area; // "داخلي" | "VIP"
  final String status; // "available" | "reserved" | "occupied"
  final String? activeOrderId;
  final String? reservedBy;
  final String? reservedAt;
  final String? createdAt;
  final String? updatedAt;

  /// Convert to map
  Map<String, dynamic> toMap() {
    return {
      'tableNumber': tableNumber,
      if (name != null) 'name': name,
      'area': area,
      'status': status,
      if (activeOrderId != null) 'activeOrderId': activeOrderId,
      if (reservedBy != null) 'reservedBy': reservedBy,
      if (reservedAt != null) 'reservedAt': reservedAt,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  /// Check if table is active (has order or not available)
  bool get isActive => status != 'available' || activeOrderId != null;

  /// Get display name
  String get displayName => name ?? 'طاولة $tableNumber';
}



