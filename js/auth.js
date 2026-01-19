/**
 * نظام المصادقة باستخدام Firebase Authentication
 * قهوة الشام - نظام إدارة المقهى
 */

// التحقق من أن Firebase تم تهيئته
if (typeof firebase === 'undefined') {
    throw new Error('Firebase لم يتم تحميله. تأكد من تحميل firebase-config.js أولاً');
}

// الحصول على auth instance
const auth = firebase.auth();

// حالة المستخدم الحالي
let currentUser = null;
let userData = null;

// مستمعون لتغييرات حالة المصادقة
const authStateListeners = [];

// مراقبة حالة المصادقة
auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    
    if (user) {
        // المستخدم مسجل دخول - جلب بياناته من قاعدة البيانات
        try {
            userData = await getUserDataFromDatabase(user.uid);
            // إشعار جميع المستمعين
            authStateListeners.forEach(callback => callback({ user, userData, isAuthenticated: true }));
        } catch (error) {
            console.error('خطأ في جلب بيانات المستخدم:', error);
            // إشعار المستمعين بالخطأ
            authStateListeners.forEach(callback => callback({ user, userData: null, isAuthenticated: false, error }));
        }
    } else {
        // المستخدم غير مسجل دخول
        userData = null;
        authStateListeners.forEach(callback => callback({ user: null, userData: null, isAuthenticated: false }));
    }
});

/**
 * تسجيل الدخول كأدمن
 */
