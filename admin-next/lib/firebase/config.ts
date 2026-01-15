import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBD3RarLj_696emYW84zZ1tliP_Th1z6mM",
  authDomain: "sham-coffee.firebaseapp.com",
  databaseURL: "https://sham-coffee-default-rtdb.firebaseio.com",
  projectId: "sham-coffee",
  storageBucket: "sham-coffee.firebasestorage.app",
  messagingSenderId: "483086837036",
  appId: "1:483086837036:web:2a6bf9084050ef399ef889"
};

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

// Restaurant ID constant
export const RESTAURANT_ID = 'sham-coffee-1';

export default app;

