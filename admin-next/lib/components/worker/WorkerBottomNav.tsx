'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';

const NAV_ITEMS: { id: string; path: string; label: string; icon: string; noPermission?: boolean }[] = [
  { id: 'home', path: '/worker', label: 'الرئيسية', icon: '🏠', noPermission: true },
  { id: 'staff-menu', path: '/worker/menu', label: 'المنيو', icon: '🍽️' },
  { id: 'orders', path: '/worker/orders', label: 'الطلبات', icon: '📋' },
  { id: 'cashier', path: '/worker/cashier', label: 'الكاشير', icon: '💰' },
  { id: 'tables', path: '/worker/tables', label: 'الطاولات', icon: '🪑' },
];

export default function WorkerBottomNav() {
  const pathname = usePathname();
  const { canAccessModule } = useWorkerAuth();

  const items = NAV_ITEMS.filter((item) =>
    item.noPermission ? true : canAccessModule(item.id)
  );
  if (items.length === 0) return null;

  return (
    <nav
      className="worker-app"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        backgroundColor: 'var(--worker-surface-card)',
        borderTop: '1px solid var(--worker-border)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        zIndex: 50,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
      }}
    >
      {items.map((item) => {
        const isActive = item.path === '/worker'
          ? pathname === '/worker'
          : pathname === item.path || pathname?.startsWith(item.path + '/');
        return (
          <Link
            key={item.id}
            href={item.path}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '10px 4px',
              textDecoration: 'none',
              color: isActive ? 'var(--worker-primary)' : 'var(--worker-text-muted)',
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
              fontSize: 11,
              fontWeight: 600,
              minHeight: 56,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
