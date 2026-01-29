'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';

export default function WorkerLoginPage() {
  const router = useRouter();
  const { login, worker } = useWorkerAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    // Redirect if already logged in
    if (worker) {
      router.push('/worker');
    }
  }, [worker, router]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="worker-app worker-login-page"
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: 'var(--worker-gradient-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px' : '40px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : isTablet ? 400 : 420,
        background: 'rgba(255, 255, 255, 0.97)',
        borderRadius: 'var(--worker-radius-xl)',
        padding: isMobile ? '24px 20px' : isTablet ? 32 : 40,
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: isMobile ? 64 : 80,
            height: isMobile ? 64 : 80,
            margin: '0 auto 20px',
            background: 'var(--worker-gradient-primary)',
            borderRadius: 'var(--worker-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '32px' : '40px',
          }}>
            👤
          </div>
          <h1 style={{
            fontSize: isMobile ? 24 : 28,
            fontWeight: 700,
            color: 'var(--worker-text)',
            margin: 0,
          }}>
            تسجيل دخول الموظفين
          </h1>
          <p style={{
            fontSize: isMobile ? 14 : 15,
            color: 'var(--worker-text-muted)',
            marginTop: 8,
          }}>
            أدخل بيانات الدخول للوصول إلى النظام
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--worker-error-light)',
            border: '1px solid #fca5a5',
            color: 'var(--worker-error)',
            padding: '12px 16px',
            borderRadius: 'var(--worker-radius-sm)',
            marginBottom: 24,
            fontSize: 14,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--worker-text)',
            }}>
              اسم المستخدم
            </label>
            <input
              type="text"
              name="username"
              required
              style={{
                width: '100%',
                padding: isMobile ? '14px 16px' : '12px 16px',
                fontSize: isMobile ? 16 : 15,
                border: '2px solid var(--worker-border)',
                borderRadius: 'var(--worker-radius-sm)',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--worker-primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--worker-border)'; }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--worker-text)',
            }}>
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  paddingRight: 48,
                  fontSize: isMobile ? 16 : 15,
                  border: '2px solid var(--worker-border)',
                  borderRadius: 'var(--worker-radius-sm)',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--worker-primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--worker-border)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#64748b',
                  fontSize: '20px',
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: isMobile ? 14 : 12,
              fontSize: isMobile ? 16 : 15,
              fontWeight: 600,
              color: '#fff',
              background: loading ? '#94a3b8' : 'var(--worker-gradient-primary)',
              border: 'none',
              borderRadius: 'var(--worker-radius-sm)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              minHeight: isMobile ? 48 : 44,
              boxShadow: loading ? 'none' : 'var(--worker-shadow-button)',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--worker-shadow-button)';
              }
            }}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
