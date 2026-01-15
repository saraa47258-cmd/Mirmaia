import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../theme/app_theme.dart';

class CartSidebar extends StatefulWidget {
  final VoidCallback onClose;
  final VoidCallback onSubmit;

  const CartSidebar({
    super.key,
    required this.onClose,
    required this.onSubmit,
  });

  @override
  State<CartSidebar> createState() => _CartSidebarState();
}

class _CartSidebarState extends State<CartSidebar> {
  final TextEditingController _tableController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    _tableController.text = cartProvider.tableNumber ?? '';
  }

  @override
  void dispose() {
    _tableController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Overlay
        GestureDetector(
          onTap: widget.onClose,
          child: Container(
            color: Colors.black.withOpacity(0.5),
          ),
        ),
        
        // Sidebar
        Positioned(
          top: 0,
          bottom: 0,
          left: 0,
          width: 400,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(4, 0),
                ),
              ],
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
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              AppTheme.primaryColor,
                              AppTheme.secondaryColor,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.shopping_cart,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Consumer<CartProvider>(
                        builder: (context, cart, _) => Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'الطلب',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.lightText,
                              ),
                            ),
                            Text(
                              '${cart.itemCount} صنف',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: widget.onClose,
                        icon: const Icon(Icons.close),
                        style: IconButton.styleFrom(
                          backgroundColor: AppTheme.lightBackground,
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Table Input
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: Colors.grey[200]!),
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
                          color: AppTheme.lightTextSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Consumer<CartProvider>(
                        builder: (context, cart, _) => TextField(
                          controller: _tableController,
                          onChanged: (value) => cart.setTable(value),
                          decoration: InputDecoration(
                            hintText: 'مثال: طاولة 5، غرفة VIP...',
                            filled: true,
                            fillColor: AppTheme.lightBackground,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Items List
                Expanded(
                  child: Consumer<CartProvider>(
                    builder: (context, cart, _) {
                      if (cart.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.shopping_cart_outlined,
                                size: 64,
                                color: Colors.grey[400],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'السلة فارغة',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        );
                      }

                      return ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: cart.items.length,
                        itemBuilder: (context, index) {
                          final item = cart.items[index];
                          return _CartItemCard(item: item);
                        },
                      );
                    },
                  ),
                ),
                
                // Footer
                Consumer<CartProvider>(
                  builder: (context, cart, _) {
                    if (cart.isEmpty) return const SizedBox.shrink();

                    return Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppTheme.lightBackground,
                        border: Border(
                          top: BorderSide(color: Colors.grey[200]!),
                        ),
                      ),
                      child: Column(
                        children: [
                          // Total
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'الإجمالي',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.lightText,
                                ),
                              ),
                              Text(
                                '${cart.total.toStringAsFixed(3)} ر.ع',
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.lightText,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          
                          // Submit Button
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: cart.isSubmitting ||
                                      (cart.tableNumber?.isEmpty ?? true)
                                  ? null
                                  : widget.onSubmit,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryColor,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                disabledBackgroundColor: Colors.grey[300],
                              ),
                              child: cart.isSubmitting
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(
                                          Colors.white,
                                        ),
                                      ),
                                    )
                                  : const Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.send),
                                        SizedBox(width: 8),
                                        Text(
                                          'إرسال الطلب',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                            ),
                          ),
                          
                          if ((cart.tableNumber?.isEmpty ?? true))
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(
                                'يرجى إدخال رقم الطاولة',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.orange[700],
                                ),
                              ),
                            ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _CartItemCard extends StatelessWidget {
  final CartItem item;

  const _CartItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context, listen: false);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.lightBackground,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Product Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.product.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.lightText,
                      ),
                    ),
                    if (item.variation != null)
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          item.variation!.name,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ),
                    const SizedBox(height: 4),
                    Text(
                      '${item.price.toStringAsFixed(3)} ر.ع',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.successColor,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Remove Button
              IconButton(
                onPressed: () => cartProvider.removeItem(item.id),
                icon: const Icon(Icons.delete_outline),
                iconSize: 20,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.red.withOpacity(0.1),
                  foregroundColor: Colors.red,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          
          // Quantity Controls
          Row(
            children: [
              // Quantity
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => cartProvider.decrementItem(item.id),
                      icon: const Icon(Icons.remove, size: 18),
                      iconSize: 18,
                      constraints: const BoxConstraints(
                        minWidth: 36,
                        minHeight: 36,
                      ),
                      style: IconButton.styleFrom(
                        foregroundColor: Colors.red,
                      ),
                    ),
                    SizedBox(
                      width: 32,
                      child: Text(
                        item.quantity.toString(),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => cartProvider.incrementItem(item.id),
                      icon: const Icon(Icons.add, size: 18),
                      iconSize: 18,
                      constraints: const BoxConstraints(
                        minWidth: 36,
                        minHeight: 36,
                      ),
                      style: IconButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              
              const Spacer(),
              
              // Line Total
              Text(
                '${item.total.toStringAsFixed(3)} ر.ع',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.lightText,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

