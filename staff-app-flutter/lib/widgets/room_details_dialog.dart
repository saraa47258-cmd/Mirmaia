import 'package:flutter/material.dart';
import 'package:intl/intl.dart' as intl;
import '../models/room_model.dart';
import '../models/room_model.dart' as room_models;
import '../services/realtime_database_service.dart';

class RoomDetailsDialog extends StatefulWidget {

  const RoomDetailsDialog({
    super.key,
    required this.room,
  });
  final RoomModel room;

  @override
  State<RoomDetailsDialog> createState() => _RoomDetailsDialogState();
}

class _RoomDetailsDialogState extends State<RoomDetailsDialog> {
  final RealtimeDatabaseService _rtdb = RealtimeDatabaseService();
  room_models.RoomReservation? _reservation;
  Map<String, dynamic>? _order;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    // Load reservation if exists
    if (widget.room.activeReservationId != null) {
      final reservation = await _rtdb.getRoomReservation(widget.room.activeReservationId!);
      if (mounted) {
        setState(() => _reservation = reservation);
      }
    }

    // Load order if exists
    if (widget.room.activeOrderId != null) {
      final order = await _rtdb.getOrderById(widget.room.activeOrderId!);
      if (mounted) {
        setState(() => _order = order);
      }
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Directionality(
        textDirection: TextDirection.rtl,
        child: Dialog(
          child: Container(
            padding: const EdgeInsets.all(40),
            child: const CircularProgressIndicator(),
          ),
        ),
      );
    }

