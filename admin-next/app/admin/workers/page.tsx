'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Employee,
  EmployeeRole,
  ROLE_CONFIG,
  getEmployees,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  resetEmployeePassword,
  deleteEmployee,
  CreateEmployeeData,
} from '@/lib/employees';
import EmployeesTable from '@/lib/components/employees/EmployeesTable';
import EmployeeModal from '@/lib/components/employees/EmployeeModal';
import ResetPasswordModal from '@/lib/components/employees/ResetPasswordModal';
import {
  Users,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  UserCheck,
  UserX,
  Shield,
} from 'lucide-react';

export default function EmployeesPage() {
  const { user } = useAuth();

  // Data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<EmployeeRole | 'all'>('all');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [resetPasswordEmployee, setResetPasswordEmployee] = useState<Employee | null>(null);
  const [deleteConfirmEmployee, setDeleteConfirmEmployee] = useState<Employee | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load employees
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      showToast('خطأ في تحميل الموظفين', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Calculate stats
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.isActive).length,
    inactive: employees.filter(e => !e.isActive).length,
    admins: employees.filter(e => e.role === 'admin').length,
    cashiers: employees.filter(e => e.role === 'cashier').length,
    staff: employees.filter(e => e.role === 'staff').length,
  };

  // Handle create employee
  const handleCreate = async (data: CreateEmployeeData) => {
    setActionLoading(true);
    try {
      await createEmployee(data, user?.id || 'system');
      showToast('تم إضافة الموظف بنجاح', 'success');
      setShowAddModal(false);
      loadEmployees();
    } catch (error: any) {
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update employee
  const handleUpdate = async (data: { fullName: string; role: EmployeeRole; phone?: string; position?: string }) => {
    if (!editEmployee) return;
    
    setActionLoading(true);
    try {
      await updateEmployee(editEmployee.id, data);
      showToast('تم تحديث بيانات الموظف', 'success');
      setEditEmployee(null);
      loadEmployees();
    } catch (error: any) {
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (employee: Employee) => {
    setActionLoading(true);
    try {
      await toggleEmployeeStatus(employee.id, !employee.isActive);
      showToast(
        employee.isActive ? 'تم تعطيل الموظف' : 'تم تفعيل الموظف',
        'success'
      );
      loadEmployees();
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('حدث خطأ', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (newPassword: string) => {
    if (!resetPasswordEmployee) return;

    setActionLoading(true);
    try {
      await resetEmployeePassword(resetPasswordEmployee.id, newPassword);
      showToast('تم تغيير كلمة المرور بنجاح', 'success');
      setResetPasswordEmployee(null);
    } catch (error: any) {
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirmEmployee) return;

    setActionLoading(true);
    try {
      await deleteEmployee(deleteConfirmEmployee.id);
      showToast('تم حذف الموظف', 'success');
      setDeleteConfirmEmployee(null);
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      showToast('حدث خطأ أثناء الحذف', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: '0', minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0f172a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Users style={{ width: '28px', height: '28px', color: '#6366f1' }} />
            إدارة الموظفين
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            إدارة حسابات الموظفين والصلاحيات
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            إضافة موظف
          </button>
          <button
            onClick={loadEmployees}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#475569',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw
              style={{
                width: '18px',
                height: '18px',
                animation: loading ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users style={{ width: '22px', height: '22px', color: '#6366f1' }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>إجمالي الموظفين</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{stats.total}</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserCheck style={{ width: '22px', height: '22px', color: '#22c55e' }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>نشط</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>{stats.active}</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserX style={{ width: '22px', height: '22px', color: '#ef4444' }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>معطل</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield style={{ width: '22px', height: '22px', color: '#dc2626' }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>مدراء</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>{stats.admins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <EmployeesTable
        employees={employees}
        loading={loading}
        searchTerm={searchTerm}
        filterRole={filterRole}
        onSearch={setSearchTerm}
        onFilterRole={setFilterRole}
        onEdit={(employee) => setEditEmployee(employee)}
        onToggleStatus={handleToggleStatus}
        onResetPassword={(employee) => setResetPasswordEmployee(employee)}
        onDelete={(employee) => setDeleteConfirmEmployee(employee)}
      />

      {/* Add Employee Modal */}
      {showAddModal && (
        <EmployeeModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreate}
          loading={actionLoading}
        />
      )}

      {/* Edit Employee Modal */}
      {editEmployee && (
        <EmployeeModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onSave={handleUpdate}
          loading={actionLoading}
        />
      )}

      {/* Reset Password Modal */}
      {resetPasswordEmployee && (
        <ResetPasswordModal
          employee={resetPasswordEmployee}
          onClose={() => setResetPasswordEmployee(null)}
          onConfirm={handleResetPassword}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmployee && (
        <>
          <div
            onClick={() => setDeleteConfirmEmployee(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 100,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            maxWidth: '95vw',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            zIndex: 101,
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <AlertCircle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              تأكيد الحذف
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              هل أنت متأكد من حذف الموظف "{deleteConfirmEmployee.fullName}"؟
              <br />
              <span style={{ color: '#ef4444', fontWeight: 500 }}>هذا الإجراء لا يمكن التراجع عنه.</span>
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteConfirmEmployee(null)}
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
                onClick={handleDelete}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: actionLoading ? '#fca5a5' : '#ef4444',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {actionLoading ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 24px',
          backgroundColor: toast.type === 'success' ? '#22c55e' : '#ef4444',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 200,
          animation: 'slideUp 0.3s ease-out',
        }}>
          {toast.type === 'success' ? (
            <CheckCircle style={{ width: '20px', height: '20px', color: '#ffffff' }} />
          ) : (
            <AlertCircle style={{ width: '20px', height: '20px', color: '#ffffff' }} />
          )}
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
            {toast.message}
          </span>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
