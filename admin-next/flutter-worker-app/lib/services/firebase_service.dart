import 'package:firebase_database/firebase_database.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  final DatabaseReference _database = FirebaseDatabase.instance.ref();
  static const String restaurantId = 'mirmaia-1';

  // Helper to convert dynamic map to Map<String, dynamic>
  Map<String, dynamic> _convertMap(dynamic value) {
    if (value == null) return {};
    if (value is Map) {
      final result = <String, dynamic>{};
      value.forEach((key, val) {
        final keyStr = key.toString();
        if (val is Map) {
          result[keyStr] = _convertMap(val);
        } else if (val is List) {
          result[keyStr] = val.map((item) => item is Map ? _convertMap(item) : item).toList();
        } else {
          result[keyStr] = val;
        }
      });
      return result;
    }
    return {};
  }

  // Get worker by username
  Future<Map<String, dynamic>?> getWorkerByUsername(String username) async {
    try {
      final snapshot = await _database
          .child('restaurant-system/workers/$restaurantId')
          .get();

      if (snapshot.exists) {
        final workers = snapshot.value as Map<dynamic, dynamic>;
        
        for (var entry in workers.entries) {
          final worker = entry.value as Map<dynamic, dynamic>;
          if (worker['username']?.toString().toLowerCase() == 
              username.toLowerCase()) {
            final result = <String, dynamic>{'id': entry.key.toString()};
            worker.forEach((key, value) {
              final keyStr = key.toString();
              if (value is Map) {
                result[keyStr] = _convertMap(value);
              } else if (value is List) {
                result[keyStr] = value.map((item) => item is Map ? _convertMap(item) : item).toList();
              } else {
                result[keyStr] = value;
              }
            });
            
            // Debug: Print permissions structure
            print('Worker permissions structure:');
            print('  - detailedPermissions: ${result['detailedPermissions']}');
            if (result['detailedPermissions'] != null) {
              print('  - modules: ${result['detailedPermissions']['modules']}');
              print('  - actions: ${result['detailedPermissions']['actions']}');
            }
            
            return result;
          }
        }
      }
      return null;
    } catch (e) {
      print('Error getting worker: $e');
      return null;
    }
  }

  static double _toDouble(dynamic v) {
    if (v == null) return 0.0;
    if (v is num) return v.toDouble();
    if (v is String) return double.tryParse(v) ?? 0.0;
    return 0.0;
  }

  // Get menu items (أسعار من Firebase بالريال العُماني)
  Future<List<Map<String, dynamic>>> getMenuItems() async {
    try {
      final snapshot = await _database
          .child('restaurant-system/menu/$restaurantId')
          .get();

      if (snapshot.exists) {
        final items = snapshot.value as Map<dynamic, dynamic>;
        return items.entries.map((entry) {
          final itemData = entry.value as Map<dynamic, dynamic>;
          final result = <String, dynamic>{'id': entry.key.toString()};
          itemData.forEach((key, value) {
            result[key.toString()] = value;
          });
          // تطبيع الأسعار من Firebase (ريال عُماني)
          final p = _toDouble(result['price']);
          final bp = _toDouble(result['basePrice']);
          result['price'] = p;
          result['basePrice'] = bp > 0 ? bp : p;
          final variations = result['variations'] as List<dynamic>?;
          if (variations != null && variations.isNotEmpty) {
            result['variations'] = variations.map((v) {
              final m = Map<String, dynamic>.from(v as Map);
              m['price'] = _toDouble(m['price']);
              return m;
            }).toList();
          }
          return result;
        }).toList();
      }
      return [];
    } catch (e) {
      print('Error getting menu items: $e');
      return [];
    }
  }

  // Get categories
  Future<List<Map<String, dynamic>>> getCategories() async {
    try {
      final snapshot = await _database
          .child('restaurant-system/categories/$restaurantId')
          .get();

      if (snapshot.exists) {
        final categories = snapshot.value as Map<dynamic, dynamic>;
        return categories.entries.map((entry) {
          final categoryData = entry.value as Map<dynamic, dynamic>;
          final result = <String, dynamic>{'id': entry.key.toString()};
          categoryData.forEach((key, value) {
            result[key.toString()] = value;
          });
          return result;
        }).toList();
      }
      return [];
    } catch (e) {
      print('Error getting categories: $e');
      return [];
    }
  }

  // Create order
  Future<String?> createOrder(Map<String, dynamic> orderData) async {
    try {
      final ordersRef = _database
          .child('restaurant-system/orders/$restaurantId');
      
      final newOrderRef = ordersRef.push();
      await newOrderRef.set({
        ...orderData,
        'createdAt': ServerValue.timestamp,
        'updatedAt': ServerValue.timestamp,
      });
      
      return newOrderRef.key;
    } catch (e) {
      print('Error creating order: $e');
      return null;
    }
  }

  // Get orders
  Stream<DatabaseEvent> getOrdersStream() {
    return _database
        .child('restaurant-system/orders/$restaurantId')
        .onValue;
  }

  // Update order
  Future<bool> updateOrder(String orderId, Map<String, dynamic> updates) async {
    try {
      await _database
          .child('restaurant-system/orders/$restaurantId/$orderId')
          .update({
        ...updates,
        'updatedAt': ServerValue.timestamp,
      });
      return true;
    } catch (e) {
      print('Error updating order: $e');
      return false;
    }
  }

  // Get tables
  Future<List<Map<String, dynamic>>> getTables() async {
    try {
      final snapshot = await _database
          .child('restaurant-system/tables/$restaurantId')
          .get();

      if (snapshot.exists) {
        final tables = snapshot.value as Map<dynamic, dynamic>;
        return tables.entries.map((entry) {
          final tableData = entry.value as Map<dynamic, dynamic>;
          final result = <String, dynamic>{'id': entry.key.toString()};
          tableData.forEach((key, value) {
            result[key.toString()] = value;
          });
          return result;
        }).toList();
      }
      return [];
    } catch (e) {
      print('Error getting tables: $e');
      return [];
    }
  }

  // Get rooms
  Future<List<Map<String, dynamic>>> getRooms() async {
    try {
      final snapshot = await _database
          .child('restaurant-system/rooms/$restaurantId')
          .get();

      if (snapshot.exists) {
        final rooms = snapshot.value as Map<dynamic, dynamic>;
        return rooms.entries.map((entry) {
          final roomData = entry.value as Map<dynamic, dynamic>;
          final result = <String, dynamic>{'id': entry.key.toString()};
          roomData.forEach((key, value) {
            result[key.toString()] = value;
          });
          return result;
        }).toList();
      }
      return [];
    } catch (e) {
      print('Error getting rooms: $e');
      return [];
    }
  }
}
