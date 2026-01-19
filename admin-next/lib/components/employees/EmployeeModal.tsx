'use client';

import { useState, useEffect } from 'react';
import { Employee, EmployeeRole, ROLE_CONFIG, PERMISSION_LABELS, CreateEmployeeData } from '@/lib/employees';
import { X, User, Lock, Shield, Phone, Briefcase, Eye, EyeOff } from 'lucide-react';

interface EmployeeModalProps {
  employee?: Employee | null;
  onClose: () => void;
  onSave: (data: CreateEmployeeData | { fullName: string; role: EmployeeRole; phone?: string; position?: string }) => Promise<void>;
  loading?: boolean;
}

export default function EmployeeModal({
  employee,
  onClose,
  onSave,
  loading,
}: EmployeeModalProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<EmployeeRole>('staff');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!employee;

  useEffect(() => {
    if (employee) {
      setFullName(employee.fullName);
      setUsername(employee.username);
      setRole(employee.role);
      setPhone(employee.phone || '');
      setPosition(employee.position || '');
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName.trim()) {
      setError('الاسم الكامل مطلوب');
      return;
    }

    if (!isEdit) {
      if (!username.trim()) {
        setError('اسم المستخدم مطلوب');
        return;
      }
      if (username.length < 3) {
        setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
        return;
      }
      if (!password) {
        setError('كلمة المرور مطلوبة');
        return;
      }
      if (password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمة المرور غير متطابقة');
        return;
      }
    }

    try {
      if (isEdit) {
        await onSave({ fullName, role, phone, position });
      } else {
        await onSave({ fullName, username, password, role, phone, position });
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    }
  };

  const roles: { value: EmployeeRole; config: typeof ROLE_CONFIG[EmployeeRole] }[] = [
    { value: 'staff', config: ROLE_CONFIG.staff },
    { value: 'cashier', config: ROLE_CONFIG.cashier },
    { value: 'admin', config: ROLE_CONFIG.admin },
  ];

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
        width: '500px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        zIndex: 101,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
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
              <User style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {isEdit ? 'تعديل موظف' : 'إضافة موظف جديد'}
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                {isEdit ? 'تحديث بيانات الموظف' : 'إنشاء حساب موظف جديد'}
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
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px' }}>
            {error && (
              <div style={{
                padding: '14px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#ef4444',
              }}>
                {error}
              </div>
            )}

            {/* Full Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                <User style={{ width: '16px', height: '16px' }} />
                الاسم الكامل
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل الاسم الكامل"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Username (only for new employees) */}
            {!isEdit && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '10px',
                }}>
                  <User style={{ width: '16px', height: '16px' }} />
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="username"
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
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  سيستخدم للدخول إلى النظام
                </p>
              </div>
            )}

            {/* Password (only for new employees) */}
            {!isEdit && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '10px',
                  }}>
                    <Lock style={{ width: '16px', height: '16px' }} />
                    كلمة المرور
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
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
              </>
            )}

            {/* Role */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                <Shield style={{ width: '16px', height: '16px' }} />
                الصلاحية
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {roles.map(({ value, config }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      backgroundColor: role === value ? config.bgColor : '#f8fafc',
                      border: role === value ? `2px solid ${config.color}` : '2px solid #e2e8f0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'right',
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: role === value ? config.color : '#e2e8f0',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Shield style={{
                        width: '20px',
                        height: '20px',
                        color: role === value ? '#ffffff' : '#64748b',
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: role === value ? config.color : '#0f172a',
                        marginBottom: '2px',
                      }}>
                        {config.label}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                        {config.description}
                      </p>
                      {/* Show permissions when selected */}
                      {role === value && (
                        <div style={{ 
                          marginTop: '8px', 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '4px' 
                        }}>
                          {config.permissions.map((perm) => (
                            <span
                              key={perm}
                              style={{
                                padding: '2px 6px',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                color: '#6366f1',
                                borderRadius: '4px',
                                fontSize: '10px',
                              }}
                            >
                              {PERMISSION_LABELS[perm] || perm}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {role === value && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: config.color,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                <Phone style={{ width: '16px', height: '16px' }} />
                رقم الهاتف (اختياري)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="99123456"
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

            {/* Position */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                <Briefcase style={{ width: '16px', height: '16px' }} />
                المسمى الوظيفي (اختياري)
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="مثال: نادل، باريستا..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
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
              {loading ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إضافة الموظف')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}





