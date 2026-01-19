/**
 * ملف مساعد للتحقق من المصادقة في جميع الصفحات
 * يستخدم نظام المصادقة الجديد بدلاً من localStorage
 */

// التحقق من أن Auth تم تحميله
if (typeof Auth === 'undefined') {
    console.warn('نظام المصادقة غير محمل. تأكد من تحميل auth.js أولاً');
}

/**
 * التحقق من تسجيل الدخول كأدمن
 */
async function checkAdminAuth() {
    try {
        if (typeof Auth === 'undefined') {
            // Fallback للتوافق مع الكود القديم
            return sessionStorage.getItem('auth_user_type') === 'admin';
        }
        
        const authCheck = await Auth.checkAuth();
        return authCheck.isAuthenticated && authCheck.user && authCheck.user.role === 'admin';
    } catch (error) {
        if (typeof ErrorHandler !== 'undefined') {
            ErrorHandler.handleNonCriticalError(error, 'التحقق من مصادقة الأدمن');
        }
        return false;
    }
}

/**
 * التحقق من تسجيل الدخول كعامل
 */
async function checkWorkerAuth() {
    try {
        if (typeof Auth === 'undefined') {
            // Fallback للتوافق مع الكود القديم
            return sessionStorage.getItem('auth_user_type') === 'worker';
        }
        
        const authCheck = await Auth.checkAuth();
        return authCheck.isAuthenticated && authCheck.user && authCheck.user.role === 'worker';
    } catch (error) {
        if (typeof ErrorHandler !== 'undefined') {
            ErrorHandler.handleNonCriticalError(error, 'التحقق من مصادقة العامل');
        }
        return false;
    }
}

/**
 * التحقق من تسجيل الدخول (أدمن أو عامل)
 */
async function checkAnyAuth() {
    try {
        const isAdmin = await checkAdminAuth();
        const isWorker = await checkWorkerAuth();
        return isAdmin || isWorker;
    } catch (error) {
        return false;
    }
}

/**
 * الحصول على بيانات المستخدم الحالي
 */
function getCurrentUserData() {
    try {
        if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
            return Auth.getCurrentUser();
        }
        
        // Fallback
        const userDataStr = sessionStorage.getItem('auth_user_data');
        if (userDataStr) {
            return JSON.parse(userDataStr);
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * التحقق من المصادقة وإعادة التوجيه إذا لزم الأمر
 */
async function requireAuth(requiredRole = null, redirectTo = null) {
    try {
        const authCheck = await Auth.checkAuth();
        
        if (!authCheck.isAuthenticated) {
            // غير مسجل دخول - إعادة توجيه
            const redirect = redirectTo || (requiredRole === 'admin' ? 'login-admin.html' : 'login-worker.html');
            window.location.href = redirect;
            return false;
        }
        
        if (requiredRole && authCheck.user.role !== requiredRole) {
            // نوع المستخدم غير صحيح - إعادة توجيه
            const redirect = redirectTo || (requiredRole === 'admin' ? 'login-admin.html' : 'login-worker.html');
            window.location.href = redirect;
            return false;
        }
        
        return true;
    } catch (error) {
        if (typeof ErrorHandler !== 'undefined') {
            ErrorHandler.handleError(error, 'التحقق من المصادقة', 'error');
        }
        return false;
    }
}

/**
 * دالة تسجيل الخروج
 */
async function logoutUser() {
    try {
        if (typeof Auth !== 'undefined' && Auth.logout) {
            await Auth.logout();
        } else {
            // Fallback - مسح sessionStorage
            sessionStorage.clear();
        }
        
        // إعادة توجيه لتسجيل الدخول
        window.location.href = 'login-admin.html';
    } catch (error) {
        if (typeof ErrorHandler !== 'undefined') {
            ErrorHandler.handleError(error, 'تسجيل الخروج', 'error');
        }
        // حتى في حالة الخطأ، مسح البيانات المحلية
        sessionStorage.clear();
        window.location.href = 'login-admin.html';
    }
}

// تصدير للاستخدام العام
window.AuthCheck = {
    checkAdminAuth,
    checkWorkerAuth,
    checkAnyAuth,
    getCurrentUserData,
    requireAuth,
    logout: logoutUser
};

// دالة مساعدة للتوافق مع الكود القديم
window.isAdminLoggedIn = () => {
    return sessionStorage.getItem('auth_user_type') === 'admin';
};

window.isWorkerLoggedIn = () => {
    return sessionStorage.getItem('auth_user_type') === 'worker';
};





