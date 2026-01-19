class UserModel {

  UserModel({
    required this.uid,
    required this.fullName,
    required this.username,
    this.email,
    required this.role,
    required this.permissions,
    required this.isActive,
    this.createdAt,
    this.lastLoginAt,
  });

  factory UserModel.fromMap(String uid, Map<String, dynamic> map) {
    // Parse permissions
    Map<String, bool> perms = {};
    if (map['permissions'] != null) {
      if (map['permissions'] is Map) {
        (map['permissions'] as Map).forEach((key, value) {
          perms[key.toString()] = value == true;
        });
      } else if (map['permissions'] is List) {
        for (var perm in (map['permissions'] as List)) {
          perms[perm.toString()] = true;
        }
      }
    }
    
    // Admin has all permissions
    if (map['role'] == 'admin') {
      perms = {
        'staffMenu': true,
        'cashier': true,
        'tables': true,
        'roomOrders': true,
        'inventory': true,
        'reports': true,
        'workers': true,
      };
    }

    return UserModel(
      uid: uid,
      fullName: map['fullName'] ?? map['name'] ?? '',
      username: map['username'] ?? '',
      email: map['email'],
      role: map['role'] ?? 'staff',
      permissions: perms,
      isActive: map['isActive'] ?? map['active'] ?? true,
      createdAt: map['createdAt'] != null 
          ? DateTime.tryParse(map['createdAt'].toString())
          : null,
      lastLoginAt: map['lastLoginAt'] != null 
          ? DateTime.tryParse(map['lastLoginAt'].toString())
          : null,
    );
  }
  final String uid;
  final String fullName;
  final String username;
  final String? email;
  final String role;
  final Map<String, bool> permissions;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? lastLoginAt;

  Map<String, dynamic> toMap() {
    return {
      'fullName': fullName,
      'username': username,
      'email': email,
      'role': role,
      'permissions': permissions,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'lastLoginAt': lastLoginAt?.toIso8601String(),
    };
  }

  bool hasPermission(String permission) {
    if (role == 'admin') return true;
    return permissions[permission] == true;
  }

  String get roleLabel {
    switch (role) {
      case 'admin':
        return 'مدير';
      case 'cashier':
        return 'كاشير';
      case 'staff':
        return 'موظف';
      default:
        return role;
    }
  }

  UserModel copyWith({
    String? uid,
    String? fullName,
    String? username,
    String? email,
    String? role,
    Map<String, bool>? permissions,
    bool? isActive,
    DateTime? createdAt,
    DateTime? lastLoginAt,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      fullName: fullName ?? this.fullName,
      username: username ?? this.username,
      email: email ?? this.email,
      role: role ?? this.role,
      permissions: permissions ?? this.permissions,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
    );
  }
}