    // Calculate totals
    final roomCharge = _reservation?.roomCharge ?? 
                       (_order?['roomCharge'] as num?)?.toDouble() ?? 0.0;
    final gender = _reservation?.gender ?? 
                   _order?['gender']?.toString() ?? 'girl';
    final items = (_order?['items'] as List<dynamic>?) ?? [];
    final itemsSubtotal = items.fold<double>(
      0.0,
      (sum, item) => sum + ((item['itemTotal'] as num?)?.toDouble() ?? 
                            ((item['quantity'] as num?)?.toInt() ?? 1) * 
                            ((item['unitPrice'] as num?)?.toDouble() ?? 0.0)),
    );
    final discountAmount = (_order?['discountAmount'] as num?)?.toDouble() ?? 0.0;
    final taxAmount = (_order?['taxAmount'] as num?)?.toDouble() ?? 0.0;
    final total = roomCharge + itemsSubtotal - discountAmount + taxAmount;
    final paid = _order?['paid'] == true;
    final status = _order?['status']?.toString() ?? widget.room.status;
    final createdAt = _reservation?.createdAt ?? 
                      _order?['createdAt']?.toString() ?? 
                      widget.room.reservedAt;
    final createdByName = _reservation?.createdByName ?? 
                          _order?['createdByName']?.toString() ?? 
                          widget.room.reservedBy ?? 'غير معروف';

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          width: 600,
          constraints: const BoxConstraints(maxHeight: 700),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: paid
                        ? [const Color(0xFFDCFCE7), const Color(0xFFBBF7D0)]
                        : [const Color(0xFFFEF3C7), const Color(0xFFFDE68A)],
                  ),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: paid ? const Color(0xFF22C55E) : const Color(0xFFF59E0B),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Text(
                          widget.room.roomNumber,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.room.displayName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          if (createdAt != null)
                            Text(
                              _formatDate(createdAt),
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.grey[700],
                              ),
                            ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),

              // Content
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status and Payment badges
                      Row(
                        children: [
                          _buildBadge(
                            paid ? 'مدفوع' : 'غير مدفوع',
                            paid ? const Color(0xFF22C55E) : const Color(0xFFF59E0B),
                          ),
                          const SizedBox(width: 8),
                          _buildBadge(
                            _getStatusLabel(status),
                            _getStatusColor(status),
                          ),
                          if (gender.isNotEmpty) ...[
                            const SizedBox(width: 8),
                            _buildBadge(
                              gender.toLowerCase() == 'boy' ? 'ولد' : 'بنت',
                              const Color(0xFF8B5CF6),
                            ),
                          ],
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Created by
                      Row(
                        children: [
                          Icon(Icons.person, size: 16, color: Colors.grey[600]),
                          const SizedBox(width: 8),
                          Text(
                            'أنشأ بواسطة: $createdByName',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[700],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),
                      const Divider(),

                      // Room Charge
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'رسوم الغرفة',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            Text(
                              '${roomCharge.toStringAsFixed(3)} ر.ع',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: roomCharge > 0 ? const Color(0xFFDC2626) : const Color(0xFF22C55E),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Items (if exists)
                      if (items.isNotEmpty) ...[
                        const SizedBox(height: 20),
                        const Text(
                          'العناصر',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 12),
                        ...items.asMap().entries.map((entry) {
                          final index = entry.key;
                          final item = entry.value as Map<String, dynamic>;
                          return _buildOrderItem(index + 1, item);
                        }),
                      ],

                      const SizedBox(height: 20),
                      const Divider(),

                      // Totals
                      _buildTotalRow('رسوم الغرفة', roomCharge),
                      if (itemsSubtotal > 0) _buildTotalRow('المجموع الفرعي للعناصر', itemsSubtotal),
                      if (discountAmount > 0)
                        _buildTotalRow('الخصم', -discountAmount, isDiscount: true),
                      if (taxAmount > 0) _buildTotalRow('الضريبة', taxAmount),
                      const SizedBox(height: 8),
                      _buildTotalRow('الإجمالي', total, isTotal: true),
                    ],
                  ),
                ),
              ),

              // Footer
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(20),
                    bottomRight: Radius.circular(20),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('إغلاق'),
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

  Widget _buildBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _buildOrderItem(int index, Map<String, dynamic> item) {
    final name = item['name']?.toString() ?? 'غير معروف';
    final variation = item['variationName']?.toString();
    final quantity = (item['quantity'] as num?)?.toInt() ?? 1;
    final unitPrice = (item['unitPrice'] as num?)?.toDouble() ?? 0.0;
    final lineTotal = (item['itemTotal'] as num?)?.toDouble() ?? (quantity * unitPrice);
    final notes = item['notes']?.toString();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Center(
                  child: Text(
                    '$index',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    if (variation != null && variation.isNotEmpty)
                      Text(
                        variation,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                  ],
                ),
              ),
              Text(
                '${lineTotal.toStringAsFixed(3)} ر.ع',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                'الكمية: $quantity',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(width: 16),
              Text(
                'السعر: ${unitPrice.toStringAsFixed(3)} ر.ع',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          if (notes != null && notes.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.note, size: 14, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      notes,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[700],
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, double amount, {bool isDiscount = false, bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? FontWeight.w700 : FontWeight.w500,
              color: const Color(0xFF0F172A),
            ),
          ),
          Text(
            '${isDiscount ? '-' : ''}${amount.toStringAsFixed(3)} ر.ع',
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: FontWeight.w700,
              color: isTotal ? const Color(0xFF22C55E) : const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '-';
    try {
      final date = DateTime.parse(dateStr);
      return intl.DateFormat('yyyy-MM-dd HH:mm', 'ar').format(date);
    } catch (e) {
      return dateStr;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'قيد الانتظار';
      case 'preparing':
        return 'قيد التحضير';
      case 'ready':
        return 'جاهز';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      case 'available':
        return 'متاحة';
      case 'reserved':
        return 'محجوزة';
      case 'occupied':
        return 'مشغولة';
      default:
        return status;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return const Color(0xFFF59E0B);
      case 'preparing':
        return const Color(0xFF6366F1);
      case 'ready':
        return const Color(0xFF22C55E);
      case 'completed':
        return const Color(0xFF22C55E);
      case 'cancelled':
        return const Color(0xFFDC2626);
      case 'available':
        return const Color(0xFF22C55E);
      case 'reserved':
        return const Color(0xFFDC2626);
      case 'occupied':
        return const Color(0xFFDC2626);
      default:
        return const Color(0xFF64748B);
    }
  }
}

