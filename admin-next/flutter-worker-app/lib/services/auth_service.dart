import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'firebase_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final FirebaseService _firebaseService = FirebaseService();
  static const String _workerKey = 'current_worker';
  static const String _usernameKey = 'saved_username';

  // Login
  Future<Map<String, dynamic>?> login(String username, String password) async {
    try {
      final worker = await _firebaseService.getWorkerByUsername(username);

      if (worker == null) {
        return {'error': 'اسم المستخدم غير موجود'};
      }

      // Check if worker is active
      final isActive = worker['isActive'] ?? worker['active'] ?? false;
      if (!isActive) {
        return {'error': 'الحساب غير مفعّل'};
      }

      // Check password
      if (worker['password'] != password) {
        return {'error': 'كلمة المرور غير صحيحة'};
      }

      // Save worker data
      await _saveWorkerData(worker);
      await _saveUsername(username);

      return {'success': true, 'worker': worker};
    } catch (e) {
      print('Login error: $e');
      return {'error': 'حدث خطأ أثناء تسجيل الدخول'};
    }
  }

  // Get saved worker
  Future<Map<String, dynamic>?> getSavedWorker() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final workerJson = prefs.getString(_workerKey);
      final username = prefs.getString(_usernameKey);

      if (username != null) {
        // Fetch from Firebase to get latest data
        return await _firebaseService.getWorkerByUsername(username);
      }
      return null;
    } catch (e) {
      print('Error getting saved worker: $e');
      return null;
    }
  }

  // Save worker data
  Future<void> _saveWorkerData(Map<String, dynamic> worker) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_workerKey, jsonEncode(worker));
  }

  // Save username
  Future<void> _saveUsername(String username) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_usernameKey, username);
  }

  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_workerKey);
    await prefs.remove(_usernameKey);
  }

  // Check permissions
  bool hasPermission(Map<String, dynamic>? worker, String permission) {
    if (worker == null) return false;

    // Admin has all permissions
    if (worker['role'] == 'admin') {
      print('hasPermission: user is admin, granting permission: $permission');
      return true;
    }

    // Check permissions array (legacy)
    final permissions = worker['permissions'];
    if (permissions != null) {
      if (permissions == 'full') {
        print('hasPermission: permissions is full, granting: $permission');
        return true;
      }
      if (permissions is List) {
        final hasPerm = permissions.contains(permission);
        print('hasPermission (legacy array): $permission = $hasPerm');
        return hasPerm;
      }
    }

    // Check detailed permissions
    final detailedPermissions = worker['detailedPermissions'];
    print('hasPermission: checking detailedPermissions for $permission');
    print('  - detailedPermissions type: ${detailedPermissions.runtimeType}');
    print('  - detailedPermissions value: $detailedPermissions');

    if (detailedPermissions != null) {
      // Convert to Map if needed
      Map<String, dynamic>? permMap;
      if (detailedPermissions is Map) {
        permMap = Map<String, dynamic>.from(detailedPermissions);
      } else {
        print('  - detailedPermissions is not a Map, skipping');
      }

      if (permMap != null) {
        // Check modules
        final modules = permMap['modules'];
        print('  - modules type: ${modules.runtimeType}');
        print('  - modules value: $modules');

        if (modules != null) {
          Map<String, dynamic>? modulesMap;
          if (modules is Map) {
            modulesMap = Map<String, dynamic>.from(modules);
          }

          if (modulesMap != null) {
            // Map permission names to module names
            final permissionMap = {
              'staff-menu': 'staffMenu',
              'staffMenu': 'staffMenu',
              'orders': 'orders',
              'tables': 'tables',
              'rooms': 'rooms',
              'cashier': 'cashier',
              'inventory': 'inventory',
              'reports': 'reports',
              'products': 'products',
              'menu': 'staffMenu', // Alias for staff-menu
            };

            final moduleName = permissionMap[permission];
            if (moduleName != null) {
              final moduleValue = modulesMap[moduleName];
              final hasAccess = moduleValue == true || moduleValue == 'true';
              print(
                  '  - Checking module $moduleName: $moduleValue (${moduleValue.runtimeType}) -> $hasAccess');
              return hasAccess;
            }
          }
        }

        // Check actions
        final actions = permMap['actions'];
        print('  - actions type: ${actions.runtimeType}');
        print('  - actions value: $actions');

        if (actions != null) {
          Map<String, dynamic>? actionsMap;
          if (actions is Map) {
            actionsMap = Map<String, dynamic>.from(actions);
          }

          if (actionsMap != null) {
            final actionMap = {
              'createOrder': 'createOrder',
              'editOrder': 'editOrder',
              'cancelOrder': 'cancelOrder',
              'processPayment': 'processPayment',
              'applyDiscount': 'applyDiscount',
              'viewFinancials': 'viewFinancials',
              'manageProducts': 'manageProducts',
              'manageTables': 'manageTables',
              'manageRooms': 'manageRooms',
              'dailyClosing': 'dailyClosing',
            };

            final actionName = actionMap[permission];
            if (actionName != null) {
              final actionValue = actionsMap[actionName];
              final hasAccess = actionValue == true || actionValue == 'true';
              print(
                  '  - Checking action $actionName: $actionValue (${actionValue.runtimeType}) -> $hasAccess');
              return hasAccess;
            }
          }
        }
      }
    }

    print('hasPermission: $permission -> false (no match found)');
    return false;
  }

  // Check if financial data should be hidden
  bool shouldHideFinancialData(Map<String, dynamic>? worker) {
    // Always show prices - return false to always display financial data
    return false;
  }
}
