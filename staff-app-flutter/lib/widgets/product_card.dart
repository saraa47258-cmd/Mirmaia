import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/product_model.dart';
import '../theme/app_theme.dart';

class ProductCard extends StatefulWidget {
  final ProductModel product;
  final VoidCallback onAdd;

  const ProductCard({
    super.key,
    required this.product,
    required this.onAdd,
  });

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _isHovered ? AppTheme.primaryColor : AppTheme.lightBorder,
          ),
          boxShadow: _isHovered
              ? [
                  BoxShadow(
                    color: AppTheme.primaryColor.withOpacity(0.15),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image
            Expanded(
              flex: 3,
              child: Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.lightBackground,
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(15),
                      ),
                    ),
                    child: Center(
                      child: product.imageUrl != null && product.imageUrl!.isNotEmpty
                          ? ClipRRect(
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(15),
                              ),
                              child: CachedNetworkImage(
                                imageUrl: product.imageUrl!,
                                fit: BoxFit.cover,
                                width: double.infinity,
                                height: double.infinity,
                                placeholder: (context, url) => Center(
                                  child: Text(
                                    product.emoji ?? '☕',
                                    style: const TextStyle(fontSize: 40),
                                  ),
                                ),
                                errorWidget: (context, url, error) => Center(
                                  child: Text(
                                    product.emoji ?? '☕',
                                    style: const TextStyle(fontSize: 40),
                                  ),
                                ),
                              ),
                            )
                          : Text(
                              product.emoji ?? '☕',
                              style: const TextStyle(fontSize: 40),
                            ),
                    ),
                  ),
                  
                  // Variations Badge
                  if (product.hasVariations)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.secondaryColor.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.layers,
                              size: 12,
                              color: Colors.white,
                            ),
                            SizedBox(width: 4),
                            Text(
                              'خيارات',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
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
            
            // Content
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name
                    Text(
                      product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.lightText,
                      ),
                    ),
                    const SizedBox(height: 4),
                    
                    // Price
                    Row(
                      children: [
                        if (product.hasVariations)
                          Text(
                            'يبدأ من ',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.grey[600],
                            ),
                          ),
                        Text(
                          '${product.minPrice.toStringAsFixed(3)} ر.ع',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.successColor,
                          ),
                        ),
                      ],
                    ),
                    
                    const Spacer(),
                    
                    // Add Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: widget.onAdd,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: product.hasVariations
                              ? AppTheme.secondaryColor
                              : AppTheme.primaryColor,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              product.hasVariations ? Icons.layers : Icons.add,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              product.hasVariations ? 'اختر' : 'إضافة',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
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
          ],
        ),
      ),
    );
  }
}

