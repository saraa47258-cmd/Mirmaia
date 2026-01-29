import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  
  Map<String, dynamic>? _currentWorker;
  bool _isLoading = true;
  bool _isAuthenticated = false;

  Map<String, dynamic>? get currentWorker => _currentWorker;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final worker = await _authService.getSavedWorker();
      if (worker != null) {
        _currentWorker = worker;
        _isAuthenticated = true;
      }
    } catch (e) {
      print('Auth check error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>?> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final result = await _authService.login(username, password);
      
      if (result?['success'] == true && result?['worker'] != null) {
        _currentWorker = result!['worker'];
        _isAuthenticated = true;
        _isLoading = false;
        notifyListeners();
        return {'success': true};
      } else {
        _isLoading = false;
        notifyListeners();
        return result;
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return {'error': 'حدث خطأ أثناء تسجيل الدخول'};
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _currentWorker = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  bool hasPermission(String permission) {
    return _authService.hasPermission(_currentWorker, permission);
  }

  bool canAccessModule(String module) {
    return hasPermission(module);
  }

  bool canPerformAction(String action) {
    return _authService.hasPermission(_currentWorker, action);
  }

  bool shouldHideFinancialData() {
    return _authService.shouldHideFinancialData(_currentWorker);
  }
}
