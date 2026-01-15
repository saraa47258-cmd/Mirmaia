import 'product_model.dart';

class OrderItem {
  final String productId;
  final String name;
  final double price;
  final int quantity;
  final String? emoji;
  final String? notes;
  final ProductVariation? variation;

  OrderItem({
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    this.emoji,
    this.notes,
    this.variation,
  });

  double get total => price * quantity;

  Map<String, dynamic> toMap() {
    return {
      'id': productId,
      'name': name,
      'price': price,
      'quantity': quantity,
      'itemTotal': total,
      'emoji': emoji,
      'notes': notes,
      if (variation != null)
        'variation': {
          'id': variation!.id,
          'name': variation!.name,
          'price': variation!.price,
        },
    };
  }

  factory OrderItem.fromMap(Map<String, dynamic> map) {
    ProductVariation? variation;
    if (map['variation'] != null) {
      variation = ProductVariation(
        id: map['variation']['id'] ?? '',
        name: map['variation']['name'] ?? '',
        price: (map['variation']['price'] ?? 0).toDouble(),
      );
    }

    return OrderItem(
      productId: map['id'] ?? '',
      name: map['name'] ?? '',
      price: (map['price'] ?? 0).toDouble(),
      quantity: map['quantity'] ?? 1,
      emoji: map['emoji'],
      notes: map['notes'] ?? map['note'],
      variation: variation,
    );
  }

  String get displayName {
    if (variation != null) {
      return '$name - ${variation!.name}';
    }
    return name;
  }
}

class OrderModel {
  final String id;
  final List<OrderItem> items;
  final double subtotal;
  final double? discount;
  final double? tax;
  final double total;
  final String status;
  final String? paymentMethod;
  final String? paymentStatus;
  final String? tableNumber;
  final String? tableId;
  final String? roomId;
  final String? roomNumber;
  final String? orderType;
  final String? customerName;
  final String? workerId;
  final String? workerName;
  final String source;
  final DateTime createdAt;
  final DateTime? updatedAt;

  OrderModel({
    required this.id,
    required this.items,
    required this.subtotal,
    this.discount,
    this.tax,
    required this.total,
    required this.status,
    this.paymentMethod,
    this.paymentStatus,
    this.tableNumber,
    this.tableId,
    this.roomId,
    this.roomNumber,
    this.orderType,
    this.customerName,
    this.workerId,
    this.workerName,
    required this.source,
    required this.createdAt,
    this.updatedAt,
  });

  factory OrderModel.fromMap(String id, Map<String, dynamic> map) {
    List<OrderItem> itemsList = [];
    if (map['items'] != null && map['items'] is List) {
      itemsList = (map['items'] as List)
          .map((item) => OrderItem.fromMap(item as Map<String, dynamic>))
          .toList();
    }

    return OrderModel(
      id: id,
      items: itemsList,
      subtotal: (map['subtotal'] ?? map['total'] ?? 0).toDouble(),
      discount: map['discount']?.toDouble(),
      tax: map['tax']?.toDouble(),
      total: (map['total'] ?? 0).toDouble(),
      status: map['status'] ?? 'pending',
      paymentMethod: map['paymentMethod'],
      paymentStatus: map['paymentStatus'],
      tableNumber: map['tableNumber'],
      tableId: map['tableId'],
      roomId: map['roomId'],
      roomNumber: map['roomNumber'],
      orderType: map['orderType'],
      customerName: map['customerName'],
      workerId: map['workerId'],
      workerName: map['workerName'],
      source: map['source'] ?? 'staff',
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: map['updatedAt'] != null
          ? DateTime.tryParse(map['updatedAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'items': items.map((item) => item.toMap()).toList(),
      'subtotal': subtotal,
      'discount': discount,
      'tax': tax,
      'total': total,
      'status': status,
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
      'tableNumber': tableNumber,
      'tableId': tableId,
      'roomId': roomId,
      'roomNumber': roomNumber,
      'orderType': orderType,
      'customerName': customerName,
      'workerId': workerId,
      'workerName': workerName,
      'source': source,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'itemsCount': itemsCount,
    };
  }

  int get itemsCount => items.fold(0, (sum, item) => sum + item.quantity);

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'جاري التحضير';
      case 'preparing':
        return 'يُحضّر';
      case 'ready':
        return 'جاهز';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      case 'paid':
        return 'مدفوع';
      default:
        return status;
    }
  }
}