async function loginAdmin(username, password) {
    try {
        // البحث عن الأدمن في قاعدة البيانات
        const adminRef = firebase.database().ref('restaurant-system/admins');
        const snapshot = await adminRef.once('value');
        const admins = snapshot.val() || {};
        
        let adminFound = null;
        for (const key in admins) {
            const admin = admins[key];
            if (admin.username === username && admin.password === password) {
                adminFound = { id: key, ...admin };
                break;
            }
        }
        
        if (!adminFound) {
            throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
        
        // إنشاء Custom Token أو استخدام Email/Password Auth
        // للبساطة، سنستخدم Custom Token (يتطلب Server-side)
        // أو يمكن استخدام Email/Password إذا كان لدينا email
        
        // بديل: استخدام Custom Claims في Firebase Admin SDK (يتطلب Server)
        // للآن، سنستخدم طريقة مؤقتة مع حفظ البيانات في sessionStorage
        
        // إنشاء معرف فريد للجلسة
        const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // حفظ بيانات الجلسة في sessionStorage (أكثر أماناً من localStorage)
        sessionStorage.setItem('auth_session_id', sessionId);
        sessionStorage.setItem('auth_user_id', adminFound.id);
        sessionStorage.setItem('auth_user_type', 'admin');
        sessionStorage.setItem('auth_user_data', JSON.stringify({
            id: adminFound.id,
            username: adminFound.username,
            name: adminFound.name,
            role: adminFound.role,
            restaurantId: adminFound.restaurantId || 'sham-coffee-1'
        }));
        
        // حفظ في قاعدة البيانات للتحقق لاحقاً
        await firebase.database().ref(`sessions/${sessionId}`).set({
            userId: adminFound.id,
            userType: 'admin',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 ساعة
        });
        
        return {
            success: true,
            user: {
                id: adminFound.id,
                username: adminFound.username,
                name: adminFound.name,
                role: adminFound.role,
                restaurantId: adminFound.restaurantId || 'sham-coffee-1'
            }
        };
    } catch (error) {
        console.error('خطأ في تسجيل دخول الأدمن:', error);
        throw error;
    }
}

/**
 * تسجيل الدخول كعامل
 */
async function loginWorker(username, password, restaurantId = 'sham-coffee-1') {
    try {
        // البحث عن العامل في قاعدة البيانات
        const workersRef = firebase.database().ref(`restaurant-system/workers/${restaurantId}`);
        const snapshot = await workersRef.once('value');
        const workers = snapshot.val() || {};
        
        let workerFound = null;
        for (const key in workers) {
            const worker = workers[key];
            if (worker.username === username && worker.password === password && worker.status === 'active') {
                workerFound = { id: key, ...worker };
                break;
            }
        }
        
        if (!workerFound) {
            throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
        
        // إنشاء معرف فريد للجلسة
        const sessionId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // حفظ بيانات الجلسة في sessionStorage
        sessionStorage.setItem('auth_session_id', sessionId);
        sessionStorage.setItem('auth_user_id', workerFound.id);
        sessionStorage.setItem('auth_user_type', 'worker');
        sessionStorage.setItem('auth_user_data', JSON.stringify({
            id: workerFound.id,
            username: workerFound.username,
            name: workerFound.name,
            role: workerFound.role,
            position: workerFound.position || 'عامل',
            permissions: workerFound.permissions || 'full',
            restaurantId: restaurantId
        }));
        
        // حفظ في قاعدة البيانات للتحقق لاحقاً
        await firebase.database().ref(`sessions/${sessionId}`).set({
            userId: workerFound.id,
            userType: 'worker',
            restaurantId: restaurantId,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 ساعة
        });
        
        return {
            success: true,
            user: {
                id: workerFound.id,
                username: workerFound.username,
                name: workerFound.name,
                role: workerFound.role,
                position: workerFound.position || 'عامل',
                permissions: workerFound.permissions || 'full',
                restaurantId: restaurantId
            }
        };
    } catch (error) {
        console.error('خطأ في تسجيل دخول العامل:', error);
        throw error;
    }
}

/**
 * تسجيل الخروج
 */
async function logout() {
    try {
        const sessionId = sessionStorage.getItem('auth_session_id');
        
        if (sessionId) {
            // حذف الجلسة من قاعدة البيانات
            await firebase.database().ref(`sessions/${sessionId}`).remove();
        }
        
        // مسح sessionStorage
        sessionStorage.removeItem('auth_session_id');
        sessionStorage.removeItem('auth_user_id');
        sessionStorage.removeItem('auth_user_type');
        sessionStorage.removeItem('auth_user_data');
        
        // تسجيل الخروج من Firebase Auth
        if (auth.currentUser) {
            await auth.signOut();
        }
        
        return { success: true };
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        throw error;
    }
}

/**
 * التحقق من حالة المصادقة الحالية
 */
async function checkAuth() {
    try {
        const sessionId = sessionStorage.getItem('auth_session_id');
        
        if (!sessionId) {
            return { isAuthenticated: false };
        }
        
        // التحقق من الجلسة في قاعدة البيانات
        const sessionRef = firebase.database().ref(`sessions/${sessionId}`);
        const snapshot = await sessionRef.once('value');
        const session = snapshot.val();
        
        if (!session) {
            // الجلسة غير موجودة - مسح sessionStorage
            sessionStorage.clear();
            return { isAuthenticated: false };
        }
        
        // التحقق من انتهاء الجلسة
        if (session.expiresAt && Date.now() > session.expiresAt) {
            // الجلسة منتهية - حذفها
            await sessionRef.remove();
            sessionStorage.clear();
            return { isAuthenticated: false };
        }
        
        // جلب بيانات المستخدم
        const userDataStr = sessionStorage.getItem('auth_user_data');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            return {
                isAuthenticated: true,
                user: userData,
                session: session
            };
        }
        
        return { isAuthenticated: false };
    } catch (error) {
        console.error('خطأ في التحقق من المصادقة:', error);
        return { isAuthenticated: false, error: error.message };
    }
}

/**
 * الحصول على بيانات المستخدم الحالي
 */
function getCurrentUser() {
    const userDataStr = sessionStorage.getItem('auth_user_data');
    if (userDataStr) {
        try {
            return JSON.parse(userDataStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

/**
 * التحقق من نوع المستخدم
 */
function isAdmin() {
    const userType = sessionStorage.getItem('auth_user_type');
    return userType === 'admin';
}

function isWorker() {
    const userType = sessionStorage.getItem('auth_user_type');
    return userType === 'worker';
}

/**
 * جلب بيانات المستخدم من قاعدة البيانات
 */
async function getUserDataFromDatabase(userId) {
    // هذه الدالة يمكن توسيعها لاحقاً عند استخدام Firebase Auth بشكل كامل
    const userDataStr = sessionStorage.getItem('auth_user_data');
    if (userDataStr) {
        return JSON.parse(userDataStr);
    }
    return null;
}

/**
 * الاشتراك في تغييرات حالة المصادقة
 */
function onAuthStateChanged(callback) {
    authStateListeners.push(callback);
    
    // استدعاء فوري بالحالة الحالية
    const currentAuth = getCurrentUser();
    if (currentAuth) {
        callback({ user: currentAuth, userData: currentAuth, isAuthenticated: true });
    } else {
        callback({ user: null, userData: null, isAuthenticated: false });
    }
}

// تصدير الدوال
window.Auth = {
    loginAdmin,
    loginWorker,
    logout,
    checkAuth,
    getCurrentUser,
    isAdmin,
    isWorker,
    onAuthStateChanged,
    auth: auth
};





