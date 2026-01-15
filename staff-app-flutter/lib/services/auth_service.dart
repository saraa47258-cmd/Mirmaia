import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  static const String restaurantId = 'sham-coffee-1';

  // Get current Firebase user
  User? get currentUser => _auth.currentUser;

  // Auth state stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Login with username and password
  /// First tries Firebase Auth, then falls back to Firestore lookup
  Future<UserModel> login(String username, String password) async {
    try {
      // First, try to find user by username in Firestore
      UserModel? user = await _findUserByUsername(username, password);
      
      if (user != null) {
        // Check if account is active
        if (!user.isActive) {
          throw Exception('الحساب موقوف');
        }
        
        // Update last login
        await _updateLastLogin(user.uid);
        
        return user;
      }
      
      // If not found in workers, try admin/restaurant login
      user = await _tryRestaurantLogin(username, password);
      
      if (user != null) {
        return user;
      }

      throw Exception('اسم المستخدم أو كلمة المرور غير صحيحة');
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      rethrow;
    }
  }

  /// Find user by username in workers collection
  Future<UserModel?> _findUserByUsername(String username, String password) async {
    // Try users collection first (new structure)
    try {
      final usersSnapshot = await _firestore
          .collection('restaurant-system')
          .doc('users')
          .collection(restaurantId)
          .where('username', isEqualTo: username)
          .limit(1)
          .get();

      if (usersSnapshot.docs.isNotEmpty) {
        final doc = usersSnapshot.docs.first;
        final data = doc.data();
        
        // Check password
        if (data['password'] == password) {
          return UserModel.fromMap(doc.id, data);
        }
      }
    } catch (e) {
      // Collection might not exist, try workers
    }

    // Try workers collection (legacy structure)
    try {
      final workersSnapshot = await _firestore
          .collection('restaurant-system')
          .doc('workers')
          .collection(restaurantId)
          .where('username', isEqualTo: username)
          .limit(1)
          .get();

      if (workersSnapshot.docs.isNotEmpty) {
        final doc = workersSnapshot.docs.first;
        final data = doc.data();
        
        // Check password
        if (data['password'] == password) {
          // Map worker data to UserModel
          return UserModel(
            uid: doc.id,
            fullName: data['name'] ?? data['fullName'] ?? '',
            username: data['username'] ?? '',
            role: data['role'] ?? data['position'] ?? 'staff',
            permissions: _parseWorkerPermissions(data),
            isActive: data['active'] ?? data['isActive'] ?? true,
          );
        }
      }
    } catch (e) {
      // Collection might not exist
    }

    return null;
  }

  /// Try restaurant/admin login
  Future<UserModel?> _tryRestaurantLogin(String username, String password) async {
    try {
      final restaurantSnapshot = await _firestore
          .collection('restaurant-system')
          .doc('restaurants')
          .collection(restaurantId)
          .limit(1)
          .get();

      if (restaurantSnapshot.docs.isNotEmpty) {
        final doc = restaurantSnapshot.docs.first;
        final data = doc.data();
        
        if (data['username'] == username && data['password'] == password) {
          return UserModel(
            uid: doc.id,
            fullName: data['name'] ?? 'مدير النظام',
            username: username,
            role: 'admin',
            permissions: {
              'staffMenu': true,
              'cashier': true,
              'tables': true,
              'roomOrders': true,
              'inventory': true,
              'reports': true,
              'workers': true,
            },
            isActive: true,
          );
        }
      }

      // Try direct restaurant document
      final directDoc = await _firestore
          .collection('restaurant-system')
          .doc('restaurants')
          .get();
      
      if (directDoc.exists) {
        final restaurants = directDoc.data() ?? {};
        if (restaurants[restaurantId] != null) {
          final data = restaurants[restaurantId] as Map<String, dynamic>;
          if (data['username'] == username && data['password'] == password) {
            return UserModel(
              uid: restaurantId,
              fullName: data['name'] ?? 'مدير النظام',
              username: username,
              role: 'admin',
              permissions: {
                'staffMenu': true,
                'cashier': true,
                'tables': true,
                'roomOrders': true,
                'inventory': true,
                'reports': true,
                'workers': true,
              },
              isActive: true,
            );
          }
        }
      }
    } catch (e) {
      // Restaurant not found
    }

    return null;
  }

  Map<String, bool> _parseWorkerPermissions(Map<String, dynamic> data) {
    Map<String, bool> perms = {};
    
    // Check permissions field
    if (data['permissions'] != null) {
      if (data['permissions'] is Map) {
        (data['permissions'] as Map).forEach((key, value) {
          perms[key.toString()] = value == true;
        });
      } else if (data['permissions'] is List) {
        for (var perm in (data['permissions'] as List)) {
          perms[perm.toString()] = true;
        }
      }
    }
    
    // Default permissions based on role/position
    final role = data['role'] ?? data['position'] ?? 'staff';
    
    if (role == 'admin' || role == 'مدير') {
      return {
        'staffMenu': true,
        'cashier': true,
        'tables': true,
        'roomOrders': true,
        'inventory': true,
        'reports': true,
        'workers': true,
      };
    } else if (role == 'cashier' || role == 'كاشير') {
      perms['staffMenu'] = perms['staffMenu'] ?? true;
      perms['cashier'] = perms['cashier'] ?? true;
      perms['tables'] = perms['tables'] ?? true;
      perms['roomOrders'] = perms['roomOrders'] ?? true;
    } else {
      // Default staff permissions
      perms['staffMenu'] = perms['staffMenu'] ?? true;
    }
    
    return perms;
  }

  Future<void> _updateLastLogin(String uid) async {
    try {
      // Try to update in users collection
      await _firestore
          .collection('restaurant-system')
          .doc('users')
          .collection(restaurantId)
          .doc(uid)
          .update({
            'lastLoginAt': FieldValue.serverTimestamp(),
          });
    } catch (e) {
      // Try workers collection
      try {
        await _firestore
            .collection('restaurant-system')
            .doc('workers')
            .collection(restaurantId)
            .doc(uid)
            .update({
              'lastLoginAt': FieldValue.serverTimestamp(),
            });
      } catch (_) {
        // Ignore errors
      }
    }
  }

  /// Logout
  Future<void> logout() async {
    await _auth.signOut();
  }

  /// Handle Firebase Auth exceptions
  Exception _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return Exception('المستخدم غير موجود');
      case 'wrong-password':
        return Exception('كلمة المرور غير صحيحة');
      case 'user-disabled':
        return Exception('الحساب موقوف');
      case 'too-many-requests':
        return Exception('محاولات كثيرة، حاول لاحقاً');
      case 'network-request-failed':
        return Exception('خطأ في الاتصال بالإنترنت');
      default:
        return Exception('حدث خطأ: ${e.message}');
    }
  }
}

