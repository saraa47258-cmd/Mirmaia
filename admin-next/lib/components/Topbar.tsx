'use client';

import { getCurrentUser } from '../auth';

export default function Topbar() {
  const user = getCurrentUser();

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">لوحة التحكم</h2>
          <p className="text-sm text-gray-400">مرحباً بك، {user?.name || 'مدير'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{user?.name || 'مدير النظام'}</p>
            <p className="text-xs text-gray-400">{user?.role === 'admin' ? 'مدير' : 'عامل'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

