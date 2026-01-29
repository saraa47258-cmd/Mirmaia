'use client';

import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

function isLoginPath(path: string | null) {
  if (!path) return false;
  const normalized = path.replace(/\/$/, '');
  return normalized === '/worker/login';
}

export function WorkerLayoutContent({ children }: { children: React.ReactNode }) {
  const { worker, loading } = useWorkerAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!worker && !isLoginPath(pathname)) {
      router.replace('/worker/login');
      return;
    }
    if (worker && isLoginPath(pathname)) {
      router.replace('/worker');
      return;
    }
  }, [worker, loading, pathname, router]);

  if (isLoginPath(pathname)) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: '4px solid #e2e8f0',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'worker-spin 1s linear infinite',
            }}
          />
          <p style={{ color: '#64748b', fontSize: 14 }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return null;
  }

  return <>{children}</>;
}
