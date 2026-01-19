import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends StatefulWidget {
  final Function(Map<String, dynamic>) onLoginSuccess;

  const LoginScreen({super.key, required this.onLoginSuccess});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;

  // Firebase REST API URL
  static const String _databaseUrl = 'https://sham-coffee-default-rtdb.firebaseio.com';
  static const String _restaurantId = 'sham-coffee-1';

  Future<void> _login() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text;

    if (username.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'الرجاء إدخال اسم المستخدم وكلمة المرور';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // First, try to authenticate as worker
      final workersResponse = await http.get(
        Uri.parse('$_databaseUrl/restaurant-system/workers/$_restaurantId.json'),
      );

      if (workersResponse.statusCode == 200) {
        final workersData = json.decode(workersResponse.body) as Map<String, dynamic>?;
        
        if (workersData != null) {
          for (final entry in workersData.entries) {
            final worker = entry.value as Map<String, dynamic>;
            if (worker['username'] == username && worker['password'] == password) {
              // Check if account is active (handle both 'active' and 'isActive' fields, and string/bool values)
              final isActive = worker['active'] == true || 
                               worker['active'] == 'true' ||
                               worker['isActive'] == true ||
                               worker['isActive'] == 'true';
              
              if (!isActive) {
                setState(() {
                  _errorMessage = 'هذا الحساب غير مفعل';
                  _isLoading = false;
                });
                return;
              }

              // Successfully logged in as worker
              final userData = {
                'id': entry.key,
                'name': worker['fullName'] ?? worker['name'] ?? username,
                'username': username,
                'role': worker['role'] ?? 'worker',
                'position': worker['position'] ?? 'موظف',
                'permissions': worker['detailedPermissions'],
                'legacyPermissions': worker['permissions'],
              };

              await _saveLoginData(userData);
              widget.onLoginSuccess(userData);
              return;
            }
          }
        }
      }

      // Try to authenticate as admin/restaurant
      final restaurantResponse = await http.get(
        Uri.parse('$_databaseUrl/restaurant-system/restaurants/$_restaurantId.json'),
      );

      if (restaurantResponse.statusCode == 200) {
        final restaurant = json.decode(restaurantResponse.body) as Map<String, dynamic>?;
        
        if (restaurant != null &&
            restaurant['username'] == username &&
            restaurant['password'] == password) {
          // Successfully logged in as admin
          final userData = {
            'id': _restaurantId,
            'name': restaurant['name'] ?? 'مدير',
            'username': username,
            'role': 'admin',
            'position': 'مدير النظام',
            'permissions': null, // Admin has full permissions
          };

          await _saveLoginData(userData);
          widget.onLoginSuccess(userData);
          return;
        }
      }

      // No matching user found
      setState(() {
        _errorMessage = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت';
        _isLoading = false;
      });
    }
  }

  Future<void> _saveLoginData(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isLoggedIn', true);
    await prefs.setString('userId', userData['id']);
    await prefs.setString('userName', userData['name']);
    await prefs.setString('userRole', userData['role']);
    await prefs.setString('userPosition', userData['position'] ?? '');
    if (userData['permissions'] != null) {
      await prefs.setString('permissions', json.encode(userData['permissions']));
    }
    if (userData['legacyPermissions'] != null) {
      await prefs.setString('legacyPermissions', userData['legacyPermissions']);
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF6366f1),
              Color(0xFF8b5cf6),
              Color(0xFFa855f7),
            ],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 420),
              padding: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 40,
                    offset: const Offset(0, 20),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF6366f1), Color(0xFF8b5cf6)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6366f1).withOpacity(0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        '☕',
                        style: TextStyle(fontSize: 40),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Title
                  const Text(
                    'قهوة الشام',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0f172a),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'نظام إدارة الموظفين',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF64748b),
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Error Message
                  if (_errorMessage != null)
                    Container(
                      padding: const EdgeInsets.all(16),
                      margin: const EdgeInsets.only(bottom: 24),
                      decoration: BoxDecoration(
                        color: const Color(0xFFfef2f2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFfecaca)),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.error_outline,
                            color: Color(0xFFdc2626),
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(
                                color: Color(0xFFdc2626),
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Username Field
                  TextField(
                    controller: _usernameController,
                    textDirection: TextDirection.ltr,
                    textAlign: TextAlign.right,
                    decoration: InputDecoration(
                      labelText: 'اسم المستخدم',
                      hintText: 'أدخل اسم المستخدم',
                      prefixIcon: const Icon(Icons.person_outline),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFe2e8f0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF6366f1), width: 2),
                      ),
                      filled: true,
                      fillColor: const Color(0xFFf8fafc),
                    ),
                    onSubmitted: (_) => _login(),
                  ),
                  const SizedBox(height: 20),

                  // Password Field
                  TextField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    textDirection: TextDirection.ltr,
                    textAlign: TextAlign.right,
                    decoration: InputDecoration(
                      labelText: 'كلمة المرور',
                      hintText: 'أدخل كلمة المرور',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off : Icons.visibility,
                          color: const Color(0xFF64748b),
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFe2e8f0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF6366f1), width: 2),
                      ),
                      filled: true,
                      fillColor: const Color(0xFFf8fafc),
                    ),
                    onSubmitted: (_) => _login(),
                  ),
                  const SizedBox(height: 32),

                  // Login Button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _login,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366f1),
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: const Color(0xFF6366f1).withOpacity(0.6),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2.5,
                              ),
                            )
                          : const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.login, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  'تسجيل الدخول',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Footer
                  Text(
                    'الإصدار 1.0.0',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade400,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
