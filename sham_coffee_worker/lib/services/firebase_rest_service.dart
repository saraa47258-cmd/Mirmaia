import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../firebase_options.dart';

/// خدمة Firebase Database باستخدام REST API (حل بديل لمشكلة platform channel على Windows)
class FirebaseRestService {
  static String? _databaseURL;
  static String? _apiKey;
  
  /// تهيئة الخدمة
  static void initialize() {
    final options = DefaultFirebaseOptions.currentPlatform;
    _databaseURL = options.databaseURL;
    _apiKey = options.apiKey;
    
    if (_databaseURL == null || _databaseURL!.isEmpty) {
      throw Exception('databaseURL is missing in Firebase options');
    }
    
    if (_apiKey == null || _apiKey!.isEmpty) {
      throw Exception('apiKey is missing in Firebase options');
    }
    
    // إزالة trailing slash من databaseURL
    _databaseURL = _databaseURL!.endsWith('/') 
        ? _databaseURL!.substring(0, _databaseURL!.length - 1)
        : _databaseURL;
    
    if (kDebugMode) {
      debugPrint('✅ FirebaseRestService: Initialized');
      debugPrint('   DatabaseURL: $_databaseURL');
    }
  }
  
  /// قراءة البيانات من path معين
  static Future<Map<String, dynamic>?> get(String path) async {
    if (_databaseURL == null || _apiKey == null) {
      throw Exception('FirebaseRestService not initialized');
    }
    
    // تنظيف path
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    final url = '$_databaseURL/$path.json?auth=$_apiKey';
    
    try {
      if (kDebugMode) {
        debugPrint('📡 GET: $path');
      }
      
      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('انتهت مهلة الاتصال. يرجى التحقق من الاتصال بالإنترنت.');
        },
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (kDebugMode) {
          debugPrint('✅ GET success: $path');
        }
        return data as Map<String, dynamic>?;
      } else {
        if (kDebugMode) {
          debugPrint('❌ GET failed: ${response.statusCode} - ${response.body}');
        }
        throw Exception('خطأ في الاتصال: ${response.statusCode}');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ GET error: $e');
      }
      rethrow;
    }
  }
  
  /// كتابة البيانات إلى path معين
  static Future<void> set(String path, Map<String, dynamic> data) async {
    if (_databaseURL == null || _apiKey == null) {
      throw Exception('FirebaseRestService not initialized');
    }
    
    // تنظيف path
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    final url = '$_databaseURL/$path.json?auth=$_apiKey';
    
    try {
      if (kDebugMode) {
        debugPrint('📡 SET: $path');
      }
      
      final response = await http.put(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('انتهت مهلة الاتصال. يرجى التحقق من الاتصال بالإنترنت.');
        },
      );
      
      if (response.statusCode == 200) {
        if (kDebugMode) {
          debugPrint('✅ SET success: $path');
        }
      } else {
        if (kDebugMode) {
          debugPrint('❌ SET failed: ${response.statusCode} - ${response.body}');
        }
        throw Exception('خطأ في الاتصال: ${response.statusCode}');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ SET error: $e');
      }
      rethrow;
    }
  }
  
  /// إضافة بيانات جديدة (push)
  static Future<String> push(String path, Map<String, dynamic> data) async {
    if (_databaseURL == null || _apiKey == null) {
      throw Exception('FirebaseRestService not initialized');
    }
    
    // تنظيف path
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    final url = '$_databaseURL/$path.json?auth=$_apiKey';
    
    try {
      if (kDebugMode) {
        debugPrint('📡 PUSH: $path');
      }
      
      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('انتهت مهلة الاتصال. يرجى التحقق من الاتصال بالإنترنت.');
        },
      );
      
      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        final key = result['name'] as String?;
        if (kDebugMode) {
          debugPrint('✅ PUSH success: $path -> $key');
        }
        return key ?? '';
      } else {
        if (kDebugMode) {
          debugPrint('❌ PUSH failed: ${response.statusCode} - ${response.body}');
        }
        throw Exception('خطأ في الاتصال: ${response.statusCode}');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ PUSH error: $e');
      }
      rethrow;
    }
  }
  
  /// تحديث بيانات (update)
  static Future<void> update(String path, Map<String, dynamic> data) async {
    if (_databaseURL == null || _apiKey == null) {
      throw Exception('FirebaseRestService not initialized');
    }
    
    // تنظيف path
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    final url = '$_databaseURL/$path.json?auth=$_apiKey';
    
    try {
      if (kDebugMode) {
        debugPrint('📡 UPDATE: $path');
      }
      
      final response = await http.patch(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('انتهت مهلة الاتصال. يرجى التحقق من الاتصال بالإنترنت.');
        },
      );
      
      if (response.statusCode == 200) {
        if (kDebugMode) {
          debugPrint('✅ UPDATE success: $path');
        }
      } else {
        if (kDebugMode) {
          debugPrint('❌ UPDATE failed: ${response.statusCode} - ${response.body}');
        }
        throw Exception('خطأ في الاتصال: ${response.statusCode}');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ UPDATE error: $e');
      }
      rethrow;
    }
  }
}
