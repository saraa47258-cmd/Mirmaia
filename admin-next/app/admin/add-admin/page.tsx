'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee } from '@/lib/employees';
import { useAuth } from '@/lib/context/AuthContext';
import Topbar from '@/lib/components/Topbar';
import { UserPlus, CheckCircle, XCircle } from 'lucide-react';

export default function AddAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
    try {
      await createEmployee(
        {
          fullName: formData.fullName,
          username: formData.username,
          password: formData.password,
          role: 'admin',
          phone: formData.phone || undefined,
          position: formData.position,
        },
        user?.id || 'system'
      );

      setSuccess(true);
      setFormData({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        position: 'مدير',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/workers');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة حساب الأدمن');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Topbar title="إضافة حساب أدمن" subtitle="إنشاء حساب مدير جديد" />

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          {/* Success Message */}
          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '12px',
              marginBottom: '24px',
              color: '#166534',
            }}>
              <CheckCircle style={{ width: '20px', height: '20px' }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  تم إنشاء حساب الأدمن بنجاح!
                </div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>
                  سيتم توجيهك إلى صفحة الموظفين...
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '12px',
              marginBottom: '24px',
              color: '#991b1b',
            }}>
              <XCircle style={{ width: '20px', height: '20px' }} />
              <div style={{ fontWeight: 500 }}>{error}</div>
            </div>
          )}

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserPlus style={{ width: '28px', height: '28px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                marginBottom: '4px',
              }}>
                إضافة حساب أدمن
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0,
              }}>
                إنشاء حساب مدير جديد مع صلاحيات كاملة
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Full Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '8px',
                }}>
                  الاسم الكامل <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="مثال: أحمد محمد"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Username */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '8px',
                }}>
                  اسم المستخدم <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="مثال: admin"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '8px',
                }}>
                  كلمة المرور <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="4 أحرف على الأقل"
                  required
                  minLength={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '8px',
                }}>
                  تأكيد كلمة المرور <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="أعد إدخال كلمة المرور"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '8px',
                }}>
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="مثال: 91234567"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Position */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#334155',
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
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px',
              }}>
                <button
                  type="button"
                  onClick={() => router.push('/admin/workers')}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#e2e8f0';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: loading || success
                      ? '#94a3b8'
                      : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: loading || success ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'جاري الإنشاء...' : success ? 'تم الإنشاء!' : 'إنشاء حساب أدمن'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
