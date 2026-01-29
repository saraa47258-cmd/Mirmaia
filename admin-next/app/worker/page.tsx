'use client';

import { useState, useEffect } from 'react';
import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WorkerHomePage() {
  const { worker, loading, canAccessModule, logout } = useWorkerAuth();
  const router = useRouter();
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    if (!loading && !worker) {
      router.replace('/worker/login');
    }
  }, [loading, worker, router]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize === 'mobile';

  const modules = [
    { id: 'staff-menu', label: 'المنيو', icon: '🍽️', path: '/worker/menu', color: '#6366f1' },
    { id: 'orders', label: 'الطلبات', icon: '📋', path: '/worker/orders', color: '#10b981' },
    { id: 'tables', label: 'الطاولات', icon: '🪑', path: '/worker/tables', color: '#f59e0b' },
    { id: 'rooms', label: 'الغرف', icon: '🚪', path: '/worker/rooms', color: '#8b5cf6' },
    { id: 'cashier', label: 'الكاشير', icon: '💰', path: '/worker/cashier', color: '#ef4444' },
    { id: 'inventory', label: 'المخزون', icon: '📦', path: '/worker/inventory', color: '#06b6d4' },
    { id: 'reports', label: 'التقارير', icon: '📊', path: '/worker/reports', color: '#ec4899' },
    { id: 'products', label: 'المنتجات', icon: '🛍️', path: '/worker/products', color: '#14b8a6' },
  ].filter((m) => canAccessModule(m.id));

  const handleLogout = async () => {
    if (confirm('هل تريد تسجيل الخروج؟')) await logout();
  };

  if (loading) {
    return (
      <div
        className="worker-app"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--worker-gradient-bg)',
          padding: 24,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: 16,
              background: 'var(--worker-gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            ⏳
          </div>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!worker) return null;

  if (modules.length === 0) {
    return (
      <div
        className="worker-app"
        style={{
          minHeight: '100vh',
          background: 'var(--worker-surface)',
          padding: 20,
          paddingTop: 'max(20px, env(safe-area-inset-top))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            background: 'var(--worker-surface-card)',
            padding: 40,
            borderRadius: 'var(--worker-radius-xl)',
            boxShadow: 'var(--worker-shadow-card)',
            maxWidth: 360,
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--worker-text)',
              marginBottom: 8,
            }}
          >
            ليس لديك صلاحيات
          </h2>
          <p style={{ color: 'var(--worker-text-muted)', marginBottom: 24 }}>
            ليس لديك صلاحيات للوصول إلى أي قسم
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: '14px 28px',
              background: 'var(--worker-gradient-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--worker-radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              boxShadow: 'var(--worker-shadow-button)',
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="worker-app"
      style={{
        minHeight: '100vh',
        background: 'var(--worker-surface)',
        paddingTop: 'max(0px, env(safe-area-inset-top))',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'var(--worker-gradient-primary)',
          padding: isMobile ? '20px 16px' : '24px 20px',
          paddingTop: 'max(20px, calc(20px + env(safe-area-inset-top)))',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: isMobile ? 22 : 26,
                fontWeight: 700,
                margin: 0,
                color: '#fff',
              }}
            >
              {worker?.name || 'موظف'}
            </h1>
            <p
              style={{
                fontSize: 14,
                margin: '4px 0 0',
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {worker?.position || 'موظف'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 18px',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 'var(--worker-radius-sm)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              minHeight: 44,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Modules Grid */}
      <div
        style={{
          padding: isMobile ? 16 : 24,
          maxWidth: 1200,
          margin: '0 auto',
          paddingBottom: 24,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              isMobile
                ? 'repeat(2, 1fr)'
                : screenSize === 'tablet'
                  ? 'repeat(3, 1fr)'
                  : 'repeat(4, 1fr)',
            gap: isMobile ? 12 : 16,
          }}
        >
          {modules.map((mod) => (
            <Link
              key={mod.id}
              href={mod.path}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="worker-module-card"
                style={{
                  background: 'var(--worker-surface-card)',
                  padding: isMobile ? 16 : 20,
                  borderRadius: 'var(--worker-radius-lg)',
                  boxShadow: 'var(--worker-shadow-card)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  minHeight: isMobile ? 120 : 140,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 36 : 44,
                    marginBottom: 8,
                  }}
                >
                  {mod.icon}
                </div>
                <span
                  style={{
                    fontSize: isMobile ? 15 : 17,
                    fontWeight: 700,
                    color: 'var(--worker-text)',
                  }}
                >
                  {mod.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
