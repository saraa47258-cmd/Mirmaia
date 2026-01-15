import 'package:flutter/material.dart';
import '../models/product_model.dart';
import '../theme/app_theme.dart';

class VariationDialog extends StatefulWidget {
  final ProductModel product;
  final Function(ProductVariation variation, String? notes) onAdd;

  const VariationDialog({
    super.key,
    required this.product,
    required this.onAdd,
  });

  @override
  State<VariationDialog> createState() => _VariationDialogState();
}

class _VariationDialogState extends State<VariationDialog> {
  late ProductVariation? _selectedVariation;
  final TextEditingController _notesController = TextEditingController();
  bool _showNotes = false;

  @override
  void initState() {
    super.initState();
    _selectedVariation = widget.product.defaultVariation;
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final variations = widget.product.variations;

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
                  // Product Image/Emoji
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppTheme.lightBackground,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: widget.product.imageUrl != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                widget.product.imageUrl!,
                                fit: BoxFit.cover,
                                width: 56,
                                height: 56,
                              ),
                            )
                          : Text(
                              widget.product.emoji ?? '☕',
                              style: const TextStyle(fontSize: 28),
                            ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  
                  // Product Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.product.name,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.lightText,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.layers,
                              size: 14,
                              color: AppTheme.primaryColor.withOpacity(0.7),
                            ),
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
                  
                  // Close Button
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                    style: IconButton.styleFrom(
                      backgroundColor: AppTheme.lightBackground,
                    ),
                  ),
                ],
              ),
            ),
            
            // Variations List
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: variations.map((variation) {
                  final isSelected = _selectedVariation?.id == variation.id;
                  
                  return GestureDetector(
                    onTap: () => setState(() => _selectedVariation = variation),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 14,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryColor.withOpacity(0.1)
                            : AppTheme.lightBackground,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected
                              ? AppTheme.primaryColor
                              : Colors.transparent,
                          width: 2,
                        ),
                      ),
                      child: Row(
                        children: [
                          // Radio
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isSelected
                                  ? AppTheme.primaryColor
                                  : Colors.transparent,
                              border: Border.all(
                                color: isSelected
                                    ? AppTheme.primaryColor
                                    : Colors.grey[400]!,
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
                          
                          // Variation Name
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  variation.name,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: isSelected
                                        ? FontWeight.w700
                                        : FontWeight.w500,
                                    color: isSelected
                                        ? AppTheme.primaryColor
                                        : AppTheme.lightText,
                                  ),
                                ),
                                if (variation.isDefault)
                                  Container(
                                    margin: const EdgeInsets.only(top: 4),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[200],
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      'الافتراضي',
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          
                          // Price
                          Text(
                            '${variation.price.toStringAsFixed(3)} ر.ع',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: isSelected
                                  ? AppTheme.primaryColor
                                  : AppTheme.successColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            
            // Notes Toggle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  GestureDetector(
                    onTap: () => setState(() => _showNotes = !_showNotes),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: _showNotes
                            ? AppTheme.primaryColor.withOpacity(0.1)
                            : AppTheme.lightBackground,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: AppTheme.lightBorder,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.edit_note,
                            size: 20,
                            color: _showNotes
                                ? AppTheme.primaryColor
                                : Colors.grey[600],
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'إضافة ملاحظة (اختياري)',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: _showNotes
                                  ? AppTheme.primaryColor
                                  : Colors.grey[600],
                            ),
                          ),
                          const Spacer(),
                          Icon(
                            _showNotes
                                ? Icons.keyboard_arrow_up
                                : Icons.keyboard_arrow_down,
                            color: Colors.grey[600],
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  if (_showNotes)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: TextField(
                        controller: _notesController,
                        maxLines: 2,
                        decoration: InputDecoration(
                          hintText: 'مثال: بدون سكر، حليب قليل...',
                          filled: true,
                          fillColor: AppTheme.lightBackground,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Summary & Add Button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.lightBackground,
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(20),
                ),
              ),
              child: Column(
                children: [
                  // Summary
                  if (_selectedVariation != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'اخترت',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                              Text(
                                '${widget.product.name} - ${_selectedVariation!.name}',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.lightText,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            '${_selectedVariation!.price.toStringAsFixed(3)} ر.ع',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.successColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  
                  // Add Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _selectedVariation == null
                          ? null
                          : () {
                              widget.onAdd(
                                _selectedVariation!,
                                _notesController.text.isNotEmpty
                                    ? _notesController.text
                                    : null,
                              );
                              Navigator.pop(context);
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.shopping_cart),
                          SizedBox(width: 8),
                          Text(
                            'إضافة إلى السلة',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
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
      ),
    );
  }
}

