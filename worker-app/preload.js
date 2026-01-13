const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    printReceipt: (content) => {
        console.log('إرسال طلب الطباعة...');
        ipcRenderer.send('print-receipt', content);
    },
    getPrinters: () => ipcRenderer.invoke('get-printers')
});

console.log('تم تحميل Electron API');





