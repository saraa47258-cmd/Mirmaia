import { database, RESTAURANT_ID } from './firebase/config';
import { ref, get, set, remove } from 'firebase/database';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'worker';
  restaurantId: string;
  position?: string;
  permissions?: 'full' | 'menu-only';
}

interface Session {
  userId: string;
  userType: 'admin' | 'worker';
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

export const loginAdmin = async (username: string, password: string): Promise<User> => {
  // Search for admin in database
  const adminRef = ref(database, 'restaurant-system/restaurants');
  const snapshot = await get(adminRef);
  const restaurants = snapshot.val() || {};
  
  let adminFound: any = null;
  for (const key in restaurants) {
    const restaurant = restaurants[key];
    if (restaurant.username === username && restaurant.password === password) {
      adminFound = { id: key, ...restaurant };
      break;
    }
  }
  
  if (!adminFound) {
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  }
  
  // Create session
  const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  if (isBrowser) {
    sessionStorage.setItem(SESSION_KEY, sessionId);
    sessionStorage.setItem(USER_TYPE_KEY, 'admin');
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify({
      id: adminFound.id,
      username: adminFound.username,
      name: adminFound.name || 'مدير',
      role: 'admin',
      restaurantId: RESTAURANT_ID,
    }));
  }
  
  // Save session to database
  await set(ref(database, `sessions/${sessionId}`), {
    userId: adminFound.id,
    userType: 'admin',
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    restaurantId: RESTAURANT_ID,
  });
  
  return {
    id: adminFound.id,
    username: adminFound.username,
    name: adminFound.name || 'مدير',
    role: 'admin',
    restaurantId: RESTAURANT_ID,
  };
};

export const logout = async (): Promise<void> => {
  if (!isBrowser) return;
  
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (sessionId) {
    await remove(ref(database, `sessions/${sessionId}`));
  }
  
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
  sessionStorage.removeItem(USER_TYPE_KEY);
};

export const checkAuth = async (): Promise<{ isAuthenticated: boolean; user?: User }> => {
  if (!isBrowser) {
    return { isAuthenticated: false };
  }
  
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    return { isAuthenticated: false };
  }
  
  // Check session in database
  const sessionRef = ref(database, `sessions/${sessionId}`);
  const snapshot = await get(sessionRef);
  const session: Session | null = snapshot.val();
  
  if (!session) {
    sessionStorage.clear();
    return { isAuthenticated: false };
  }
  
  // Check expiration
  if (session.expiresAt && Date.now() > session.expiresAt) {
    await remove(sessionRef);
    sessionStorage.clear();
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
  
  const userDataStr = sessionStorage.getItem(USER_DATA_KEY);
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
  return sessionStorage.getItem(USER_TYPE_KEY) === 'admin';
};

