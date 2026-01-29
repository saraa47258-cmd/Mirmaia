import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// قراءة الإعدادات من متغيرات البيئة
// Mirmaia Project (mirmaia-33acc)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCgClGRYyHcvrKAGVG05mBnIBRDNHZVNGQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mirmaia-33acc.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://mirmaia-33acc-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mirmaia-33acc",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mirmaia-33acc.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "822171259038",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:822171259038:web:c763356d68ab2a479b6b8f"
};

// التحقق من وجود الإعدادات المطلوبة
if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
  console.warn('⚠️ Firebase configuration is incomplete. Please check your environment variables.');
}

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const database: Database = getDatabase(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Restaurant ID constant - يمكن تغييره من متغيرات البيئة
export const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'mirmaia-1';

export default app;





