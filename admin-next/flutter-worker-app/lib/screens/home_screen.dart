import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/app_theme.dart';
import 'staff_menu_screen.dart';
import 'orders_screen.dart';
import 'tables_screen.dart';
import 'rooms_screen.dart';
import 'cashier_screen.dart';
import 'inventory_screen.dart';
import 'reports_screen.dart';
import 'products_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final worker = authProvider.currentWorker;

    // Get available modules based on permissions
    final availableModules = _getAvailableModules(authProvider);

    if (authProvider.isLoading) {
      return Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF0F172A),
                Color(0xFF1E1B4B),
                Color(0xFF0F172A),
              ],
            ),
          ),
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
                SizedBox(height: 16),
                Text(
                  'جاري التحميل...',
                  style: TextStyle(color: Colors.white70, fontSize: 15),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (availableModules.isEmpty) {
      return _buildNoPermissionsScreen(authProvider, worker);
    }

    // Adjust selected index if needed
    if (_selectedIndex >= availableModules.length) {
      _selectedIndex = 0;
    }

    // If we have modules, show the module selection screen first
    return _buildModuleSelectionScreen(authProvider, worker, availableModules);
  }

  Widget _buildNoPermissionsScreen(AuthProvider authProvider, Map<String, dynamic>? worker) {
    return Scaffold(
      body: Container(
        color: AppColors.surface,
        padding: const EdgeInsets.all(20),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  '🔒',
                  style: TextStyle(fontSize: 64),
                ),
                const SizedBox(height: 16),
                const Text(
                  'ليس لديك صلاحيات',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'ليس لديك صلاحيات للوصول إلى أي قسم',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    await authProvider.logout();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    elevation: 4,
                  ),
                  child: const Text(
                    'تسجيل الخروج',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModuleSelectionScreen(
    AuthProvider authProvider,
    Map<String, dynamic>? worker,
    List<Map<String, dynamic>> availableModules,
  ) {
    return Scaffold(
      body: Column(
        children: [
          // Gradient Header
          Container(
            decoration: const BoxDecoration(
              gradient: AppGradients.primaryGradient,
              boxShadow: [
                BoxShadow(
                  color: Color(0x4D6366F1),
                  blurRadius: 20,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 20,
              bottom: 24,
              left: 20,
              right: 20,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        worker?['name'] ?? worker?['fullName'] ?? 'موظف',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        worker?['position'] ?? 'موظف',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.85),
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('تأكيد'),
                        content: const Text('هل تريد تسجيل الخروج؟'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context, false),
                            child: const Text('إلغاء'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(context, true),
                            child: const Text('تسجيل الخروج'),
                          ),
                        ],
                      ),
                    );
                    if (confirm == true && mounted) {
                      await authProvider.logout();
                    }
                  },
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.white.withOpacity(0.2),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                      side: BorderSide(color: Colors.white.withOpacity(0.4)),
                    ),
                  ),
                  child: const Text(
                    'تسجيل الخروج',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          // Modules Grid
          Expanded(
            child: Container(
              color: AppColors.surface,
              padding: const EdgeInsets.all(16),
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.9,
                ),
                itemCount: availableModules.length,
                itemBuilder: (context, index) {
                  final module = availableModules[index];
                  return _buildModuleCard(module, () => _navigateToModule(module));
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModuleCard(Map<String, dynamic> module, VoidCallback onTap) {
    final icon = module['icon'] as String;
    final label = module['label'] as String;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          decoration: BoxDecoration(
            color: AppColors.surfaceCard,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            boxShadow: AppShadows.card,
            border: Border.all(color: Colors.transparent, width: 2),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                icon,
                style: const TextStyle(fontSize: 36),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToModule(Map<String, dynamic> module) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _ModuleScreenWrapper(
          module: module,
          allModules: _getAvailableModules(
            Provider.of<AuthProvider>(context, listen: false),
          ),
        ),
      ),
    );
  }

  List<Map<String, dynamic>> _getAvailableModules(AuthProvider authProvider) {
    final modules = <Map<String, dynamic>>[];

    // منيو الموظفين
    if (authProvider.canAccessModule('staff-menu')) {
      modules.add({
        'id': 'staff-menu',
        'label': 'المنيو',
        'icon': '🍽️',
        'color': const Color(0xFF6366F1),
        'screen': const StaffMenuScreen(),
      });
    }

    // الطلبات
    if (authProvider.canAccessModule('orders')) {
      modules.add({
        'id': 'orders',
        'label': 'الطلبات',
        'icon': '📋',
        'color': const Color(0xFF10B981),
        'screen': const OrdersScreen(),
      });
    }

    // الطاولات
    if (authProvider.canAccessModule('tables')) {
      modules.add({
        'id': 'tables',
        'label': 'الطاولات',
        'icon': '🪑',
        'color': const Color(0xFFF59E0B),
        'screen': const TablesScreen(),
      });
    }

    // الغرف
    if (authProvider.canAccessModule('rooms')) {
      modules.add({
        'id': 'rooms',
        'label': 'الغرف',
        'icon': '🚪',
        'color': const Color(0xFF8B5CF6),
        'screen': const RoomsScreen(),
      });
    }

    // الكاشير
    if (authProvider.canAccessModule('cashier')) {
      modules.add({
        'id': 'cashier',
        'label': 'الكاشير',
        'icon': '💰',
        'color': const Color(0xFFEF4444),
        'screen': const CashierScreen(),
      });
    }

    // المخزون
    if (authProvider.canAccessModule('inventory')) {
      modules.add({
        'id': 'inventory',
        'label': 'المخزون',
        'icon': '📦',
        'color': const Color(0xFF06B6D4),
        'screen': const InventoryScreen(),
      });
    }

    // التقارير
    if (authProvider.canAccessModule('reports')) {
      modules.add({
        'id': 'reports',
        'label': 'التقارير',
        'icon': '📊',
        'color': const Color(0xFFEC4899),
        'screen': const ReportsScreen(),
      });
    }

    // المنتجات
    if (authProvider.canAccessModule('products')) {
      modules.add({
        'id': 'products',
        'label': 'المنتجات',
        'icon': '🛍️',
        'color': const Color(0xFF14B8A6),
        'screen': const ProductsScreen(),
      });
    }

    return modules;
  }
}

// Wrapper widget for module screens with bottom navigation
class _ModuleScreenWrapper extends StatefulWidget {
  final Map<String, dynamic> module;
  final List<Map<String, dynamic>> allModules;

  const _ModuleScreenWrapper({
    required this.module,
    required this.allModules,
  });

  @override
  State<_ModuleScreenWrapper> createState() => _ModuleScreenWrapperState();
}

class _ModuleScreenWrapperState extends State<_ModuleScreenWrapper> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.allModules.indexWhere(
      (m) => m['id'] == widget.module['id'],
    );
    if (_currentIndex == -1) _currentIndex = 0;
  }

  void _onTabTapped(int index) {
    if (index == _currentIndex) return;
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final currentModule = widget.allModules[_currentIndex];
    final screen = currentModule['screen'] as Widget;

    return Scaffold(
      appBar: AppBar(
        title: Text(currentModule['label'] as String),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: screen,
      bottomNavigationBar: widget.allModules.length > 1
          ? Container(
              decoration: BoxDecoration(
                color: AppColors.surfaceCard,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 12,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                child: Container(
                  height: 72,
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: List.generate(
                      widget.allModules.length > 5 ? 5 : widget.allModules.length,
                      (index) {
                        final module = widget.allModules[index];
                        final isActive = index == _currentIndex;
                        return Expanded(
                          child: InkWell(
                            onTap: () => _onTabTapped(index),
                            child: Container(
                              decoration: BoxDecoration(
                                color: isActive
                                    ? AppColors.primary.withOpacity(0.08)
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(AppRadius.sm),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    module['icon'] as String,
                                    style: TextStyle(
                                      fontSize: 22,
                                      color: isActive
                                          ? AppColors.primary
                                          : AppColors.textSecondary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    module['label'] as String,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: isActive
                                          ? AppColors.primary
                                          : AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),
            )
          : null,
    );
  }
}
