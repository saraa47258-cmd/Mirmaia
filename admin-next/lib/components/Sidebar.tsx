'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { ROLE_CONFIG, EmployeeRole } from '@/lib/employees';
import { 
  Coffee, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  DoorOpen, 
  Receipt, 
  Warehouse,
  UtensilsCrossed,
  Home,
  LogOut,
  X,
  ChevronLeft,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
  width?: number;
}

export default function Sidebar({ isOpen = true, onClose, isMobile = false, width = 280 }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Helper function to check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!user?.role) return false;
    const roleConfig = ROLE_CONFIG[user.role as EmployeeRole];
    if (!roleConfig) return false;
    // Admin has all permissions
    if (user.role === 'admin') return true;
    return roleConfig.permissions.includes(permission);
  };
  
  // قائمة الروابط مع الصلاحيات المطلوبة
  const allMenuItems = [
    { path: '/admin', icon: Home, label: 'لوحة التحكم', permission: 'dashboard', exact: true },
    { path: '/admin/staff-menu', icon: UtensilsCrossed, label: 'منيو الموظفين', permission: 'staff-menu' },
    { path: '/admin/cashier', icon: ShoppingCart, label: 'الكاشير', permission: 'cashier' },
    { path: '/admin/orders', icon: Receipt, label: 'الطلبات', permission: 'orders' },
    { path: '/admin/tables', icon: DoorOpen, label: 'الطاولات', permission: 'tables' },
    { path: '/admin/rooms', icon: DoorOpen, label: 'الغرف', permission: 'rooms' },
    { path: '/admin/room-orders', icon: Receipt, label: 'طلبات الغرف', permission: 'room-orders' },
    { path: '/admin/products', icon: Package, label: 'المنتجات', permission: 'products' },
    { path: '/admin/menu', icon: Coffee, label: 'المنيو', permission: 'menu' },
    { path: '/admin/inventory', icon: Warehouse, label: 'المخزن', permission: 'inventory' },
    { path: '/admin/workers', icon: Users, label: 'الموظفين', permission: 'workers' },
    { path: '/admin/permissions', icon: Shield, label: 'الصلاحيات', permission: 'workers' },
    { path: '/admin/reports', icon: BarChart3, label: 'التقارير', permission: 'reports' },
  ];

  // فلترة الروابط حسب صلاحيات المستخدم
  const menuItems = allMenuItems.filter(item => hasPermission(item.permission));

  const handleNavigation = useCallback((path: string) => {
    if (isNavigating) return;
    
    const currentPath = pathname || window.location.pathname;
    if (currentPath === path) {
      if (isMobile && onClose) onClose();
      return;
    }
    
    setIsNavigating(true);
    
    // إغلاق القائمة في الموبايل
    if (isMobile && onClose) {
      onClose();
    }
    
    router.push(path);
    setTimeout(() => setIsNavigating(false), 500);
  }, [pathname, router, isNavigating, isMobile, onClose]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string, exact?: boolean) => {
    const currentPath = pathname || '';
    if (exact) {
      return currentPath === path;
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  // لا تظهر الـ Sidebar إذا كانت مغلقة
  if (!isOpen) return null;

  // Get role badge config
  const getRoleBadge = () => {
    if (user?.role === 'admin') return { emoji: '👑', text: 'مدير النظام', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' };
    if (user?.role === 'cashier') return { emoji: '💰', text: 'كاشير', bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' };
    return { emoji: '👤', text: 'موظف', bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' };
  };

  const roleBadge = getRoleBadge();

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: `${width}px`,
      height: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
      transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(100%)') : 'translateX(0)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Header Section */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        flexShrink: 0,
      }}>
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              left: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <X style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
          </button>
        )}

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
            flexShrink: 0,
          }}>
            <Coffee style={{ width: '28px', height: '28px', color: '#ffffff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 700, 
              color: '#ffffff',
              letterSpacing: '0.3px',
            }}>
              قهوة الشام
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#64748b',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.name || 'نظام إدارة نقاط البيع'}
            </div>
          </div>
        </div>

        {/* Role Badge */}
        {user?.role && (
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: roleBadge.bg,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}>
            <span style={{ fontSize: '14px' }}>{roleBadge.emoji}</span>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: '#ffffff',
              letterSpacing: '0.2px',
            }}>
              {roleBadge.text}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <nav style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: '16px 14px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent',
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '0 12px 12px',
        }}>
          القائمة الرئيسية
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);
          const isHovered = hoveredItem === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              disabled={isNavigating}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                marginBottom: '6px',
                background: active 
                  ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
                  : isHovered 
                    ? 'rgba(255, 255, 255, 0.04)' 
                    : 'transparent',
                border: 'none',
                borderRadius: '12px',
                cursor: isNavigating ? 'wait' : 'pointer',
                color: active ? '#f59e0b' : isHovered ? '#e2e8f0' : '#94a3b8',
                fontSize: '14px',
                fontWeight: active ? 600 : 500,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'right',
                opacity: isNavigating ? 0.7 : 1,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Active Indicator */}
              {active && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '28px',
                  background: 'linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)',
                  borderRadius: '0 4px 4px 0',
                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)',
                }} />
              )}
              
              {/* Icon Container */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: active 
                  ? 'rgba(245, 158, 11, 0.15)' 
                  : isHovered 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}>
                <Icon style={{ 
                  width: '20px', 
                  height: '20px',
                  transition: 'transform 0.2s ease',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }} />
              </div>
              
              {/* Label */}
              <span style={{ 
                flex: 1,
                textAlign: 'right',
                letterSpacing: '0.2px',
              }}>
                {item.label}
              </span>
              
              {/* Arrow for active/hover */}
              {(active || isHovered) && (
                <ChevronLeft style={{ 
                  width: '16px', 
                  height: '16px',
                  color: active ? '#f59e0b' : '#64748b',
                  opacity: active ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div style={{
        padding: '16px 14px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        flexShrink: 0,
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%)',
      }}>
        <button
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.borderColor = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 16px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            cursor: 'pointer',
            color: '#f87171',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
        >
          <LogOut style={{ width: '18px', height: '18px' }} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
