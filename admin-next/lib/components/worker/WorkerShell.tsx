'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import WorkerBottomNav from './WorkerBottomNav';

const MOBILE_BREAKPOINT = 768;

export default function WorkerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isLogin = pathname === '/worker/login' || pathname?.startsWith('/worker/login/');
  const showBottomNav = !isLogin && isMobile;

  return (
    <div className="worker-app" style={{ minHeight: '100vh', position: 'relative' }}>
      <main
        style={{
          paddingBottom: showBottomNav ? 'calc(72px + env(safe-area-inset-bottom))' : 0,
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
      {showBottomNav && <WorkerBottomNav />}
    </div>
  );
}
