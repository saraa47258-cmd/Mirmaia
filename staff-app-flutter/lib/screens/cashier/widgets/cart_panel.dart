import 'package:flutter/material.dart';
import '../../../models/cart_model.dart';
import '../../../models/order_model.dart';

/// Cart panel widget for POS
class CartPanel extends StatelessWidget {

  const CartPanel({
    super.key,
    required this.cart,
    required this.orderType,
    required this.onOrderTypeChanged,
    required this.onQuantityChanged,
    required this.onRemoveItem,
    required this.onNotesChanged,
    required this.onClearCart,
    required this.onApplyDiscount,
  });
  final Cart cart;
  final OrderType orderType;
  final ValueChanged<OrderType> onOrderTypeChanged;
  final void Function(String itemId, int newQuantity) onQuantityChanged;
  final ValueChanged<String> onRemoveItem;
  final void Function(String itemId, String notes) onNotesChanged;
  final VoidCallback onClearCart;
  final ValueChanged<double> onApplyDiscount;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header
        _buildHeader(context),
        
        // Order type selector
        _buildOrderTypeSelector(),
        
        // Cart items
        Expanded(
          child: cart.isEmpty
              ? _buildEmptyCart()
              : _buildCartItems(),
        ),
        
        // Summary
        _buildSummary(context),
      ],
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F6FA),
        border: Border(
          bottom: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.shopping_cart_outlined, color: Color(0xFF1E293B)),
          const SizedBox(width: 12),
          const Text(
            'السلة',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const Spacer(),
          if (cart.items.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFD4A574),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${cart.itemCount}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.red),
              onPressed: onClearCart,
              tooltip: 'مسح السلة',
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOrderTypeSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          _OrderTypeButton(
            label: 'محلي',
            icon: Icons.restaurant,
            isSelected: orderType == OrderType.dineIn,
            onTap: () => onOrderTypeChanged(OrderType.dineIn),
          ),
          const SizedBox(width: 8),
          _OrderTypeButton(
            label: 'سفري',
            icon: Icons.takeout_dining,
            isSelected: orderType == OrderType.takeaway,
            onTap: () => onOrderTypeChanged(OrderType.takeaway),
          ),
          const SizedBox(width: 8),
          _OrderTypeButton(
            label: 'توصيل',
            icon: Icons.delivery_dining,
            isSelected: orderType == OrderType.delivery,
            onTap: () => onOrderTypeChanged(OrderType.delivery),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyCart() {
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
              color: Colors.grey.shade500,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'اختر منتجات لإضافتها',
            style: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItems() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: cart.items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final item = cart.items[index];
        return _CartItemCard(
          item: item,
          onQuantityChanged: (qty) => onQuantityChanged(item.id, qty),
          onRemove: () => onRemoveItem(item.id),
          onNotesChanged: (notes) => onNotesChanged(item.id, notes),
        );
      },
    );
  }

  Widget _buildSummary(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: Colors.grey.shade200),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Discount button
          if (cart.items.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showDiscountDialog(context),
                      icon: const Icon(Icons.discount_outlined, size: 18),
                      label: const Text('خصم'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF3B82F6),
                        side: const BorderSide(color: Color(0xFF3B82F6)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          
          // Subtotal
          _SummaryRow(
            label: 'المجموع الفرعي',
            value: cart.subtotal,
          ),
          
          // Discount
          if (cart.totalDiscount > 0)
            _SummaryRow(
              label: 'الخصم',
              value: -cart.totalDiscount,
              isDiscount: true,
            ),
          
          // Tax
          _SummaryRow(
            label: 'الضريبة (15%)',
            value: cart.taxAmount,
          ),
          
          const Divider(height: 24),
          
          // Total
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'الإجمالي',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${cart.grandTotal.toStringAsFixed(2)} ر.س',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFD4A574),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showDiscountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => _DiscountDialog(
        currentDiscount: cart.discountPercent,
        onApply: onApplyDiscount,
      ),
    );
  }
}

class _OrderTypeButton extends StatelessWidget {

