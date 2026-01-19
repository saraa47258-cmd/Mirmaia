'use client';

import { Employee, EmployeeRole, ROLE_CONFIG, PERMISSION_LABELS } from '@/lib/employees';
import { 
  User, 
  Edit, 
  Power, 
  Key, 
  Trash2, 
  Shield,
  Calendar,
  Clock,
  MoreVertical,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';

interface EmployeesTableProps {
  employees: Employee[];
  loading?: boolean;
  onEdit: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
  onResetPassword: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
}

export default function EmployeesTable({
  employees,
  loading,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
}: EmployeesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedPermissions, setExpandedPermissions] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '20px',
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '16px',
            padding: '16px 0',
            borderBottom: '1px solid #f1f5f9',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              animation: 'pulse 1.5s infinite',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                width: '150px',
                height: '16px',
                backgroundColor: '#f1f5f9',
                borderRadius: '4px',
                marginBottom: '8px',
                animation: 'pulse 1.5s infinite',
              }} />
              <div style={{
                width: '100px',
                height: '12px',
                backgroundColor: '#f1f5f9',
                borderRadius: '4px',
                animation: 'pulse 1.5s infinite',
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
    }}>
      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{
                padding: '14px 20px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                الموظف
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                اسم المستخدم
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                الصلاحية
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                الحالة
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                تاريخ الإنشاء
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                آخر دخول
              </th>
              <th style={{
                padding: '14px 20px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
                width: '100px',
              }}>
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <User style={{
                    width: '48px',
                    height: '48px',
                    color: '#cbd5e1',
                    margin: '0 auto 16px',
                  }} />
                  <p style={{ fontSize: '16px', color: '#64748b' }}>
                    لا يوجد موظفين
                  </p>
                </td>
              </tr>
            ) : (
              employees.map((employee) => {
                // Fallback for unknown roles
                const roleConfig = ROLE_CONFIG[employee.role] || {
                  label: employee.role || 'غير محدد',
                  color: '#64748b',
                  bgColor: 'rgba(100, 116, 139, 0.1)',
                  description: '',
                  permissions: [],
                };
                return (
                  <tr
                    key={employee.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      opacity: employee.isActive ? 1 : 0.6,
                    }}
                  >
                    {/* Employee */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: employee.isActive 
                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            : '#94a3b8',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}>
                          {employee.fullName.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                            {employee.fullName}
                          </p>
                          {employee.position && (
                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              {employee.position}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td style={{ padding: '16px' }}>
                      <code style={{
                        fontSize: '13px',
                        color: '#475569',
                        backgroundColor: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '6px',
                      }}>
                        {employee.username}
                      </code>
                    </td>

                    {/* Role & Permissions */}
                    <td style={{ padding: '16px' }}>
                      <div>
                        <button
                          onClick={() => setExpandedPermissions(
                            expandedPermissions === employee.id ? null : employee.id
                          )}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            backgroundColor: roleConfig.bgColor,
                            color: roleConfig.color,
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Shield style={{ width: '12px', height: '12px' }} />
                          {roleConfig.label}
                          {expandedPermissions === employee.id ? (
                            <ChevronUp style={{ width: '12px', height: '12px' }} />
                          ) : (
                            <ChevronDown style={{ width: '12px', height: '12px' }} />
                          )}
                        </button>
                        
                        {/* Permissions List */}
                        {expandedPermissions === employee.id && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}>
                            <p style={{ 
                              color: '#64748b', 
                              marginBottom: '6px',
                              fontWeight: 600,
                            }}>
                              الصلاحيات:
                            </p>
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '4px' 
                            }}>
                              {roleConfig.permissions.map((perm) => (
                                <span
                                  key={perm}
                                  style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#e2e8f0',
                                    color: '#475569',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                  }}
                                >
                                  {PERMISSION_LABELS[perm] || perm}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: employee.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: employee.isActive ? '#22c55e' : '#ef4444',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: employee.isActive ? '#22c55e' : '#ef4444',
                        }} />
                        {employee.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>

                    {/* Created At */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          {formatDate(employee.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Last Login */}
                    <td style={{ padding: '16px' }}>
                      {employee.lastLoginAt ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                          <div>
                            <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>
                              {formatDate(employee.lastLoginAt)}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {formatTime(employee.lastLoginAt)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>لم يسجل دخول</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === employee.id ? null : employee.id)}
                          style={{
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: openMenuId === employee.id ? '#f1f5f9' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            margin: '0 auto',
                          }}
                        >
                          <MoreVertical style={{ width: '18px', height: '18px', color: '#64748b' }} />
                        </button>

                        {openMenuId === employee.id && (
                          <>
                            <div
                              onClick={() => setOpenMenuId(null)}
                              style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 10,
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: '0',
                              marginTop: '4px',
                              backgroundColor: '#ffffff',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                              border: '1px solid #e2e8f0',
                              zIndex: 20,
                              minWidth: '160px',
                              overflow: 'hidden',
                            }}>
                              <button
                                onClick={() => { onEdit(employee); setOpenMenuId(null); }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '12px 16px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  fontSize: '14px',
                                  color: '#374151',
                                  cursor: 'pointer',
                                  textAlign: 'right',
                                }}
                              >
                                <Edit style={{ width: '16px', height: '16px' }} />
                                تعديل
                              </button>
                              <button
                                onClick={() => { onToggleStatus(employee); setOpenMenuId(null); }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '12px 16px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  fontSize: '14px',
                                  color: employee.isActive ? '#f59e0b' : '#22c55e',
                                  cursor: 'pointer',
                                  textAlign: 'right',
                                }}
                              >
                                <Power style={{ width: '16px', height: '16px' }} />
                                {employee.isActive ? 'تعطيل' : 'تفعيل'}
                              </button>
                              <button
                                onClick={() => { onResetPassword(employee); setOpenMenuId(null); }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '12px 16px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  fontSize: '14px',
                                  color: '#6366f1',
                                  cursor: 'pointer',
                                  textAlign: 'right',
                                }}
                              >
                                <Key style={{ width: '16px', height: '16px' }} />
                                إعادة تعيين كلمة المرور
                              </button>
                              <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />
                              <button
                                onClick={() => { onDelete(employee.id); setOpenMenuId(null); }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '12px 16px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  fontSize: '14px',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  textAlign: 'right',
                                }}
                              >
                                <Trash2 style={{ width: '16px', height: '16px' }} />
                                حذف
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {employees.length > 0 && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            عرض {employees.length} موظف
          </p>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

