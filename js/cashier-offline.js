/**
 * نظام معالجة حالة عدم الاتصال - الكاشير
 * قهوة الشام
 */

class CashierOfflineHandler {
    constructor() {
        this.isOnline = navigator.onLine;
        this.pendingOperations = [];
        this.offlineIndicator = null;
        this.init();
    }
    
    init() {
        // إنشاء مؤشر عدم الاتصال
        this.createOfflineIndicator();
        
        // مراقبة حالة الاتصال
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // مراقبة حالة Firebase
        if (typeof FirebaseDB !== 'undefined' && FirebaseDB.onFirebaseConnectionChange) {
            FirebaseDB.onFirebaseConnectionChange((isConnected) => {
                if (isConnected) {
                    this.handleOnline();
                } else {
                    this.handleOffline();
                }
            });
        }
        
        // محاولة إعادة إرسال العمليات المعلقة عند الاتصال
        setInterval(() => {
            if (this.isOnline && this.pendingOperations.length > 0) {
                this.retryPendingOperations();
            }
        }, 5000); // كل 5 ثواني
    }
    
    createOfflineIndicator() {
        this.offlineIndicator = document.createElement('div');
        this.offlineIndicator.className = 'offline-indicator';
        this.offlineIndicator.innerHTML = `
            <i class="fas fa-wifi"></i>
            <span>غير متصل بالإنترنت - سيتم حفظ البيانات محلياً</span>
        `;
        document.body.appendChild(this.offlineIndicator);
    }
    
    handleOnline() {
        this.isOnline = true;
        if (this.offlineIndicator) {
            this.offlineIndicator.classList.remove('show');
        }
        
        // إشعار المستخدم
        if (typeof BonApp !== 'undefined' && BonApp.showToast) {
            BonApp.showToast('تم استعادة الاتصال بالإنترنت ✅', 'success');
        }
        
        // محاولة إعادة إرسال العمليات المعلقة
        this.retryPendingOperations();
    }
    
    handleOffline() {
        this.isOnline = false;
        if (this.offlineIndicator) {
            this.offlineIndicator.classList.add('show');
        }
        
        // إشعار المستخدم
        if (typeof BonApp !== 'undefined' && BonApp.showToast) {
            BonApp.showToast('انقطع الاتصال بالإنترنت - سيتم حفظ البيانات محلياً', 'warning');
        }
    }
    
    /**
     * حفظ عملية في قائمة الانتظار
     */
    addPendingOperation(operation) {
        this.pendingOperations.push({
            ...operation,
            timestamp: Date.now(),
            retries: 0
        });
        
        // حفظ في localStorage
        this.savePendingOperations();
    }
    
    /**
     * محاولة إعادة إرسال العمليات المعلقة
     */
    async retryPendingOperations() {
        if (this.pendingOperations.length === 0) return;
        
        const maxRetries = 3;
        const operationsToRetry = [...this.pendingOperations];
        
        for (const operation of operationsToRetry) {
            if (operation.retries >= maxRetries) {
                // إزالة العملية بعد 3 محاولات فاشلة
                this.removePendingOperation(operation.id);
                continue;
            }
            
            try {
                const success = await this.executeOperation(operation);
                if (success) {
                    this.removePendingOperation(operation.id);
                } else {
                    operation.retries++;
                }
            } catch (error) {
                operation.retries++;
                if (typeof ErrorHandler !== 'undefined') {
                    ErrorHandler.handleNonCriticalError(error, `إعادة إرسال العملية ${operation.id}`);
                }
            }
        }
        
        this.savePendingOperations();
    }
    
    /**
     * تنفيذ عملية محفوظة
     */
    async executeOperation(operation) {
        try {
            switch (operation.type) {
                case 'save_order':
                    return await this.saveOrder(operation.data);
                case 'update_order':
                    return await this.updateOrder(operation.data);
                case 'close_table':
                    return await this.closeTable(operation.data);
                case 'close_room':
                    return await this.closeRoom(operation.data);
                case 'daily_closing':
                    return await this.saveDailyClosing(operation.data);
                default:
                    return false;
            }
        } catch (error) {
            return false;
        }
    }
    
    /**
     * حفظ طلب (مع معالجة عدم الاتصال)
     */
    async saveOrder(orderData) {
        if (!this.isOnline) {
            // حفظ محلياً
            const operationId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.addPendingOperation({
                id: operationId,
                type: 'save_order',
                data: orderData
            });
            
            // حفظ في localStorage أيضاً
            const localOrders = JSON.parse(localStorage.getItem('offline_orders') || '[]');
            localOrders.push({
                id: operationId,
                ...orderData,
                savedAt: new Date().toISOString()
            });
            localStorage.setItem('offline_orders', JSON.stringify(localOrders));
            
            return { success: true, offline: true, operationId };
        }
        
        // محاولة الحفظ في Firebase
        try {
            if (typeof firebase !== 'undefined' && firebase.database) {
                const orderRef = firebase.database().ref(`restaurant-system/restaurants/${orderData.restaurantId || 'sham-coffee-1'}/orders`).push();
                await orderRef.set(orderData);
                return { success: true, offline: false, orderId: orderRef.key };
            }
        } catch (error) {
            // في حالة الفشل، حفظ محلياً
            if (typeof ErrorHandler !== 'undefined') {
                ErrorHandler.handleFirebaseError(error, 'حفظ الطلب');
            }
            return await this.saveOrder(orderData); // إعادة المحاولة (سيتم حفظها محلياً)
        }
    }
    
