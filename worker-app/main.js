const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        autoHideMenuBar: true,
        frame: true,
        backgroundColor: '#0a0a0f',
        show: false
    });

    mainWindow.loadFile('pages/login.html');
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// طباعة نص بسيط - طريقة Electron المباشرة
ipcMain.on('print-text', (event, receiptText) => {
    // طباعة مباشرة بدون نافذة
    const tempPath = path.join(app.getPath('temp'), 'sham_receipt.txt');
    
    // كتابة الملف
    fs.writeFileSync(tempPath, receiptText, 'utf8');
    
    // طباعة باستخدام notepad
    const printCmd = `notepad /p "${tempPath}"`;
    
    exec(printCmd, (error, stdout, stderr) => {
        if (error) {
            console.error('Print error:', error);
        } else {
            console.log('Print command sent!');
        }
        
        // حذف الملف بعد الطباعة
        setTimeout(() => {
            try { fs.unlinkSync(tempPath); } catch(e) {}
        }, 5000);
    });
    
    if (mainWindow) {
        mainWindow.webContents.send('print-result', { success: true });
    }
});

// طباعة HTML - من cashier.html
ipcMain.on('print-receipt', (event, receiptHtml) => {
    // استخراج النص من HTML للطباعة
    const tempPath = path.join(app.getPath('temp'), 'sham_receipt.txt');
    
    // تحويل HTML إلى نص بسيط
    let textContent = receiptHtml
        .replace(/<[^>]*>/g, ' ')  // إزالة HTML tags
        .replace(/\s+/g, ' ')      // ضغط المسافات
        .trim();
    
    // كتابة الملف
    fs.writeFileSync(tempPath, textContent, 'utf8');
    
    // طباعة باستخدام notepad مباشرة
    const printCmd = `notepad /p "${tempPath}"`;
    
    exec(printCmd, (error, stdout, stderr) => {
        if (error) {
            console.error('Print error:', error);
            if (mainWindow) {
                mainWindow.webContents.send('print-result', { success: false, error: error.message });
            }
        } else {
            console.log('Print command sent automatically!');
            if (mainWindow) {
                mainWindow.webContents.send('print-result', { success: true });
            }
        }
        
        // حذف الملف بعد الطباعة
        setTimeout(() => {
            try { fs.unlinkSync(tempPath); } catch(e) {}
        }, 5000);
    });
});

// طباعة عبر ملف مؤقت - طريقة Windows
ipcMain.on('print-via-file', (event, text) => {
    const tempPath = path.join(app.getPath('temp'), 'sham_receipt.txt');
    
    // كتابة الملف
    fs.writeFileSync(tempPath, text, 'utf8');
    console.log('Receipt saved to:', tempPath);
    
    // طباعة باستخدام notepad
    const printCmd = `notepad /p "${tempPath}"`;
    
    exec(printCmd, (error, stdout, stderr) => {
        if (error) {
            console.error('Print error:', error);
            if (mainWindow) {
                mainWindow.webContents.send('print-result', { success: false, error: error.message });
            }
        } else {
            console.log('Print command sent!');
            if (mainWindow) {
                mainWindow.webContents.send('print-result', { success: true });
            }
        }
        
        // حذف الملف بعد الطباعة
        setTimeout(() => {
            try { fs.unlinkSync(tempPath); } catch(e) {}
        }, 5000);
    });
});

// طباعة HTML - نافذة الفاتورة الجميلة
ipcMain.on('silent-print', (event, receiptHTML) => {
    const printWindow = new BrowserWindow({
        show: true,
        width: 450,
        height: 750,
        title: 'فاتورة - قهوة الشام',
        autoHideMenuBar: true,
        backgroundColor: '#f0f0f0',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // إذا كان HTML كامل، استخدمه مباشرة
    if (receiptHTML.includes('<!DOCTYPE html>') || receiptHTML.includes('<html')) {
        printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHTML)}`);
    } else {
        // HTML جزئي - أضف wrapper
        const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>فاتورة - قهوة الشام</title>
    <style>
        @page { size: 80mm auto; margin: 2mm; }
        @media print { .no-print { display: none !important; } }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 20px; background: #f0f0f0; }
        .no-print { text-align: center; margin-bottom: 15px; }
        .btn { padding: 12px 25px; margin: 5px; border: none; border-radius: 20px; cursor: pointer; font-weight: bold; }
        .btn-print { background: linear-gradient(135deg, #d4a574, #b8956a); color: white; }
        .btn-close { background: #ef4444; color: white; }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="btn btn-print" onclick="window.print()">🖨️ طباعة</button>
        <button class="btn btn-close" onclick="window.close()">✕ إغلاق</button>
    </div>
    <div style="background:white;padding:15px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">${receiptHTML}</div>
</body>
</html>`;
        printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    }
});

// الحصول على قائمة الطابعات
ipcMain.handle('get-printers', async () => {
    if (mainWindow) {
        return await mainWindow.webContents.getPrintersAsync();
    }
    return [];
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// منع النوافذ المنبثقة
app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
});