  const _OrderTypeButton({
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
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              color: isSelected
                  ? const Color(0xFFD4A574).withOpacity(0.1)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isSelected
                    ? const Color(0xFFD4A574)
                    : Colors.grey.shade300,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  icon,
                  size: 20,
                  color: isSelected
                      ? const Color(0xFFD4A574)
                      : Colors.grey.shade600,
                ),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected
                        ? const Color(0xFFD4A574)
                        : Colors.grey.shade600,
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

class _CartItemCard extends StatelessWidget {

  const _CartItemCard({
    required this.item,
    required this.onQuantityChanged,
    required this.onRemove,
    required this.onNotesChanged,
  });
  final CartItem item;
  final ValueChanged<int> onQuantityChanged;
  final VoidCallback onRemove;
  final ValueChanged<String> onNotesChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.displayName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    if (item.addonsSummary.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          '+ ${item.addonsSummary}',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              
              // Remove button
              IconButton(
                icon: Icon(Icons.close, size: 18, color: Colors.grey.shade400),
                onPressed: onRemove,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          Row(
            children: [
              // Quantity controls
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _QuantityButton(
                      icon: Icons.remove,
                      onTap: () => onQuantityChanged(item.quantity - 1),
                    ),
                    Container(
                      width: 40,
                      alignment: Alignment.center,
                      child: Text(
                        '${item.quantity}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    _QuantityButton(
                      icon: Icons.add,
                      onTap: () => onQuantityChanged(item.quantity + 1),
                    ),
                  ],
                ),
              ),
              
              // Notes button
              IconButton(
                icon: Icon(
                  item.notes?.isNotEmpty == true
                      ? Icons.sticky_note_2
                      : Icons.sticky_note_2_outlined,
                  size: 20,
                  color: item.notes?.isNotEmpty == true
                      ? const Color(0xFF3B82F6)
                      : Colors.grey.shade400,
                ),
                onPressed: () => _showNotesDialog(context),
              ),
              
              const Spacer(),
              
              // Price
              Text(
                '${item.totalPrice.toStringAsFixed(2)} ر.س',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Color(0xFF1E293B),
                ),
              ),
            ],
          ),
          
          // Notes display
          if (item.notes?.isNotEmpty == true)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.note, size: 14, color: Color(0xFFD97706)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item.notes!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFFD97706),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _showNotesDialog(BuildContext context) {
    final controller = TextEditingController(text: item.notes ?? '');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ملاحظات', textAlign: TextAlign.right),
        content: TextField(
          controller: controller,
          textAlign: TextAlign.right,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'أضف ملاحظات للمنتج...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              onNotesChanged(controller.text);
              Navigator.pop(context);
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }
}

class _QuantityButton extends StatelessWidget {

  const _QuantityButton({
    required this.icon,
    required this.onTap,
  });
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        width: 32,
        height: 32,
        alignment: Alignment.center,
        child: Icon(icon, size: 18, color: Colors.grey.shade700),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isDiscount = false,
  });
  final String label;
  final double value;
  final bool isDiscount;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 14,
            ),
          ),
          Text(
            '${value.toStringAsFixed(2)} ر.س',
            style: TextStyle(
              color: isDiscount ? Colors.green : Colors.grey.shade800,
              fontWeight: FontWeight.w500,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

class _DiscountDialog extends StatefulWidget {

  const _DiscountDialog({
    required this.currentDiscount,
    required this.onApply,
  });
  final double currentDiscount;
  final ValueChanged<double> onApply;

  @override
  State<_DiscountDialog> createState() => _DiscountDialogState();
}

class _DiscountDialogState extends State<_DiscountDialog> {
  late double _selectedDiscount;

  @override
  void initState() {
    super.initState();
    _selectedDiscount = widget.currentDiscount;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('تطبيق خصم', textAlign: TextAlign.right),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [0, 5, 10, 15, 20, 25].map((percent) {
              final isSelected = _selectedDiscount == percent.toDouble();
              return ChoiceChip(
                label: Text('$percent%'),
                selected: isSelected,
                onSelected: (_) {
                  setState(() => _selectedDiscount = percent.toDouble());
                },
                selectedColor: const Color(0xFFD4A574),
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : Colors.black,
                ),
              );
            }).toList(),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('إلغاء'),
        ),
        ElevatedButton(
          onPressed: () {
            widget.onApply(_selectedDiscount);
            Navigator.pop(context);
          },
          child: const Text('تطبيق'),
        ),
      ],
    );
  }
}



