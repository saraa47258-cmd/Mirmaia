/**
 * Firebase Backup Script
 * سكربت النسخ الاحتياطي لبيانات Firebase
 * 
 * Usage / الاستخدام:
 *   node scripts/backup-firebase.js
 * 
 * This will create a backup folder with all your data
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Firebase Configuration
const DATABASE_URL = 'https://mirmaia-33acc-default-rtdb.firebaseio.com';
const RESTAURANT_ID = 'mirmaia-1';

// Collections to backup
const COLLECTIONS = [
  'orders',
  'menu',
  'categories', 
  'workers',
  'tables',
  'rooms',
  'daily_closings',
  'invoices',
  'restaurants',
];

// Create backup folder with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFolder = path.join(__dirname, '..', 'backups', `backup-${timestamp}`);

// Ensure backup directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Fetch data from Firebase
function fetchData(collection) {
  return new Promise((resolve, reject) => {
    const url = `${DATABASE_URL}/restaurant-system/${collection}/${RESTAURANT_ID}.json`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.error(`Error fetching ${collection}:`, err.message);
      resolve(null);
    });
  });
}

// Main backup function
async function backup() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     Firebase Backup Script                 ║');
  console.log('║     Sham Coffee - سكربت النسخ الاحتياطي   ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`📅 Backup Time: ${new Date().toLocaleString()}`);
  console.log(`📁 Backup Folder: ${backupFolder}`);
  console.log('');
  
  ensureDir(backupFolder);
  
  const summary = {
    timestamp: new Date().toISOString(),
    collections: {},
  };
  
  for (const collection of COLLECTIONS) {
    process.stdout.write(`📦 Backing up ${collection}... `);
    
    try {
      const data = await fetchData(collection);
      
      if (data) {
        const filePath = path.join(backupFolder, `${collection}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        
        const count = typeof data === 'object' ? Object.keys(data).length : 0;
        summary.collections[collection] = { count, status: 'success' };
        console.log(`✅ ${count} records`);
      } else {
        summary.collections[collection] = { count: 0, status: 'empty' };
        console.log('⚪ Empty or not found');
      }
    } catch (error) {
      summary.collections[collection] = { count: 0, status: 'error', error: error.message };
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Save summary
  const summaryPath = path.join(backupFolder, '_backup-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  
  console.log('');
  console.log('════════════════════════════════════════════');
  console.log('✅ Backup completed successfully!');
  console.log(`📁 Location: ${backupFolder}`);
  console.log('════════════════════════════════════════════');
  
  // List backup contents
  console.log('');
  console.log('📋 Backup Contents:');
  const files = fs.readdirSync(backupFolder);
  files.forEach(file => {
    const stats = fs.statSync(path.join(backupFolder, file));
    const size = (stats.size / 1024).toFixed(2);
    console.log(`   📄 ${file} (${size} KB)`);
  });
  
  return backupFolder;
}

// Run backup
backup().catch(console.error);
