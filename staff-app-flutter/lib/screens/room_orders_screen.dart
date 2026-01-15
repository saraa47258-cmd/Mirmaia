import 'package:flutter/material.dart';
import '../models/order_model.dart';
import '../services/firestore_service.dart';
import '../theme/app_theme.dart';
import 'package:intl/intl.dart';

class RoomOrdersScreen extends StatefulWidget {
  const RoomOrdersScreen({super.key});

  @override
  State<RoomOrdersScreen> createState() => _RoomOrdersScreenState();
}

class _RoomOrdersScreenState extends State<RoomOrdersScreen> {
  final FirestoreService _firestoreService = FirestoreService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightBackground,
      appBar: AppBar(
        title: const Text('طلبات الغرف'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: StreamBuilder<List<OrderModel>>(
        stream: _firestoreService.roomOrdersStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Text('خطأ: ${snapshot.error}'),
            );
          }

          final orders = snapshot.data ?? [];

          if (orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.meeting_room_outlined, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'لا توجد طلبات غرف اليوم',
                    style: TextStyle(
                      fontSize: 18,
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
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final order = orders[index];
              return _OrderCard(order: order);
            },
          );
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final OrderModel order;

  const _OrderCard({required this.order});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'processing':
      case 'preparing':
        return Colors.blue;
      case 'ready':
        return AppTheme.successColor;
      case 'completed':
      case 'paid':
        return Colors.green;
      case 'cancelled':
        return AppTheme.errorColor;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(order.status);
    final timeFormat = DateFormat('HH:mm');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.lightBorder),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.05),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
            ),
            child: Row(
              children: [
                // Room Icon
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppTheme.secondaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.meeting_room,
                    color: AppTheme.secondaryColor,
                  ),
                ),
                const SizedBox(width: 12),
                
                // Order Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'غرفة ${order.roomNumber ?? '?'}',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.lightText,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '#${order.id.substring(order.id.length - 6).toUpperCase()}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${timeFormat.format(order.createdAt)} • ${order.itemsCount} صنف',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Status Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    order.statusLabel,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Items
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                ...order.items.take(3).map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Text(
                        item.emoji ?? '•',
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          item.displayName,
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppTheme.lightText,
                          ),
                        ),
                      ),
                      Text(
                        'x${item.quantity}',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        '${item.total.toStringAsFixed(3)} ر.ع',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.lightText,
                        ),
                      ),
                    ],
                  ),
                )),
                if (order.items.length > 3)
                  Text(
                    '+${order.items.length - 3} أصناف أخرى',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[500],
                    ),
                  ),
                const Divider(height: 24),
                
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
                      '${order.total.toStringAsFixed(3)} ر.ع',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.successColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

