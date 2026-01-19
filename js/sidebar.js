// Sidebar Logic - Runs immediately to ensure elements exist before other scripts
(function() {
    const sidebarContainer = document.querySelector('.sidebar');
    if (!sidebarContainer) return;

    // Get current page filename
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    // التحقق من نوع المستخدم (استخدام نظام المصادقة الجديد)
    let isAdmin = false;
    let isWorker = false;
    
    // محاولة استخدام نظام المصادقة الجديد
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
        const currentUser = Auth.getCurrentUser();
        if (currentUser) {
            isAdmin = currentUser.role === 'admin';
            isWorker = currentUser.role === 'worker';
        }
    } else {
        // Fallback للتوافق مع الكود القديم
        isAdmin = sessionStorage.getItem('auth_user_type') === 'admin';
        isWorker = sessionStorage.getItem('auth_user_type') === 'worker';
    }

    // قائمة الأدمن (جميع الصفحات)
    const adminMenuItems = [
        { name: 'لوحة التحكم', icon: 'fa-home', link: 'index.html', id: 'dashboard' },
        { name: 'المنيو', icon: 'fa-cloud', link: 'menu.html', id: 'menu' },
        { name: 'منيو الموظفين', icon: 'fa-utensils', link: 'menu-staff.html', id: 'menu-staff' },
        { name: 'إدارة القائمة', icon: 'fa-edit', link: 'admin-menu.html', id: 'admin-menu' },
        { name: 'الطلبات', icon: 'fa-list-alt', link: 'all-orders.html', id: 'all-orders' },
        { name: 'الطاولات', icon: 'fa-chair', link: 'tables.html', id: 'tables' },
        { name: 'الجلسات الخاصة', icon: 'fa-couch', link: 'rooms.html', id: 'rooms' },
        { name: 'إدارة العمال', icon: 'fa-users', link: 'admin-workers.html', id: 'admin-workers' },
        { name: 'الكاشير', icon: 'fa-cash-register', link: 'cashier.html', id: 'cashier' },
        { name: 'المخزن', icon: 'fa-warehouse', link: 'inventory.html', id: 'inventory' },
        { name: 'نظام الباركود', icon: 'fa-barcode', link: 'barcode.html', id: 'barcode' },
        { name: 'التقارير', icon: 'fa-chart-bar', link: 'reports.html', id: 'reports' }
    ];

    // قائمة العامل بصلاحيات كاملة
    const workerFullMenuItems = [
        { name: 'منيو الطلبات', icon: 'fa-utensils', link: 'menu-staff.html', id: 'menu-staff' },
        { name: 'الكاشير', icon: 'fa-cash-register', link: 'cashier.html', id: 'cashier' },
        { name: 'الطاولات', icon: 'fa-chair', link: 'tables.html', id: 'tables' },
        { name: 'الجلسات الخاصة', icon: 'fa-couch', link: 'rooms.html', id: 'rooms' }
    ];
    
    // قائمة العامل بصلاحيات منيو فقط
    const workerMenuOnlyItems = [
        { name: 'منيو الطلبات', icon: 'fa-utensils', link: 'menu-staff.html', id: 'menu-staff' }
    ];

    // اختيار القائمة المناسبة
    let menuItems;
    let workerPermissions = 'full';
    
    // محاولة الحصول على الصلاحيات من نظام المصادقة الجديد
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
        const currentUser = Auth.getCurrentUser();
        if (currentUser && currentUser.permissions) {
            workerPermissions = currentUser.permissions;
        }
    } else {
        // Fallback
        const userDataStr = sessionStorage.getItem('auth_user_data');
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                workerPermissions = userData.permissions || 'full';
            } catch (e) {
                workerPermissions = 'full';
            }
        }
    }
    
    if (isWorker) {
        // للعامل: حسب الصلاحيات
        if (workerPermissions === 'menu-only') {
            menuItems = workerMenuOnlyItems;
        } else {
            menuItems = workerFullMenuItems;
        }
    } else if (isAdmin) {
        // للأدمن: جميع الصفحات
        menuItems = adminMenuItems;
    } else {
        // إذا لم يكن مسجل دخول: توجيه لتسجيل الدخول
        menuItems = [];
    }

    // معلومات المستخدم
    let userName = 'مستخدم';
    let userRole = 'مستخدم';
    
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
        const currentUser = Auth.getCurrentUser();
        if (currentUser) {
            userName = currentUser.name || (isAdmin ? 'مدير النظام' : 'عامل');
            userRole = isAdmin ? 'أدمن' : (isWorker ? 'عامل' : 'مستخدم');
        }
    } else {
        // Fallback
        const userDataStr = sessionStorage.getItem('auth_user_data');
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                userName = userData.name || (isAdmin ? 'مدير النظام' : 'عامل');
                userRole = isAdmin ? 'أدمن' : (isWorker ? 'عامل' : 'مستخدم');
            } catch (e) {
                userName = isAdmin ? 'مدير النظام' : (isWorker ? 'عامل' : 'مستخدم');
                userRole = isAdmin ? 'أدمن' : (isWorker ? 'عامل' : 'مستخدم');
            }
        }
    }

    let sidebarHTML = `
        <div class="sidebar-header">
            <div class="logo">💨</div>
            <div class="brand">
                <h1>قهوة الشام</h1>
                <p>${userRole}</p>
            </div>
        </div>

        <nav class="nav-menu">
    `;

    // التأكد من أن العامل لا يرى عناصر إدارية
    if (isWorker) {
        // للعامل: فقط عرض العناصر المسموحة حسب الصلاحيات
        menuItems.forEach(item => {
            let isActive = page === item.link;
            sidebarHTML += `
                <a href="${item.link}" class="nav-item ${isActive ? 'active' : ''}" data-section="${item.id}">
                    <i class="fas ${item.icon}"></i>
                    <span>${item.name}</span>
                </a>
            `;
        });
        
        // إضافة شارة الصلاحيات للعامل بصلاحيات منيو فقط
        if (workerPermissions === 'menu-only') {
            sidebarHTML += `
                <div style="padding: 10px; margin: 10px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; text-align: center; font-size: 12px; color: #fca5a5;">
                    🔒 صلاحيات منيو فقط
                </div>
            `;
        }
    } else {
        // للأدمن أو غير المسجلين
        menuItems.forEach(item => {
        // Check if active
        let isActive = false;
        if (page === item.link) {
            isActive = true;
        }

            sidebarHTML += `
                <a href="${item.link}" class="nav-item ${isActive ? 'active' : ''}" data-section="${item.id}">
                    <i class="fas ${item.icon}"></i>
                    <span>${item.name}</span>
                </a>
            `;
        });
    }

    sidebarHTML += `
        </nav>

        <div class="sidebar-footer">
            <button class="btn btn-secondary" onclick="if(typeof BonApp !== 'undefined') BonApp.toggleTheme(); else toggleThemeFallback()" style="width: 100%; margin-bottom: 10px;">
                <i class="fas fa-moon"></i>
                <span>تغيير المظهر</span>
            </button>
            <button class="btn btn-danger" onclick="logout()" style="width: 100%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); margin-bottom: 10px;">
                <i class="fas fa-sign-out-alt"></i>
                <span>تسجيل الخروج</span>
            </button>
            <button class="btn btn-danger" onclick="clearAppCache()" style="width: 100%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">
                <i class="fas fa-sync-alt"></i>
                <span>تحديث التطبيق</span>
            </button>
        </div>
    `;

    sidebarContainer.innerHTML = sidebarHTML;
})();

