'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '../auth';

const menuItems = [
  {
    title: 'لوحة التحكم',
    href: '/admin',
    icon: '📊',
  },
  {
    title: 'الطلبات',
    href: '/admin/orders',
    icon: '🛒',
  },
  {
    title: 'المنتجات',
    href: '/admin/products',
    icon: '☕',
  },
  {
    title: 'العمال',
    href: '/admin/workers',
    icon: '👥',
  },
  {
    title: 'التقارير',
    href: '/admin/reports',
    icon: '📈',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = getCurrentUser();

  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
          ☕ قهوة الشام
        </h1>
        <p className="text-sm text-gray-400 mt-1">لوحة التحكم</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role === 'admin' ? 'مدير' : 'عامل'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-700 transition-colors"
          onClick={async () => {
            const { logout } = await import('../auth');
            await logout();
          }}
        >
          <span>🚪</span>
          <span className="font-medium">تسجيل الخروج</span>
        </Link>
      </div>
    </aside>
  );
}

