import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String _databaseUrl = 'https://sham-coffee-default-rtdb.firebaseio.com';
  static const String _restaurantId = 'sham-coffee-1';
  static const String baseUrl = 'https://sham-coffee.web.app';
  
  static const String _keyIsLoggedIn = 'is_logged_in';
  static const String _keyBranchId = 'branch_id';
  static const String _keyUserId = 'user_id';
  static const String _keyUserName = 'user_name';
  static const String _keyUserRole = 'user_role';
  static const String _keyUserPosition = 'user_position';
  static const String _keyUserPermissions = 'user_permissions';
  static const String _keyUsername = 'username';

  // Login result
  static Future<LoginResult> login(String username, String password) async {
    if (username.isEmpty || password.isEmpty) {
      return LoginResult.error('الرجاء إدخال اسم المستخدم وكلمة المرور');
    }

    try {
      // Try worker login first
      final workersResponse = await http.get(
        Uri.parse('$_databaseUrl/restaurant-system/workers/$_restaurantId.json'),
      );

      if (workersResponse.statusCode == 200) {
        final workersData = json.decode(workersResponse.body) as Map<String, dynamic>?;
        
        if (workersData != null) {
          for (final entry in workersData.entries) {
            final worker = entry.value as Map<String, dynamic>;
            if (worker['username'] == username && worker['password'] == password) {
              // Check if active
              final isActive = worker['active'] == true || 
                               worker['isActive'] == true ||
                               worker['active'] == 'true' ||
                               worker['isActive'] == 'true';
              
              if (!isActive) {
                return LoginResult.error('هذا الحساب غير مفعل');
              }

              final user = UserData(
                id: entry.key,
                name: worker['fullName'] ?? worker['name'] ?? username,
                username: username,
                role: worker['role'] ?? 'staff',
                position: worker['position'] ?? 'موظف',
                permissions: _parsePermissions(worker['permissions']),
                branchId: _restaurantId,
              );

              await _saveUser(user);
              return LoginResult.success(user);
            }
          }
        }
      }

      // Try admin login
      final restaurantResponse = await http.get(
        Uri.parse('$_databaseUrl/restaurant-system/restaurants/$_restaurantId.json'),
      );

      if (restaurantResponse.statusCode == 200) {
        final restaurant = json.decode(restaurantResponse.body) as Map<String, dynamic>?;
        
        if (restaurant != null &&
            restaurant['username'] == username &&
            restaurant['password'] == password) {
          final user = UserData(
            id: _restaurantId,
            name: restaurant['name'] ?? 'مدير',
            username: username,
            role: 'admin',
            position: 'مدير النظام',
            permissions: ['all'],
            branchId: _restaurantId,
          );

          await _saveUser(user);
          return LoginResult.success(user);
        }
      }

      return LoginResult.error('اسم المستخدم أو كلمة المرور غير صحيحة');
    } catch (e) {
      return LoginResult.error('خطأ في الاتصال. تأكد من اتصالك بالإنترنت');
    }
  }

  static List<String> _parsePermissions(dynamic permissions) {
    if (permissions == null) return [];
    if (permissions is List) {
      return permissions.map((e) => e.toString()).toList();
    }
    return [];
  }

  static Future<void> _saveUser(UserData user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyIsLoggedIn, true);
    await prefs.setString(_keyUserId, user.id);
    await prefs.setString(_keyUserName, user.name);
    await prefs.setString(_keyUsername, user.username);
    await prefs.setString(_keyUserRole, user.role);
    await prefs.setString(_keyUserPosition, user.position);
    await prefs.setStringList(_keyUserPermissions, user.permissions);
    await prefs.setString(_keyBranchId, user.branchId);
  }

  static Future<UserData?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final isLoggedIn = prefs.getBool(_keyIsLoggedIn) ?? false;
    
    if (!isLoggedIn) return null;
    
    return UserData(
      id: prefs.getString(_keyUserId) ?? '',
      name: prefs.getString(_keyUserName) ?? '',
      username: prefs.getString(_keyUsername) ?? '',
      role: prefs.getString(_keyUserRole) ?? 'staff',
      position: prefs.getString(_keyUserPosition) ?? '',
      permissions: prefs.getStringList(_keyUserPermissions) ?? [],
      branchId: prefs.getString(_keyBranchId) ?? 'sham-coffee-1',
    );
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}

class UserData {
  final String id;
  final String name;
  final String username;
  final String role;
  final String position;
  final List<String> permissions;
  final String branchId;

  UserData({
    required this.id,
    required this.name,
    required this.username,
    required this.role,
    required this.position,
    required this.permissions,
    required this.branchId,
  });

  bool get isAdmin => role == 'admin';
  
  bool hasPermission(String permission) {
    if (isAdmin) return true;
    if (permissions.contains('all')) return true;
    return permissions.contains(permission);
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'username': username,
    'role': role,
    'position': position,
    'permissions': permissions,
    'branchId': branchId,
    'restaurantId': branchId,
  };
}

class LoginResult {
  final bool success;
  final UserData? user;
  final String? error;

  LoginResult.success(this.user) : success = true, error = null;
  LoginResult.error(this.error) : success = false, user = null;
}
