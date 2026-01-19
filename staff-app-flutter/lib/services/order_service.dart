import 'dart:convert';
import 'dart:math';
import 'package:http/http.dart' as http;
import '../models/order_model.dart';
import '../models/cart_model.dart';

/// Service for managing orders in Firebase
class OrderService {
  static const String databaseURL = 'https://sham-coffee-default-rtdb.firebaseio.com';
  static const String restaurantId = 'sham-coffee-1';

  /// Generate order number
  String _generateOrderNumber() {
    final now = DateTime.now();
    final random = Random().nextInt(999).toString().padLeft(3, '0');
    return '${now.hour.toString().padLeft(2, '0')}${now.minute.toString().padLeft(2, '0')}$random';
  }

  /// Create a new order from cart
  Future<OrderModel?> createOrder({
    required Cart cart,
    required PaymentMethod paymentMethod,
    required OrderType orderType,
    String? tableId,
    String? tableName,
    String? roomId,
    String? roomName,
    String? customerName,
    String? customerPhone,
    String? notes,
    String? cashierId,
    String? cashierName,
    double? amountReceived,
  }) async {
    try {
      final orderNumber = _generateOrderNumber();
      final now = DateTime.now();

      // Convert cart items to order items
      final orderItems = cart.items.map((item) => OrderItem(
        productId: item.product.id,
        productName: item.product.nameAr,
        variantName: item.selectedVariant?.nameAr,
        addonNames: item.selectedAddons.map((a) => a.nameAr).toList(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes,
      )).toList();

      final order = OrderModel(
        id: '', // Will be set by Firebase
        orderNumber: orderNumber,
        items: orderItems,
        subtotal: cart.subtotal,
        discount: cart.totalDiscount,
        tax: cart.taxAmount,
        grandTotal: cart.grandTotal,
        status: OrderStatus.pending,
        paymentMethod: paymentMethod,
        orderType: orderType,
        tableId: tableId,
        tableName: tableName,
        roomId: roomId,
        roomName: roomName,
        customerName: customerName,
        customerPhone: customerPhone,
        notes: notes,
        cashierId: cashierId,
        cashierName: cashierName,
        amountReceived: amountReceived,
        changeAmount: amountReceived != null ? amountReceived - cart.grandTotal : null,
        createdAt: now,
      );

      // Save to Firebase
      final url = Uri.parse('$databaseURL/restaurant-system/orders/$restaurantId.json');
      final response = await http.post(
        url,
        body: json.encode(order.toMap()),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        final orderId = responseData['name'];
        print('✅ Order created: $orderId');

        // Update table/room status if applicable
        if (tableId != null) {
          await _updateTableStatus(tableId, 'occupied', orderId);
        }
        if (roomId != null) {
          await _updateRoomStatus(roomId, 'occupied', orderId);
        }

        return OrderModel(
          id: orderId,
          orderNumber: order.orderNumber,
          items: order.items,
          subtotal: order.subtotal,
          discount: order.discount,
          tax: order.tax,
          grandTotal: order.grandTotal,
          status: order.status,
          paymentMethod: order.paymentMethod,
          orderType: order.orderType,
          tableId: order.tableId,
          tableName: order.tableName,
          roomId: order.roomId,
          roomName: order.roomName,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          notes: order.notes,
          cashierId: order.cashierId,
          cashierName: order.cashierName,
          amountReceived: order.amountReceived,
          changeAmount: order.changeAmount,
          createdAt: order.createdAt,
        );
      } else {
        print('❌ Failed to create order: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('❌ Error creating order: $e');
      return null;
    }
  }

  /// Update order status
  Future<bool> updateOrderStatus(String orderId, OrderStatus status) async {
    try {
      final url = Uri.parse('$databaseURL/restaurant-system/orders/$restaurantId/$orderId.json');
      final response = await http.patch(
        url,
        body: json.encode({
          'status': status.value,
          if (status == OrderStatus.completed) 'completedAt': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 200) {
        print('✅ Order status updated to: ${status.value}');
        return true;
      }
      return false;
    } catch (e) {
      print('❌ Error updating order status: $e');
      return false;
    }
  }

  /// Get recent orders
  Future<List<OrderModel>> getRecentOrders({int limit = 50}) async {
    try {
      final url = Uri.parse('$databaseURL/restaurant-system/orders/$restaurantId.json?orderBy="\$key"&limitToLast=$limit');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data == null) return [];

        final List<OrderModel> orders = [];
        if (data is Map) {
          data.forEach((key, value) {
            if (value is Map) {
              orders.add(OrderModel.fromMap(key, Map<String, dynamic>.from(value)));
            }
          });
        }

        // Sort by createdAt descending
        orders.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        return orders;
      }
    } catch (e) {
      print('Error fetching orders: $e');
    }
    return [];
  }

  /// Get order by ID
  Future<OrderModel?> getOrder(String orderId) async {
    try {
      final url = Uri.parse('$databaseURL/restaurant-system/orders/$restaurantId/$orderId.json');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data != null && data is Map) {
          return OrderModel.fromMap(orderId, Map<String, dynamic>.from(data));
        }
      }
    } catch (e) {
      print('Error fetching order: $e');
    }
    return null;
  }

  /// Update table status
  Future<void> _updateTableStatus(String tableId, String status, String? orderId) async {
    try {
      final url = Uri.parse('$databaseURL/restaurant-system/tables/$restaurantId/$tableId.json');
      await http.patch(
        url,
        body: json.encode({
          'status': status,
          'currentOrderId': orderId,
          'updatedAt': DateTime.now().toIso8601String(),
        }),
      );
    } catch (e) {
      print('Error updating table status: $e');
    }
  }

  /// Update room status
  Future<void> _updateRoomStatus(String roomId, String status, String? orderId) async {
    try {
      final url = Uri.parse('$databaseURL/restaurant-system/rooms/$restaurantId/$roomId.json');
      await http.patch(
        url,
        body: json.encode({
          'status': status,
          'currentOrderId': orderId,
          'updatedAt': DateTime.now().toIso8601String(),
        }),
      );
    } catch (e) {
      print('Error updating room status: $e');
    }
  }

  /// Get today's orders summary
  Future<Map<String, dynamic>> getTodaySummary() async {
    try {
      final orders = await getRecentOrders(limit: 200);
      final today = DateTime.now();
      final todayOrders = orders.where((o) {
        return o.createdAt.year == today.year &&
            o.createdAt.month == today.month &&
            o.createdAt.day == today.day;
      }).toList();

      final completedOrders = todayOrders.where((o) => 
        o.status == OrderStatus.completed).toList();

      double totalSales = 0;
      for (final order in completedOrders) {
        totalSales += order.grandTotal;
      }

      return {
        'totalOrders': todayOrders.length,
        'completedOrders': completedOrders.length,
        'pendingOrders': todayOrders.where((o) => o.status == OrderStatus.pending).length,
        'totalSales': totalSales,
        'averageOrderValue': completedOrders.isNotEmpty 
            ? totalSales / completedOrders.length 
            : 0,
      };
    } catch (e) {
      print('Error getting today summary: $e');
      return {
        'totalOrders': 0,
        'completedOrders': 0,
        'pendingOrders': 0,
        'totalSales': 0.0,
        'averageOrderValue': 0.0,
      };
    }
  }
}



