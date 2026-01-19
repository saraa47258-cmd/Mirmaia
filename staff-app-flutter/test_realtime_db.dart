import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'config/firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  final auth = FirebaseAuth.instance;
  final db = FirebaseDatabase.instanceFor(
    app: auth.app,
    databaseURL: 'https://sham-coffee-default-rtdb.firebaseio.com',
  );
  
  print('Testing Realtime Database connection...');
  print('Database URL: ${db.databaseURL}');
  
  try {
    final ref = db.ref('restaurant-system/workers/sham-coffee-1');
    final snapshot = await ref.get();
    
    print('Snapshot exists: ${snapshot.exists}');
    print('Snapshot value: ${snapshot.value}');
    
    if (snapshot.exists && snapshot.value != null) {
      final data = snapshot.value as Map;
      print('Found ${data.length} workers');
      for (var entry in data.entries) {
        print('Worker ID: ${entry.key}');
        print('Worker data: ${entry.value}');
      }
    }
  } catch (e) {
    print('Error: $e');
  }
}



