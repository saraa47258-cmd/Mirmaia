'use client';

import { useState } from 'react';
import { Employee } from '@/lib/employees';
import { X, Key, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ResetPasswordModalProps {
  employee: Employee;
  onClose: () => void;
  onConfirm: (newPassword: string) => Promise<void>;
  loading?: boolean;
}

export default function ResetPasswordModal({
  employee,
  onClose,
  onConfirm,
  loading,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }

    try {
      await onConfirm(password);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newPass = '';
    for (let i = 0; i < 8; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPass);
    setConfirmPassword(newPass);
    setShowPassword(true);
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '420px',
        maxWidth: '95vw',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        zIndex: 101,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Key style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                إعادة تعيين كلمة المرور
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                {employee.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px' }}>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                marginBottom: '20px',
              }}>
                <AlertCircle style={{ width: '18px', height: '18px', color: '#ef4444' }} />
                <span style={{ fontSize: '14px', color: '#ef4444' }}>{error}</span>
              </div>
            )}

            {/* New Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                كلمة المرور الجديدة
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  required
                  dir="ltr"
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    textAlign: 'left',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                تأكيد كلمة المرور
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور"
                required
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  textAlign: 'left',
                }}
              />
            </div>

            {/* Generate Password Button */}
            <button
              type="button"
              onClick={generatePassword}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#f1f5f9',
                border: '1px dashed #cbd5e1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Key style={{ width: '16px', height: '16px' }} />
              توليد كلمة مرور عشوائية
            </button>

            {password && showPassword && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <CheckCircle style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>كلمة المرور:</p>
                  <code style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#6366f1',
                    letterSpacing: '1px',
                  }}>
                    {password}
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

