import 'package:flutter/material.dart';
import '../../../models/product_model.dart';

/// Dialog for selecting product options (variants and addons)
class ProductOptionsDialog extends StatefulWidget {

  const ProductOptionsDialog({
    super.key,
    required this.product,
    required this.onConfirm,
  });
  final ProductModel product;
  final void Function(ProductVariant? variant, List<ProductAddon> addons) onConfirm;

  @override
  State<ProductOptionsDialog> createState() => _ProductOptionsDialogState();
}

class _ProductOptionsDialogState extends State<ProductOptionsDialog> {
  ProductVariant? _selectedVariant;
  final Set<String> _selectedAddonIds = {};

  @override
  void initState() {
    super.initState();
    // Pre-select first variant if available
    if (widget.product.variants.isNotEmpty) {
      _selectedVariant = widget.product.variants.first;
    }
  }

  double get _totalPrice {
    double price = widget.product.price;
    if (_selectedVariant != null) {
      price += _selectedVariant!.priceModifier;
    }
    for (final addon in widget.product.addons) {
      if (_selectedAddonIds.contains(addon.id)) {
        price += addon.price;
      }
    }
    return price;
  }

  List<ProductAddon> get _selectedAddons {
    return widget.product.addons
        .where((addon) => _selectedAddonIds.contains(addon.id))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Container(
          width: 450,
          constraints: const BoxConstraints(maxHeight: 600),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              _buildHeader(),
              
              // Content
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Variants
                      if (widget.product.variants.isNotEmpty) ...[
                        _buildSectionTitle('الحجم'),
                        const SizedBox(height: 12),
                        _buildVariantSelector(),
                        const SizedBox(height: 24),
                      ],
                      
                      // Addons
                      if (widget.product.addons.isNotEmpty) ...[
                        _buildSectionTitle('إضافات'),
                        const SizedBox(height: 12),
                        _buildAddonsSelector(),
                      ],
                    ],
                  ),
                ),
              ),
              
              // Footer
              _buildFooter(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Color(0xFFF5F6FA),
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Row(
        children: [
          // Product icon
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Center(
              child: Text(
                _getProductEmoji(),
                style: const TextStyle(fontSize: 28),
              ),
            ),
          ),
          const SizedBox(width: 16),
          
          // Product name
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.product.nameAr,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'السعر الأساسي: ${widget.product.price.toStringAsFixed(0)} ر.س',
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          
          // Close button
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  String _getProductEmoji() {
    final category = widget.product.categoryId.toLowerCase();
    if (category.contains('coffee')) return '☕';
    if (category.contains('tea')) return '🍵';
    if (category.contains('cold')) return '🧊';
    if (category.contains('dessert')) return '🍰';
    if (category.contains('snack')) return '🥪';
    if (category.contains('shisha')) return '💨';
    return '🍽️';
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: Color(0xFF1E293B),
      ),
    );
  }

  Widget _buildVariantSelector() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: widget.product.variants.map((variant) {
        final isSelected = _selectedVariant?.id == variant.id;
        return _VariantChip(
          variant: variant,
          basePrice: widget.product.price,
          isSelected: isSelected,
          onTap: () {
            setState(() {
              _selectedVariant = variant;
            });
          },
        );
      }).toList(),
    );
  }

  Widget _buildAddonsSelector() {
    return Column(
      children: widget.product.addons.map((addon) {
        final isSelected = _selectedAddonIds.contains(addon.id);
        return _AddonTile(
          addon: addon,
          isSelected: isSelected,
          onChanged: (selected) {
            setState(() {
              if (selected) {
                _selectedAddonIds.add(addon.id);
              } else {
                _selectedAddonIds.remove(addon.id);
              }
            });
          },
        );
      }).toList(),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(20),
          bottomRight: Radius.circular(20),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Price display
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'الإجمالي',
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                ),
              ),
              Text(
                '${_totalPrice.toStringAsFixed(2)} ر.س',
                style: const TextStyle(
                  color: Color(0xFFD4A574),
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          
          const Spacer(),
          
          // Cancel button
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          const SizedBox(width: 12),
          
          // Add button
          ElevatedButton(
            onPressed: () {
              widget.onConfirm(_selectedVariant, _selectedAddons);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD4A574),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Row(
              children: [
                Icon(Icons.add_shopping_cart),
                SizedBox(width: 8),
                Text(
                  'إضافة للسلة',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
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

class _VariantChip extends StatelessWidget {

  const _VariantChip({
    required this.variant,
    required this.basePrice,
    required this.isSelected,
    required this.onTap,
  });
  final ProductVariant variant;
  final double basePrice;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final totalPrice = basePrice + variant.priceModifier;
    
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: BoxDecoration(
            color: isSelected
                ? const Color(0xFFD4A574).withOpacity(0.1)
                : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected
                  ? const Color(0xFFD4A574)
                  : Colors.grey.shade300,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              Text(
                variant.nameAr,
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected
                      ? const Color(0xFFD4A574)
                      : Colors.grey.shade800,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${totalPrice.toStringAsFixed(0)} ر.س',
                style: TextStyle(
                  fontSize: 12,
                  color: isSelected
                      ? const Color(0xFFD4A574)
                      : Colors.grey.shade600,
                ),
              ),
              if (variant.priceModifier != 0)
                Text(
                  variant.priceModifier > 0
                      ? '+${variant.priceModifier.toStringAsFixed(0)}'
                      : variant.priceModifier.toStringAsFixed(0),
                  style: TextStyle(
                    fontSize: 10,
                    color: variant.priceModifier > 0
                        ? Colors.orange
                        : Colors.green,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AddonTile extends StatelessWidget {

  const _AddonTile({
    required this.addon,
    required this.isSelected,
    required this.onChanged,
  });
  final ProductAddon addon;
  final bool isSelected;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onChanged(!isSelected),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected
                ? const Color(0xFF3B82F6).withOpacity(0.1)
                : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected
                  ? const Color(0xFF3B82F6)
                  : Colors.grey.shade300,
            ),
          ),
          child: Row(
            children: [
              // Checkbox
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF3B82F6) : Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: isSelected
                        ? const Color(0xFF3B82F6)
                        : Colors.grey.shade400,
                    width: 2,
                  ),
                ),
                child: isSelected
                    ? const Icon(Icons.check, size: 16, color: Colors.white)
                    : null,
              ),
              const SizedBox(width: 16),
              
              // Addon name
              Expanded(
                child: Text(
                  addon.nameAr,
                  style: TextStyle(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    color: isSelected
                        ? const Color(0xFF3B82F6)
                        : Colors.grey.shade800,
                  ),
                ),
              ),
              
              // Price
              Text(
                '+${addon.price.toStringAsFixed(0)} ر.س',
                style: TextStyle(
                  color: isSelected
                      ? const Color(0xFF3B82F6)
                      : Colors.grey.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}



