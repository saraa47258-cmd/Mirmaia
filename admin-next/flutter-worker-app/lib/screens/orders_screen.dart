import 'package:flutter/material.dart';
import '../services/firebase_service.dart';
import '../utils/currency.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final FirebaseService _firebaseService = FirebaseService();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: _firebaseService.getOrdersStream(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (!snapshot.hasData || snapshot.data?.snapshot.value == null) {
          return const Center(
            child: Text('لا توجد طلبات'),
          );
        }

        final ordersData = snapshot.data!.snapshot.value as Map<dynamic, dynamic>?;
        if (ordersData == null || ordersData.isEmpty) {
          return const Center(
            child: Text('لا توجد طلبات'),
          );
        }

        int orderTime(Map<dynamic, dynamic> o) {
          final ts = o['timestamp'];
          if (ts != null && ts is num) return ts.toInt();
          final ca = o['createdAt'];
          if (ca != null) {
            final d = DateTime.tryParse(ca.toString());
            if (d != null) return d.millisecondsSinceEpoch;
          }
          return 0;
        }
        final orders = ordersData.entries.toList()
          ..sort((a, b) {
            final at = orderTime(a.value as Map<dynamic, dynamic>);
            final bt = orderTime(b.value as Map<dynamic, dynamic>);
            return bt.compareTo(at);
          });

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: orders.length,
          itemBuilder: (context, index) {
            final orderEntry = orders[index];
            final orderId = orderEntry.key.toString();
            final order = orderEntry.value as Map<dynamic, dynamic>;

            return _OrderCard(
              orderId: orderId,
              order: order,
              firebaseService: _firebaseService,
            );
          },
        );
      },
    );
  }
}

class _OrderCard extends StatelessWidget {
  final String orderId;
  final Map<dynamic, dynamic> order;
  final FirebaseService firebaseService;

  const _OrderCard({
    required this.orderId,
    required this.order,
    required this.firebaseService,
  });

  String _getStatusText(String? status) {
    switch (status) {
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
      default:
        return 'غير معروف';
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'preparing':
        return Colors.blue;
      case 'ready':
        return Colors.green;
      case 'completed':
        return Colors.grey;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  void _showOrderDetails(
    BuildContext context,
    String orderId,
    Map<dynamic, dynamic> order,
    String status,
  ) {
    final items = order['items'] as List<dynamic>? ?? [];
    
    final shortId = orderId.length > 6 ? orderId.substring(orderId.length - 6).toUpperCase() : orderId;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('تفاصيل الطلب #$shortId'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('الحالة: ${_getStatusText(status)}'),
              const SizedBox(height: 16),
              const Text(
                'العناصر:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ...items.map<Widget>((item) {
                final name = item['name'] ?? '';
                final quantity = item['quantity'] ?? 1;
                final price = item['price'] ?? 0.0;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Text('  • $name x$quantity - ${formatPrice(price)}'),
                );
              }),
              const SizedBox(height: 16),
              Text(
                'الإجمالي: ${formatPrice((order['total'] ?? 0.0) as num?)}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            ],
          ),
        ),
        actions: [
          if (status == 'pending' || status == 'preparing')
            TextButton(
              onPressed: () async {
                final newStatus = status == 'pending' ? 'preparing' : 'ready';
                final success = await firebaseService.updateOrder(orderId, {
                  'status': newStatus,
                });
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(success
                          ? 'تم تحديث حالة الطلب'
                          : 'حدث خطأ في تحديث الطلب'),
                      backgroundColor: success ? Colors.green : Colors.red,
                    ),
                  );
                }
              },
              child: Text(status == 'pending' ? 'بدء التحضير' : 'جاهز'),
            ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final status = order['status']?.toString() ?? 'pending';
    final total = order['total'] ?? 0.0;
    final items = order['items'] as List<dynamic>? ?? [];
    final tableNumber = order['tableNumber']?.toString() ?? '';
    final roomNumber = order['roomNumber']?.toString() ?? '';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getStatusColor(status).withOpacity(0.2),
          child: Icon(
            Icons.receipt_long,
            color: _getStatusColor(status),
          ),
        ),
        title: Text(
          'طلب #${orderId.length > 6 ? orderId.substring(orderId.length - 6).toUpperCase() : orderId}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (tableNumber.isNotEmpty) Text('طاولة: $tableNumber'),
            if (roomNumber.isNotEmpty) Text('غرفة: $roomNumber'),
            Text('${items.length} عنصر'),
            const SizedBox(height: 4),
            Chip(
              label: Text(_getStatusText(status)),
              backgroundColor: _getStatusColor(status).withOpacity(0.2),
              labelStyle: TextStyle(color: _getStatusColor(status)),
            ),
          ],
        ),
        trailing: Text(
          formatPrice(total),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        onTap: () {
          _showOrderDetails(context, orderId, order, status);
        },
      ),
    );
  }
}
