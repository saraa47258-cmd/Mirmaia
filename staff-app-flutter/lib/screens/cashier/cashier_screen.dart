import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/product_model.dart';
import '../../models/category_model.dart';
import '../../providers/cart_provider.dart' show CartProvider, CartItem;
import '../../providers/auth_provider.dart';
import '../../services/realtime_database_service.dart';
import '../../utils/responsive.dart';

/// Professional POS Cashier Screen - Matching Next.js Design
class CashierScreen extends StatefulWidget {
  const CashierScreen({super.key});

  @override
  State<CashierScreen> createState() => _CashierScreenState();
}

class _CashierScreenState extends State<CashierScreen> {
  final RealtimeDatabaseService _dbService = RealtimeDatabaseService();
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _customerNameController = TextEditingController();
  final TextEditingController _customerPhoneController = TextEditingController();

  List<CategoryModel> _categories = [];
  List<ProductModel> _allProducts = [];
  List<Map<String, dynamic>> _tables = [];
  List<Map<String, dynamic>> _rooms = [];
  bool _isLoading = true;
  String _selectedCategory = 'all';
  String _searchQuery = '';
  String _orderType = 'table'; // 'table', 'room'
  int _discountPercent = 0;

  // Selected table/room
  Map<String, dynamic>? _selectedTable;
  Map<String, dynamic>? _selectedRoom;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _customerNameController.dispose();
    _customerPhoneController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    print('🔄 Cashier: Loading data from Realtime Database...');
    try {
      final categories = await _dbService.getCategories();
      final products = await _dbService.getProducts();
      final tables = await _dbService.getTables();
      final rooms = await _dbService.getRooms();
      
      print('✅ Cashier: Loaded ${categories.length} categories, ${products.length} products');
      print('✅ Cashier: Loaded ${tables.length} tables, ${rooms.length} rooms');
      
      if (mounted) {
        setState(() {
          _categories = categories;
          _allProducts = products;
          _tables = tables.map((t) => t.toMap()..['id'] = t.id).toList();
          _rooms = rooms.map((r) => r.toMap()..['id'] = r.id).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      print('❌ Cashier Error loading data: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<ProductModel> get _filteredProducts {
    return _allProducts.where((product) {
      final matchesCategory =
          _selectedCategory == 'all' || product.categoryId == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty ||
          product.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          product.nameAr.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  void _onOrderTypeChanged(String type) {
    setState(() {
      _orderType = type;
    });
    
    final cart = Provider.of<CartProvider>(context, listen: false);
    cart.setOrderType(type);
    
    // Show selection dialog for table/room
    if (type == 'table' && _selectedTable == null) {
      _showTableSelectionDialog();
    } else if (type == 'room' && _selectedRoom == null) {
      _showRoomSelectionDialog();
    }
  }

  void _showTableSelectionDialog() {
    final availableTables = _tables.where((t) => t['status'] == 'available').toList();
    
    showDialog(
      context: context,
      builder: (context) => _SelectionDialog(
        title: 'اختر الطاولة',
        icon: Icons.table_restaurant_rounded,
        items: availableTables,
        getLabel: (item) => 'طاولة ${item['tableNumber']}',
        getSubtitle: (item) => item['name'] ?? '',
        onSelect: (item) {
          setState(() => _selectedTable = item);
          final cart = Provider.of<CartProvider>(context, listen: false);
          cart.setTable(item['tableNumber']?.toString(), id: item['id']);
          Navigator.pop(context);
        },
        emptyMessage: 'لا توجد طاولات متاحة',
      ),
    );
  }

  void _showRoomSelectionDialog() {
    final availableRooms = _rooms.where((r) => r['status'] == 'available').toList();
    
    showDialog(
      context: context,
      builder: (context) => _SelectionDialog(
        title: 'اختر الغرفة',
        icon: Icons.meeting_room_rounded,
        items: availableRooms,
        getLabel: (item) => 'غرفة ${item['roomNumber']}',
        getSubtitle: (item) => item['name'] ?? '',
        onSelect: (item) {
          setState(() => _selectedRoom = item);
          final cart = Provider.of<CartProvider>(context, listen: false);
          cart.setRoom(item['roomNumber']?.toString(), id: item['id']);
          Navigator.pop(context);
        },
        emptyMessage: 'لا توجد غرف متاحة',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final responsive = Responsive(context);
    
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Container(
        color: const Color(0xFFF1F5F9),
        child: _buildResponsiveLayout(responsive),
      ),
    );
  }

  Widget _buildResponsiveLayout(Responsive responsive) {
    // Products panel - reused across all layouts
    final productsPanel = _ProductsPanel(
      categories: _categories,
      products: _filteredProducts,
      selectedCategory: _selectedCategory,
      searchQuery: _searchQuery,
      isLoading: _isLoading,
      onCategoryChanged: (cat) => setState(() => _selectedCategory = cat),
      onSearchChanged: (query) => setState(() => _searchQuery = query),
      onProductTap: _handleProductTap,
      onRefresh: _loadData,
      isCompact: responsive.isMobile,
    );

    final cartPanel = _CartPanel(
      onRemoveItem: (id) {
        final cart = Provider.of<CartProvider>(context, listen: false);
        cart.removeItem(id);
      },
      isCompact: responsive.isMobile,
    );

    final orderSummaryPanel = _OrderSummaryPanel(
      orderType: _orderType,
      discountPercent: _discountPercent,
      selectedTable: _selectedTable,
      selectedRoom: _selectedRoom,
      customerNameController: _customerNameController,
      customerPhoneController: _customerPhoneController,
      onOrderTypeChanged: _onOrderTypeChanged,
      onDiscountChanged: (percent) => setState(() => _discountPercent = percent),
      onSelectTable: _showTableSelectionDialog,
      onSelectRoom: _showRoomSelectionDialog,
      onCreateOrder: _handleCreateOrder,
      onPayNow: _handlePayNow,
      isCompact: responsive.isMobile,
    );

    // Large Desktop: 3-column layout (Products | Cart | Order Summary)
    if (responsive.isLargeDesktop) {
      return Row(
        children: [
          Expanded(flex: 5, child: productsPanel),
          Expanded(flex: 3, child: cartPanel),
          Expanded(flex: 3, child: orderSummaryPanel),
        ],
      );
    }
    
    // Desktop: 2-column layout (Products | Cart+Order stacked)
    if (responsive.isDesktop) {
      return Row(
        children: [
          Expanded(flex: 5, child: productsPanel),
          Expanded(
            flex: 4,
            child: Column(
              children: [
                Expanded(flex: 3, child: cartPanel),
                Expanded(flex: 2, child: orderSummaryPanel),
              ],
            ),
          ),
        ],
      );
    }
    
    // Tablet: 2-column layout with smaller panels
    if (responsive.isTablet) {
      return Row(
        children: [
          Expanded(flex: 3, child: productsPanel),
          Expanded(
            flex: 2,
            child: Column(
              children: [
                Expanded(child: cartPanel),
                _buildCompactOrderSummary(orderSummaryPanel),
              ],
            ),
          ),
        ],
      );
    }
    
    // Mobile: Single column with bottom sheet for cart/order
    return Stack(
      children: [
        productsPanel,
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: _MobileCartBar(
            onCartTap: () => _showMobileCartSheet(context, cartPanel, orderSummaryPanel),
          ),
        ),
      ],
    );
  }

  Widget _buildCompactOrderSummary(_OrderSummaryPanel panel) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Consumer<CartProvider>(
        builder: (context, cart, _) {
          return Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'الإجمالي: ${cart.total.toStringAsFixed(3)} ر.ع',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF22C55E),
                      ),
                    ),
                    Text(
                      '${cart.itemCount} عناصر',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: cart.isEmpty ? null : _handlePayNow,
                icon: const Icon(Icons.payment, size: 18),
                label: const Text('دفع'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF22C55E),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showMobileCartSheet(BuildContext context, Widget cartPanel, Widget orderPanel) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.4,
        maxChildSize: 0.95,
        builder: (context, scrollController) {
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                // Handle
                Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                // Cart + Order Summary
                Expanded(
                  child: DefaultTabController(
                    length: 2,
                    child: Column(
                      children: [
                        const TabBar(
                          tabs: [
                            Tab(text: 'السلة'),
                            Tab(text: 'ملخص الطلب'),
                          ],
                          labelColor: Color(0xFF6366F1),
                          unselectedLabelColor: Colors.grey,
                          indicatorColor: Color(0xFF6366F1),
                        ),
                        Expanded(
                          child: TabBarView(
                            children: [
                              cartPanel,
                              SingleChildScrollView(child: orderPanel),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _handleProductTap(ProductModel product) {
    final cart = Provider.of<CartProvider>(context, listen: false);
    
    if (product.hasVariants) {
      _showVariationDialog(product);
    } else {
      cart.addItem(product);
      _showSnackBar('تمت إضافة ${product.nameAr} إلى السلة');
    }
  }

  void _showVariationDialog(ProductModel product) {
    showDialog(
      context: context,
      builder: (context) => _VariationDialog(
        product: product,
        onAdd: (variation, notes) {
          final cart = Provider.of<CartProvider>(context, listen: false);
          cart.addItem(product, variation: variation, notes: notes);
          Navigator.pop(context);
          _showSnackBar('تمت إضافة ${product.nameAr} إلى السلة');
        },
      ),
    );
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Future<void> _handleCreateOrder() async {
    final cart = Provider.of<CartProvider>(context, listen: false);
    final auth = Provider.of<AuthProvider>(context, listen: false);

    if (cart.isEmpty) {
      _showSnackBar('السلة فارغة');
      return;
    }

    // Validate table/room selection
    if (_orderType == 'table' && _selectedTable == null) {
      _showSnackBar('يرجى اختيار الطاولة');
      _showTableSelectionDialog();
      return;
    }

    if (_orderType == 'room' && _selectedRoom == null) {
      _showSnackBar('يرجى اختيار الغرفة');
      _showRoomSelectionDialog();
      return;
    }

    cart.setOrderType(_orderType);
    cart.setCustomerName(_customerNameController.text);

    final orderId = await cart.submitOrder(
      workerId: auth.user?.uid ?? '',
      workerName: auth.user?.fullName ?? '',
    );

    if (orderId != null) {
      _showSnackBar('تم إنشاء الطلب بنجاح');
      _customerNameController.clear();
      _customerPhoneController.clear();
      setState(() {
        _discountPercent = 0;
        _orderType = 'table';
        _selectedTable = null;
        _selectedRoom = null;
      });
      // Reload tables/rooms to update availability
      _loadData();
    } else if (cart.error != null) {
      _showSnackBar(cart.error!);
    }
  }

  Future<void> _handlePayNow() async {
    await _handleCreateOrder();
  }
}

// ==================== Selection Dialog ====================
class _SelectionDialog extends StatelessWidget {

  const _SelectionDialog({
    required this.title,
    required this.icon,
    required this.items,
    required this.getLabel,
    required this.getSubtitle,
    required this.onSelect,
    required this.emptyMessage,
  });
  final String title;
  final IconData icon;
  final List<Map<String, dynamic>> items;
  final String Function(Map<String, dynamic>) getLabel;
  final String Function(Map<String, dynamic>) getSubtitle;
  final ValueChanged<Map<String, dynamic>> onSelect;
  final String emptyMessage;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Directionality(
        textDirection: TextDirection.rtl,
        child: Container(
          width: 400,
          constraints: const BoxConstraints(maxHeight: 500),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.1),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icon, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              
              // Content
              Flexible(
                child: items.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(40),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.info_outline,
                              size: 48,
                              color: Colors.grey.shade400,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              emptyMessage,
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        shrinkWrap: true,
                        padding: const EdgeInsets.all(16),
                        itemCount: items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, index) {
                          final item = items[index];
                          return _SelectionItem(
                            label: getLabel(item),
                            subtitle: getSubtitle(item),
                            onTap: () => onSelect(item),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SelectionItem extends StatefulWidget {

  const _SelectionItem({
    required this.label,
    required this.subtitle,
    required this.onTap,
  });
  final String label;
  final String subtitle;
  final VoidCallback onTap;

  @override
  State<_SelectionItem> createState() => _SelectionItemState();
}

class _SelectionItemState extends State<_SelectionItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _isHovered ? const Color(0xFF6366F1).withOpacity(0.1) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: _isHovered ? const Color(0xFF6366F1) : const Color(0xFFE2E8F0),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF22C55E).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.check_circle,
                  color: Color(0xFF22C55E),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.label,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    if (widget.subtitle.isNotEmpty)
                      Text(
                        widget.subtitle,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade500,
                        ),
                      ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: Colors.grey.shade400,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ==================== Mobile Cart Bar ====================
class _MobileCartBar extends StatelessWidget {

  const _MobileCartBar({required this.onCartTap});
  final VoidCallback onCartTap;

  @override
  Widget build(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (context, cart, _) {
        if (cart.isEmpty) return const SizedBox.shrink();
        
        return Container(
          margin: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF6366F1),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF6366F1).withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onCartTap,
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${cart.itemCount}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'عرض السلة',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Text(
                      '${cart.total.toStringAsFixed(3)} ر.ع',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_upward, color: Colors.white),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

// ==================== Products Panel ====================
class _ProductsPanel extends StatelessWidget {

  const _ProductsPanel({
    required this.categories,
    required this.products,
    required this.selectedCategory,
    required this.searchQuery,
    required this.isLoading,
    this.isCompact = false,
    required this.onCategoryChanged,
    required this.onSearchChanged,
    required this.onProductTap,
    required this.onRefresh,
  });
  final List<CategoryModel> categories;
  final List<ProductModel> products;
  final String selectedCategory;
  final String searchQuery;
  final bool isLoading;
  final bool isCompact;
  final ValueChanged<String> onCategoryChanged;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<ProductModel> onProductTap;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: TextField(
                onChanged: onSearchChanged,
                textDirection: TextDirection.rtl,
                decoration: InputDecoration(
                  hintText: 'ابحث عن منتج ...',
                  hintStyle: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 14,
                  ),
                  prefixIcon: Icon(
                    Icons.search,
                    color: Colors.grey.shade400,
                    size: 20,
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                ),
              ),
            ),
          ),

          // Categories
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              height: 40,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                reverse: true,
                itemCount: categories.length + 1,
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return _CategoryChip(
                      label: 'الكل',
                      isSelected: selectedCategory == 'all',
                      onTap: () => onCategoryChanged('all'),
                    );
                  }
                  final category = categories[index - 1];
                  return _CategoryChip(
                    label: category.nameAr,
                    isSelected: selectedCategory == category.id,
                    onTap: () => onCategoryChanged(category.id),
                    hasIndicator: true,
                  );
                },
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Products Grid
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : products.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.inventory_2_outlined,
                              size: 64,
                              color: Colors.grey.shade300,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'لا توجد منتجات',
                              style: TextStyle(
                                color: Colors.grey.shade500,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 4,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 0.85,
                        ),
                        itemCount: products.length,
                        itemBuilder: (context, index) {
                          return _ProductCard(
                            product: products[index],
                            onTap: () => onProductTap(products[index]),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {

  const _CategoryChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.hasIndicator = false,
  });
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final bool hasIndicator;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFF6366F1) : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (hasIndicator && !isSelected) ...[
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Color(0xFF22C55E),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                ],
                Text(
                  label,
                  style: TextStyle(
                    color: isSelected ? Colors.white : const Color(0xFF64748B),
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ProductCard extends StatefulWidget {

  const _ProductCard({
    required this.product,
    required this.onTap,
  });
  final ProductModel product;
  final VoidCallback onTap;

  @override
  State<_ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<_ProductCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _isHovered ? const Color(0xFF6366F1) : const Color(0xFFE2E8F0),
            ),
            boxShadow: _isHovered
                ? [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withOpacity(0.15),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Column(
            children: [
              // Product Image/Emoji
              Expanded(
                flex: 3,
                child: Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
                  ),
                  child: Center(
                    child: widget.product.imageUrl != null &&
                            widget.product.imageUrl!.isNotEmpty
                        ? ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(15),
                            ),
                            child: Image.network(
                              widget.product.imageUrl!,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              height: double.infinity,
                              errorBuilder: (_, __, ___) => _buildEmoji(),
                            ),
                          )
                        : _buildEmoji(),
                  ),
                ),
              ),
              // Product Info
              Expanded(
                flex: 2,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          widget.product.nameAr,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1E293B),
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.product.hasVariants
                            ? 'من ${widget.product.minPrice.toStringAsFixed(3)} ر.ع'
                            : '${widget.product.price.toStringAsFixed(3)} ر.ع',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF22C55E),
                        ),
                      ),
                      if (widget.product.hasVariants)
                        Text(
                          'خيارات',
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.grey.shade500,
                          ),
                        ),
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

  Widget _buildEmoji() {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: const Color(0xFF6366F1).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Text(
          widget.product.emoji ?? '☕',
          style: const TextStyle(fontSize: 28),
        ),
      ),
    );
  }
}

// ==================== Cart Panel ====================
class _CartPanel extends StatelessWidget {

  const _CartPanel({required this.onRemoveItem, this.isCompact = false});
  final ValueChanged<String> onRemoveItem;
  final bool isCompact;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  Icons.shopping_cart_outlined,
                  color: Colors.grey.shade600,
                  size: 20,
                ),
                const SizedBox(width: 8),
                const Text(
                  'السلة',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
          ),
          
          Divider(height: 1, color: Colors.grey.shade200),
          
          // Cart Items
          Expanded(
            child: Consumer<CartProvider>(
              builder: (context, cart, child) {
                if (cart.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.shopping_cart_outlined,
                          size: 64,
                          color: Colors.grey.shade300,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'السلة فارغة',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'أضف منتجات لإضافتها',
                          style: TextStyle(
                            color: Colors.grey.shade400,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: cart.items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = cart.items[index];
                    return _CartItemWidget(
                      item: item,
                      onIncrement: () => cart.incrementItem(item.id),
                      onDecrement: () => cart.decrementItem(item.id),
                      onRemove: () => onRemoveItem(item.id),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CartItemWidget extends StatelessWidget {

  const _CartItemWidget({
    required this.item,
    required this.onIncrement,
    required this.onDecrement,
    required this.onRemove,
  });
  final CartItem item;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Product info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.displayName,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${item.price.toStringAsFixed(3)} ر.ع',
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF22C55E),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          
          // Quantity controls
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                _QtyButton(icon: Icons.remove, onTap: onDecrement),
                Container(
                  width: 32,
                  alignment: Alignment.center,
                  child: Text(
                    '${item.quantity}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
                _QtyButton(icon: Icons.add, onTap: onIncrement),
              ],
            ),
          ),
          
          const SizedBox(width: 8),
          
          // Remove button
          IconButton(
            onPressed: onRemove,
            icon: Icon(
              Icons.delete_outline,
              color: Colors.red.shade400,
              size: 20,
            ),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {

  const _QtyButton({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        alignment: Alignment.center,
        child: Icon(icon, size: 16, color: const Color(0xFF64748B)),
      ),
    );
  }
}

// ==================== Order Summary Panel ====================
class _OrderSummaryPanel extends StatelessWidget {

  const _OrderSummaryPanel({
    required this.orderType,
    required this.discountPercent,
    required this.selectedTable,
    required this.selectedRoom,
    required this.customerNameController,
    required this.customerPhoneController,
    required this.onOrderTypeChanged,
    required this.onDiscountChanged,
    required this.onSelectTable,
    required this.onSelectRoom,
    required this.onCreateOrder,
    required this.onPayNow,
    this.isCompact = false,
  });
  final String orderType;
  final int discountPercent;
  final Map<String, dynamic>? selectedTable;
  final Map<String, dynamic>? selectedRoom;
  final TextEditingController customerNameController;
  final TextEditingController customerPhoneController;
  final ValueChanged<String> onOrderTypeChanged;
  final ValueChanged<int> onDiscountChanged;
  final VoidCallback onSelectTable;
  final VoidCallback onSelectRoom;
  final VoidCallback onCreateOrder;
  final VoidCallback onPayNow;
  final bool isCompact;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(0, 16, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  Icons.receipt_long_outlined,
                  color: Colors.grey.shade600,
                  size: 20,
                ),
                const SizedBox(width: 8),
                const Text(
                  'ملخص الطلب',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
          ),
          
          Divider(height: 1, color: Colors.grey.shade200),
          
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Order Type
                  const Text(
                    'نوع الطلب',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _OrderTypeButton(
                          icon: Icons.table_restaurant_outlined,
                          label: 'طاولة',
                          isSelected: orderType == 'table',
                          onTap: () => onOrderTypeChanged('table'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _OrderTypeButton(
                          icon: Icons.meeting_room_outlined,
                          label: 'غرفة',
                          isSelected: orderType == 'room',
                          onTap: () => onOrderTypeChanged('room'),
                        ),
                      ),
                    ],
                  ),
                  
                  // Table/Room Selection
                  if (orderType == 'table') ...[
                    const SizedBox(height: 16),
                    _SelectionButton(
                      label: selectedTable != null 
                          ? 'طاولة ${selectedTable!['tableNumber']}'
                          : 'اختر الطاولة',
                      icon: Icons.table_restaurant_rounded,
                      isSelected: selectedTable != null,
                      onTap: onSelectTable,
                    ),
                  ],
                  
                  if (orderType == 'room') ...[
                    const SizedBox(height: 16),
                    _SelectionButton(
                      label: selectedRoom != null 
                          ? 'غرفة ${selectedRoom!['roomNumber']}'
                          : 'اختر الغرفة',
                      icon: Icons.meeting_room_rounded,
                      isSelected: selectedRoom != null,
                      onTap: onSelectRoom,
                    ),
                  ],
                  
                  const SizedBox(height: 20),
                  
                  // Customer Info
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.person_outline, size: 14, color: Colors.grey.shade500),
                                const SizedBox(width: 4),
                                Text(
                                  'اسم العميل',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade500,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            _InputField(
                              controller: customerNameController,
                              hint: 'اختياري',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.phone_outlined, size: 14, color: Colors.grey.shade500),
                                const SizedBox(width: 4),
                                Text(
                                  'الهاتف',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade500,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            _InputField(
                              controller: customerPhoneController,
                              hint: 'اختياري',
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Discount
                  Row(
                    children: [
                      Text(
                        'خصم (%)',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const Spacer(),
                      Icon(Icons.percent, size: 14, color: Colors.grey.shade400),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [0, 5, 10, 15, 20].map((percent) {
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 3),
                          child: _DiscountButton(
                            percent: percent,
                            isSelected: discountPercent == percent,
                            onTap: () => onDiscountChanged(percent),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ),
          
          // Summary
          Consumer<CartProvider>(
            builder: (context, cart, child) {
              final subtotal = cart.subtotal;
              final discount = subtotal * (discountPercent / 100);
              final total = subtotal - discount;

              return Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.vertical(
                    bottom: Radius.circular(16),
                  ),
                ),
                child: Column(
                  children: [
                    // Subtotal
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'المجموع الفرعي',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade600,
                          ),
                        ),
                        Text(
                          '${subtotal.toStringAsFixed(3)} ر.ع',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                    
                    if (discountPercent > 0) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'الخصم ($discountPercent%)',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.red.shade400,
                            ),
                          ),
                          Text(
                            '-${discount.toStringAsFixed(3)} ر.ع',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.red.shade400,
                            ),
                          ),
                        ],
                      ),
                    ],
                    
                    const SizedBox(height: 12),
                    
                    // Total
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'الإجمالي',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        Text(
                          '${total.toStringAsFixed(3)} ر.ع',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF22C55E),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Buttons
                    Row(
                      children: [
                        Expanded(
                          child: _ActionButton(
                            label: 'دفع الآن',
                            color: const Color(0xFFDCFCE7),
                            textColor: const Color(0xFF22C55E),
                            onTap: onPayNow,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _ActionButton(
                            label: 'إنشاء طلب',
                            color: const Color(0xFF8B5CF6).withOpacity(0.15),
                            textColor: const Color(0xFF8B5CF6),
                            onTap: onCreateOrder,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _SelectionButton extends StatelessWidget {

  const _SelectionButton({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: isSelected
                ? const Color(0xFF22C55E).withOpacity(0.1)
                : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? const Color(0xFF22C55E) : const Color(0xFFE2E8F0),
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                size: 20,
                color: isSelected ? const Color(0xFF22C55E) : Colors.grey.shade500,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: isSelected ? const Color(0xFF22C55E) : Colors.grey.shade600,
                  ),
                ),
              ),
              Icon(
                isSelected ? Icons.check_circle : Icons.arrow_drop_down,
                size: 20,
                color: isSelected ? const Color(0xFF22C55E) : Colors.grey.shade400,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OrderTypeButton extends StatelessWidget {

  const _OrderTypeButton({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF8B5CF6).withOpacity(0.1) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? const Color(0xFF8B5CF6) : const Color(0xFFE2E8F0),
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                size: 22,
                color: isSelected ? const Color(0xFF8B5CF6) : Colors.grey.shade500,
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: isSelected ? const Color(0xFF8B5CF6) : Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InputField extends StatelessWidget {

  const _InputField({
    required this.controller,
    required this.hint,
  });
  final TextEditingController controller;
  final String hint;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: TextField(
        controller: controller,
        textDirection: TextDirection.rtl,
        style: const TextStyle(fontSize: 13),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(
            color: Colors.grey.shade400,
            fontSize: 13,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 10,
          ),
        ),
      ),
    );
  }
}

class _DiscountButton extends StatelessWidget {

  const _DiscountButton({
    required this.percent,
    required this.isSelected,
    required this.onTap,
  });
  final int percent;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
            ),
          ),
          child: Center(
            child: Text(
              '$percent%',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : Colors.grey.shade600,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {

  const _ActionButton({
    required this.label,
    required this.color,
    required this.textColor,
    required this.onTap,
  });
  final String label;
  final Color color;
  final Color textColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ==================== Variation Dialog ====================
class _VariationDialog extends StatefulWidget {

  const _VariationDialog({
    required this.product,
    required this.onAdd,
  });
  final ProductModel product;
  final Function(ProductVariant?, String?) onAdd;

  @override
  State<_VariationDialog> createState() => _VariationDialogState();
}

class _VariationDialogState extends State<_VariationDialog> {
  ProductVariant? _selectedVariant;
  final TextEditingController _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedVariant = widget.product.defaultVariation;
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Directionality(
        textDirection: TextDirection.rtl,
        child: Container(
          width: 400,
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        widget.product.emoji ?? '☕',
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
                          widget.product.nameAr,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'اختر الحجم أو النوع',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              
              const SizedBox(height: 20),
              
              // Variations
              ...widget.product.variants.map((variant) {
                final isSelected = _selectedVariant?.id == variant.id;
                final price = widget.product.price + variant.priceModifier;
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => setState(() => _selectedVariant = variant),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF6366F1).withOpacity(0.1)
                              : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF6366F1)
                                : const Color(0xFFE2E8F0),
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Row(
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
                                      : Colors.grey.shade400,
                                  width: 2,
                                ),
                              ),
                              child: isSelected
                                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                                  : null,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                variant.nameAr,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                  color: isSelected
                                      ? const Color(0xFF6366F1)
                                      : const Color(0xFF1E293B),
                                ),
                              ),
                            ),
                            Text(
                              '${price.toStringAsFixed(3)} ر.ع',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: isSelected
                                    ? const Color(0xFF6366F1)
                                    : const Color(0xFF22C55E),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }),
              
              const SizedBox(height: 16),
              
              // Notes
              Text(
                'ملاحظات (اختياري)',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _notesController,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'مثال: بدون سكر...',
                  hintStyle: TextStyle(color: Colors.grey.shade400),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: Colors.grey.shade200),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: Colors.grey.shade200),
                  ),
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Add Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    widget.onAdd(
                      _selectedVariant,
                      _notesController.text.isNotEmpty ? _notesController.text : null,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  icon: const Icon(Icons.add_shopping_cart),
                  label: const Text(
                    'إضافة إلى السلة',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
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
