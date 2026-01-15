'use client';

import { Employee, EmployeeRole, ROLE_CONFIG } from '@/lib/employees';
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
  Search
} from 'lucide-react';
import { useState } from 'react';

interface EmployeesTableProps {
  employees: Employee[];
  loading?: boolean;
  searchTerm: string;
  filterRole: EmployeeRole | 'all';
  onSearch: (term: string) => void;
  onFilterRole: (role: EmployeeRole | 'all') => void;
  onEdit: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
  onResetPassword: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export default function EmployeesTable({
  employees,
  loading,
  searchTerm,
  filterRole,
  onSearch,
  onFilterRole,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
}: EmployeesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
      {/* Filters */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <Search style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
            color: '#94a3b8',
          }} />
          <input
            type="text"
            placeholder="بحث بالاسم أو اسم المستخدم..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 44px 12px 16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Role Filter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: 'all' as const, label: 'الكل' },
            { value: 'staff' as EmployeeRole, label: ROLE_CONFIG.staff.label },
            { value: 'cashier' as EmployeeRole, label: ROLE_CONFIG.cashier.label },
            { value: 'admin' as EmployeeRole, label: ROLE_CONFIG.admin.label },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFilterRole(value)}
              style={{
                padding: '10px 18px',
                backgroundColor: filterRole === value ? '#6366f1' : '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: filterRole === value ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

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
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <User style={{
                    width: '48px',
                    height: '48px',
                    color: '#cbd5e1',
                    margin: '0 auto 16px',
                  }} />
                  <p style={{ fontSize: '16px', color: '#64748b' }}>
                    {searchTerm || filterRole !== 'all' ? 'لا توجد نتائج' : 'لا يوجد موظفين'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => {
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

                    {/* Role */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: roleConfig.bgColor,
                        color: roleConfig.color,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}>
                        <Shield style={{ width: '12px', height: '12px' }} />
                        {roleConfig.label}
                      </span>
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
                                onClick={() => { onDelete(employee); setOpenMenuId(null); }}
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
      {filteredEmployees.length > 0 && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            عرض {filteredEmployees.length} من {employees.length} موظف
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

