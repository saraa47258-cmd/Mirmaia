/**
 * Add Admin Account Script
 * 
 * This script creates a new admin account in the system.
 * 
 * Usage:
 *   npx tsx scripts/add-admin.ts
 * 
 * Or with custom values:
 *   ADMIN_USERNAME=admin2 ADMIN_PASSWORD=password123 ADMIN_NAME="مدير جديد" npx tsx scripts/add-admin.ts
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCgClGRYyHcvrKAGVG05mBnIBRDNHZVNGQ",
  authDomain: "mirmaia-33acc.firebaseapp.com",
  databaseURL: "https://mirmaia-33acc-default-rtdb.firebaseio.com",
  projectId: "mirmaia-33acc",
  storageBucket: "mirmaia-33acc.firebasestorage.app",
  messagingSenderId: "822171259038",
  appId: "1:822171259038:web:c763356d68ab2a479b6b8f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'mirmaia-1';

const getPath = (collection: string) => `restaurant-system/${collection}/${RESTAURANT_ID}`;

// Admin permissions (full access)
const ADMIN_PERMISSIONS = [
  'dashboard',
  'staff-menu',
  'cashier',
  'orders',
  'tables',
  'rooms',
  'room-orders',
  'products',
  'menu',
  'inventory',
  'workers',
  'reports',
];

// Check if username exists
async function checkUsernameExists(username: string): Promise<boolean> {
  const snapshot = await get(ref(database, getPath('workers')));
  if (!snapshot.exists()) return false;
  
  const workers = snapshot.val();
  return Object.values(workers).some((worker: any) => 
    worker.username?.toLowerCase() === username.toLowerCase()
  );
}

async function addAdminAccount() {
  console.log('🔐 Adding Admin Account...\n');
  
  // Get values from environment or use defaults
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const fullName = process.env.ADMIN_NAME || 'مدير النظام';
  const phone = process.env.ADMIN_PHONE || '';
  const position = process.env.ADMIN_POSITION || 'مدير';
  
  try {
    // Check if username already exists
    console.log(`📋 Checking username: ${username}...`);
    const exists = await checkUsernameExists(username);
    if (exists) {
      console.error(`❌ Error: اسم المستخدم "${username}" موجود بالفعل!`);
      console.log('\n💡 Tip: استخدم متغير البيئة ADMIN_USERNAME لتحديد اسم مستخدم مختلف');
      process.exit(1);
    }
    console.log('   ✅ Username is available');
    
    // Create admin account
    console.log(`\n👤 Creating admin account...`);
    console.log(`   Name: ${fullName}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${'*'.repeat(password.length)}`);
    console.log(`   Role: admin`);
    
    const adminRef = push(ref(database, getPath('workers')));
    const adminId = adminRef.key!;
    
    const adminData = {
      uid: adminId,
      fullName: fullName,
      name: fullName, // For backward compatibility
      username: username,
      password: password, // In production, this should be hashed
      role: 'admin',
      isActive: true,
      active: true, // For backward compatibility
      phone: phone || undefined,
      position: position,
      permissions: ADMIN_PERMISSIONS,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
    };
    
    // Remove undefined values
    Object.keys(adminData).forEach(key => {
      if (adminData[key as keyof typeof adminData] === undefined) {
        delete adminData[key as keyof typeof adminData];
      }
    });
    
    await set(adminRef, adminData);
    
    console.log('\n✅ Admin account created successfully!');
    console.log('\n📌 Account Details:');
    console.log(`   ID: ${adminId}`);
    console.log(`   Name: ${fullName}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: admin`);
    console.log(`   Status: Active`);
    console.log(`   Permissions: Full access`);
    
    console.log('\n🔑 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n💡 You can now login at: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  }
}

// Run the script
addAdminAccount()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to create admin account:', error);
    process.exit(1);
  });
