/**
 * Financial Data Reset Script
 * 
 * This script resets all financial/transactional data for testing purposes.
 * 
 * WHAT GETS DELETED:
 * - All orders
 * - Daily closings
 * - Table statuses (reset to available)
 * - Room statuses (reset to available)
 * 
 * WHAT STAYS:
 * - Products
 * - Categories
 * - Employees/Users
 * - Settings
 * - Inventory items
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove, get, update } from 'firebase/database';

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
const RESTAURANT_ID = 'mirmaia-1';

const getPath = (collection: string) => `restaurant-system/${collection}/${RESTAURANT_ID}`;

async function resetFinancialData() {
  console.log('🔄 Starting Financial Data Reset...\n');
  
  try {
    // 1. Delete all orders
    console.log('📋 Deleting all orders...');
    await remove(ref(database, getPath('orders')));
    console.log('   ✅ Orders deleted');

    // 2. Delete all daily closings
    console.log('📊 Deleting daily closings...');
    await remove(ref(database, getPath('daily_closings')));
    console.log('   ✅ Daily closings deleted');

    // 3. Reset table statuses
    console.log('🪑 Resetting table statuses...');
    const tablesSnapshot = await get(ref(database, getPath('tables')));
    if (tablesSnapshot.exists()) {
      const tables = tablesSnapshot.val();
      const tableUpdates: Record<string, any> = {};
      Object.keys(tables).forEach(tableId => {
        tableUpdates[`${getPath('tables')}/${tableId}/status`] = 'available';
        tableUpdates[`${getPath('tables')}/${tableId}/currentOrderId`] = null;
      });
      await update(ref(database), tableUpdates);
      console.log(`   ✅ ${Object.keys(tables).length} tables reset to available`);
    } else {
      console.log('   ⚪ No tables found');
    }

    // 4. Reset room statuses
    console.log('🚪 Resetting room statuses...');
    const roomsSnapshot = await get(ref(database, getPath('rooms')));
    if (roomsSnapshot.exists()) {
      const rooms = roomsSnapshot.val();
      const roomUpdates: Record<string, any> = {};
      Object.keys(rooms).forEach(roomId => {
        roomUpdates[`${getPath('rooms')}/${roomId}/status`] = 'available';
        roomUpdates[`${getPath('rooms')}/${roomId}/currentOrderId`] = null;
      });
      await update(ref(database), roomUpdates);
      console.log(`   ✅ ${Object.keys(rooms).length} rooms reset to available`);
    } else {
      console.log('   ⚪ No rooms found');
    }

    console.log('\n✅ Financial data reset complete!');
    console.log('\n📌 Summary:');
    console.log('   - All orders: DELETED');
    console.log('   - Daily closings: DELETED');
    console.log('   - Tables: RESET to available');
    console.log('   - Rooms: RESET to available');
    console.log('\n📌 Preserved:');
    console.log('   - Products ✓');
    console.log('   - Categories ✓');
    console.log('   - Employees ✓');
    console.log('   - Inventory ✓');
    console.log('   - Settings ✓');

  } catch (error) {
    console.error('❌ Error during reset:', error);
    throw error;
  }
}

// Run the reset
resetFinancialData()
  .then(() => {
    console.log('\n🎉 Done! You can now test the system with fresh data.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reset:', error);
    process.exit(1);
  });
