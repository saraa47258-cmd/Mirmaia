/// Order status enum
enum OrderStatus {
  pending,
  preparing,
  ready,
  completed,
  cancelled,
}

extension OrderStatusExtension on OrderStatus {
  String get displayName {
    switch (this) {
      case OrderStatus.pending:
        return 'قيد الانتظار';
      case OrderStatus.preparing:
        return 'قيد التحضير';
      case OrderStatus.ready:
        return 'جاهز';
      case OrderStatus.completed:
        return 'مكتمل';
      case OrderStatus.cancelled:
        return 'ملغي';
    }
  }

  String get value {
    return toString().split('.').last;
  }

  static OrderStatus fromString(String value) {
    switch (value.toLowerCase()) {
      case 'pending':
        return OrderStatus.pending;
      case 'preparing':
        return OrderStatus.preparing;
      case 'ready':
        return OrderStatus.ready;
      case 'completed':
        return OrderStatus.completed;
      case 'cancelled':
        return OrderStatus.cancelled;
      default:
        return OrderStatus.pending;
    }
  }
}

/// Payment method enum
enum PaymentMethod {
  cash,
  card,
  split,
}

extension PaymentMethodExtension on PaymentMethod {
  String get displayName {
    switch (this) {
      case PaymentMethod.cash:
        return 'نقداً';
      case PaymentMethod.card:
        return 'بطاقة';
      case PaymentMethod.split:
        return 'تقسيم';
    }
  }

  String get value {
    return toString().split('.').last;
  }

  static PaymentMethod fromString(String value) {
    switch (value.toLowerCase()) {
      case 'cash':
        return PaymentMethod.cash;
      case 'card':
        return PaymentMethod.card;
      case 'split':
        return PaymentMethod.split;
      default:
        return PaymentMethod.cash;
    }
  }
}

/// Order type enum
enum OrderType {
  dineIn,
  takeaway,
  delivery,
}

extension OrderTypeExtension on OrderType {
  String get displayName {
    switch (this) {
      case OrderType.dineIn:
        return 'محلي';
      case OrderType.takeaway:
        return 'سفري';
      case OrderType.delivery:
        return 'توصيل';
    }
  }

  String get value {
    return toString().split('.').last;
  }

  static OrderType fromString(String value) {
    switch (value.toLowerCase()) {
      case 'dinein':
      case 'dine_in':
        return OrderType.dineIn;
      case 'takeaway':
      case 'take_away':
        return OrderType.takeaway;
      case 'delivery':
        return OrderType.delivery;
      default:
        return OrderType.dineIn;
    }
  }
}

/// Order item model
class OrderItem {

  OrderItem({
    required this.productId,
    required this.productName,
    this.variantName,
    this.addonNames = const [],
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.notes,
  });

  factory OrderItem.fromMap(Map<String, dynamic> data) {
    return OrderItem(
      productId: data['productId'] ?? '',
      productName: data['productName'] ?? '',
      variantName: data['variantName'] ?? data['variant']?['nameAr'],
      addonNames: (data['addonNames'] as List<dynamic>?)?.cast<String>() ??
          (data['addons'] as List<dynamic>?)
              ?.map((a) => a['nameAr']?.toString() ?? '')
              .toList() ??
          [],
      quantity: data['quantity'] ?? 1,
      unitPrice: (data['unitPrice'] ?? 0).toDouble(),
      totalPrice: (data['totalPrice'] ?? 0).toDouble(),
      notes: data['notes'],
    );
  }
  final String productId;
  final String productName;
  final String? variantName;
  final List<String> addonNames;
  final int quantity;
  final double unitPrice;
  final double totalPrice;
  final String? notes;

  Map<String, dynamic> toMap() {
    return {
      'productId': productId,
      'productName': productName,
      'variantName': variantName,
      'addonNames': addonNames,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'totalPrice': totalPrice,
      'notes': notes,
    };
  }
}

/// Order model
class OrderModel {

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.items,
    required this.subtotal,
    this.discount = 0,
    required this.tax,
    required this.grandTotal,
    this.status = OrderStatus.pending,
    this.paymentMethod = PaymentMethod.cash,
    this.orderType = OrderType.dineIn,
    this.tableId,
    this.tableName,
    this.roomId,
    this.roomName,
    this.customerName,
    this.customerPhone,
    this.notes,
    this.cashierId,
    this.cashierName,
    this.amountReceived,
    this.changeAmount,
    required this.createdAt,
    this.completedAt,
  });

  factory OrderModel.fromMap(String id, Map<String, dynamic> data) {
    return OrderModel(
      id: id,
      orderNumber: data['orderNumber'] ?? id.substring(0, 6).toUpperCase(),
      items: (data['items'] as List<dynamic>?)
              ?.map((item) => OrderItem.fromMap(item))
              .toList() ??
          [],
      subtotal: (data['subtotal'] ?? 0).toDouble(),
      discount: (data['discount'] ?? 0).toDouble(),
      tax: (data['tax'] ?? 0).toDouble(),
      grandTotal: (data['grandTotal'] ?? data['total'] ?? 0).toDouble(),
      status: OrderStatusExtension.fromString(data['status'] ?? 'pending'),
      paymentMethod:
          PaymentMethodExtension.fromString(data['paymentMethod'] ?? 'cash'),
      orderType: OrderTypeExtension.fromString(data['orderType'] ?? 'dineIn'),
      tableId: data['tableId'],
      tableName: data['tableName'],
      roomId: data['roomId'],
      roomName: data['roomName'],
      customerName: data['customerName'],
      customerPhone: data['customerPhone'],
      notes: data['notes'],
      cashierId: data['cashierId'],
      cashierName: data['cashierName'],
      amountReceived: data['amountReceived']?.toDouble(),
      changeAmount: data['changeAmount']?.toDouble(),
      createdAt: data['createdAt'] != null
          ? DateTime.tryParse(data['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      completedAt: data['completedAt'] != null
          ? DateTime.tryParse(data['completedAt'].toString())
          : null,
    );
  }
  final String id;
  final String orderNumber;
  final List<OrderItem> items;
  final double subtotal;
  final double discount;
  final double tax;
  final double grandTotal;
  final OrderStatus status;
  final PaymentMethod paymentMethod;
  final OrderType orderType;
  final String? tableId;
  final String? tableName;
  final String? roomId;
  final String? roomName;
  final String? customerName;
  final String? customerPhone;
  final String? notes;
  final String? cashierId;
  final String? cashierName;
  final double? amountReceived;
  final double? changeAmount;
  final DateTime createdAt;
  final DateTime? completedAt;

  Map<String, dynamic> toMap() {
    return {
      'orderNumber': orderNumber,
      'items': items.map((item) => item.toMap()).toList(),
      'subtotal': subtotal,
      'discount': discount,
      'tax': tax,
      'grandTotal': grandTotal,
      'status': status.value,
      'paymentMethod': paymentMethod.value,
      'orderType': orderType.value,
      'tableId': tableId,
      'tableName': tableName,
      'roomId': roomId,
      'roomName': roomName,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'notes': notes,
      'cashierId': cashierId,
      'cashierName': cashierName,
      'amountReceived': amountReceived,
      'changeAmount': changeAmount,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }
}