    /**
     * تحديث طلب
     */
    async updateOrder(data) {
        if (!this.isOnline) {
            const operationId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.addPendingOperation({
                id: operationId,
                type: 'update_order',
                data: data
            });
            return { success: true, offline: true };
        }
        
        try {
            if (typeof firebase !== 'undefined' && firebase.database) {
                const orderRef = firebase.database().ref(`restaurant-system/restaurants/${data.restaurantId || 'sham-coffee-1'}/orders/${data.orderId}`);
                await orderRef.update(data.updates);
                return { success: true, offline: false };
            }
        } catch (error) {
            if (typeof ErrorHandler !== 'undefined') {
                ErrorHandler.handleFirebaseError(error, 'تحديث الطلب');
            }
            return await this.updateOrder(data);
        }
    }
    
    /**
     * إغلاق طاولة
     */
    async closeTable(data) {
        if (!this.isOnline) {
            const operationId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.addPendingOperation({
                id: operationId,
                type: 'close_table',
                data: data
            });
            return { success: true, offline: true };
        }
        
        // تنفيذ إغلاق الطاولة
        try {
            if (typeof firebase !== 'undefined' && firebase.database) {
                const updates = {};
                data.orderIds.forEach(orderId => {
                    updates[`${orderId}/status`] = 'paid';
                    updates[`${orderId}/paymentStatus`] = 'paid';
                    updates[`${orderId}/paymentMethod`] = data.paymentMethod;
                });
                
                await firebase.database().ref(`restaurant-system/restaurants/${data.restaurantId || 'sham-coffee-1'}/orders`).update(updates);
                return { success: true, offline: false };
            }
        } catch (error) {
            if (typeof ErrorHandler !== 'undefined') {
                ErrorHandler.handleFirebaseError(error, 'إغلاق الطاولة');
            }
            return await this.closeTable(data);
        }
    }
    
    /**
     * إغلاق غرفة
     */
    async closeRoom(data) {
        // نفس منطق إغلاق الطاولة
        return await this.closeTable({ ...data, type: 'room' });
    }
    
    /**
     * حفظ الإغلاق اليومي
     */
    async saveDailyClosing(data) {
        if (!this.isOnline) {
            const operationId = `closing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.addPendingOperation({
                id: operationId,
                type: 'daily_closing',
                data: data
            });
            
            // حفظ في localStorage
            const localClosings = JSON.parse(localStorage.getItem('offline_closings') || '[]');
            localClosings.push({
                id: operationId,
                ...data,
                savedAt: new Date().toISOString()
            });
            localStorage.setItem('offline_closings', JSON.stringify(localClosings));
            
            return { success: true, offline: true };
        }
        
        try {
            if (typeof firebase !== 'undefined' && firebase.database) {
                const closingRef = firebase.database().ref(`restaurant-system/restaurants/${data.restaurantId || 'sham-coffee-1'}/daily-closings`).push();
                await closingRef.set(data);
                return { success: true, offline: false };
            }
        } catch (error) {
            if (typeof ErrorHandler !== 'undefined') {
                ErrorHandler.handleFirebaseError(error, 'حفظ الإغلاق اليومي');
            }
            return await this.saveDailyClosing(data);
        }
    }
    
    /**
     * حفظ العمليات المعلقة في localStorage
     */
    savePendingOperations() {
        try {
            localStorage.setItem('cashier_pending_operations', JSON.stringify(this.pendingOperations));
        } catch (e) {
            // تجاهل خطأ localStorage
        }
    }
    
    /**
     * تحميل العمليات المعلقة من localStorage
     */
    loadPendingOperations() {
        try {
            const saved = localStorage.getItem('cashier_pending_operations');
            if (saved) {
                this.pendingOperations = JSON.parse(saved);
            }
        } catch (e) {
            this.pendingOperations = [];
        }
    }
    
    /**
     * إزالة عملية من قائمة الانتظار
     */
    removePendingOperation(operationId) {
        this.pendingOperations = this.pendingOperations.filter(op => op.id !== operationId);
        this.savePendingOperations();
    }
    
    /**
     * التحقق من حالة الاتصال
     */
    checkConnection() {
        return this.isOnline && (typeof FirebaseDB === 'undefined' || FirebaseDB.isConnected());
    }
}

// إنشاء instance واحد
const cashierOfflineHandler = new CashierOfflineHandler();

// تحميل العمليات المعلقة عند التحميل
cashierOfflineHandler.loadPendingOperations();

// تصدير
window.CashierOfflineHandler = cashierOfflineHandler;





