import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../services/firestore_service.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/product_card.dart';
import '../widgets/cart_sidebar.dart';
import '../widgets/variation_dialog.dart';
import '../theme/app_theme.dart';

class StaffMenuScreen extends StatefulWidget {
  const StaffMenuScreen({super.key});

  @override
  State<StaffMenuScreen> createState() => _StaffMenuScreenState();
}

class _StaffMenuScreenState extends State<StaffMenuScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  final TextEditingController _searchController = TextEditingController();
  
  List<CategoryModel> _categories = [];
  List<ProductModel> _products = [];
  bool _isLoading = true;
  String _selectedCategory = 'all';
  String _searchQuery = '';
  bool _showCart = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    try {
      final categories = await _firestoreService.getCategories();
      final products = await _firestoreService.getProducts();
      
      setState(() {
        _categories = categories;
        _products = products;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ في تحميل البيانات: $e')),
        );
      }
    }
  }

  List<ProductModel> get _filteredProducts {
    return _products.where((product) {
      // Category filter
      if (_selectedCategory != 'all' && 
          product.category != _selectedCategory &&
          product.categoryId != _selectedCategory) {
        return false;
      }
      
      // Search filter
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        return product.name.toLowerCase().contains(query) ||
            (product.description?.toLowerCase().contains(query) ?? false);
      }
      
      return true;
    }).toList();
  }

  void _handleAddToCart(ProductModel product) {
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    
    if (product.hasVariations) {
      // Show variation dialog
      showDialog(
        context: context,
        builder: (context) => VariationDialog(
          product: product,
          onAdd: (variation, notes) {
            cartProvider.addItem(product, variation: variation, notes: notes);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('تمت إضافة ${product.name} - ${variation.name}'),
                duration: const Duration(seconds: 1),
              ),
            );
          },
        ),
      );
    } else {
      cartProvider.addItem(product);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('تمت إضافة ${product.name}'),
          duration: const Duration(seconds: 1),
        ),
      );
    }
  }

  Future<void> _submitOrder() async {
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    final orderId = await cartProvider.submitOrder(
      workerId: authProvider.user?.uid ?? '',
      workerName: authProvider.user?.fullName ?? '',
    );
    
    if (orderId != null && mounted) {
      setState(() => _showCart = false);
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          icon: const Icon(Icons.check_circle, color: AppTheme.successColor, size: 48),
          title: const Text('تم إرسال الطلب'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'رقم الطلب: #${orderId.substring(orderId.length - 6).toUpperCase()}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'الحالة: قيد الانتظار',
                style: TextStyle(color: AppTheme.lightTextSecondary),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('حسناً'),
            ),
          ],
        ),
      );
    } else if (cartProvider.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(cartProvider.error!),
          backgroundColor: AppTheme.errorColor,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context);
    
    return Scaffold(
      backgroundColor: AppTheme.lightBackground,
      appBar: AppBar(
        title: const Text('منيو الموظفين'),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          // Cart Button
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () => setState(() => _showCart = true),
              ),
              if (cartProvider.itemCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppTheme.errorColor,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      cartProvider.itemCount.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Search Bar
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.white,
                child: TextField(
                  controller: _searchController,
                  onChanged: (value) => setState(() => _searchQuery = value),
                  decoration: InputDecoration(
                    hintText: 'ابحث عن منتج...',
                    prefixIcon: const Icon(Icons.search, color: AppTheme.lightTextSecondary),
                    filled: true,
                    fillColor: AppTheme.lightBackground,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
              ),
              
              // Categories
              Container(
                height: 56,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(
                    bottom: BorderSide(color: Colors.grey[200]!),
                  ),
                ),
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _CategoryChip(
                      label: 'الكل',
                      isSelected: _selectedCategory == 'all',
                      onTap: () => setState(() => _selectedCategory = 'all'),
                    ),
                    ..._categories.map((category) => _CategoryChip(
                      label: category.name,
                      icon: category.icon,
                      isSelected: _selectedCategory == category.id,
                      onTap: () => setState(() => _selectedCategory = category.id),
                    )),
                  ],
                ),
              ),
              
              // Products Grid
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _filteredProducts.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[400]),
                                const SizedBox(height: 16),
                                Text(
                                  'لا توجد منتجات',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _loadData,
                            child: GridView.builder(
                              padding: const EdgeInsets.all(16),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                mainAxisSpacing: 16,
                                crossAxisSpacing: 16,
                                childAspectRatio: 0.85,
                              ),
                              itemCount: _filteredProducts.length,
                              itemBuilder: (context, index) {
                                final product = _filteredProducts[index];
                                return ProductCard(
                                  product: product,
                                  onAdd: () => _handleAddToCart(product),
                                );
                              },
                            ),
                          ),
              ),
            ],
          ),
          
          // Cart Sidebar
          if (_showCart)
            CartSidebar(
              onClose: () => setState(() => _showCart = false),
              onSubmit: _submitOrder,
            ),
        ],
      ),
      
      // Floating Cart Button
      floatingActionButton: cartProvider.isNotEmpty
          ? FloatingActionButton.extended(
              onPressed: () => setState(() => _showCart = true),
              backgroundColor: AppTheme.primaryColor,
              icon: const Icon(Icons.shopping_cart),
              label: Text(
                '${cartProvider.total.toStringAsFixed(3)} ر.ع',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
            )
          : null,
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final String? icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 8),
      child: FilterChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Text(icon!, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 6),
            ],
            Text(label),
          ],
        ),
        selected: isSelected,
        onSelected: (_) => onTap(),
        selectedColor: AppTheme.primaryColor.withOpacity(0.1),
        checkmarkColor: AppTheme.primaryColor,
        labelStyle: TextStyle(
          color: isSelected ? AppTheme.primaryColor : AppTheme.lightText,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? AppTheme.primaryColor : Colors.grey[300]!,
          ),
        ),
      ),
    );
  }
}

