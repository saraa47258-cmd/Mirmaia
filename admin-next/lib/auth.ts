import { database, RESTAURANT_ID } from './firebase/config';
import { ref, get, set, remove, update } from 'firebase/database';

export type UserRole = 'admin' | 'cashier' | 'staff';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  restaurantId: string;
  position?: string;
  permissions?: string[] | 'full' | 'menu-only';
  detailedPermissions?: {
    modules?: {
      staffMenu?: boolean;
      orders?: boolean;
      tables?: boolean;
      rooms?: boolean;
      cashier?: boolean;
      inventory?: boolean;
      reports?: boolean;
      products?: boolean;
    };
    actions?: {
      createOrder?: boolean;
      editOrder?: boolean;
      cancelOrder?: boolean;
      processPayment?: boolean;
      applyDiscount?: boolean;
      viewFinancials?: boolean;
      manageProducts?: boolean;
      manageTables?: boolean;
      manageRooms?: boolean;
      dailyClosing?: boolean;
    };
  };
}

interface Session {
  userId: string;
  userType: UserRole;
  createdAt: number;
  expiresAt: number;
  restaurantId?: string;
}

// Check if we're in browser
const isBrowser = typeof window !== 'undefined';

// Session management
const SESSION_KEY = 'auth_session_id';
const USER_DATA_KEY = 'auth_user_data';
const USER_TYPE_KEY = 'auth_user_type';
const AUTH_COOKIE_NAME = 'auth_session';

