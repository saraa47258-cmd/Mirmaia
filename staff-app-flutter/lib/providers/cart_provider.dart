import 'package:flutter/foundation.dart';
import '../models/product_model.dart';
import '../models/order_model.dart';
import '../services/firestore_service.dart';

class CartItem {
  final ProductModel product;
  final ProductVariation? variation;
  int quantity;
  String? notes;

  CartItem({
    required this.product,
    this.variation,
    this.quantity = 1,
    this.notes,
  });

  String get id => variation != null 
      ? '${product.id}_${variation!.id}' 
      : product.id;

  double get price => variation?.price ?? product.price;

  double get total => price * quantity;

  String get displayName => variation != null 
      ? '${product.name} - ${variation!.name}' 
      : product.name;

  OrderItem toOrderItem() {
    return OrderItem(
      productId: product.id,
      name: product.name,
      price: price,
      quantity: quantity,
      emoji: product.emoji,
      notes: notes,
      variation: variation,
    );
  }
}

class CartProvider with ChangeNotifier {
  final FirestoreService _firestoreService = FirestoreService();
  
  final List<CartItem> _items = [];
  String? _tableNumber;
  String? _tableId;
  String? _roomId;
  String? _roomNumber;
  String _orderType = 'table';
  String? _customerName;
  bool _isSubmitting = false;
  String? _error;

  // Getters
  List<CartItem> get items => List.unmodifiable(_items);
  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);
  double get subtotal => _items.fold(0, (sum, item) => sum + item.total);
  double get total => subtotal; // Can add discount/tax logic here
  bool get isEmpty => _items.isEmpty;
  bool get isNotEmpty => _items.isNotEmpty;
  String? get tableNumber => _tableNumber;
  String? get tableId => _tableId;
  String? get roomId => _roomId;
  String? get roomNumber => _roomNumber;
  String get orderType => _orderType;
  String? get customerName => _customerName;
  bool get isSubmitting => _isSubmitting;
  String? get error => _error;

  /// Add item to cart
  void addItem(ProductModel product, {ProductVariation? variation, String? notes}) {
    final id = variation != null ? '${product.id}_${variation.id}' : product.id;
    
    final existingIndex = _items.indexWhere((item) => item.id == id);
    
    if (existingIndex >= 0) {
      _items[existingIndex].quantity++;
      if (notes != null) {
        _items[existingIndex].notes = notes;
      }
    } else {
      _items.add(CartItem(
        product: product,
        variation: variation,
        quantity: 1,
        notes: notes,
      ));
    }
    
    notifyListeners();
  }

  /// Remove item from cart
  void removeItem(String itemId) {
    _items.removeWhere((item) => item.id == itemId);
    notifyListeners();
  }

  /// Increment item quantity
  void incrementItem(String itemId) {
    final index = _items.indexWhere((item) => item.id == itemId);
    if (index >= 0) {
      _items[index].quantity++;
      notifyListeners();
    }
  }

  /// Decrement item quantity
  void decrementItem(String itemId) {
    final index = _items.indexWhere((item) => item.id == itemId);
    if (index >= 0) {
      if (_items[index].quantity > 1) {
        _items[index].quantity--;
      } else {
        _items.removeAt(index);
      }
      notifyListeners();
    }
  }

  /// Update item notes
  void updateItemNotes(String itemId, String notes) {
    final index = _items.indexWhere((item) => item.id == itemId);
    if (index >= 0) {
      _items[index].notes = notes.isEmpty ? null : notes;
      notifyListeners();
    }
  }

  /// Get quantity of a product in cart
  int getQuantity(String productId, {String? variationId}) {
    final id = variationId != null ? '${productId}_$variationId' : productId;
    final item = _items.firstWhere(
      (item) => item.id == id,
      orElse: () => CartItem(product: ProductModel(id: '', name: '', price: 0, category: ''), quantity: 0),
    );
    return item.quantity;
  }

  /// Set table info
  void setTable(String? number, {String? id}) {
    _tableNumber = number;
    _tableId = id;
    _orderType = 'table';
    _roomId = null;
    _roomNumber = null;
    notifyListeners();
  }

  /// Set room info
  void setRoom(String? number, {String? id}) {
    _roomNumber = number;
    _roomId = id;
    _orderType = 'room';
    _tableId = null;
    _tableNumber = null;
    notifyListeners();
  }

  /// Set order type
  void setOrderType(String type) {
    _orderType = type;
    if (type == 'takeaway') {
      _tableId = null;
      _tableNumber = null;
      _roomId = null;
      _roomNumber = null;
    }
    notifyListeners();
  }

  /// Set customer name
  void setCustomerName(String? name) {
    _customerName = name;
    notifyListeners();
  }

  /// Clear cart
  void clear() {
    _items.clear();
    _tableNumber = null;
    _tableId = null;
    _roomId = null;
    _roomNumber = null;
    _customerName = null;
    _orderType = 'table';
    _error = null;
    notifyListeners();
  }

  /// Submit order
  Future<String?> submitOrder({
    required String workerId,
    required String workerName,
  }) async {
    if (_items.isEmpty) {
      _error = 'السلة فارغة';
      notifyListeners();
      return null;
    }

    if (_orderType == 'table' && (_tableNumber == null || _tableNumber!.isEmpty)) {
      _error = 'يرجى إدخال رقم الطاولة';
      notifyListeners();
      return null;
    }

    if (_orderType == 'room' && (_roomNumber == null || _roomNumber!.isEmpty)) {
      _error = 'يرجى اختيار الغرفة';
      notifyListeners();
      return null;
    }

    _isSubmitting = true;
    _error = null;
    notifyListeners();

    try {
      final orderItems = _items.map((item) => item.toOrderItem()).toList();
      
      final orderId = await _firestoreService.createOrder(
        items: orderItems,
        total: total,
        tableNumber: _tableNumber,
        tableId: _tableId,
        roomId: _roomId,
        roomNumber: _roomNumber,
        orderType: _orderType,
        customerName: _customerName,
        workerId: workerId,
        workerName: workerName,
        source: 'staff',
      );

      clear();
      return orderId;
    } catch (e) {
      _error = 'حدث خطأ في إرسال الطلب: ${e.toString()}';
      notifyListeners();
      return null;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}

