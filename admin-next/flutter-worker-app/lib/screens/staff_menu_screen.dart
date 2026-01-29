import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../services/firebase_service.dart';
import '../utils/currency.dart';
import '../utils/app_theme.dart';
import '../providers/auth_provider.dart';

class StaffMenuScreen extends StatefulWidget {
  const StaffMenuScreen({super.key});

  @override
  State<StaffMenuScreen> createState() => _StaffMenuScreenState();
}

class _StaffMenuScreenState extends State<StaffMenuScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _products = [];
  List<Map<String, dynamic>> _tables = [];
  final List<CartItem> _cart = [];
  String? _selectedCategoryId;
  String _searchTerm = '';
  bool _isLoading = true;
  bool _isCartOpen = false;
  String _tableNumber = '';
  bool _isSubmitting = false;
  bool _showSuccess = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    final categories = await _firebaseService.getCategories();
    final menuItems = await _firebaseService.getMenuItems();
    final tables = await _firebaseService.getTables();
    
    setState(() {
      _categories = categories.where((c) => 
        (c['isActive'] ?? c['active'] ?? true) == true
      ).toList();
      _products = menuItems.where((p) => 
        (p['isActive'] ?? p['active'] ?? true) == true
      ).toList();
      _tables = tables;
      _isLoading = false;
    });
  }

  List<Map<String, dynamic>> get _filteredProducts {
    var filtered = _products;
    
    // Filter by category
    if (_selectedCategoryId != null) {
      filtered = filtered.where((p) => 
        p['categoryId'] == _selectedCategoryId || 
        p['category'] == _selectedCategoryId
      ).toList();
    }
    
    // Filter by search
    if (_searchTerm.isNotEmpty) {
      final searchLower = _searchTerm.toLowerCase();
      filtered = filtered.where((p) {
        final name = (p['name'] ?? '').toLowerCase();
        final nameEn = (p['nameEn'] ?? '').toLowerCase();
        final desc = (p['description'] ?? '').toLowerCase();
        return name.contains(searchLower) || 
               nameEn.contains(searchLower) || 
               desc.contains(searchLower);
      }).toList();
    }
    
    return filtered;
  }

  void _addToCart(Map<String, dynamic> product, Map<String, dynamic>? variation) {
    final cartItemId = variation != null 
      ? '${product['id']}-${variation['id']}' 
      : product['id'].toString();
    
    setState(() {
      final existing = _cart.indexWhere((item) => item.cartItemId == cartItemId);
      if (existing >= 0) {
        _cart[existing].quantity++;
        _cart[existing].lineTotal = _cart[existing].unitPrice * _cart[existing].quantity;
      } else {
        final price = variation != null 
          ? (variation['price'] ?? 0.0) 
          : (product['basePrice'] ?? product['price'] ?? 0.0);
        
        _cart.add(CartItem(
          cartItemId: cartItemId,
          productId: product['id'].toString(),
          name: variation != null 
            ? '${product['name']} - ${variation['name']}'
            : product['name'] ?? '',
          emoji: product['emoji'],
          variationId: variation?['id'],
          variationName: variation?['name'],
          unitPrice: price,
          quantity: 1,
          lineTotal: price,
        ));
      }
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('تم إضافة ${product['name']} للسلة'),
        duration: const Duration(seconds: 1),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _incrementItem(String cartItemId) {
    setState(() {
      final index = _cart.indexWhere((item) => item.cartItemId == cartItemId);
      if (index >= 0) {
        _cart[index].quantity++;
        _cart[index].lineTotal = _cart[index].unitPrice * _cart[index].quantity;
      }
    });
  }

  void _decrementItem(String cartItemId) {
    setState(() {
      final index = _cart.indexWhere((item) => item.cartItemId == cartItemId);
      if (index >= 0) {
        if (_cart[index].quantity > 1) {
          _cart[index].quantity--;
          _cart[index].lineTotal = _cart[index].unitPrice * _cart[index].quantity;
        } else {
          _cart.removeAt(index);
        }
      }
    });
  }

  void _removeItem(String cartItemId) {
    setState(() {
      _cart.removeWhere((item) => item.cartItemId == cartItemId);
    });
  }

  void _updateNote(String cartItemId, String note) {
    setState(() {
      final index = _cart.indexWhere((item) => item.cartItemId == cartItemId);
      if (index >= 0) {
        _cart[index].note = note.isEmpty ? null : note;
      }
    });
  }

  Future<void> _submitOrder() async {
    if (_cart.isEmpty || _tableNumber.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('الرجاء إدخال رقم الطاولة وإضافة منتجات للسلة'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final items = _cart.map((item) {
        return <String, dynamic>{
          'id': item.productId,
          'name': item.name,
          'price': item.unitPrice,
          'quantity': item.quantity,
          'itemTotal': item.lineTotal,
          'emoji': item.emoji,
          'note': item.note,
        };
      }).toList();

      final total = _cart.fold(0.0, (sum, item) => sum + item.lineTotal);

      final orderData = {
        'items': items,
        'total': total,
        'status': 'pending',
        'tableNumber': _tableNumber.trim(),
        'orderType': 'table',
        'source': 'staff-menu',
        'restaurantId': 'mirmaia-1',
        'createdAt': DateTime.now().toIso8601String(),
      };

      final orderId = await _firebaseService.createOrder(orderData);
      
      if (orderId != null) {
        setState(() {
          _cart.clear();
          _tableNumber = '';
          _isCartOpen = false;
          _showSuccess = true;
        });
        
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) {
            setState(() => _showSuccess = false);
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('حدث خطأ: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  int get _cartItemsCount => _cart.fold(0, (sum, item) => sum + item.quantity);
  double get _cartTotal => _cart.fold(0.0, (sum, item) => sum + item.lineTotal);

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.surface,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: Stack(
        children: [
          // Main Content
          Column(
            children: [
              // Search Bar
              Container(
                padding: const EdgeInsets.all(16),
                color: AppColors.surfaceCard,
                child: TextField(
                  onChanged: (value) => setState(() => _searchTerm = value),
                  decoration: InputDecoration(
                    hintText: 'ابحث عن منتج...',
                    prefixIcon: const Icon(Icons.search, color: AppColors.textSecondary),
                    suffixIcon: _searchTerm.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, color: AppColors.textSecondary),
                            onPressed: () => setState(() => _searchTerm = ''),
                          )
                        : null,
                    filled: true,
                    fillColor: AppColors.borderLight,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),

              // Categories
              if (_categories.isNotEmpty)
                Container(
                  height: 60,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _categories.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return Padding(
                          padding: const EdgeInsets.only(left: 8),
                          child: FilterChip(
                            label: const Text('الكل'),
                            selected: _selectedCategoryId == null,
                            onSelected: (selected) {
                              setState(() => _selectedCategoryId = null);
                            },
                          ),
                        );
                      }
                      
                      final category = _categories[index - 1];
                      final isSelected = _selectedCategoryId == category['id'];
                      
                      return Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: FilterChip(
                          avatar: category['emoji'] != null 
                            ? Text(category['emoji'])
                            : category['icon'] != null
                              ? Text(category['icon'])
                              : null,
                          label: Text(category['name'] ?? ''),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              _selectedCategoryId = selected ? category['id'] : null;
                            });
                          },
                        ),
                      );
                    },
                  ),
                ),

              // Products Count
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    const Icon(Icons.inventory_2, size: 18, color: AppColors.textSecondary),
                    const SizedBox(width: 8),
                    Text(
                      '${_filteredProducts.length} منتج',
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),

              // Products Grid
              Expanded(
                child: _filteredProducts.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.inventory_2_outlined, size: 64, color: AppColors.border),
                            const SizedBox(height: 16),
                            const Text(
                              'لا توجد منتجات',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _searchTerm.isNotEmpty
                                  ? 'جرب كلمة بحث مختلفة'
                                  : 'اختر تصنيف آخر',
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 0.75,
                        ),
                        itemCount: _filteredProducts.length,
                        itemBuilder: (context, index) {
                          final product = _filteredProducts[index];
                          return _ProductCard(
                            product: product,
                            onTap: () => _showProductModal(product),
                          );
                        },
                      ),
              ),
            ],
          ),

          // Success Toast
          if (_showSuccess)
            Positioned(
              top: 100,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: BoxDecoration(
                    gradient: AppGradients.successGradient,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.success.withValues(alpha: 0.35),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.check_circle_rounded, color: Colors.white, size: 24),
                      SizedBox(width: 10),
                      Text(
                        'تم إرسال الطلب بنجاح!',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Floating Cart Button
          if (!_isCartOpen)
            Positioned(
              bottom: 24,
              left: 24,
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => setState(() => _isCartOpen = true),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppShadows.fab,
                      gradient: AppGradients.primaryGradient,
                    ),
                    child: Stack(
                      clipBehavior: Clip.none,
                      alignment: Alignment.center,
                      children: [
                        const Icon(Icons.shopping_cart_rounded, color: Colors.white, size: 26),
                        if (_cartItemsCount > 0)
                          Positioned(
                            right: -4,
                            top: -4,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: AppColors.error,
                                shape: BoxShape.circle,
                              ),
                              constraints: const BoxConstraints(minWidth: 20, minHeight: 20),
                              child: Text(
                                '$_cartItemsCount',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),

      // Cart Sidebar
      endDrawer: _isCartOpen
          ? _CartSidebar(
              items: _cart,
              tableNumber: _tableNumber,
              onTableChange: (value) => setState(() => _tableNumber = value),
              onClose: () => setState(() => _isCartOpen = false),
              onIncrement: _incrementItem,
              onDecrement: _decrementItem,
              onRemove: _removeItem,
              onNoteChange: _updateNote,
              onSubmit: _submitOrder,
              isSubmitting: _isSubmitting,
            )
          : null,
    );
  }

  void _showProductModal(Map<String, dynamic> product) {
    final variations = product['variations'] as List<dynamic>? ?? [];
    final hasVariations = variations.isNotEmpty;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ProductModal(
        product: product,
        hasVariations: hasVariations,
        variations: variations,
        onAddToCart: (variation) => _addToCart(product, variation),
        onClose: () => Navigator.pop(context),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final VoidCallback onTap;

  const _ProductCard({
    required this.product,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final imageUrl = product['imageUrl'] ?? product['image'];
    final name = product['name'] ?? '';
    final price = product['basePrice'] ?? product['price'] ?? 0.0;
    final variations = product['variations'] as List<dynamic>? ?? [];
    final hasVariations = variations.isNotEmpty;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(AppRadius.md),
        boxShadow: AppShadows.card,
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    child: imageUrl != null && imageUrl.toString().isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: imageUrl.toString(),
                            fit: BoxFit.cover,
                            width: double.infinity,
                            placeholder: (context, url) => Container(
                              color: Colors.grey[200],
                              child: const Center(child: CircularProgressIndicator()),
                            ),
                            errorWidget: (context, url, error) => Container(
                              color: Colors.grey[200],
                              child: Center(
                                child: Text(
                                  product['emoji'] ?? '📦',
                                  style: const TextStyle(fontSize: 48),
                                ),
                              ),
                            ),
                          )
                        : Container(
                            color: Colors.grey[200],
                            child: Center(
                              child: Text(
                                product['emoji'] ?? '📦',
                                style: const TextStyle(fontSize: 48),
                              ),
                            ),
                          ),
                  ),
                  if (hasVariations)
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.layers, size: 12, color: Colors.white),
                            SizedBox(width: 4),
                            Text(
                              'خيارات متعددة',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            // Info
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Consumer<AuthProvider>(
                        builder: (context, authProvider, _) {
                          final hideFinancial = authProvider.shouldHideFinancialData();
                          return Text(
                            hasVariations
                                ? 'من ${formatPriceShort(price, hideFinancial: hideFinancial)} $kCurrency'
                                : formatPrice(price, hideFinancial: hideFinancial),
                            style: const TextStyle(
                              color: AppColors.success,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          );
                        },
                      ),
                      ElevatedButton(
                        onPressed: onTap,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: hasVariations 
                              ? const Color(0xFF8B5CF6)
                              : const Color(0xFF6366F1),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          minimumSize: Size.zero,
                        ),
                        child: Text(
                          hasVariations ? 'اختر' : 'إضافة',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        ),
      ),
    );
  }
}

class _ProductModal extends StatelessWidget {
  final Map<String, dynamic> product;
  final bool hasVariations;
  final List<dynamic> variations;
  final Function(Map<String, dynamic>?) onAddToCart;
  final VoidCallback onClose;

  const _ProductModal({
    required this.product,
    required this.hasVariations,
    required this.variations,
    required this.onAddToCart,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return StatefulBuilder(
      builder: (context, setState) {
        Map<String, dynamic>? selectedVariation;
        String note = '';

        if (hasVariations && variations.isNotEmpty) {
          dynamic defaultVar;
          try {
            defaultVar = variations.firstWhere(
              (v) => (v as Map)['isDefault'] == true,
            );
          } catch (e) {
            defaultVar = variations.first;
          }
          // Convert Map<Object?, Object?> to Map<String, dynamic>
          selectedVariation = Map<String, dynamic>.from(defaultVar as Map);
        }

        final currentPrice = selectedVariation != null
            ? (selectedVariation['price'] ?? 0.0)
            : (product['basePrice'] ?? product['price'] ?? 0.0);

        return Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.grey[200]!),
                  ),
                ),
                child: Row(
                  children: [
                    // Product Image
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.grey[100],
                      ),
                      child: product['imageUrl'] != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: CachedNetworkImage(
                                imageUrl: product['imageUrl'],
                                fit: BoxFit.cover,
                              ),
                            )
                          : Center(
                              child: Text(
                                product['emoji'] ?? '📦',
                                style: const TextStyle(fontSize: 28),
                              ),
                            ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            product['name'] ?? '',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (hasVariations)
                            Row(
                              children: [
                                const Icon(Icons.layers, size: 14, color: Color(0xFF6366F1)),
                                const SizedBox(width: 4),
                                Text(
                                  'اختر الحجم أو النوع',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: onClose,
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),

              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Description
                      if (product['description'] != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 20),
                          child: Text(
                            product['description'],
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                              height: 1.7,
                            ),
                          ),
                        ),

                      // Variations
                      if (hasVariations && variations.isNotEmpty)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'اختر الحجم أو النوع',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 10),
                            ...variations.map<Widget>((variation) {
                              final variationMap = Map<String, dynamic>.from(variation as Map);
                              final isSelected = selectedVariation?['id'] == variationMap['id'];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: InkWell(
                                  onTap: () => setState(() {
                                    selectedVariation = variationMap;
                                  }),
                                  child: Container(
                                    padding: const EdgeInsets.all(14),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? const Color(0xFF6366F1).withOpacity(0.1)
                                          : Colors.grey[50],
                                      border: Border.all(
                                        color: isSelected
                                            ? const Color(0xFF6366F1)
                                            : Colors.transparent,
                                        width: 2,
                                      ),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              width: 22,
                                              height: 22,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: isSelected
                                                    ? const Color(0xFF6366F1)
                                                    : Colors.transparent,
                                                border: Border.all(
                                                  color: isSelected
                                                      ? const Color(0xFF6366F1)
                                                      : Colors.grey[300]!,
                                                  width: 2,
                                                ),
                                              ),
                                              child: isSelected
                                                  ? const Icon(
                                                      Icons.check,
                                                      size: 14,
                                                      color: Colors.white,
                                                    )
                                                  : null,
                                            ),
                                            const SizedBox(width: 12),
                                            Text(
                                              variationMap['name'] ?? '',
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: isSelected
                                                    ? FontWeight.bold
                                                    : FontWeight.normal,
                                                color: isSelected
                                                    ? const Color(0xFF6366F1)
                                                    : Colors.black87,
                                              ),
                                            ),
                                            if (variationMap['isDefault'] == true)
                                              Container(
                                                margin: const EdgeInsets.only(right: 8),
                                                padding: const EdgeInsets.symmetric(
                                                  horizontal: 6,
                                                  vertical: 2,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: Colors.grey[200],
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: const Text(
                                                  'الافتراضي',
                                                  style: TextStyle(
                                                    fontSize: 10,
                                                    color: Colors.grey,
                                                  ),
                                                ),
                                              ),
                                          ],
                                        ),
                                        Consumer<AuthProvider>(
                                          builder: (context, authProvider, _) {
                                            return Text(
                                              formatPrice(variationMap['price'] ?? 0.0, hideFinancial: authProvider.shouldHideFinancialData()),
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                                color: isSelected
                                                    ? const Color(0xFF6366F1)
                                                    : Colors.green[700],
                                              ),
                                            );
                                          },
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            }),
                            const SizedBox(height: 20),
                          ],
                        ),

                      // Price (if no variations)
                      if (!hasVariations)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 24),
                          child: Consumer<AuthProvider>(
                            builder: (context, authProvider, _) {
                              return Text(
                                formatPrice(currentPrice, hideFinancial: authProvider.shouldHideFinancialData()),
                                style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green,
                                ),
                              );
                            },
                          ),
                        ),

                      // Selected Summary
                      if (hasVariations && selectedVariation != null)
                        Container(
                          padding: const EdgeInsets.all(14),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.green[50],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'السعر المحدد',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey,
                                ),
                              ),
                              Consumer<AuthProvider>(
                                builder: (context, authProvider, _) {
                                  return Text(
                                    formatPrice((selectedVariation ?? {})['price'] ?? 0.0, hideFinancial: authProvider.shouldHideFinancialData()),
                                    style: TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green[700],
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),

                      // Note
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'ملاحظات (اختياري)',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            onChanged: (value) => note = value,
                            maxLines: 3,
                            decoration: InputDecoration(
                              hintText: 'مثال: بدون سكر، حار جداً...',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              filled: true,
                              fillColor: Colors.grey[50],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Footer
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(color: Colors.grey[200]!),
                  ),
                ),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: hasVariations && selectedVariation == null
                        ? null
                        : () {
                            onAddToCart(selectedVariation);
                            onClose();
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: hasVariations && selectedVariation == null
                          ? Colors.grey
                          : const Color(0xFF6366F1),
                      padding: const EdgeInsets.all(16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      hasVariations && selectedVariation != null
                          ? 'إضافة (${selectedVariation!['name']})'
                          : 'إضافة إلى الطلب',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _CartSidebar extends StatelessWidget {
  final List<CartItem> items;
  final String tableNumber;
  final Function(String) onTableChange;
  final VoidCallback onClose;
  final Function(String) onIncrement;
  final Function(String) onDecrement;
  final Function(String) onRemove;
  final Function(String, String) onNoteChange;
  final VoidCallback onSubmit;
  final bool isSubmitting;

  const _CartSidebar({
    required this.items,
    required this.tableNumber,
    required this.onTableChange,
    required this.onClose,
    required this.onIncrement,
    required this.onDecrement,
    required this.onRemove,
    required this.onNoteChange,
    required this.onSubmit,
    required this.isSubmitting,
  });

  @override
  Widget build(BuildContext context) {
    final itemsCount = items.fold(0, (sum, item) => sum + item.quantity);
    final total = items.fold(0.0, (sum, item) => sum + item.lineTotal);

    return Drawer(
      width: 380,
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: AppColors.border),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: AppGradients.primaryGradient,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: const Icon(Icons.shopping_cart_rounded, color: Colors.white),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'الطلب',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '$itemsCount صنف',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: onClose,
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),

          // Table Selection
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: AppColors.border),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'رقم الطاولة / الغرفة',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  onChanged: onTableChange,
                  decoration: InputDecoration(
                    hintText: 'مثال: طاولة 5، غرفة VIP...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    filled: true,
                    fillColor: AppColors.surfaceCard,
                  ),
                ),
              ],
            ),
          ),

          // Items List
          Expanded(
            child: items.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_cart, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        const Text(
                          'السلة فارغة',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'أضف منتجات للطلب',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return _CartItemCard(
                        item: item,
                        onIncrement: () => onIncrement(item.cartItemId),
                        onDecrement: () => onDecrement(item.cartItemId),
                        onRemove: () => onRemove(item.cartItemId),
                        onNoteChange: (note) => onNoteChange(item.cartItemId, note),
                      );
                    },
                  ),
          ),

          // Footer
          if (items.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(color: Colors.grey[200]!),
                ),
                color: Colors.grey[50],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'الإجمالي',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey,
                        ),
                      ),
                      Consumer<AuthProvider>(
                        builder: (context, authProvider, _) {
                          return Text(
                            formatPrice(total, hideFinancial: authProvider.shouldHideFinancialData()),
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: tableNumber.trim().isEmpty || isSubmitting
                          ? null
                          : onSubmit,
                      icon: isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Icon(Icons.send),
                      label: Text(isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: tableNumber.trim().isEmpty
                            ? Colors.grey
                            : const Color(0xFF6366F1),
                        padding: const EdgeInsets.all(16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                  if (tableNumber.trim().isEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        'يرجى إدخال رقم الطاولة أولاً',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.orange[700],
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
}

class _CartItemCard extends StatefulWidget {
  final CartItem item;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;
  final VoidCallback onRemove;
  final Function(String) onNoteChange;

  const _CartItemCard({
    required this.item,
    required this.onIncrement,
    required this.onDecrement,
    required this.onRemove,
    required this.onNoteChange,
  });

  @override
  State<_CartItemCard> createState() => _CartItemCardState();
}

class _CartItemCardState extends State<_CartItemCard> {
  bool _isEditingNote = false;
  final _noteController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _noteController.text = widget.item.note ?? '';
  }

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Emoji/Image
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.white,
                ),
                child: Center(
                  child: Text(
                    widget.item.emoji ?? '📦',
                    style: const TextStyle(fontSize: 24),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.item.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (widget.item.variationName != null)
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          widget.item.variationName!,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF6366F1),
                          ),
                        ),
                      ),
                    Consumer<AuthProvider>(
                      builder: (context, authProvider, _) {
                        return Text(
                          formatPrice(widget.item.unitPrice, hideFinancial: authProvider.shouldHideFinancialData()),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.green[700],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: widget.onRemove,
                icon: const Icon(Icons.delete_outline, color: Colors.red),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Quantity Controls
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: widget.onDecrement,
                      icon: const Icon(Icons.remove, size: 18),
                      color: Colors.red,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(
                        minWidth: 32,
                        minHeight: 32,
                      ),
                    ),
                    SizedBox(
                      width: 28,
                      child: Text(
                        '${widget.item.quantity}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: widget.onIncrement,
                      icon: const Icon(Icons.add, size: 18),
                      color: Colors.white,
                      style: IconButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                      ),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(
                        minWidth: 32,
                        minHeight: 32,
                      ),
                    ),
                  ],
                ),
              ),
              // Total
              Consumer<AuthProvider>(
                builder: (context, authProvider, _) {
                  return Text(
                    formatPrice(widget.item.lineTotal, hideFinancial: authProvider.shouldHideFinancialData()),
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  );
                },
              ),
            ],
          ),
          // Note
          const SizedBox(height: 12),
          TextField(
            controller: _noteController,
            onChanged: (value) {
              if (!_isEditingNote) {
                setState(() => _isEditingNote = true);
              }
            },
            onSubmitted: (value) {
              widget.onNoteChange(value);
              setState(() => _isEditingNote = false);
            },
            decoration: InputDecoration(
              hintText: 'ملاحظة...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            ),
            style: const TextStyle(fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class CartItem {
  final String cartItemId;
  final String productId;
  final String name;
  final String? emoji;
  final String? variationId;
  final String? variationName;
  final double unitPrice;
  int quantity;
  double lineTotal;
  String? note;

  CartItem({
    required this.cartItemId,
    required this.productId,
    required this.name,
    this.emoji,
    this.variationId,
    this.variationName,
    required this.unitPrice,
    required this.quantity,
    required this.lineTotal,
    this.note,
  });
}
