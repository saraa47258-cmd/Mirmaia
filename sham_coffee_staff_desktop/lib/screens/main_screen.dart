import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_windows/webview_windows.dart';

class MainScreen extends StatefulWidget {
  final Map<String, dynamic> userData;
  final VoidCallback onLogout;

  const MainScreen({
    super.key,
    required this.userData,
    required this.onLogout,
  });

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  final _webviewController = WebviewController();
  bool _isWebViewReady = false;
  String _currentModule = 'staff-menu';
  bool _isLoading = true;

  // Base URL for the web application
  static const String _baseUrl = 'https://sham-coffee.web.app';

  // Module definitions
  final List<ModuleInfo> _allModules = [
    ModuleInfo(
      id: 'staff-menu',
      name: 'قائمة الطلبات',
      icon: Icons.restaurant_menu,
      path: '/admin/staff-menu',
      permissionKey: 'staffMenu',
    ),
    ModuleInfo(
      id: 'orders',
      name: 'الطلبات',
      icon: Icons.receipt_long,
      path: '/admin/orders',
      permissionKey: 'orders',
    ),
    ModuleInfo(
      id: 'tables',
      name: 'الطاولات',
      icon: Icons.table_restaurant,
      path: '/admin/tables',
      permissionKey: 'tables',
    ),
    ModuleInfo(
      id: 'rooms',
      name: 'الغرف',
      icon: Icons.meeting_room,
      path: '/admin/rooms',
      permissionKey: 'rooms',
    ),
    ModuleInfo(
      id: 'cashier',
      name: 'الكاشير',
      icon: Icons.point_of_sale,
      path: '/admin/cashier',
      permissionKey: 'cashier',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  List<ModuleInfo> get _allowedModules {
    final role = widget.userData['role'];
    
    // Admin has access to all modules
    if (role == 'admin') {
      return _allModules;
    }

    // Check for detailed permissions
    final permissions = widget.userData['permissions'];
    if (permissions != null) {
      Map<String, dynamic> permissionsMap;
      if (permissions is String) {
        permissionsMap = json.decode(permissions);
      } else {
        permissionsMap = permissions as Map<String, dynamic>;
      }

      final modules = permissionsMap['modules'] as Map<String, dynamic>?;
      if (modules != null) {
        return _allModules.where((m) => modules[m.permissionKey] == true).toList();
      }
    }

    // Check for legacy permissions
    final legacyPermissions = widget.userData['legacyPermissions'];
    if (legacyPermissions == 'full') {
      return _allModules;
    }

    // Default: only staff-menu
    return _allModules.where((m) => m.id == 'staff-menu').toList();
  }

  Future<void> _initWebView() async {
    try {
      await _webviewController.initialize();
      
      _webviewController.loadingState.listen((state) {
        if (mounted) {
          setState(() {
            _isLoading = state == LoadingState.loading;
          });
        }
      });

      // Set user agent
      await _webviewController.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ShamCoffeeStaff/1.0',
      );

      // First load a blank page to inject auth data
      await _webviewController.loadUrl('about:blank');
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Inject authentication data into sessionStorage and localStorage
      await _injectAuthData();
      
      // Wait for injection to complete
      await Future.delayed(const Duration(milliseconds: 300));

      // Navigate to the first allowed module
      final modules = _allowedModules;
      if (modules.isNotEmpty) {
        await _navigateToModule(modules.first);
      }

      if (mounted) {
        setState(() {
          _isWebViewReady = true;
        });
      }
    } catch (e) {
      debugPrint('WebView initialization error: $e');
    }
  }

  Future<void> _injectAuthData() async {
    // Prepare user data for web app
    final userData = {
      'id': widget.userData['id'],
      'username': widget.userData['username'],
      'name': widget.userData['name'],
      'role': widget.userData['role'] == 'admin' ? 'admin' : 'staff',
      'restaurantId': 'sham-coffee-1',
      'position': widget.userData['position'],
      'permissions': widget.userData['legacyPermissions'],
    };
    
    final userDataJson = json.encode(userData);
    final userRole = widget.userData['role'] == 'admin' ? 'admin' : 'staff';
    final sessionId = 'flutter_session_${DateTime.now().millisecondsSinceEpoch}';
    
    // JavaScript to inject auth data into sessionStorage (for Next.js app)
    final script = '''
      (function() {
        try {
          // Set session storage (used by getCurrentUser)
          sessionStorage.setItem('auth_user_data', '$userDataJson');
          sessionStorage.setItem('auth_user_type', '$userRole');
          sessionStorage.setItem('auth_session_id', '$sessionId');
          
          // Also set localStorage for persistence
          localStorage.setItem('auth_user_data', '$userDataJson');
          localStorage.setItem('auth_user_type', '$userRole');
          localStorage.setItem('auth_session_id', '$sessionId');
          
          // Set cookie for middleware
          document.cookie = 'auth_session=$sessionId; path=/; SameSite=Strict; max-age=86400';
          
          console.log('Auth data injected successfully');
          return true;
        } catch(e) {
          console.error('Failed to inject auth data:', e);
          return false;
        }
      })();
    ''';
    
    try {
      await _webviewController.executeScript(script);
      debugPrint('Auth data injected into WebView');
    } catch (e) {
      debugPrint('Failed to inject auth data: $e');
    }
  }

  Future<void> _navigateToModule(ModuleInfo module) async {
    setState(() {
      _currentModule = module.id;
      _isLoading = true;
    });

    // Re-inject auth data before navigation to ensure it persists
    await _injectAuthForUrl('$_baseUrl${module.path}');
  }
  
  Future<void> _injectAuthForUrl(String url) async {
    // First navigate to the URL
    await _webviewController.loadUrl(url);
    
    // Wait for page to start loading
    await Future.delayed(const Duration(milliseconds: 100));
    
    // Inject auth data again to ensure it's available
    final userData = {
      'id': widget.userData['id'],
      'username': widget.userData['username'],
      'name': widget.userData['name'],
      'role': widget.userData['role'] == 'admin' ? 'admin' : 'staff',
      'restaurantId': 'sham-coffee-1',
      'position': widget.userData['position'],
      'permissions': widget.userData['legacyPermissions'],
    };
    
    final userDataJson = json.encode(userData);
    final userRole = widget.userData['role'] == 'admin' ? 'admin' : 'staff';
    final sessionId = 'flutter_session_${DateTime.now().millisecondsSinceEpoch}';
    
    final script = '''
      (function() {
        sessionStorage.setItem('auth_user_data', '$userDataJson');
        sessionStorage.setItem('auth_user_type', '$userRole');
        sessionStorage.setItem('auth_session_id', '$sessionId');
        localStorage.setItem('auth_user_data', '$userDataJson');
        localStorage.setItem('auth_user_type', '$userRole');
        localStorage.setItem('auth_session_id', '$sessionId');
        document.cookie = 'auth_session=$sessionId; path=/; SameSite=Strict; max-age=86400';
      })();
    ''';
    
    try {
      await _webviewController.executeScript(script);
    } catch (e) {
      debugPrint('Failed to re-inject auth: $e');
    }
  }

  Future<void> _refresh() async {
    await _webviewController.reload();
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.logout, color: Color(0xFFef4444)),
            SizedBox(width: 12),
            Text('تسجيل الخروج'),
          ],
        ),
        content: const Text('هل أنت متأكد من تسجيل الخروج؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              widget.onLogout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFef4444),
              foregroundColor: Colors.white,
            ),
            child: const Text('تسجيل الخروج'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _webviewController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final allowedModules = _allowedModules;

    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 260,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF1e1b4b), Color(0xFF312e81)],
              ),
            ),
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        color: Colors.white.withOpacity(0.1),
                      ),
                    ),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF6366f1), Color(0xFF8b5cf6)],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF6366f1).withOpacity(0.4),
                              blurRadius: 16,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Text('☕', style: TextStyle(fontSize: 32)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'قهوة الشام',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'نظام إدارة الموظفين',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.6),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),

                // User Info
                Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366f1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            widget.userData['name']?.toString().characters.first ?? 'م',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.userData['name'] ?? 'مستخدم',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              widget.userData['position'] ?? widget.userData['role'] ?? '',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.6),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Navigation
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(right: 12, bottom: 8),
                        child: Text(
                          'الأقسام',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.4),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      ...allowedModules.map((module) => _buildNavItem(module)),
                    ],
                  ),
                ),

                // Footer Actions
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: Colors.white.withOpacity(0.1),
                      ),
                    ),
                  ),
                  child: Column(
                    children: [
                      // Refresh Button
                      _buildActionButton(
                        icon: Icons.refresh,
                        label: 'تحديث',
                        onTap: _refresh,
                      ),
                      const SizedBox(height: 8),
                      // Logout Button
                      _buildActionButton(
                        icon: Icons.logout,
                        label: 'تسجيل الخروج',
                        onTap: _showLogoutDialog,
                        isDestructive: true,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Main Content
          Expanded(
            child: Column(
              children: [
                // Top Bar
                Container(
                  height: 56,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Module Title
                      Text(
                        allowedModules.firstWhere(
                          (m) => m.id == _currentModule,
                          orElse: () => allowedModules.first,
                        ).name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0f172a),
                        ),
                      ),
                      const Spacer(),
                      // Loading Indicator
                      if (_isLoading)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFfef3c7),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Color(0xFFd97706),
                                ),
                              ),
                              SizedBox(width: 8),
                              Text(
                                'جاري التحميل...',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFd97706),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),

                // WebView
                Expanded(
                  child: _isWebViewReady
                      ? Webview(_webviewController)
                      : const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircularProgressIndicator(
                                color: Color(0xFF6366f1),
                              ),
                              SizedBox(height: 16),
                              Text(
                                'جاري تحميل النظام...',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Color(0xFF64748b),
                                ),
                              ),
                            ],
                          ),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(ModuleInfo module) {
    final isActive = _currentModule == module.id;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _navigateToModule(module),
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isActive
                  ? const Color(0xFF6366f1)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Icon(
                  module.icon,
                  size: 20,
                  color: isActive
                      ? Colors.white
                      : Colors.white.withOpacity(0.6),
                ),
                const SizedBox(width: 12),
                Text(
                  module.name,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                    color: isActive
                        ? Colors.white
                        : Colors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: isDestructive
                ? const Color(0xFFef4444).withOpacity(0.1)
                : Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isDestructive
                  ? const Color(0xFFef4444).withOpacity(0.3)
                  : Colors.white.withOpacity(0.1),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: isDestructive
                    ? const Color(0xFFef4444)
                    : Colors.white.withOpacity(0.8),
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDestructive
                      ? const Color(0xFFef4444)
                      : Colors.white.withOpacity(0.8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ModuleInfo {
  final String id;
  final String name;
  final IconData icon;
  final String path;
  final String permissionKey;

  const ModuleInfo({
    required this.id,
    required this.name,
    required this.icon,
    required this.path,
    required this.permissionKey,
  });
}
