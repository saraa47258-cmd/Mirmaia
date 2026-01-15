'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, logout } from '../auth';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  BarChart3,
  LogOut,
  Coffee,
  Settings,
  ChevronLeft
} from 'lucide-react';

const menuItems = [
  {
    title: 'لوحة التحكم',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'الطلبات',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    title: 'المنتجات',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'العمال',
    href: '/admin/workers',
    icon: Users,
  },
  {
    title: 'التقارير',
    href: '/admin/reports',
    icon: BarChart3,
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
    <aside className="fixed right-0 top-0 h-full w-[240px] bg-gray-950 border-l border-gray-800/50 flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-800/50">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Coffee className="w-4 h-4 text-accent" />
          </div>
          <span className="text-[13px] font-semibold text-gray-100">قهوة الشام</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800/80 text-white'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-gray-500'}`} />
                <span>{item.title}</span>
                {isActive && (
                  <ChevronLeft className="w-3.5 h-3.5 mr-auto text-gray-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-800/50">
        {/* User */}
        {user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
            <div className="w-7 h-7 rounded-md bg-gray-800 flex items-center justify-center text-[11px] font-semibold text-gray-300">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-200 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-500 truncate">
                {user.role === 'admin' ? 'مدير' : 'عامل'}
              </p>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-1">
          <button className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 transition-colors">
            <Settings className="w-3.5 h-3.5" />
            <span>الإعدادات</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
