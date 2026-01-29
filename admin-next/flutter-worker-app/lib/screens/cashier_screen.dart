import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../services/firebase_service.dart';
import '../utils/currency.dart';
import '../utils/app_theme.dart';

class CashierScreen extends StatefulWidget {
  const CashierScreen({super.key});

  @override
  State<CashierScreen> createState() => _CashierScreenState();
}

class _CashierScreenState extends State<CashierScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  List<Map<String, dynamic>> _products = [];
  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _tables = [];
  List<Map<String, dynamic>> _rooms = [];
  final List<CartItem> _cart = [];
  String? _selectedCategoryId;
  String _searchTerm = '';
  bool _isLoading = true;
  String? _selectedTableId;
  String? _selectedRoomId;
  String? _roomGender;
  final String _orderType = 'takeaway'; // 'takeaway', 'table', 'room'
  final int _discountPercent = 0;
  final String _customerName = '';
  final String _customerPhone = '';
  String _activePanel = 'products'; // 'products', 'cart', 'payment'

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final products = await _firebaseService.getMenuItems();
    final categories = await _firebaseService.getCategories();
    final tables = await _firebaseService.getTables();
    final rooms = await _firebaseService.getRooms();
    setState(() {
      _products = products.where((p) => 
        (p['isActive'] ?? p['active'] ?? true) == true
      ).toList();
      _categories = categories.where((c) => 
        (c['isActive'] ?? c['active'] ?? true) == true
      ).toList();
      _tables = tables.where((t) => 
        (t['status'] ?? 'available') == 'available'
      ).toList();
      _rooms = rooms.where((r) => 
        (r['status'] ?? 'available') == 'available' && 
        (r['isActive'] ?? true) == true
      ).toList();
      _isLoading = false;
    });
  }

  void _addToCart(Map<String, dynamic> product, Map<String, dynamic>? variation, int quantity, String note) {
    final cartItemId = '${product['id']}_${variation?['id'] ?? 'default'}_${DateTime.now().millisecondsSinceEpoch}';
    final price = variation != null 
      ? (variation['price'] ?? 0.0) 
      : (product['basePrice'] ?? product['price'] ?? 0.0);
    final name = variation != null 
      ? '${product['name']} - ${variation['name']}'
      : (product['name'] ?? '');
    
    setState(() {
      _cart.add(CartItem(
        id: cartItemId,
        productId: product['id'].toString(),
        name: name,
        emoji: product['emoji'],
        variationId: variation?['id'],
        variationName: variation?['name'],
        unitPrice: price,
        quantity: quantity,
        note: note.isEmpty ? null : note,
        lineTotal: price * quantity,
      ));
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('تم إضافة ${product['name']} للسلة'),
        duration: const Duration(seconds: 1),
        backgroundColor: Colors.green,
      ),
    );
  }

  bool _hasVariations(Map<String, dynamic> product) {
    final variations = product['variations'] as List<dynamic>? ?? [];
    return variations.isNotEmpty;
  }

  void _handleProductClick(Map<String, dynamic> product) {
    if (_hasVariations(product)) {
      _showVariationModal(product);
    } else {
      _addToCart(product, null, 1, '');
    }
  }

  void _showVariationModal(Map<String, dynamic> product) {
    final variations = product['variations'] as List<dynamic>? ?? [];
    if (variations.isEmpty) {
      _addToCart(product, null, 1, '');
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _VariationModal(
        product: product,
        variations: variations,
        onAdd: (variation, quantity, note) => _addToCart(product, variation, quantity, note),
        onClose: () => Navigator.pop(context),
      ),
    );
  }

  void _updateQuantity(String itemId, int quantity) {
    if (quantity <= 0) {
      setState(() => _cart.removeWhere((item) => item.id == itemId));
      return;
    }
    setState(() {
      final index = _cart.indexWhere((item) => item.id == itemId);
      if (index >= 0) {
        _cart[index].quantity = quantity;
        _cart[index].lineTotal = _cart[index].unitPrice * quantity;
      }
    });
  }

  void _removeItem(String itemId) {
    setState(() => _cart.removeWhere((item) => item.id == itemId));
  }

  void _updateNote(String itemId, String note) {
    setState(() {
      final index = _cart.indexWhere((item) => item.id == itemId);
      if (index >= 0) {
        _cart[index].note = note.isEmpty ? null : note;
      }
    });
  }

  void _clearCart() {
    setState(() {
      _cart.clear();
      _activePanel = 'products';
    });
  }

  double get _cartSubtotal {
    return _cart.fold(0.0, (sum, item) => sum + item.lineTotal);
  }

  double get _cartDiscount {
    return _cartSubtotal * (_discountPercent / 100);
  }

  double get _roomPrice {
    if (_orderType != 'room' || _selectedRoomId == null) return 0.0;
    final room = _rooms.firstWhere((r) => r['id'] == _selectedRoomId, orElse: () => {});
    if (room.isEmpty) return 0.0;
    
    final priceType = room['priceType'] ?? 'free';
    if (priceType == 'free') return 0.0;
    if (priceType == 'fixed') return (room['hourlyRate'] ?? 0.0).toDouble();
    if (priceType == 'gender') {
      if (_roomGender == 'male') return (room['malePrice'] ?? 0.0).toDouble();
      if (_roomGender == 'female') return (room['femalePrice'] ?? 0.0).toDouble();
    }
    return 0.0;
  }

  double get _cartTotal {
    return _cartSubtotal - _cartDiscount + _roomPrice;
  }

  Future<void> _createOrder({bool payNow = false, String? paymentMethod, double? receivedAmount}) async {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('السلة فارغة'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Validate order type
    if (_orderType == 'table' && _selectedTableId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('الرجاء اختيار طاولة'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_orderType == 'room' && (_selectedRoomId == null || 
        (_rooms.firstWhere((r) => r['id'] == _selectedRoomId, orElse: () => {})['priceType'] == 'gender' && _roomGender == null))) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('الرجاء اختيار غرفة ونوع العميل'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

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

      final orderData = {
        'items': items,
        'subtotal': _cartSubtotal,
        'discount': {
          'percent': _discountPercent,
          'amount': _cartDiscount,
        },
        'total': _cartTotal,
        'status': payNow ? 'paid' : 'pending',
        'paymentStatus': payNow ? 'paid' : 'pending',
        'paymentMethod': payNow ? (paymentMethod ?? 'cash') : null,
        'orderType': _orderType,
        'tableId': _selectedTableId,
        'tableNumber': _selectedTableId != null 
          ? _tables.firstWhere((t) => t['id'] == _selectedTableId, orElse: () => {})['tableNumber']
          : null,
        'roomId': _selectedRoomId,
        'roomNumber': _selectedRoomId != null
          ? _rooms.firstWhere((r) => r['id'] == _selectedRoomId, orElse: () => {})['roomNumber']
          : null,
        'roomGender': _roomGender,
        'roomPrice': _roomPrice > 0 ? _roomPrice : null,
        'customerName': _customerName.isEmpty ? null : _customerName,
        'customerPhone': _customerPhone.isEmpty ? null : _customerPhone,
        'source': 'cashier',
        'restaurantId': 'mirmaia-1',
        'createdAt': DateTime.now().toIso8601String(),
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      };

      if (payNow && paymentMethod == 'cash' && receivedAmount != null) {
        orderData['receivedAmount'] = receivedAmount;
        orderData['change'] = receivedAmount - _cartTotal;
      }

      final orderId = await _firebaseService.createOrder(orderData);
      
      if (orderId != null) {
        _clearCart();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(payNow ? 'تم الدفع بنجاح!' : 'تم إنشاء الطلب بنجاح #${orderId.substring(orderId.length - 6).toUpperCase()}'),
              backgroundColor: Colors.green,
            ),
          );
        }
        await _loadData(); // Refresh tables/rooms
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
    }
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
        return name.contains(searchLower) || nameEn.contains(searchLower);
      }).toList();
    }
    
    return filtered;
  }

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
      appBar: AppBar(
        title: const Text(
          'الكاشير',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 20,
          ),
        ),
        centerTitle: true,
        elevation: 0,
        actions: [
          if (_cart.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                gradient: AppGradients.primaryGradient,
                borderRadius: BorderRadius.circular(20),
                boxShadow: AppShadows.button,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.shopping_cart_rounded, color: Colors.white, size: 18),
                  const SizedBox(width: 6),
                  Text(
                    '${_cart.length}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
      body: Column(
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
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),

          // Categories
          if (_categories.isNotEmpty)
            Container(
              height: 70,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.surfaceCard,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
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
                        selectedColor: AppColors.primary.withValues(alpha: 0.15),
                        checkmarkColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: _selectedCategoryId == null 
                              ? AppColors.primary 
                              : AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
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
                          ? Text(category['emoji'], style: const TextStyle(fontSize: 16))
                          : null,
                      label: Text(category['name'] ?? ''),
                      selected: isSelected,
                      selectedColor: AppColors.primary.withValues(alpha: 0.15),
                      checkmarkColor: AppColors.primary,
                      labelStyle: TextStyle(
                        color: isSelected ? AppColors.primary : AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
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
                      final isActive = product['isActive'] ?? product['active'] ?? true;
                      final imageUrl = product['imageUrl'] ?? product['image'];
                      final variations = product['variations'] as List<dynamic>? ?? [];
                      final hasVariations = variations.isNotEmpty;
                      
                      return _ProductCard(
                        product: product,
                        imageUrl: imageUrl,
                        isActive: isActive,
                        hasVariations: hasVariations,
                        onTap: isActive ? () => _handleProductClick(product) : null,
                      );
                    },
                  ),
          ),

          // Cart Summary Bar
          if (_cart.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                gradient: AppGradients.primaryGradient,
                boxShadow: AppShadows.button,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.shopping_cart_rounded, color: Colors.white, size: 24),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${_cart.length} عنصر',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            formatPrice(_cartTotal),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      TextButton.icon(
                        onPressed: _clearCart,
                        icon: const Icon(Icons.clear_all, color: Colors.white, size: 18),
                        label: const Text('مسح', style: TextStyle(color: Colors.white)),
                        style: TextButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: 0.2),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: _createOrder,
                        icon: const Icon(Icons.check_circle_rounded, size: 20),
                        label: const Text('إنشاء طلب'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          elevation: 0,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

          // Cart Items (if any)
          if (_cart.isNotEmpty)
            Container(
              height: 168,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceCard,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'عناصر السلة',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        formatPrice(_cartTotal),
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                Expanded(
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _cart.length,
                    itemBuilder: (context, index) {
                      final item = _cart[index];
                      return SizedBox(
                        width: 100,
                        child: Card(
                          margin: const EdgeInsets.only(left: 8),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 4,
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  item.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 11,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 2),
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove, size: 16),
                                      onPressed: () => _updateQuantity(
                                        item.id,
                                        item.quantity - 1,
                                      ),
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(
                                        minWidth: 28,
                                        minHeight: 28,
                                      ),
                                      style: IconButton.styleFrom(
                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                      ),
                                    ),
                                    Text('${item.quantity}', style: const TextStyle(fontSize: 11)),
                                    IconButton(
                                      icon: const Icon(Icons.add, size: 16),
                                      onPressed: () => _updateQuantity(
                                        item.id,
                                        item.quantity + 1,
                                      ),
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(
                                        minWidth: 28,
                                        minHeight: 28,
                                      ),
                                      style: IconButton.styleFrom(
                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  formatPrice(item.lineTotal),
                                  style: TextStyle(
                                    color: Colors.green[700],
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
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

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final dynamic imageUrl;
  final bool isActive;
  final bool hasVariations;
  final VoidCallback? onTap;

  const _ProductCard({
    required this.product,
    required this.imageUrl,
    required this.isActive,
    required this.hasVariations,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final name = product['name'] ?? '';
    final price = product['basePrice'] ?? product['price'] ?? 0.0;
    final emoji = product['emoji'];

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(AppRadius.md),
        boxShadow: AppShadows.card,
        border: Border.all(
          color: isActive ? AppColors.border : AppColors.error.withValues(alpha: 0.3),
          width: 1,
        ),
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
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.md)),
                      child: imageUrl != null && imageUrl.toString().isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: imageUrl.toString(),
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (context, url) => Container(
                                color: AppColors.borderLight,
                                child: const Center(
                                  child: CircularProgressIndicator(
                                    color: AppColors.primary,
                                    strokeWidth: 2,
                                  ),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [
                                      AppColors.borderLight,
                                      AppColors.border,
                                    ],
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    emoji ?? '📦',
                                    style: const TextStyle(fontSize: 48),
                                  ),
                                ),
                              ),
                            )
                          : Container(
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    AppColors.borderLight,
                                    AppColors.border,
                                  ],
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  emoji ?? '📦',
                                  style: const TextStyle(fontSize: 48),
                                ),
                              ),
                            ),
                    ),
                    if (hasVariations)
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.layers, size: 12, color: Colors.white),
                              SizedBox(width: 4),
                              Text(
                                'خيارات',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    if (!isActive)
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.5),
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(AppRadius.md),
                            ),
                          ),
                          child: const Center(
                            child: Text(
                              'غير متاح',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
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
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          formatPrice(price),
                          style: const TextStyle(
                            color: AppColors.success,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                        if (hasVariations)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Icon(
                              Icons.arrow_forward_ios,
                              size: 12,
                              color: AppColors.primary,
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

class CartItem {
  final String id;
  final String productId;
  final String name;
  final String? emoji;
  final String? variationId;
  final String? variationName;
  final double unitPrice;
  int quantity;
  String? note;
  double lineTotal;

  CartItem({
    required this.id,
    required this.productId,
    required this.name,
    this.emoji,
    this.variationId,
    this.variationName,
    required this.unitPrice,
    required this.quantity,
    this.note,
    required this.lineTotal,
  });
}

class _VariationModal extends StatefulWidget {
  final Map<String, dynamic> product;
  final List<dynamic> variations;
  final Function(Map<String, dynamic>?, int, String) onAdd;
  final VoidCallback onClose;

  const _VariationModal({
    required this.product,
    required this.variations,
    required this.onAdd,
    required this.onClose,
  });

  @override
  State<_VariationModal> createState() => _VariationModalState();
}

class _VariationModalState extends State<_VariationModal> {
  Map<String, dynamic>? _selectedVariation;
  int _quantity = 1;
  String _note = '';

  @override
  void initState() {
    super.initState();
    if (widget.variations.isNotEmpty) {
      dynamic defaultVar;
      try {
        defaultVar = widget.variations.firstWhere(
          (v) => (v as Map)['isDefault'] == true,
        );
      } catch (e) {
        defaultVar = widget.variations.first;
      }
      // Convert Map<Object?, Object?> to Map<String, dynamic>
      _selectedVariation = Map<String, dynamic>.from(defaultVar as Map);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentPrice = _selectedVariation != null
        ? (_selectedVariation!['price'] ?? 0.0).toDouble()
        : (widget.product['basePrice'] ?? widget.product['price'] ?? 0.0).toDouble();

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
              border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: Colors.grey[100],
                  ),
                  child: widget.product['imageUrl'] != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: CachedNetworkImage(
                            imageUrl: widget.product['imageUrl'],
                            fit: BoxFit.cover,
                          ),
                        )
                      : Center(
                          child: Text(
                            widget.product['emoji'] ?? '📦',
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
                        widget.product['name'] ?? '',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (widget.product['description'] != null)
                        Text(
                          widget.product['description'].toString().length > 40
                              ? '${widget.product['description'].toString().substring(0, 40)}...'
                              : widget.product['description'].toString(),
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                        ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: widget.onClose,
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
                  // Variations
                  if (widget.variations.isNotEmpty)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'اختر الحجم/النوع',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: widget.variations.map<Widget>((variation) {
                            final variationMap = Map<String, dynamic>.from(variation as Map);
                            final isSelected = _selectedVariation?['id'] == variationMap['id'];
                            return InkWell(
                              onTap: () => setState(() => _selectedVariation = variationMap),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: isSelected
                                        ? const Color(0xFF6366F1)
                                        : Colors.grey[300]!,
                                    width: 2,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                  color: isSelected
                                      ? const Color(0xFF6366F1).withOpacity(0.1)
                                      : Colors.white,
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      variationMap['name'] ?? '',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: isSelected
                                            ? const Color(0xFF6366F1)
                                            : Colors.black87,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      formatPrice(variationMap['price'] ?? 0.0),
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: isSelected
                                            ? const Color(0xFF6366F1)
                                            : Colors.green[700],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),

                  // Quantity
                  const Text(
                    'الكمية',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => setState(() => _quantity = _quantity > 1 ? _quantity - 1 : 1),
                        icon: const Icon(Icons.remove),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.grey[100],
                        ),
                      ),
                      SizedBox(
                        width: 60,
                        child: Text(
                          '$_quantity',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () => setState(() => _quantity++),
                        icon: const Icon(Icons.add),
                        style: IconButton.styleFrom(
                          backgroundColor: const Color(0xFF6366F1),
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Note
                  const Row(
                    children: [
                      Icon(Icons.note, size: 16, color: Colors.grey),
                      SizedBox(width: 8),
                      Text(
                        'ملاحظة (اختياري)',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    onChanged: (value) => setState(() => _note = value),
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'مثال: بدون سكر، حار جداً...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Footer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
              color: Colors.grey[50],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'الإجمالي',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    Text(
                      formatPrice(currentPrice * _quantity),
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.green[700],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      widget.onAdd(_selectedVariation, _quantity, _note);
                      widget.onClose();
                    },
                    icon: const Icon(Icons.shopping_cart),
                    label: const Text('إضافة للسلة'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      padding: const EdgeInsets.all(14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
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
