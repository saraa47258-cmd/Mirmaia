'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Shield } from 'lucide-react';

export default function SetupAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    position: 'مدير',
  });

  // Check if admin exists - Skip check and allow setup directly
  const checkAdminExists = async () => {
    // Skip API check for now - allow setup directly
    // This avoids Firebase permission issues in API routes
    setHasAdmin(false);
    setChecking(false);
  };

  useEffect(() => {
    checkAdminExists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.fullName.trim()) {
      setError('الرجاء إدخال الاسم الكامل');
      return;
    }
    if (!formData.username.trim()) {
      setError('الرجاء إدخال اسم المستخدم');
      return;
    }
    if (!formData.password) {
      setError('الرجاء إدخال كلمة المرور');
      return;
    }
    if (formData.password.length < 4) {
      setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);
    // Use direct Firebase approach (no API route needed for static export)
    await createAdminDirectly();
  };

  // Fallback: Create admin directly using Firebase from client
  const createAdminDirectly = async () => {
    try {
      const { database, RESTAURANT_ID } = await import('@/lib/firebase/config');
      const { ref, push, set, get } = await import('firebase/database');

      // Check if username exists
      const workersRef = ref(database, `restaurant-system/workers/${RESTAURANT_ID}`);
      const snapshot = await get(workersRef);
      const workers = snapshot.val() || {};
      
      const usernameExists = Object.values(workers).some((worker: any) => 
        worker.username?.toLowerCase() === formData.username.toLowerCase()
      );

      if (usernameExists) {
        setError('اسم المستخدم موجود بالفعل');
        setLoading(false);
        return;
      }

      // Create admin account
      const adminRef = push(ref(database, `restaurant-system/workers/${RESTAURANT_ID}`));
      const adminId = adminRef.key!;

      const ADMIN_PERMISSIONS = [
        'dashboard', 'staff-menu', 'cashier', 'orders', 'tables', 'rooms',
        'room-orders', 'products', 'menu', 'inventory', 'workers', 'reports',
      ];

      const adminData: any = {
        uid: adminId,
        fullName: formData.fullName,
        name: formData.fullName,
        username: formData.username,
        password: formData.password,
        role: 'admin',
        isActive: true,
        active: true,
        position: formData.position || 'مدير',
        permissions: ADMIN_PERMISSIONS,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      };

      if (formData.phone) {
        adminData.phone = formData.phone;
      }

      await set(adminRef, adminData);

      setSuccess(true);
      setLoading(false);
      setFormData({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        position: 'مدير',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating admin directly:', err);
      setError(err.message || 'حدث خطأ أثناء إنشاء حساب الأدمن. تأكد من صلاحيات Firebase.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: '#a855f7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
            willChange: 'transform',
          }}></div>
          <p style={{ marginTop: '20px', fontSize: '16px' }}>جاري التحقق...</p>
        </div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (hasAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px' : '24px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: isMobile ? '16px' : '24px',
          padding: isMobile ? '24px 20px' : '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}>
          <CheckCircle style={{ 
            width: isMobile ? '50px' : '60px', 
            height: isMobile ? '50px' : '60px', 
            color: '#22c55e', 
            margin: '0 auto 20px' 
          }} />
          <h2 style={{ 
            fontSize: isMobile ? '20px' : '24px', 
            fontWeight: 700, 
            color: '#ffffff', 
            marginBottom: '12px',
            lineHeight: '1.3',
          }}>
            حساب الأدمن موجود بالفعل
          </h2>
          <p style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#94a3b8', 
            marginBottom: '24px',
            lineHeight: '1.5',
          }}>
            يبدو أن هناك حساب أدمن موجود بالفعل في النظام. يمكنك تسجيل الدخول الآن.
          </p>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: isMobile ? '14px 24px' : '12px 24px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              border: 'none',
              borderRadius: '12px',
              fontSize: isMobile ? '16px' : '15px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              minHeight: isMobile ? '48px' : '44px',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              width: '100%',
            }}
          >
            الذهاب إلى تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // Responsive design for mobile
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px' : isTablet ? '20px' : '24px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: isMobile ? '16px' : '24px',
        padding: isMobile ? '24px 20px' : isTablet ? '32px' : '40px',
        maxWidth: '500px',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
          <div style={{
            width: isMobile ? '60px' : '70px',
            height: isMobile ? '60px' : '70px',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(185, 28, 28, 0.2) 100%)',
            borderRadius: isMobile ? '16px' : '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Shield style={{ width: isMobile ? '30px' : '36px', height: isMobile ? '30px' : '36px', color: '#dc2626' }} />
          </div>
          <h2 style={{
            fontSize: isMobile ? '22px' : isTablet ? '26px' : '28px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '8px',
            lineHeight: '1.3',
          }}>
            إعداد حساب الأدمن الأول
          </h2>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#94a3b8',
            lineHeight: '1.5',
          }}>
            قم بإنشاء حساب الأدمن الأول للوصول إلى لوحة التحكم
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            marginBottom: '24px',
            color: '#86efac',
          }}>
            <CheckCircle style={{ width: '20px', height: '20px' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                تم إنشاء حساب الأدمن بنجاح!
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>
                سيتم توجيهك إلى صفحة تسجيل الدخول...
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            marginBottom: '24px',
            color: '#fca5a5',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: error.includes('Permission denied') ? '12px' : '0' }}>
              <XCircle style={{ width: '20px', height: '20px' }} />
              <div style={{ fontWeight: 500, flex: 1 }}>{error}</div>
            </div>
            {error.includes('Permission denied') && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '13px',
                lineHeight: '1.6',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>الحل:</div>
                <div style={{ marginBottom: '8px' }}>
                  يجب تعديل Firebase Realtime Database Rules للسماح بالكتابة.
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>الخطوات:</strong>
                </div>
                <ol style={{ margin: '0', paddingRight: '20px', marginBottom: '12px' }}>
                  <li>افتح Firebase Console: <a href="https://console.firebase.google.com/" target="_blank" rel="noopener" style={{ color: '#fca5a5', textDecoration: 'underline' }}>console.firebase.google.com</a></li>
                  <li>اختر المشروع: <strong>mirmaia-33acc</strong></li>
                  <li>اذهب إلى <strong>Realtime Database → Rules</strong></li>
                  <li>استبدل القواعد بالقواعد المذكورة في ملف <code style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>FIX_FIREBASE_PERMISSIONS.md</code></li>
                  <li>اضغط <strong>Publish</strong></li>
                </ol>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  أو يمكنك إنشاء حساب الأدمن مباشرة من Firebase Console (انظر الملف المذكور أعلاه)
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' }}>
            {/* Full Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '8px',
              }}>
                الاسم الكامل <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="مثال: أحمد محمد"
                required
                autoComplete="name"
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
                  color: '#f1f5f9',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Username */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '8px',
              }}>
                اسم المستخدم <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="مثال: admin"
                required
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  fontSize: isMobile ? '16px' : '14px',
                  color: '#f1f5f9',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '8px',
              }}>
                كلمة المرور <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="4 أحرف على الأقل"
                required
                minLength={4}
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  fontSize: isMobile ? '16px' : '14px',
                  color: '#f1f5f9',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '8px',
              }}>
                تأكيد كلمة المرور <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="أعد إدخال كلمة المرور"
                required
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  fontSize: isMobile ? '16px' : '14px',
                  color: '#f1f5f9',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '8px',
              }}>
                رقم الهاتف (اختياري)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="مثال: 91234567"
                autoComplete="tel"
                inputMode="numeric"
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  fontSize: isMobile ? '16px' : '14px',
                  color: '#f1f5f9',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Position */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '8px',
              }}>
                المنصب
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="مثال: مدير"
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  fontSize: isMobile ? '16px' : '14px',
                  color: '#f1f5f9',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: '100%',
                padding: isMobile ? '16px 24px' : '14px 24px',
                background: loading || success
                  ? 'rgba(99, 102, 241, 0.5)'
                  : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: isMobile ? '16px' : '15px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: loading || success ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                touchAction: 'manipulation', // Better touch handling
                WebkitTapHighlightColor: 'transparent',
                minHeight: isMobile ? '48px' : '44px', // Better touch target
                transition: 'all 0.2s ease',
              }}
              onTouchStart={(e) => {
                if (!loading && !success) {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {loading ? 'جاري الإنشاء...' : success ? 'تم الإنشاء!' : 'إنشاء حساب الأدمن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