// مساعد لإدارة الكوكيز
const CookieHelper = {
  set(name: string, value: string, days: number = 1) {
    if (!isBrowser) return;
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
  },
  
  get(name: string): string | null {
    if (!isBrowser) return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },
  
  remove(name: string) {
    if (!isBrowser) return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// تشفير بسيط للكلمة السرية (في الإنتاج، استخدم bcrypt على الخادم)
const hashPassword = async (password: string): Promise<string> => {
  // في الإنتاج الحقيقي، يجب استخدام bcrypt على الخادم
  // هذا تشفير مؤقت للعرض فقط
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'mirmaia-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// مقارنة كلمة المرور (للتوافق مع النظام القديم)
const verifyPassword = async (inputPassword: string, storedPassword: string): Promise<boolean> => {
  // في النظام الحالي، كلمات المرور مخزنة كنص (غير آمن)
  // نقارن مباشرة للتوافق، لكن يجب تحديث النظام لاستخدام التشفير
  return inputPassword === storedPassword;
};

// Login for admin (via restaurants)
export const loginAdmin = async (username: string, password: string): Promise<User> => {
  // First, try to find in restaurants (restaurant admin)
  const adminRef = ref(database, 'restaurant-system/restaurants');
  const snapshot = await get(adminRef);
  const restaurants = snapshot.val() || {};
  
  let adminFound: any = null;
  for (const key in restaurants) {
    const restaurant = restaurants[key];
    const passwordMatch = await verifyPassword(password, restaurant.password);
    if (restaurant.username === username && passwordMatch) {
      adminFound = { id: key, ...restaurant, isRestaurantAdmin: true };
      break;
    }
  }

  // If not found in restaurants, try workers with admin role
  if (!adminFound) {
    const workersRef = ref(database, `restaurant-system/workers/${RESTAURANT_ID}`);
    const workersSnapshot = await get(workersRef);
    const workers = workersSnapshot.val() || {};

    for (const key in workers) {
      const worker = workers[key];
      const passwordMatch = await verifyPassword(password, worker.password);
      if (
        worker.username === username && 
        passwordMatch &&
        (worker.active !== false && worker.isActive !== false)
      ) {
        adminFound = { id: key, ...worker, isWorker: true };
        break;
      }
    }
  }
  
  if (!adminFound) {
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  }

  // Check if user is active (for workers)
  if (adminFound.isWorker && (adminFound.active === false || adminFound.isActive === false)) {
    throw new Error('هذا الحساب معطل. تواصل مع المدير.');
  }
  
  // Determine role
  const role: UserRole = adminFound.isRestaurantAdmin ? 'admin' : (adminFound.role || 'staff');
  
  // Create session
  const sessionId = `${role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const userData: User = {
    id: adminFound.id,
    username: adminFound.username,
    name: adminFound.name || adminFound.fullName || 'مستخدم',
    role,
    restaurantId: RESTAURANT_ID,
    position: adminFound.position,
    permissions: adminFound.permissions,
  };

  // حفظ في sessionStorage
  if (isBrowser) {
    sessionStorage.setItem(SESSION_KEY, sessionId);
    sessionStorage.setItem(USER_TYPE_KEY, role);
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    
    // حفظ في الكوكي للميدل وير
    CookieHelper.set(AUTH_COOKIE_NAME, JSON.stringify({ 
      sessionId, 
      role, 
      userId: userData.id 
    }), 1);
  }
  
  // Save session to database
  await set(ref(database, `sessions/${sessionId}`), {
    userId: adminFound.id,
    userType: role,
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    restaurantId: RESTAURANT_ID,
  });

  // Update last login for workers
  if (adminFound.isWorker) {
    await update(ref(database, `restaurant-system/workers/${RESTAURANT_ID}/${adminFound.id}`), {
      lastLoginAt: new Date().toISOString(),
    });
  }
  
  return userData;
};

// Login for employees (staff/cashier)
export const loginEmployee = async (username: string, password: string): Promise<User> => {
  const workersRef = ref(database, `restaurant-system/workers/${RESTAURANT_ID}`);
  const snapshot = await get(workersRef);
  const workers = snapshot.val() || {};
  
  let workerFound: any = null;
  let workerId: string = '';
  
  for (const key in workers) {
    const worker = workers[key];
    const passwordMatch = await verifyPassword(password, worker.password);
    if (worker.username === username && passwordMatch) {
      workerFound = { id: key, ...worker };
      workerId = key;
      break;
    }
  }
  
  if (!workerFound) {
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  }

  // Check if active
  if (workerFound.active === false || workerFound.isActive === false) {
    throw new Error('هذا الحساب معطل. تواصل مع المدير.');
  }
  
  const role: UserRole = workerFound.role || 'staff';
  
  // Create session
  const sessionId = `${role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const userData: User = {
    id: workerId,
    username: workerFound.username,
    name: workerFound.name || workerFound.fullName || 'موظف',
    role,
    restaurantId: RESTAURANT_ID,
    position: workerFound.position,
    permissions: workerFound.permissions,
    detailedPermissions: workerFound.detailedPermissions, // Include detailed permissions
  } as User;

  // حفظ في sessionStorage
  if (isBrowser) {
    sessionStorage.setItem(SESSION_KEY, sessionId);
    sessionStorage.setItem(USER_TYPE_KEY, role);
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    
    // حفظ في الكوكي للميدل وير
    CookieHelper.set(AUTH_COOKIE_NAME, JSON.stringify({ 
      sessionId, 
      role, 
      userId: userData.id 
    }), 0.5); // 12 ساعة
  }
  
  // Save session to database
  await set(ref(database, `sessions/${sessionId}`), {
    userId: workerId,
    userType: role,
    createdAt: Date.now(),
    expiresAt: Date.now() + (12 * 60 * 60 * 1000), // 12 hours for employees
    restaurantId: RESTAURANT_ID,
  });

  // Update last login
  await update(ref(database, `restaurant-system/workers/${RESTAURANT_ID}/${workerId}`), {
    lastLoginAt: new Date().toISOString(),
  });
  
  return userData;
};

export const logout = async (): Promise<void> => {
  if (!isBrowser) return;
  
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (sessionId) {
    await remove(ref(database, `sessions/${sessionId}`));
  }
  
  // مسح sessionStorage
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
  sessionStorage.removeItem(USER_TYPE_KEY);
  
  // مسح الكوكي
  CookieHelper.remove(AUTH_COOKIE_NAME);
};

export const checkAuth = async (): Promise<{ isAuthenticated: boolean; user?: User }> => {
  if (!isBrowser) {
    return { isAuthenticated: false };
  }
  
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // تحقق من الكوكي إذا لم يكن في sessionStorage
    const cookieData = CookieHelper.get(AUTH_COOKIE_NAME);
    if (!cookieData) {
      return { isAuthenticated: false };
    }
  }
  
  const currentSessionId = sessionId || (() => {
    try {
      const cookieData = CookieHelper.get(AUTH_COOKIE_NAME);
      return cookieData ? JSON.parse(cookieData).sessionId : null;
    } catch { return null; }
  })();
  
  if (!currentSessionId) {
    return { isAuthenticated: false };
  }
  
  // Check session in database
  const sessionRef = ref(database, `sessions/${currentSessionId}`);
  const snapshot = await get(sessionRef);
  const session: Session | null = snapshot.val();
  
  if (!session) {
    sessionStorage.clear();
    CookieHelper.remove(AUTH_COOKIE_NAME);
    return { isAuthenticated: false };
  }
  
  // Check expiration
  if (session.expiresAt && Date.now() > session.expiresAt) {
    await remove(sessionRef);
    sessionStorage.clear();
    CookieHelper.remove(AUTH_COOKIE_NAME);
    return { isAuthenticated: false };
  }
  
  // Get user data
  const userDataStr = sessionStorage.getItem(USER_DATA_KEY);
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return {
        isAuthenticated: true,
        user: userData,
      };
    } catch (e) {
      return { isAuthenticated: false };
    }
  }
  
  return { isAuthenticated: false };
};

export const getCurrentUser = (): User | null => {
  if (!isBrowser) return null;
  
  // First try sessionStorage
  let userDataStr = sessionStorage.getItem(USER_DATA_KEY);
  
  // If not in sessionStorage, try localStorage (for WebView injection)
  if (!userDataStr) {
    userDataStr = localStorage.getItem(USER_DATA_KEY);
    // If found in localStorage, copy to sessionStorage for consistency
    if (userDataStr) {
      sessionStorage.setItem(USER_DATA_KEY, userDataStr);
      const userType = localStorage.getItem(USER_TYPE_KEY);
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (userType) sessionStorage.setItem(USER_TYPE_KEY, userType);
      if (sessionId) sessionStorage.setItem(SESSION_KEY, sessionId);
    }
  }
  
  if (userDataStr) {
    try {
      return JSON.parse(userDataStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const isAdmin = (): boolean => {
  if (!isBrowser) return false;
  return sessionStorage.getItem(USER_TYPE_KEY) === 'admin' || 
         localStorage.getItem(USER_TYPE_KEY) === 'admin';
};

export const isCashier = (): boolean => {
  if (!isBrowser) return false;
  const role = sessionStorage.getItem(USER_TYPE_KEY) || localStorage.getItem(USER_TYPE_KEY);
  return role === 'cashier' || role === 'admin';
};

export const isStaff = (): boolean => {
  if (!isBrowser) return false;
  const role = sessionStorage.getItem(USER_TYPE_KEY) || localStorage.getItem(USER_TYPE_KEY);
  return role === 'staff' || role === 'cashier' || role === 'admin';
};

// Check if user has permission to access a route
export const hasRouteAccess = (path: string): boolean => {
  if (!isBrowser) return false;
  
  const role = (sessionStorage.getItem(USER_TYPE_KEY) || localStorage.getItem(USER_TYPE_KEY)) as UserRole | null;
  if (!role) return false;
  
  // Admin has full access
  if (role === 'admin') return true;
  
  // Define allowed routes per role
  const allowedRoutes: Record<Exclude<UserRole, 'admin'>, string[]> = {
    cashier: [
      '/admin/cashier',
      '/admin/orders',
      '/admin/tables',
      '/admin/rooms',
      '/admin/room-orders',
      '/admin/staff-menu',
    ],
    staff: [
      '/admin/staff-menu',
      '/admin/orders',
      '/admin/tables',
      '/admin/rooms',
    ],
  };
  
  const routes = allowedRoutes[role] || [];
  return routes.some(route => path.startsWith(route));
};

// Get user role label
export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin': return 'مدير';
    case 'cashier': return 'كاشير';
    case 'staff': return 'موظف';
    default: return 'مستخدم';
  }
};
