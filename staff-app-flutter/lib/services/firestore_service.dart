import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/order_model.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  static const String restaurantId = 'sham-coffee-1';

  // Helper to get collection path
  String _getPath(String collection) => 'restaurant-system/$collection/$restaurantId';

  // ==================== CATEGORIES ====================

  /// Get all active categories
  Future<List<CategoryModel>> getCategories() async {
    try {
      final snapshot = await _firestore
          .collection(_getPath('categories'))
          .orderBy('order')
          .get();

      return snapshot.docs
          .map((doc) => CategoryModel.fromMap(doc.id, doc.data()))
          .where((cat) => cat.active)
          .toList();
    } catch (e) {
      print('Error getting categories: $e');
      return [];
    }
  }

  /// Stream of categories
  Stream<List<CategoryModel>> categoriesStream() {
    return _firestore
        .collection(_getPath('categories'))
        .orderBy('order')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => CategoryModel.fromMap(doc.id, doc.data()))
            .where((cat) => cat.active)
            .toList());
  }

  // ==================== PRODUCTS ====================

  /// Get all active products
  Future<List<ProductModel>> getProducts() async {
    try {
      final snapshot = await _firestore
          .collection(_getPath('menu'))
          .get();

      return snapshot.docs
          .map((doc) => ProductModel.fromMap(doc.id, doc.data()))
          .where((product) => product.active)
          .toList();
    } catch (e) {
      print('Error getting products: $e');
      return [];
    }
  }

  /// Get products by category
  Future<List<ProductModel>> getProductsByCategory(String categoryId) async {
    try {
      final snapshot = await _firestore
          .collection(_getPath('menu'))
          .where('category', isEqualTo: categoryId)
          .get();

      return snapshot.docs
          .map((doc) => ProductModel.fromMap(doc.id, doc.data()))
          .where((product) => product.active)
          .toList();
    } catch (e) {
      print('Error getting products by category: $e');
      return [];
    }
  }

  /// Stream of products
  Stream<List<ProductModel>> productsStream() {
    return _firestore
        .collection(_getPath('menu'))
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ProductModel.fromMap(doc.id, doc.data()))
            .where((product) => product.active)
            .toList());
  }

  /// Get product with variations (subcollection)
  Future<ProductModel?> getProductWithVariations(String productId) async {
    try {
      final productDoc = await _firestore
          .collection(_getPath('menu'))
          .doc(productId)
          .get();

      if (!productDoc.exists) return null;

      final productData = productDoc.data()!;
      
      // Get variations from subcollection if not embedded
      if (productData['variations'] == null) {
        final variationsSnapshot = await _firestore
            .collection(_getPath('menu'))
            .doc(productId)
            .collection('variations')
            .orderBy('sortOrder')
            .get();

        if (variationsSnapshot.docs.isNotEmpty) {
          productData['variations'] = variationsSnapshot.docs
              .map((doc) => {'id': doc.id, ...doc.data()})
              .toList();
        }
      }

      return ProductModel.fromMap(productId, productData);
    } catch (e) {
      print('Error getting product with variations: $e');
      return null;
    }
  }

  // ==================== ORDERS ====================

  /// Create a new order
  Future<String> createOrder({
    required List<OrderItem> items,
    required double total,
    String? tableNumber,
    String? tableId,
    String? roomId,
    String? roomNumber,
    String? orderType,
    String? customerName,
    String? workerId,
    String? workerName,
    String source = 'staff',
  }) async {
    try {
      final orderData = {
        'items': items.map((item) => item.toMap()).toList(),
        'subtotal': total,
        'total': total,
        'status': 'pending',
        'paymentStatus': 'pending',
        'tableNumber': tableNumber,
        'tableId': tableId,
        'roomId': roomId,
        'roomNumber': roomNumber,
        'orderType': orderType ?? 'table',
        'customerName': customerName,
        'workerId': workerId,
        'workerName': workerName,
        'source': source,
        'itemsCount': items.fold(0, (sum, item) => sum + item.quantity),
        'createdAt': FieldValue.serverTimestamp(),
        'restaurantId': restaurantId,
      };

      final docRef = await _firestore
          .collection(_getPath('orders'))
          .add(orderData);

      // Update table/room status if applicable
      if (tableId != null && orderType == 'table') {
        await updateTableStatus(tableId, 'occupied', docRef.id);
      } else if (roomId != null && orderType == 'room') {
        await updateRoomStatus(roomId, 'occupied', docRef.id);
      }

      return docRef.id;
    } catch (e) {
      print('Error creating order: $e');
      rethrow;
    }
  }

  /// Get today's orders
  Future<List<OrderModel>> getTodayOrders() async {
    try {
      final today = DateTime.now();
      final startOfDay = DateTime(today.year, today.month, today.day);
      
      final snapshot = await _firestore
          .collection(_getPath('orders'))
          .where('createdAt', isGreaterThanOrEqualTo: startOfDay)
          .orderBy('createdAt', descending: true)
          .get();

      return snapshot.docs
          .map((doc) => OrderModel.fromMap(doc.id, doc.data()))
          .toList();
    } catch (e) {
      print('Error getting today orders: $e');
      return [];
    }
  }

  /// Stream of today's orders
  Stream<List<OrderModel>> todayOrdersStream() {
    final today = DateTime.now();
    final startOfDay = DateTime(today.year, today.month, today.day);
    
    return _firestore
        .collection(_getPath('orders'))
        .where('createdAt', isGreaterThanOrEqualTo: startOfDay)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => OrderModel.fromMap(doc.id, doc.data()))
            .toList());
  }

  /// Update order status
  Future<void> updateOrderStatus(String orderId, String status) async {
    try {
      await _firestore
          .collection(_getPath('orders'))
          .doc(orderId)
          .update({
            'status': status,
            'updatedAt': FieldValue.serverTimestamp(),
          });
    } catch (e) {
      print('Error updating order status: $e');
      rethrow;
    }
  }

  // ==================== TABLES ====================

  /// Get all tables
  Future<List<Map<String, dynamic>>> getTables() async {
    try {
      final snapshot = await _firestore
          .collection(_getPath('tables'))
          .orderBy('tableNumber')
          .get();

      return snapshot.docs
          .map((doc) => {'id': doc.id, ...doc.data()})
          .toList();
    } catch (e) {
      print('Error getting tables: $e');
      return [];
    }
  }

  /// Stream of tables
  Stream<List<Map<String, dynamic>>> tablesStream() {
    return _firestore
        .collection(_getPath('tables'))
        .orderBy('tableNumber')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => {'id': doc.id, ...doc.data()})
            .toList());
  }

  /// Update table status
  Future<void> updateTableStatus(String tableId, String status, [String? activeOrderId]) async {
    try {
      final updateData = <String, dynamic>{
        'status': status,
        'updatedAt': FieldValue.serverTimestamp(),
      };
      
      if (activeOrderId != null) {
        updateData['activeOrderId'] = activeOrderId;
      } else if (status == 'available') {
        updateData['activeOrderId'] = FieldValue.delete();
      }

      await _firestore
          .collection(_getPath('tables'))
          .doc(tableId)
          .update(updateData);
    } catch (e) {
      print('Error updating table status: $e');
      rethrow;
    }
  }

  // ==================== ROOMS ====================

  /// Get all rooms
  Future<List<Map<String, dynamic>>> getRooms() async {
    try {
      final snapshot = await _firestore
          .collection(_getPath('rooms'))
          .orderBy('roomNumber')
          .get();

      return snapshot.docs
          .map((doc) => {'id': doc.id, ...doc.data()})
          .where((room) => room['isActive'] != false)
          .toList();
    } catch (e) {
      print('Error getting rooms: $e');
      return [];
    }
  }

  /// Stream of rooms
  Stream<List<Map<String, dynamic>>> roomsStream() {
    return _firestore
        .collection(_getPath('rooms'))
        .orderBy('roomNumber')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => {'id': doc.id, ...doc.data()})
            .where((room) => room['isActive'] != false)
            .toList());
  }

  /// Update room status
  Future<void> updateRoomStatus(String roomId, String status, [String? activeOrderId]) async {
    try {
      final updateData = <String, dynamic>{
        'status': status,
        'updatedAt': FieldValue.serverTimestamp(),
      };
      
      if (activeOrderId != null) {
        updateData['activeOrderId'] = activeOrderId;
      } else if (status == 'available') {
        updateData['activeOrderId'] = FieldValue.delete();
      }

      await _firestore
          .collection(_getPath('rooms'))
          .doc(roomId)
          .update(updateData);
    } catch (e) {
      print('Error updating room status: $e');
      rethrow;
    }
  }

  /// Get room orders
  Stream<List<OrderModel>> roomOrdersStream() {
    final today = DateTime.now();
    final startOfDay = DateTime(today.year, today.month, today.day);
    
    return _firestore
        .collection(_getPath('orders'))
        .where('orderType', isEqualTo: 'room')
        .where('createdAt', isGreaterThanOrEqualTo: startOfDay)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => OrderModel.fromMap(doc.id, doc.data()))
            .toList());
  }
}

