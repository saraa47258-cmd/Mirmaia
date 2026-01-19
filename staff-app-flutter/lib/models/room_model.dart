/// Room model for Firebase Realtime Database
class RoomModel {

  RoomModel({
    required this.id,
    required this.roomNumber,
    this.name,
    required this.status,
    this.activeReservationId,
    this.activeOrderId,
    this.reservedBy,
    this.reservedAt,
    this.createdAt,
    this.updatedAt,
    this.isActive = true,
  });

  /// Create from RTDB map
  factory RoomModel.fromRTDB(String id, Map<String, dynamic> data) {
    return RoomModel(
      id: id,
      roomNumber: data['roomNumber']?.toString() ?? '',
      name: data['name']?.toString(),
      status: data['status']?.toString() ?? 'available',
      activeReservationId: data['activeReservationId']?.toString(),
      activeOrderId: data['activeOrderId']?.toString(),
      reservedBy: data['reservedBy']?.toString(),
      reservedAt: data['reservedAt']?.toString(),
      createdAt: data['createdAt']?.toString(),
      updatedAt: data['updatedAt']?.toString(),
      isActive: data['isActive'] != false,
    );
  }
  final String id;
  final String roomNumber;
  final String? name;
  final String status; // "available" | "reserved" | "occupied"
  final String? activeReservationId;
  final String? activeOrderId;
  final String? reservedBy;
  final String? reservedAt;
  final String? createdAt;
  final String? updatedAt;
  final bool isActive;

  /// Convert to map
  Map<String, dynamic> toMap() {
    return {
      'roomNumber': roomNumber,
      if (name != null) 'name': name,
      'status': status,
      if (activeReservationId != null) 'activeReservationId': activeReservationId,
      if (activeOrderId != null) 'activeOrderId': activeOrderId,
      if (reservedBy != null) 'reservedBy': reservedBy,
      if (reservedAt != null) 'reservedAt': reservedAt,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
      'isActive': isActive,
    };
  }

  /// Check if room is active (has reservation or order)
  bool get isActiveRoom => status != 'available' || activeReservationId != null || activeOrderId != null;

  /// Get display name
  String get displayName => name ?? 'غرفة $roomNumber';
}

/// Room Reservation model
class RoomReservation {

  RoomReservation({
    required this.id,
    required this.roomId,
    required this.gender,
    required this.roomCharge,
    this.createdBy,
    this.createdByName,
    this.createdAt,
    this.activeOrderId,
    this.isDeleted = false,
  });

  /// Create from RTDB map
  factory RoomReservation.fromRTDB(String id, Map<String, dynamic> data) {
    final gender = data['gender']?.toString() ?? 'girl';
    // Calculate room charge based on gender
    final roomCharge = gender.toLowerCase() == 'boy' ? 3.0 : 0.0;
    
    return RoomReservation(
      id: id,
      roomId: data['roomId']?.toString() ?? '',
      gender: gender,
      roomCharge: (data['roomCharge'] as num?)?.toDouble() ?? roomCharge,
      createdBy: data['createdBy']?.toString(),
      createdByName: data['createdByName']?.toString(),
      createdAt: data['createdAt']?.toString(),
      activeOrderId: data['activeOrderId']?.toString(),
      isDeleted: data['isDeleted'] == true,
    );
  }
  final String id;
  final String roomId;
  final String gender; // "girl" | "boy"
  final double roomCharge; // 0 for girl, 3 for boy
  final String? createdBy;
  final String? createdByName;
  final String? createdAt;
  final String? activeOrderId;
  final bool isDeleted;

  /// Convert to map
  Map<String, dynamic> toMap() {
    return {
      'roomId': roomId,
      'gender': gender,
      'roomCharge': roomCharge,
      if (createdBy != null) 'createdBy': createdBy,
      if (createdByName != null) 'createdByName': createdByName,
      if (createdAt != null) 'createdAt': createdAt,
      if (activeOrderId != null) 'activeOrderId': activeOrderId,
      'isDeleted': isDeleted,
    };
  }

  /// Get gender label in Arabic
  String get genderLabel => gender.toLowerCase() == 'boy' ? 'ولد' : 'بنت';
}



