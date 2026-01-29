const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const workerBuildDir = path.join(__dirname, '..', 'build-worker');

// إنشاء مجلد build-worker
if (!fs.existsSync(workerBuildDir)) {
  fs.mkdirSync(workerBuildDir, { recursive: true });
}

// نسخ الملفات المشتركة
const sharedFiles = [
  '_next',
  'favicon.ico',
  'file.svg',
  'globe.svg',
  'next.svg',
  'vercel.svg',
  'window.svg',
  '404.html',
  '404',
];

console.log('📦 نسخ الملفات المشتركة...');
sharedFiles.forEach(file => {
  const src = path.join(buildDir, file);
  const dest = path.join(workerBuildDir, file);
  
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
    console.log(`  ✓ ${file}`);
  }
});

// نسخ صفحات worker فقط
console.log('\n📁 نسخ صفحات worker...');
const workerPages = [
  'worker',
];

workerPages.forEach(page => {
  const src = path.join(buildDir, page);
  const dest = path.join(workerBuildDir, page);
  
  if (fs.existsSync(src)) {
    copyDir(src, dest);
    console.log(`  ✓ ${page}/`);
  }
});

// نسخ index.html للصفحة الرئيسية (worker)
const workerIndex = path.join(buildDir, 'worker', 'index.html');
const rootIndex = path.join(workerBuildDir, 'index.html');
if (fs.existsSync(workerIndex)) {
  fs.copyFileSync(workerIndex, rootIndex);
  console.log('  ✓ index.html (من worker)');
}

// نسخ _not-found إذا كان موجود
const notFoundSrc = path.join(buildDir, '_not-found');
const notFoundDest = path.join(workerBuildDir, '_not-found');
if (fs.existsSync(notFoundSrc)) {
  copyDir(notFoundSrc, notFoundDest);
  console.log('  ✓ _not-found/');
}

console.log('\n✅ تم إعداد build-worker بنجاح!');
console.log(`📂 المجلد: ${workerBuildDir}`);

// دالة نسخ المجلدات
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
