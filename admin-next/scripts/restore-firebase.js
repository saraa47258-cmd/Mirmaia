/**
 * Firebase Restore Script
 * سكربت استعادة بيانات Firebase
 * 
 * Usage / الاستخدام:
 *   node scripts/restore-firebase.js <backup-folder-name>
 * 
 * Example:
 *   node scripts/restore-firebase.js backup-2026-01-23T10-30-00
 * 
 * ⚠️ WARNING: This will REPLACE existing data!
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Firebase Configuration
const DATABASE_URL = 'https://sham-coffee-default-rtdb.firebaseio.com';
const RESTAURANT_ID = 'sham-coffee-1';

// Get backup folder from command line
const backupFolderName = process.argv[2];

if (!backupFolderName) {
  console.log('');
  console.log('❌ Error: Please specify a backup folder');
  console.log('');
  console.log('Usage: node scripts/restore-firebase.js <backup-folder-name>');
  console.log('');
  console.log('Available backups:');
  
  const backupsDir = path.join(__dirname, '..', 'backups');
  if (fs.existsSync(backupsDir)) {
    const folders = fs.readdirSync(backupsDir).filter(f => f.startsWith('backup-'));
    folders.forEach(folder => {
      console.log(`   📁 ${folder}`);
    });
  } else {
    console.log('   No backups found.');
  }
  
  process.exit(1);
}

const backupFolder = path.join(__dirname, '..', 'backups', backupFolderName);

if (!fs.existsSync(backupFolder)) {
  console.log(`❌ Backup folder not found: ${backupFolder}`);
  process.exit(1);
}

// Put data to Firebase
function putData(collection, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${DATABASE_URL}/restaurant-system/${collection}/${RESTAURANT_ID}.json`);
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

// Main restore function
async function restore() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     Firebase Restore Script                ║');
  console.log('║     Sham Coffee - سكربت الاستعادة         ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`📅 Restore Time: ${new Date().toLocaleString()}`);
  console.log(`📁 Backup Folder: ${backupFolder}`);
  console.log('');
  
  // Read summary
  const summaryPath = path.join(backupFolder, '_backup-summary.json');
  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    console.log(`📆 Backup Date: ${summary.timestamp}`);
    console.log('');
  }
  
  // Confirm restore
  console.log('⚠️  WARNING: This will REPLACE existing data!');
  console.log('');
  
  // Get all JSON files in backup folder
  const files = fs.readdirSync(backupFolder).filter(f => 
    f.endsWith('.json') && !f.startsWith('_')
  );
  
  console.log(`📋 Collections to restore: ${files.length}`);
  files.forEach(f => console.log(`   📄 ${f}`));
  console.log('');
  
  // Process each file
  for (const file of files) {
    const collection = file.replace('.json', '');
    process.stdout.write(`📤 Restoring ${collection}... `);
    
    try {
      const filePath = path.join(backupFolder, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      await putData(collection, data);
      
      const count = typeof data === 'object' ? Object.keys(data).length : 0;
      console.log(`✅ ${count} records restored`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('');
  console.log('════════════════════════════════════════════');
  console.log('✅ Restore completed!');
  console.log('════════════════════════════════════════════');
}

// Run restore
restore().catch(console.error);
