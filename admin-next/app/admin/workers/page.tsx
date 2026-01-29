'use client';

import { useState, useEffect } from 'react';
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  toggleEmployeeStatus,
  resetEmployeePassword,
  Employee, 
  EmployeeRole, 
  ROLE_CONFIG,
  CreateEmployeeData
} from '@/lib/employees';
import { useAuth } from '@/lib/context/AuthContext';
import EmployeeModal from '@/lib/components/employees/EmployeeModal';
import EmployeesTable from '@/lib/components/employees/EmployeesTable';
import ResetPasswordModal from '@/lib/components/employees/ResetPasswordModal';
import Topbar from '@/lib/components/Topbar';
import { 
  Plus, 
  Search, 
  Users,
  RefreshCw,
  Filter,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<EmployeeRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showResetPassword, setShowResetPassword] = useState<Employee | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  };

  const handleCreate = async (data: CreateEmployeeData | { fullName: string; role: EmployeeRole; phone?: string; position?: string }) => {
    setModalLoading(true);
    try {
      // For create, we need the full data with username and password
      if ('username' in data && 'password' in data) {
        await createEmployee(data as CreateEmployeeData, user?.id || 'admin');
      }
      await loadEmployees();
      setShowModal(false);
    } catch (error: any) {
      throw error;
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async (data: CreateEmployeeData | { fullName: string; role: EmployeeRole; phone?: string; position?: string }) => {
    if (!editingEmployee) return;
    setModalLoading(true);
    try {
      // For update, we only need fullName, role, phone, position
      await updateEmployee(editingEmployee.id, {
        fullName: data.fullName,
        role: data.role,
        phone: data.phone,
        position: data.position
      });
      await loadEmployees();
      setEditingEmployee(null);
    } catch (error: any) {
      throw error;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await deleteEmployee(employeeId);
      await loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      await toggleEmployeeStatus(employee.id, !employee.isActive);
      await loadEmployees();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!showResetPassword) return;
    try {
      await resetEmployeePassword(showResetPassword.id, newPassword);
      setShowResetPassword(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    if (filterRole !== 'all' && emp.role !== filterRole) return false;
    if (filterStatus === 'active' && !emp.isActive) return false;
    if (filterStatus === 'inactive' && emp.isActive) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        emp.fullName.toLowerCase().includes(searchLower) ||
        emp.username.toLowerCase().includes(searchLower) ||
        emp.position?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.isActive).length,
    admins: employees.filter(e => e.role === 'admin').length,
    cashiers: employees.filter(e => e.role === 'cashier').length,
    staff: employees.filter(e => e.role === 'staff').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}></div>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>جاري التحميل...</p>
        </div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Topbar title="إدارة الموظفين" subtitle="إضافة وتعديل وإدارة الموظفين" />

      <div style={{ padding: '24px' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          {[
            { label: 'إجمالي الموظفين', value: stats.total, color: '#6366f1' },
            { label: 'نشط', value: stats.active, color: '#22c55e' },
            { label: 'مديرين', value: stats.admins, color: '#dc2626' },
            { label: 'كاشير', value: stats.cashiers, color: '#f59e0b' },
            { label: 'موظفين', value: stats.staff, color: '#3b82f6' },
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Header & Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                قائمة الموظفين
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                {filteredEmployees.length} موظف
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ 
                width: '18px', 
                height: '18px',
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
              }} />
            </button>
            <button
              onClick={() => router.push('/admin/add-admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <Shield style={{ width: '18px', height: '18px' }} />
              إضافة أدمن
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              إضافة موظف
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as EmployeeRole | 'all')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">جميع الأدوار</option>
            <option value="admin">مدير</option>
            <option value="cashier">كاشير</option>
            <option value="staff">موظف</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">الكل</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>

        {/* Employees Table */}
        <EmployeesTable
          employees={filteredEmployees}
          onEdit={(emp) => setEditingEmployee(emp)}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onResetPassword={(emp) => setShowResetPassword(emp)}
        />
      </div>

      {/* Create/Edit Modal */}
      {(showModal || editingEmployee) && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
          onSave={editingEmployee ? handleUpdate : handleCreate}
          loading={modalLoading}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <ResetPasswordModal
          employee={showResetPassword}
          onClose={() => setShowResetPassword(null)}
          onConfirm={handleResetPassword}
        />
      )}

      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
