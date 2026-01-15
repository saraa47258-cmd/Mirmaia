'use client';

import { getCurrentUser } from '../auth';
import { Bell, Search, Command } from 'lucide-react';
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
      <header className="h-14 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800/50 px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Title */}
        <div>
          {title && (
            <h1 className="text-[15px] font-semibold text-white">{title}</h1>
          )}
          {subtitle && (
            <p className="text-[12px] text-gray-500">{subtitle}</p>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {/* Search Trigger */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 h-8 px-3 bg-gray-900 border border-gray-800 rounded-md text-[12px] text-gray-400 hover:border-gray-700 hover:text-gray-300 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>بحث...</span>
            <div className="flex items-center gap-0.5 mr-2 text-gray-600">
              <Command className="w-3 h-3" />
              <span className="text-[11px]">K</span>
            </div>
          </button>

          {/* Notifications */}
          <button className="relative h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-md transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-accent rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="h-8 w-8 flex items-center justify-center rounded-md bg-gray-800 text-[11px] font-semibold text-gray-300 hover:bg-gray-700 transition-colors">
            {user?.name.charAt(0) || 'A'}
          </button>
        </div>
      </header>

      {/* Search Modal */}
      {showSearch && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] z-50 animate-fade-in"
          onClick={() => setShowSearch(false)}
        >
          <div 
            className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-modal animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="ابحث عن أي شيء..."
                autoFocus
                className="flex-1 bg-transparent text-[14px] text-white placeholder-gray-500 focus:outline-none"
              />
              <kbd className="px-1.5 py-0.5 text-[11px] text-gray-500 bg-gray-800 rounded border border-gray-700">
                ESC
              </kbd>
            </div>
            <div className="p-3 text-center text-[13px] text-gray-500">
              ابدأ الكتابة للبحث...
            </div>
          </div>
        </div>
      )}
    </>
  );
}
