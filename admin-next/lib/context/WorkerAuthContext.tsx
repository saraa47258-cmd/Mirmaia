'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginEmployee, logout as authLogout, checkAuth } from '@/lib/auth';
import { User } from '@/lib/auth';

interface WorkerAuthContextType {
  worker: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canAccessModule: (module: string) => boolean;
  canPerformAction: (action: string) => boolean;
  shouldHideFinancialData: () => boolean;
}

const WorkerAuthContext = createContext<WorkerAuthContextType | undefined>(undefined);

export function WorkerAuthProvider({ children }: { children: ReactNode }) {
  const [worker, setWorker] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { isAuthenticated, user: userData } = await checkAuth();
        // Only allow workers (not admins)
        if (isAuthenticated && userData && userData.role !== 'admin') {
          setWorker(userData);
        } else {
          setWorker(null);
        }
      } catch (error) {
        console.error('Worker auth check error:', error);
        setWorker(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const userData = await loginEmployee(username, password);
      setWorker(userData);
      router.push('/worker');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setWorker(null);
      router.push('/worker/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!worker) return false;
    
    // Admin has all permissions
    if (worker.role === 'admin') return true;

    // Check legacy permissions
    const permissions = worker.permissions;
    if (permissions === 'full') return true;
    if (Array.isArray(permissions)) {
      return permissions.includes(permission);
    }

    // Check detailed permissions
    const detailedPermissions = (worker as any).detailedPermissions;
    if (detailedPermissions) {
      // Check modules
      const modules = detailedPermissions.modules;
      if (modules) {
        const permissionMap: Record<string, string> = {
          'staff-menu': 'staffMenu',
          'staffMenu': 'staffMenu',
          'orders': 'orders',
          'tables': 'tables',
          'rooms': 'rooms',
          'cashier': 'cashier',
          'inventory': 'inventory',
          'reports': 'reports',
          'products': 'products',
          'menu': 'staffMenu',
        };
        
        const moduleName = permissionMap[permission];
        if (moduleName && modules[moduleName] === true) {
          return true;
        }
      }

      // Check actions
      const actions = detailedPermissions.actions;
      if (actions) {
        const actionMap: Record<string, string> = {
          'createOrder': 'createOrder',
          'editOrder': 'editOrder',
          'cancelOrder': 'cancelOrder',
          'processPayment': 'processPayment',
          'applyDiscount': 'applyDiscount',
          'viewFinancials': 'viewFinancials',
          'manageProducts': 'manageProducts',
          'manageTables': 'manageTables',
          'manageRooms': 'manageRooms',
          'dailyClosing': 'dailyClosing',
        };
        
        const actionName = actionMap[permission];
        if (actionName && actions[actionName] === true) {
          return true;
        }
      }
    }

    return false;
  };

  const canAccessModule = (module: string): boolean => {
    return hasPermission(module);
  };

  const canPerformAction = (action: string): boolean => {
    return hasPermission(action);
  };

  const shouldHideFinancialData = (): boolean => {
    if (!worker) return false;
    if (worker.role === 'admin') return false;

    const detailedPermissions = (worker as any).detailedPermissions;
    if (detailedPermissions?.actions) {
      return detailedPermissions.actions.viewFinancials !== true;
    }

    return false;
  };

  return (
    <WorkerAuthContext.Provider value={{ 
      worker, 
      loading, 
      login, 
      logout,
      hasPermission,
      canAccessModule,
      canPerformAction,
      shouldHideFinancialData,
    }}>
      {children}
    </WorkerAuthContext.Provider>
  );
}

export function useWorkerAuth() {
  const context = useContext(WorkerAuthContext);
  if (context === undefined) {
    throw new Error('useWorkerAuth must be used within a WorkerAuthProvider');
  }
  return context;
}
