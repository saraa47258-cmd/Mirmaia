'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, logout } from '../auth';
import { 
  LayoutDashboard, 
  UtensilsCrossed,
  Users,
  ClipboardList,
  ShoppingCart,
  Grid3X3,
  Sofa,
  UserCircle,
  Calculator,
  Package,
  QrCode,
  BarChart3,
  LogOut,
  Coffee
} from 'lucide-react';

const menuItems = [
  { title: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
  { title: 'المنيو', href: '/admin/menu', icon: UtensilsCrossed },
  { title: 'منيو الموظفين', href: '/admin/staff-menu', icon: Users },
  { title: 'إدارة القائمة', href: '/admin/products', icon: ClipboardList },
  { title: 'الطلبات', href: '/admin/orders', icon: ShoppingCart },
  { title: 'الطاولات', href: '/admin/tables', icon: Grid3X3 },
  { title: 'الجلسات الخاصة', href: '/admin/rooms', icon: Sofa },
  { title: 'إدارة العملاء', href: '/admin/customers', icon: UserCircle },
  { title: 'الكاشير', href: '/admin/cashier', icon: Calculator },
  { title: 'المخزن', href: '/admin/inventory', icon: Package },
  { title: 'نظام الباركود', href: '/admin/barcode', icon: QrCode },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = getCurrentUser();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside style={{
      position: 'fixed',
      right: 0,
      top: 0,
      height: '100vh',
      width: '260px',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          }}>
            <Coffee style={{ width: '22px', height: '22px', color: '#ffffff' }} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>قهوة الشام</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>لوحة الإدارة</div>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {user.role === 'admin' ? 'مدير النظام' : 'موظف'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: isActive ? '#eef2ff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#475569',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#1e293b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? '#e0e7ff' : '#f1f5f9',
                  color: isActive ? '#4f46e5' : '#64748b',
                  transition: 'all 0.2s',
                }}>
                  <Icon style={{ width: '18px', height: '18px' }} />
                </div>
                <span style={{ flex: 1 }}>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Reports Button */}
      <div style={{ padding: '12px' }}>
        <Link
          href="/admin/reports"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            background: pathname === '/admin/reports' 
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.35)';
          }}
        >
          <BarChart3 style={{ width: '20px', height: '20px' }} />
          <span>التقارير</span>
        </Link>
      </div>

      {/* Logout */}
      <div style={{ padding: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: '13px',
            fontWeight: 500,
            color: '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <LogOut style={{ width: '18px', height: '18px' }} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
