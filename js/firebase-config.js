/**
 * إعدادات Firebase - Mirmaia
 * نظام إدارة المقاهي
 * 
 * ملاحظة: تم تحديث هذا الملف لاستخدام نظام آمن
 * في الإنتاج، استخدم Environment Variables أو Firebase App Check
 */

// محاولة قراءة الإعدادات من Environment Variables
const getFirebaseConfig = () => {
    // محاولة قراءة من window.env (يمكن تعيينها من خلال script tag)
    if (window.env && window.env.FIREBASE_CONFIG) {
        return window.env.FIREBASE_CONFIG;
    }
    
    // Mirmaia Project (mirmaia-33acc) - Default values
    // في الإنتاج، استخدم Firebase App Check لحماية API
    return {
        apiKey: window.env?.FIREBASE_API_KEY || "AIzaSyCgClGRYyHcvrKAGVG05mBnIBRDNHZVNGQ",
        authDomain: window.env?.FIREBASE_AUTH_DOMAIN || "mirmaia-33acc.firebaseapp.com",
        databaseURL: window.env?.FIREBASE_DATABASE_URL || "https://mirmaia-33acc-default-rtdb.firebaseio.com",
        projectId: window.env?.FIREBASE_PROJECT_ID || "mirmaia-33acc",
        storageBucket: window.env?.FIREBASE_STORAGE_BUCKET || "mirmaia-33acc.firebasestorage.app",
        messagingSenderId: window.env?.FIREBASE_MESSAGING_SENDER_ID || "822171259038",
        appId: window.env?.FIREBASE_APP_ID || "1:822171259038:web:c763356d68ab2a479b6b8f"
    };
};

// إعدادات Firebase
const firebaseConfig = getFirebaseConfig();

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// مرجع قاعدة البيانات
const database = firebase.database();

// تمكين الوضع المتصل
firebase.database().goOnline();

// مراقبة حالة الاتصال
const connectedRef = firebase.database().ref('.info/connected');
let isFirebaseConnected = true;
let connectionListeners = [];

connectedRef.on('value', (snap) => {
    isFirebaseConnected = snap.val() === true;
    // إخفاء console.log في الإنتاج
    if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
        console.log(isFirebaseConnected ? '🟢 متصل بـ Firebase' : '🔴 غير متصل بـ Firebase');
    }
    connectionListeners.forEach(cb => cb(isFirebaseConnected));
});

// دالة للاشتراك في تغييرات حالة الاتصال
function onFirebaseConnectionChange(callback) {
    connectionListeners.push(callback);
    callback(isFirebaseConnected);
}

// نظام التخزين المؤقت
const firebaseCache = {
    data: new Map(),
    ttl: 60000,
    maxSize: 500,
    
    set(key, value, customTtl = null) {
        if (this.data.size >= this.maxSize) {
            const firstKey = this.data.keys().next().value;
            this.data.delete(firstKey);
        }
        this.data.set(key, {
            value,
            timestamp: Date.now(),
            ttl: customTtl || this.ttl
        });
    },
    
    get(key) {
        const item = this.data.get(key);
        if (!item) return null;
        if (Date.now() - item.timestamp > item.ttl) {
            this.data.delete(key);
            return null;
        }
        return item.value;
    },
    
    invalidate(key) {
        if (key) {
            for (const k of this.data.keys()) {
                if (k.startsWith(key)) {
                    this.data.delete(k);
                }
            }
        } else {
            this.data.clear();
        }
    }
};

// دوال مساعدة
async function executeWithRetry(fn, maxRetries = 3, delay = 500) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (error.code === 'PERMISSION_DENIED') throw error;
            if (i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
}

function withTimeout(promise, ms = 10000) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('انتهت مهلة العملية')), ms)
        )
    ]);
}

// دوال المواقع
async function getSites() {
    const cacheKey = 'sites';
    const cached = firebaseCache.get(cacheKey);
    if (cached) return cached;
    
    return executeWithRetry(async () => {
        const snapshot = await withTimeout(
            database.ref('restaurant-system/sites').once('value')
        );
        const data = snapshot.val() || {};
        firebaseCache.set(cacheKey, data);
        return data;
    });
}

