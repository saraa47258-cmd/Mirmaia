import 'package:flutter/material.dart';
import 'dart:async';
import '../models/table_model.dart';
import '../services/realtime_database_service.dart';

class TableCard extends StatefulWidget {

  const TableCard({
    super.key,
    required this.table,
    required this.onTap,
  });
  final TableModel table;
  final VoidCallback onTap;

  @override
  State<TableCard> createState() => _TableCardState();
}

class _TableCardState extends State<TableCard> {
  final RealtimeDatabaseService _rtdb = RealtimeDatabaseService();
  double? _orderTotal;
  StreamSubscription? _orderSubscription;

  @override
  void initState() {
    super.initState();
    if (widget.table.activeOrderId != null) {
      _listenToOrder();
    }
  }

  @override
  void didUpdateWidget(TableCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.table.activeOrderId != oldWidget.table.activeOrderId) {
      _orderSubscription?.cancel();
      if (widget.table.activeOrderId != null) {
        _listenToOrder();
      } else {
        setState(() => _orderTotal = null);
      }
    }
  }

  void _listenToOrder() {
    if (widget.table.activeOrderId == null) return;

    _orderSubscription = _rtdb.listenToOrder(widget.table.activeOrderId!).listen(
      (order) {
        if (mounted && order != null) {
          setState(() {
            _orderTotal = (order['total'] as num?)?.toDouble();
          });
        }
      },
    );
  }

  @override
  void dispose() {
    _orderSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isActive = widget.table.isActive;
    final statusColor = isActive ? const Color(0xFFDC2626) : const Color(0xFF22C55E);

    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFFEE2E2) : const Color(0xFFDCFCE7),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: statusColor,
            width: 1.5,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(6),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top row: Status and Area
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _getStatusLabel(widget.table.status),
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: statusColor,
                      ),
                    ),
                  ),
                  // Area badge
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        widget.table.area == 'VIP' ? Icons.star : Icons.coffee,
                        size: 10,
                        color: const Color(0xFF475569),
                      ),
                      const SizedBox(width: 2),
                      Text(
                        widget.table.area,
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              
              const SizedBox(height: 6),
              
              // Table number (compact)
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: isActive ? statusColor : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Center(
                      child: Text(
                        widget.table.tableNumber,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: isActive ? Colors.white : const Color(0xFF475569),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      widget.table.displayName,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0F172A),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),

              // Order total (if active) - compact
              if (isActive && _orderTotal != null) ...[
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _orderTotal!.toStringAsFixed(3),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: statusColor,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Text(
                        'ر.ع',
                        style: TextStyle(
                          fontSize: 9,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ] else if (isActive) ...[
                const SizedBox(height: 4),
                const SizedBox(
                  width: 12,
                  height: 12,
                  child: CircularProgressIndicator(strokeWidth: 1.5),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _getStatusLabel(String status) {
    switch (status) {
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
}

