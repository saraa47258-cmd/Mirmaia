'use client';

import { getCurrentUser } from '../auth';
import { Bell, Search, Command, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const user = getCurrentUser();
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Title */}
        <div>
          {title && (
            <h1 className="text-[17px] font-bold text-gray-900">{title}</h1>
          )}
          {subtitle && (
            <p className="text-[12px] text-gray-500">{subtitle}</p>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 h-9 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[12px] text-gray-500 hover:border-gray-300 hover:bg-gray-100 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>بحث...</span>
            <div className="flex items-center gap-0.5 mr-3 text-gray-400">
              <Command className="w-3 h-3" />
              <span className="text-[11px]">K</span>
            </div>
          </button>

          {/* Settings */}
          <button className="h-9 w-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
            <Settings className="w-[18px] h-[18px]" />
          </button>

          {/* Notifications */}
          <button className="relative h-9 w-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile */}
          <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-[12px] font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all">
            {user?.name.charAt(0) || 'A'}
          </button>
        </div>
      </header>

      {/* Search Modal */}
      {showSearch && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-start justify-center pt-[15vh] z-50"
          onClick={() => setShowSearch(false)}
        >
          <div 
            className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-900/10 animate-in fade-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن أي شيء..."
                autoFocus
                className="flex-1 bg-transparent text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              <kbd className="px-2 py-1 text-[11px] text-gray-400 bg-gray-100 rounded-lg border border-gray-200">
                ESC
              </kbd>
            </div>
            <div className="p-4 text-center text-[13px] text-gray-500">
              ابدأ الكتابة للبحث...
            </div>
          </div>
        </div>
      )}
    </>
  );
}
