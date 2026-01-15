'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  Order,
  listenToTables, 
  getOrder,
  createTable 
} from '@/lib/firebase/database';
import TableCard from '@/lib/components/tables/TableCard';
import TableDetailsModal from '@/lib/components/tables/TableDetailsModal';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Grid3X3,
  Coffee,
  TreePine,
  Crown,
  Umbrella,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react';

const AREA_OPTIONS = [
  { value: 'all', label: 'جميع المناطق', icon: Grid3X3 },
  { value: 'indoor', label: 'داخلي', icon: Coffee },
  { value: 'outdoor', label: 'خارجي', icon: TreePine },
  { value: 'room', label: 'غرف', icon: Coffee },
  { value: 'vip', label: 'VIP', icon: Crown },
  { value: 'terrace', label: 'تراس', icon: Umbrella },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'الكل', icon: Grid3X3, color: '#64748b' },
  { value: 'available', label: 'متاحة', icon: CheckCircle, color: '#16a34a' },
  { value: 'reserved', label: 'محجوزة', icon: AlertCircle, color: '#f59e0b' },
  { value: 'occupied', label: 'مشغولة', icon: XCircle, color: '#dc2626' },
];

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [tableOrders, setTableOrders] = useState<Record<string, Order>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filters
  const [filterArea, setFilterArea] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Real-time tables listener
  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToTables(async (tablesData) => {
      setTables(tablesData);
      
      // Fetch active orders for occupied tables
      const ordersMap: Record<string, Order> = {};
      await Promise.all(
        tablesData
          .filter(t => t.activeOrderId)
          .map(async (table) => {
            try {
              const order = await getOrder(table.activeOrderId!);
              if (order) {
                ordersMap[table.id] = order;
              }
            } catch (error) {
              console.error('Error fetching order:', error);
            }
          })
      );
      setTableOrders(ordersMap);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      // Area filter
      if (filterArea !== 'all' && table.area !== filterArea) {
        return false;
      }
      
      // Status filter
      if (filterStatus !== 'all' && table.status !== filterStatus) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const tableNumber = String(table.tableNumber).toLowerCase();
        const tableName = (table.name || '').toLowerCase();
        if (!tableNumber.includes(searchLower) && !tableName.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by table number
      const numA = parseInt(String(a.tableNumber)) || 0;
      const numB = parseInt(String(b.tableNumber)) || 0;
      return numA - numB;
    });
  }, [tables, filterArea, filterStatus, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter(t => t.status === 'available').length;
    const reserved = tables.filter(t => t.status === 'reserved').length;
    const occupied = tables.filter(t => t.status === 'occupied').length;
    return { total, available, reserved, occupied };
  }, [tables]);

  const handleRefresh = () => {
    // The listener will automatically refresh
    window.location.reload();
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleStatusChange = () => {
    // Will be refreshed by real-time listener
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            الطاولات
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            إدارة ومتابعة حالة الطاولات
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: '18px', height: '18px' }} />
            تحديث
          </button>
          <button
            onClick={() => setShowAddModal(true)}
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
            إضافة طاولة
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>إجمالي الطاولات</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{stats.total}</p>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#f0fdf4',
          borderRadius: '16px',
          border: '1px solid #16a34a',
        }}>
          <p style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>متاحة</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a', margin: 0 }}>{stats.available}</p>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#fef3c7',
          borderRadius: '16px',
          border: '1px solid #f59e0b',
        }}>
          <p style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '4px' }}>محجوزة</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b', margin: 0 }}>{stats.reserved}</p>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#fee2e2',
          borderRadius: '16px',
          border: '1px solid #dc2626',
        }}>
          <p style={{ fontSize: '12px', color: '#dc2626', marginBottom: '4px' }}>مشغولة</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626', margin: 0 }}>{stats.occupied}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0 14px',
              height: '44px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
            }}>
              <Search style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث برقم الطاولة..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#0f172a',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </div>

          {/* Area Filter */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {AREA_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilterArea(option.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: filterArea === option.value ? '#6366f1' : '#f1f5f9',
                    color: filterArea === option.value ? '#ffffff' : '#475569',
                  }}
                >
                  <Icon style={{ width: '14px', height: '14px' }} />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: filterStatus === option.value 
                      ? `2px solid ${option.color}` 
                      : '1px solid #e2e8f0',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: filterStatus === option.value ? `${option.color}20` : '#ffffff',
                    color: filterStatus === option.value ? option.color : '#475569',
                  }}
                >
                  <Icon style={{ width: '14px', height: '14px' }} />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: '4px',
            padding: '4px',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#6366f1' : '#94a3b8',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <LayoutGrid style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#6366f1' : '#94a3b8',
                cursor: 'pointer',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <List style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          color: '#64748b',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      ) : filteredTables.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}>
          <Grid3X3 style={{ width: '48px', height: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: '#475569', marginBottom: '8px' }}>
            {searchTerm || filterArea !== 'all' || filterStatus !== 'all' 
              ? 'لا توجد طاولات تطابق البحث' 
              : 'لا توجد طاولات'}
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            {searchTerm || filterArea !== 'all' || filterStatus !== 'all' 
              ? 'جرب تغيير الفلاتر' 
              : 'ابدأ بإضافة طاولة جديدة'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' 
            ? 'repeat(auto-fill, minmax(260px, 1fr))' 
            : '1fr',
          gap: '16px',
        }}>
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              activeOrder={tableOrders[table.id]}
              onClick={() => handleTableClick(table)}
            />
          ))}
        </div>
      )}

      {/* Table Details Modal */}
      {selectedTable && (
        <TableDetailsModal
          table={selectedTable}
          activeOrder={tableOrders[selectedTable.id]}
          onClose={() => setSelectedTable(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <AddTableModal
          onClose={() => setShowAddModal(false)}
          onSave={async (tableData) => {
            await createTable(tableData);
            setShowAddModal(false);
          }}
        />
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Add Table Modal Component
function AddTableModal({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void; 
  onSave: (data: any) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: '',
    name: '',
    area: 'indoor',
    capacity: 4,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tableNumber) return;
    
    setLoading(true);
    try {
      await onSave({
        tableNumber: formData.tableNumber,
        name: formData.name || `طاولة ${formData.tableNumber}`,
        area: formData.area,
        capacity: formData.capacity,
        status: 'available',
      });
    } catch (error) {
      console.error('Error creating table:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 90,
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '420px',
        maxWidth: '95vw',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        zIndex: 100,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            إضافة طاولة جديدة
          </h2>
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
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Table Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                رقم الطاولة *
              </label>
              <input
                type="text"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                placeholder="مثال: 1, A1, VIP1"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                اسم الطاولة (اختياري)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: طاولة الشرفة"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Area */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                المنطقة
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="indoor">داخلي</option>
                <option value="outdoor">خارجي</option>
                <option value="room">غرفة</option>
                <option value="vip">VIP</option>
                <option value="terrace">تراس</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                السعة (عدد الأشخاص)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={loading || !formData.tableNumber}
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: loading || !formData.tableNumber ? 'not-allowed' : 'pointer',
                opacity: loading || !formData.tableNumber ? 0.7 : 1,
              }}
            >
              {loading ? 'جاري الإضافة...' : 'إضافة الطاولة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '14px 24px',
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
          </div>
        </form>
      </div>
    </>
  );
}

