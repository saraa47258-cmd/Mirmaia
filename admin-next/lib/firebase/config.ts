import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// قراءة الإعدادات من متغيرات البيئة
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBD3RarLj_696emYW84zZ1tliP_Th1z6mM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sham-coffee.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://sham-coffee-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sham-coffee",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sham-coffee.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "483086837036",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:483086837036:web:2a6bf9084050ef399ef889"
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
export const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'sham-coffee-1';

export default app;