// Function to clear cache and reload - will be loaded from common.js if available, otherwise use this fallback
if (typeof clearAppCache === 'undefined') {
    async function clearAppCache() {
        if (!confirm('هل تريد تحديث التطبيق ومسح الذاكرة المؤقتة؟ سيتم إعادة تحميل الصفحة.')) return;

        try {
            // 1. Unregister Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }

            // 2. Delete all Caches
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }

            // 3. Reload page
            window.location.reload(true);
        } catch (error) {
            console.error('Error clearing cache:', error);
            alert('حدث خطأ أثناء مسح الذاكرة المؤقتة. يرجى تحديث الصفحة يدوياً.');
            window.location.reload();
        }
    }
    window.clearAppCache = clearAppCache;
}

// Fallback theme toggler if BonApp is not loaded
function toggleThemeFallback() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('bon-theme', isLight ? 'light' : 'dark');
}

// Apply theme on load if BonApp didn't do it
if (localStorage.getItem('bon-theme') === 'light') {
    document.body.classList.add('light-mode');
}

// تسجيل الخروج
async function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        try {
            // استخدام نظام المصادقة الجديد
            if (typeof Auth !== 'undefined' && Auth.logout) {
                await Auth.logout();
            } else {
                // Fallback - مسح sessionStorage
                sessionStorage.clear();
            }
            
            // توجيه لتسجيل الدخول
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
}
