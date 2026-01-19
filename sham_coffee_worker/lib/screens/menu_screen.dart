import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:async';
import 'login_screen.dart';
import 'cart_screen.dart';
import 'webview_screen.dart';
import '../services/firebase_rest_service.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  String _workerName = '';
  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _products = [];
  List<Map<String, dynamic>> _filteredProducts = [];
  String _selectedCategory = 'all';
  String _searchQuery = '';
  bool _isLoading = true;
  
  // أنواع الشيشة العالمية - تُطبق على جميع منتجات الشيشة
  Map<String, dynamic> _globalShishaTypes = {};
  
  // Cart
  final List<Map<String, dynamic>> _cart = [];
  int _cartItemsCount = 0;
  double _cartTotal = 0;

  // ===== نظام الحساب الدقيق =====
  int _toInt(dynamic value) {
    if (value == null) return 0;
    final num = (value is String) ? double.tryParse(value) ?? 0.0 : value.toDouble();
    return (num * 1000).round();
  }

  double _toDecimal(int intValue) => intValue / 1000;
  
  String _formatPrice(double value) => value.toStringAsFixed(3);

  double _calculateCartTotal() {
    int totalInt = 0;
    for (final item in _cart) {
      final priceInt = _toInt(item['price']);
      final qty = (item['quantity'] as int?) ?? 1;
      totalInt += priceInt * qty;
    }
    return _toDecimal(totalInt);
  }

  @override
  void initState() {
    super.initState();
    _loadWorkerData();
    _setupRealtimeListeners(); // الاستماع للتغييرات في الوقت الفعلي
  }

  Timer? _pollingTimer;

  @override
  void dispose() {
    // إيقاف polling عند إغلاق الشاشة
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadWorkerData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _workerName = prefs.getString('worker_name') ?? 'عامل';
    });
  }

  String? _errorMessage;

  // تحميل البيانات باستخدام REST API مع polling
  void _setupRealtimeListeners() {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    debugPrint('🔄 بدء تحميل البيانات...');
    
    // تحميل البيانات الأولية
    _loadAllData();
    
    // إعداد polling للتحقق من التغييرات كل 5 ثواني
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      _loadAllData();
    });
  }
  
  // تحميل جميع البيانات من Firebase
  Future<void> _loadAllData() async {
    try {
      // تحميل الأقسام
      final categoriesData = await FirebaseRestService.get('restaurant-system/restaurants/sham-coffee-1/categories');
      if (categoriesData != null) {
        setState(() {
          _categories = categoriesData.entries.map((e) {
            final cat = Map<String, dynamic>.from(e.value as Map);
            return {'id': e.key, ...cat};
          }).toList();
        });
        debugPrint('✅ تم تحديث ${_categories.length} قسم');
      }
      
      // تحميل أنواع الشيشة
      final shishaTypesData = await FirebaseRestService.get('restaurant-system/restaurants/sham-coffee-1/shisha-types');
      if (shishaTypesData != null) {
        setState(() {
          _globalShishaTypes = Map<String, dynamic>.from(shishaTypesData);
        });
        debugPrint('✅ تم تحديث ${_globalShishaTypes.length} نوع شيشة');
        _applyShishaTypesToProducts();
      }
      
      // تحميل المنتجات
      final productsData = await FirebaseRestService.get('restaurant-system/restaurants/sham-coffee-1/menu');
      if (productsData != null) {
        setState(() {
          _products = productsData.entries.map((e) {
            final prod = Map<String, dynamic>.from(e.value as Map);
            return {'id': e.key, ...prod};
          }).toList();
          _isLoading = false;
          _errorMessage = null;
        });
        debugPrint('✅ تم تحديث ${_products.length} منتج');
        _applyShishaTypesToProducts();
      } else {
        setState(() {
          _isLoading = false;
          _errorMessage = 'لا توجد منتجات في قاعدة البيانات';
        });
      }
    } catch (error) {
      debugPrint('❌ خطأ في تحميل البيانات: $error');
      setState(() {
        _isLoading = false;
        _errorMessage = 'خطأ في الاتصال: $error';
      });
    }
  }

  // إعادة تحميل يدوي (للسحب للتحديث)
  Future<void> _loadData() async {
    // البيانات تتحدث تلقائياً، لكن نعيد تحميل الصفحة للتأكد
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() => _isLoading = false);
  }

  void _filterProducts() {
    setState(() {
      _filteredProducts = _products.where((product) {
        final matchesCategory = _selectedCategory == 'all' || 
            product['category'] == _selectedCategory;
        final matchesSearch = _searchQuery.isEmpty || 
            (product['name'] ?? '').toString().toLowerCase().contains(_searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }).toList();
    });
  }

  // تطبيق أنواع الشيشة العالمية على المنتجات
  void _applyShishaTypesToProducts() {
    debugPrint('🔄 تطبيق أنواع الشيشة على المنتجات...');
    debugPrint('🔄 عدد أنواع الشيشة: ${_globalShishaTypes.length}');
    debugPrint('🔄 عدد المنتجات: ${_products.length}');
    
    if (_globalShishaTypes.isEmpty) {
      debugPrint('⚠️ أنواع الشيشة فارغة، لن يتم التطبيق');
      return;
    }
    
    int shishaCount = 0;
    for (int i = 0; i < _products.length; i++) {
      final product = _products[i];
      // التحقق إذا كان المنتج شيشة
      if (_isShishaProduct(product)) {
        shishaCount++;
        debugPrint('🌿 منتج شيشة: ${product['name']} (category: ${product['category']})');
        _products[i] = {
          ...product,
          'shishaTypes': _globalShishaTypes,
          'isShisha': true,
        };
      }
    }
    debugPrint('✅ تم تطبيق أنواع الشيشة على $shishaCount منتج');
    _filterProducts();
  }

  // التحقق إذا كان المنتج شيشة
  bool _isShishaProduct(Map<String, dynamic> product) {
    // التحقق من علامة isShisha
    if (product['isShisha'] == true) return true;
    
    // التحقق من القسم - البحث عن قسم الشيشة
    final category = product['category']?.toString() ?? '';
    final categoryLower = category.toLowerCase();
    
    // التحقق من ID القسم (shisha) أو اسم القسم
    if (category == 'shisha' || 
        categoryLower.contains('shisha') || 
        categoryLower.contains('شيشة') || 
        categoryLower.contains('شيش')) {
      return true;
    }
    
    // البحث في الأقسام المحملة
    final shishaCat = _categories.firstWhere(
      (c) => c['id'] == 'shisha' || 
             (c['name']?.toString().contains('شيشة') ?? false) ||
             (c['name']?.toString().contains('شيش') ?? false),
      orElse: () => {},
    );
    if (shishaCat.isNotEmpty && product['category'] == shishaCat['id']) {
      return true;
    }
    
    // التحقق من الاسم
    final name = product['name']?.toString().toLowerCase() ?? '';
    if (name.contains('شيشة') || name.contains('شيش') || name.contains('shisha')) {
      return true;
    }
    
    return false;
  }

  // الحصول على أنواع الشيشة للمنتج
  Map<dynamic, dynamic>? _getShishaTypesForProduct(Map<String, dynamic> product) {
    // إذا كان المنتج لديه أنواع شيشة خاصة
    if (product['shishaTypes'] != null && (product['shishaTypes'] as Map).isNotEmpty) {
      return product['shishaTypes'] as Map<dynamic, dynamic>;
    }
    
    // إذا كان المنتج شيشة واستخدام الأنواع العالمية
    if (_isShishaProduct(product) && _globalShishaTypes.isNotEmpty) {
      return _globalShishaTypes;
    }
    
    return null;
  }

  void _addToCart(Map<String, dynamic> product, {String? selectedSize, double? sizePrice}) {
    final price = sizePrice ?? (product['price'] is int 
        ? (product['price'] as int).toDouble() 
        : (product['price'] ?? 0.0));
    
    final cartItem = {
      'id': selectedSize != null ? '${product['id']}_$selectedSize' : product['id'],
      'productId': product['id'],
      'name': selectedSize != null ? '${product['name']} - $selectedSize' : product['name'],
      'price': price,
      'quantity': 1,
      'emoji': product['emoji'],
      'imageUrl': product['imageUrl'],
    };

    final existingIndex = _cart.indexWhere((item) => item['id'] == cartItem['id']);
    
    setState(() {
      if (existingIndex >= 0) {
        _cart[existingIndex]['quantity']++;
      } else {
        _cart.add(cartItem);
      }
      _updateCartTotals();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: 8),
            Text('تمت إضافة ${product['name']} للسلة'),
          ],
        ),
        backgroundColor: const Color(0xFF4ade80),
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _updateCartTotals() {
    _cartItemsCount = _cart.fold(0, (sum, item) => sum + (item['quantity'] as int));
    // استخدام نظام الحساب الدقيق
    _cartTotal = _calculateCartTotal();
  }

  void _showProductDetails(Map<String, dynamic> product) {
    final sizes = product['sizes'] as Map<dynamic, dynamic>?;
    // استخدام الدالة المحسنة للحصول على أنواع الشيشة
    final shishaTypes = _getShishaTypesForProduct(product);
    
    if (sizes != null || shishaTypes != null) {
      showModalBottomSheet(
        context: context,
        backgroundColor: const Color(0xFF16161f),
        isScrollControlled: true, // للسماح بالتمرير إذا كانت القائمة طويلة
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        builder: (context) => _buildProductOptionsSheet(product, sizes, shishaTypes),
      );
    } else {
      _addToCart(product);
    }
  }

  Widget _buildProductOptionsSheet(
    Map<String, dynamic> product,
    Map<dynamic, dynamic>? sizes,
    Map<dynamic, dynamic>? shishaTypes,
  ) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.7,
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[600],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                if (_isShishaProduct(product))
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    margin: const EdgeInsets.only(left: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF22c55e).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF22c55e).withValues(alpha: 0.5)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('🌿', style: TextStyle(fontSize: 12)),
                        SizedBox(width: 4),
                        Text(
                          'شيشة',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF22c55e),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                Expanded(
                  child: Text(
                    product['name'] ?? '',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            Flexible(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (sizes != null) ...[
                      const Text(
                        'اختر الحجم:',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFF8a8a9a),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: sizes.entries.map((entry) {
                          final sizeKey = entry.key.toString();
                          final value = entry.value;
                          
                          // استخراج الاسم والسعر
                          String sizeName = sizeKey;
                          double sizePrice = 0.0;
                          
                          if (value is Map) {
                            sizeName = value['name']?.toString() ?? sizeKey;
                            sizePrice = _extractPrice(value);
                          } else {
                            sizePrice = _extractPrice(value);
                          }
                          
                          return _buildOptionButton(
                            sizeName,
                            '${sizePrice.toStringAsFixed(3)} ر.ع',
                            () {
                              Navigator.pop(context);
                              _addToCart(product, selectedSize: sizeName, sizePrice: sizePrice);
                            },
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),
                    ],
                    
                    if (shishaTypes != null) ...[
                      Row(
                        children: [
                          const Text('🌿 ', style: TextStyle(fontSize: 16)),
                          const Text(
                            'اختر نوع الشيشة:',
                            style: TextStyle(
                              fontSize: 16,
                              color: Color(0xFF22c55e),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${shishaTypes.length} نوع',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF8B5CF6),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: shishaTypes.entries.map((entry) {
                          final typeKey = entry.key.toString();
                          final value = entry.value;
                          
                          // استخراج الاسم والسعر
                          String typeName = typeKey;
                          double typePrice = 0.0;
                          
                          if (value is Map) {
                            typeName = value['name']?.toString() ?? typeKey;
                            typePrice = _extractPrice(value);
                          } else {
                            typePrice = _extractPrice(value);
                          }
                          
                          return _buildOptionButton(
                            typeName,
                            '${typePrice.toStringAsFixed(3)} ر.ع',
                            () {
                              Navigator.pop(context);
                              _addToCart(product, selectedSize: typeName, sizePrice: typePrice);
                            },
                            isShisha: true,
                          );
                        }).toList(),
                      ),
                    ],
                    
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionButton(String label, String price, VoidCallback onTap, {bool isShisha = false}) {
    final color = isShisha ? const Color(0xFF22c55e) : const Color(0xFF8B5CF6);
    
    return Material(
      color: const Color(0xFF1e1e2a),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            border: Border.all(color: color.withValues(alpha: 0.3)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isShisha) const Text('🌿 ', style: TextStyle(fontSize: 14)),
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                price,
                style: TextStyle(
                  fontSize: 14,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF16161f),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('تسجيل الخروج', style: TextStyle(color: Colors.white)),
        content: const Text('هل تريد تسجيل الخروج؟', style: TextStyle(color: Color(0xFF8a8a9a))),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('خروج'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  void _openCart() async {
    final result = await Navigator.push<List<Map<String, dynamic>>>(
      context,
      MaterialPageRoute(
        builder: (context) => CartScreen(cart: List.from(_cart)),
      ),
    );
    
    if (result != null) {
      setState(() {
        _cart.clear();
        _cart.addAll(result);
        _updateCartTotals();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16161f),
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF8B5CF6), Color(0xFFA78BFA)],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(
                child: Text('☕', style: TextStyle(fontSize: 20)),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'قهوة الشام',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'مرحباً، $_workerName',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF8a8a9a),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: Colors.white),
            tooltip: 'فتح الموقع',
            onPressed: () async {
              // الحصول على معلومات العامل
              final prefs = await SharedPreferences.getInstance();
              final workerId = prefs.getString('worker_id') ?? '';
              final workerName = prefs.getString('worker_name') ?? '';
              final workerUsername = prefs.getString('worker_username') ?? '';
              
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => WebViewScreen(
                    url: 'https://sham-coffee.web.app',
                    title: 'موقع قهوة الشام',
                    workerId: workerId.isNotEmpty ? workerId : null,
                    workerName: workerName.isNotEmpty ? workerName : null,
                    workerUsername: workerUsername.isNotEmpty ? workerUsername : null,
                  ),
                ),
              );
            },
          ),
          IconButton(
            onPressed: _logout,
            icon: const Icon(Icons.logout, color: Colors.red),
            tooltip: 'تسجيل الخروج',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: Color(0xFF8B5CF6)),
                  SizedBox(height: 16),
                  Text('جاري تحميل المنيو...', style: TextStyle(color: Color(0xFF8a8a9a))),
                ],
              ),
            )
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 60, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 16)),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _loadData,
                        icon: const Icon(Icons.refresh),
                        label: const Text('إعادة المحاولة'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B5CF6)),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFF8B5CF6),
              child: CustomScrollView(
                slivers: [
                  // Search Bar
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: TextField(
                        onChanged: (value) {
                          _searchQuery = value;
                          _filterProducts();
                        },
                        decoration: InputDecoration(
                          hintText: 'ابحث عن منتج...',
                          hintStyle: const TextStyle(color: Color(0xFF8a8a9a)),
                          prefixIcon: const Icon(Icons.search, color: Color(0xFF8B5CF6)),
                          filled: true,
                          fillColor: const Color(0xFF16161f),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Categories
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 50,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        children: [
                          _buildCategoryChip('all', 'الكل', '🎯'),
                          ..._categories.map((cat) => _buildCategoryChip(
                            cat['id'],
                            cat['name'] ?? '',
                            cat['emoji'] ?? '📦',
                          )),
                        ],
                      ),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 16)),

                  // Products Grid
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _buildProductCard(_filteredProducts[index]),
                        childCount: _filteredProducts.length,
                      ),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ),
            ),
      
      // Floating Cart Button
      floatingActionButton: _cartItemsCount > 0
          ? Container(
              margin: const EdgeInsets.only(bottom: 16),
              child: FloatingActionButton.extended(
                onPressed: _openCart,
                backgroundColor: const Color(0xFF8B5CF6),
                icon: Badge(
                  label: Text('$_cartItemsCount'),
                  child: const Icon(Icons.shopping_bag),
                ),
                label: Text('${_formatPrice(_cartTotal)} ر.ع'),
              ),
            )
          : null,
    );
  }

  Widget _buildCategoryChip(String id, String name, String emoji) {
    final isSelected = _selectedCategory == id;
    return Padding(
      padding: const EdgeInsets.only(left: 8),
      child: FilterChip(
        selected: isSelected,
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji),
            const SizedBox(width: 6),
            Text(name),
          ],
        ),
        onSelected: (selected) {
          setState(() {
            _selectedCategory = id;
            _filterProducts();
          });
        },
        selectedColor: const Color(0xFF8B5CF6),
        backgroundColor: const Color(0xFF16161f),
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : const Color(0xFF8a8a9a),
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? const Color(0xFF8B5CF6) : const Color(0xFF2a2a3a),
          ),
        ),
      ),
    );
  }

  // دالة مساعدة لاستخراج السعر من القيمة
  double _extractPrice(dynamic value) {
    if (value == null) return 0.0;
    
    // إذا كانت القيمة Map تحتوي على price
    if (value is Map) {
      final priceValue = value['price'];
      if (priceValue is int) return priceValue.toDouble();
      if (priceValue is double) return priceValue;
      if (priceValue is num) return priceValue.toDouble();
      if (priceValue is String) return double.tryParse(priceValue) ?? 0.0;
      return 0.0;
    }
    
    // إذا كانت القيمة رقم مباشرة
    if (value is int) return value.toDouble();
    if (value is double) return value;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    
    return 0.0;
  }

  Widget _buildProductCard(Map<String, dynamic> product) {
    // حساب السعر - إذا كان هناك أحجام، نعرض أقل سعر
    double price = 0.0;
    String priceLabel = '';
    final bool isShisha = _isShishaProduct(product);
    
    final sizes = product['sizes'] as Map<dynamic, dynamic>?;
    // استخدام الدالة المحسنة للحصول على أنواع الشيشة
    final shishaTypes = _getShishaTypesForProduct(product);
    
    if (sizes != null && sizes.isNotEmpty) {
      // أقل سعر من الأحجام
      double minPrice = double.infinity;
      for (var value in sizes.values) {
        double p = _extractPrice(value);
        if (p < minPrice && p > 0) minPrice = p;
      }
      price = minPrice == double.infinity ? 0.0 : minPrice;
      priceLabel = 'من ${price.toStringAsFixed(3)} ر.ع';
    } else if (shishaTypes != null && shishaTypes.isNotEmpty) {
      // أقل سعر من أنواع الشيشة
      double minPrice = double.infinity;
      for (var value in shishaTypes.values) {
        double p = _extractPrice(value);
        if (p < minPrice && p > 0) minPrice = p;
      }
      price = minPrice == double.infinity ? 0.0 : minPrice;
      priceLabel = 'من ${price.toStringAsFixed(3)} ر.ع';
    } else {
      // سعر عادي
      price = _extractPrice(product['price']);
      priceLabel = '${price.toStringAsFixed(3)} ر.ع';
    }
    
    final imageUrl = product['imageUrl'];
    final emoji = product['emoji'] ?? (isShisha ? '🌿' : '📦');

    return Material(
      color: const Color(0xFF16161f),
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: () => _showProductDetails(product),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isShisha 
                  ? const Color(0xFF22c55e).withValues(alpha: 0.5) 
                  : const Color(0xFF2a2a3a),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                flex: 3,
                child: Stack(
                  children: [
                    Container(
                      margin: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1e1e2a),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: imageUrl != null && imageUrl.toString().isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: CachedNetworkImage(
                                  imageUrl: imageUrl,
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  height: double.infinity,
                                  placeholder: (context, url) => const Center(
                                    child: CircularProgressIndicator(
                                      color: Color(0xFF8B5CF6),
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  errorWidget: (context, url, error) => Text(
                                    emoji,
                                    style: const TextStyle(fontSize: 50),
                                  ),
                                ),
                              )
                            : Text(
                                emoji,
                                style: const TextStyle(fontSize: 50),
                              ),
                      ),
                    ),
                    // شارة الشيشة
                    if (isShisha)
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF22c55e),
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF22c55e).withValues(alpha: 0.4),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: const Text(
                            '🌿',
                            style: TextStyle(fontSize: 12),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Expanded(
                flex: 2,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product['name'] ?? '',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Spacer(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            priceLabel,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: isShisha 
                                  ? const Color(0xFF22c55e) 
                                  : const Color(0xFF8B5CF6),
                            ),
                          ),
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: isShisha
                                    ? [const Color(0xFF22c55e), const Color(0xFF4ade80)]
                                    : [const Color(0xFF8B5CF6), const Color(0xFFA78BFA)],
                              ),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.add,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

