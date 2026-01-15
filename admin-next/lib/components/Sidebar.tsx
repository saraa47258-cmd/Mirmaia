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
  Coffee,
  ChevronLeft
} from 'lucide-react';

const menuItems = [
  {
    title: 'لوحة التحكم',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'المنيو',
    href: '/admin/menu',
    icon: UtensilsCrossed,
  },
  {
    title: 'منيو الموظفين',
    href: '/admin/staff-menu',
    icon: Users,
  },
  {
    title: 'إدارة القائمة',
    href: '/admin/products',
    icon: ClipboardList,
  },
  {
    title: 'الطلبات',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'الطاولات',
    href: '/admin/tables',
    icon: Grid3X3,
  },
  {
    title: 'الجلسات الخاصة',
    href: '/admin/rooms',
    icon: Sofa,
  },
  {
    title: 'إدارة العملاء',
    href: '/admin/customers',
    icon: UserCircle,
  },
  {
    title: 'الكاشير',
    href: '/admin/cashier',
    icon: Calculator,
  },
  {
    title: 'المخزن',
    href: '/admin/inventory',
    icon: Package,
  },
  {
    title: 'نظام الباركود',
    href: '/admin/barcode',
    icon: QrCode,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = getCurrentUser();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed right-0 top-0 h-full w-[260px] bg-white border-l border-gray-100 flex flex-col shadow-sm">
      {/* Logo Section */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-gray-900">قهوة الشام</h1>
            <p className="text-[11px] text-gray-400">لوحة الإدارة</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-md shadow-indigo-500/20">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-400 truncate">
                {user.role === 'admin' ? 'مدير النظام' : 'موظف'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                }`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="flex-1">{item.title}</span>
                {isActive && (
                  <ChevronLeft className="w-4 h-4 text-indigo-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Reports Button - Gradient */}
      <div className="px-3 pb-3">
        <Link
          href="/admin/reports"
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
            pathname === '/admin/reports'
              ? 'bg-gradient-to-l from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-gradient-to-l from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>التقارير</span>
        </Link>
      </div>

      {/* Logout Section */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
