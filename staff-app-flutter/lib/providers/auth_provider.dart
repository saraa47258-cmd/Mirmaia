import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import 'dart:convert';

class AuthProvider with ChangeNotifier {

  AuthProvider() {
    _loadSavedUser();
  }
  final AuthService _authService = AuthService();
  
  UserModel? _user;
  bool _isLoading = false;
  String? _error;
  bool _isInitialized = false;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  bool get isInitialized => _isInitialized;

  /// Load saved user from SharedPreferences and check Firebase session
  Future<void> _loadSavedUser() async {
    try {
      // First check Firebase Auth session
      final currentSessionUser = await _authService.checkCurrentSession();
      
      if (currentSessionUser != null) {
        _user = currentSessionUser;
        await _saveUser(currentSessionUser);
        notifyListeners();
        _isInitialized = true;
        return;
      }

      // Fallback to SharedPreferences (legacy)
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user');
      
      if (userJson != null) {
        final userData = jsonDecode(userJson);
        _user = UserModel.fromMap(userData['uid'], userData);
        
        // Verify user still exists and is active in Firestore
        try {
          final verifiedUser = await _authService.checkCurrentSession();
          if (verifiedUser != null && verifiedUser.isActive) {
            _user = verifiedUser;
            await _saveUser(verifiedUser);
          } else {
            // User no longer active or doesn't exist
            _user = null;
            await _clearSavedUser();
          }
        } catch (e) {
          // If verification fails, clear saved user
          _user = null;
          await _clearSavedUser();
        }
        
        notifyListeners();
      }
    } catch (e) {
      print('Error loading saved user: $e');
      _user = null;
      await _clearSavedUser();
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
  }

  /// Save user to SharedPreferences
  Future<void> _saveUser(UserModel user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userData = {
        'uid': user.uid,
        ...user.toMap(),
      };
      await prefs.setString('user', jsonEncode(userData));
    } catch (e) {
      print('Error saving user: $e');
    }
  }

  /// Clear saved user
  Future<void> _clearSavedUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user');
    } catch (e) {
      print('Error clearing saved user: $e');
    }
  }

  /// Login with username and password
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _user = await _authService.login(username, password);
      
      // Verify user is active (should already be checked in service, but double-check)
      if (!_user!.isActive) {
        _error = 'الحساب موقوف. يرجى التواصل مع المدير';
        _user = null;
        await _authService.logout();
        await _clearSavedUser();
        notifyListeners();
        return false;
      }
      
      await _saveUser(_user!);
      _error = null;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      // Clean up on error
      _user = null;
      try {
        await _authService.logout();
        await _clearSavedUser();
      } catch (_) {
        // Ignore cleanup errors
      }
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
      await _clearSavedUser();
      _user = null;
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Check if user has permission
  bool hasPermission(String permission) {
    if (_user == null) return false;
    return _user!.hasPermission(permission);
  }

  /// Get list of allowed modules for current user
  List<Map<String, dynamic>> getAllowedModules() {
    if (_user == null) return [];

    final allModules = [
      {
        'id': 'staffMenu',
        'name': 'منيو الموظفين',
        'icon': 'restaurant_menu',
        'route': '/staff-menu',
        'color': 0xFF6366F1,
      },
      {
        'id': 'cashier',
        'name': 'الكاشير',
        'icon': 'point_of_sale',
        'route': '/cashier',
        'color': 0xFF16A34A,
      },
      {
        'id': 'tables',
        'name': 'الطاولات',
        'icon': 'table_restaurant',
        'route': '/tables',
        'color': 0xFFF59E0B,
      },
      {
        'id': 'roomOrders',
        'name': 'طلبات الغرف',
        'icon': 'meeting_room',
        'route': '/room-orders',
        'color': 0xFF8B5CF6,
      },
    ];

    return allModules
        .where((module) => hasPermission(module['id'] as String))
        .toList();
  }

  /// Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}



