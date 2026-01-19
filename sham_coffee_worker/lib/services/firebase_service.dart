import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;
import '../firebase_options.dart';

/// خدمة Firebase Database مع إعدادات صحيحة لـ Windows
class FirebaseService {
  static FirebaseDatabase? _database;
  static bool _initialized = false;
  
  /// تهيئة Firebase Database - يجب استدعاؤها مرة واحدة في بداية التطبيق
  static Future<void> initialize() async {
    if (_initialized) return;
    
    try {
      // التأكد من أن Firebase Core تم تهيئته
      final app = Firebase.app();
      
      // الحصول على databaseURL من Firebase options
      final options = DefaultFirebaseOptions.currentPlatform;
      final databaseURL = options.databaseURL;
      
      if (kDebugMode) {
        debugPrint('🔧 FirebaseService: Initializing...');
        debugPrint('   Platform: ${Platform.operatingSystem}');
        debugPrint('   DatabaseURL: $databaseURL');
      }
      
      if (databaseURL == null || databaseURL.isEmpty) {
        throw Exception('databaseURL is missing in Firebase options');
      }
      
      // على Windows، يجب استخدام instanceFor مع databaseURL صريح
      _database = FirebaseDatabase.instanceFor(
        app: app,
        databaseURL: databaseURL,
      );
      
      // تعطيل persistence على Windows (يسبب مشاكل)
      if (Platform.isWindows) {
        _database!.setPersistenceEnabled(false);
      }
      
      // تفعيل logging في وضع التطوير
      _database!.setLoggingEnabled(kDebugMode);
      
      // اختبار الاتصال (اختياري - لا نرمي خطأ إذا فشل)
      try {
        final testRef = _database!.ref('.info/connected');
        await testRef.get().timeout(
          const Duration(seconds: 5),
          onTimeout: () {
            if (kDebugMode) {
              debugPrint('⚠️ FirebaseService: Connection test timeout (this is OK)');
            }
            return testRef.get(); // إرجاع snapshot فارغ
          },
        );
      } catch (e) {
        if (kDebugMode) {
          debugPrint('⚠️ FirebaseService: Connection test failed: $e (this is OK)');
        }
        // لا نرمي الخطأ هنا، قد يكون الاتصال يعمل لاحقاً
      }
      
      _initialized = true;
      
      if (kDebugMode) {
        debugPrint('✅ FirebaseService: Initialized successfully');
      }
    } catch (e, stackTrace) {
      if (kDebugMode) {
        debugPrint('❌ FirebaseService: Initialization failed');
        debugPrint('   Error: $e');
        debugPrint('   Stack: $stackTrace');
      }
      rethrow;
    }
  }
  
  /// الحصول على instance من FirebaseDatabase
  static FirebaseDatabase getDatabase() {
    if (!_initialized) {
      throw Exception('FirebaseService not initialized. Call FirebaseService.initialize() first.');
    }
    
    if (_database == null) {
      throw Exception('FirebaseDatabase instance is null');
    }
    
    return _database!;
  }
  
  /// إعادة تعيين instance (للاستخدام في الاختبارات)
  static void reset() {
    _database = null;
    _initialized = false;
  }
}