async function saveSite(siteId, data) {
    await executeWithRetry(async () => {
        await withTimeout(
            database.ref(`restaurant-system/sites/${siteId}`).set(data)
        );
    });
    firebaseCache.invalidate('sites');
}

// دوال المطاعم
async function getRestaurants() {
    const cacheKey = 'restaurants';
    const cached = firebaseCache.get(cacheKey);
    if (cached) return cached;
    
    return executeWithRetry(async () => {
        const snapshot = await withTimeout(
            database.ref('restaurant-system/restaurants').once('value')
        );
        const data = snapshot.val() || {};
        const result = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        firebaseCache.set(cacheKey, result);
        return result;
    });
}

async function getRestaurant(restaurantId) {
    const cacheKey = `restaurant_${restaurantId}`;
    const cached = firebaseCache.get(cacheKey);
    if (cached) return cached;
    
    return executeWithRetry(async () => {
        const snapshot = await withTimeout(
            database.ref(`restaurant-system/restaurants/${restaurantId}`).once('value')
        );
        const data = snapshot.val();
        if (data) firebaseCache.set(cacheKey, data);
        return data;
    });
}

async function saveRestaurant(restaurantId, data) {
    await executeWithRetry(async () => {
        await withTimeout(
            database.ref(`restaurant-system/restaurants/${restaurantId}`).set(data)
        );
    });
    firebaseCache.invalidate('restaurant');
}

// دوال الطلبات
const orderListeners = new Map();

async function getOrders(restaurantId) {
    const cacheKey = `orders_${restaurantId}`;
    const cached = firebaseCache.get(cacheKey);
    if (cached) return cached;
    
    return executeWithRetry(async () => {
        const snapshot = await withTimeout(
            database.ref(`restaurant-system/orders/${restaurantId}`).once('value')
        );
        const data = snapshot.val() || {};
        const result = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        firebaseCache.set(cacheKey, result);
        return result;
    });
}

function listenToOrders(restaurantId, callback) {
    if (orderListeners.has(restaurantId)) {
        database.ref(`restaurant-system/orders/${restaurantId}`).off('value', orderListeners.get(restaurantId));
    }
    
    const listener = (snapshot) => {
        const data = snapshot.val() || {};
        const orders = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        firebaseCache.set(`orders_${restaurantId}`, orders);
        callback(orders);
    };
    
    orderListeners.set(restaurantId, listener);
    database.ref(`restaurant-system/orders/${restaurantId}`).on('value', listener);
}

function stopListeningToOrders(restaurantId) {
    if (orderListeners.has(restaurantId)) {
        database.ref(`restaurant-system/orders/${restaurantId}`).off('value', orderListeners.get(restaurantId));
        orderListeners.delete(restaurantId);
    }
}

async function saveOrder(restaurantId, orderId, data) {
    await executeWithRetry(async () => {
        await withTimeout(
            database.ref(`restaurant-system/orders/${restaurantId}/${orderId}`).set(data)
        );
    });
    firebaseCache.invalidate(`orders_${restaurantId}`);
}

async function updateOrderStatus(restaurantId, orderId, status) {
    await executeWithRetry(async () => {
        await withTimeout(
            database.ref(`restaurant-system/orders/${restaurantId}/${orderId}/status`).set(status)
        );
    });
    firebaseCache.invalidate(`orders_${restaurantId}`);
}

// تصدير للاستخدام العام
window.FirebaseDB = {
    getSites,
    saveSite,
    getRestaurants,
    getRestaurant,
    saveRestaurant,
    getOrders,
    listenToOrders,
    stopListeningToOrders,
    saveOrder,
    updateOrderStatus,
    onFirebaseConnectionChange,
    isConnected: () => isFirebaseConnected,
    invalidateCache: (key) => firebaseCache.invalidate(key),
    clearCache: () => firebaseCache.data.clear()
};

// إخفاء console.log في الإنتاج
if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
    console.log('🔥 Firebase متصل بنجاح - Mirmaia');
}

