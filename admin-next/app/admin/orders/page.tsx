'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Order, 
  getOrdersByDateRange, 
  getDateRangeForFilter,
  updateOrderStatus,
  updateOrderPaymentStatus,
  DateRange 
} from '@/lib/firebase/database';
import OrderFilters, { OrderFiltersState } from '@/lib/components/orders/OrderFilters';
import OrderKPIs from '@/lib/components/orders/OrderKPIs';
import OrderDetailsDrawer from '@/lib/components/orders/OrderDetailsDrawer';
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  ChefHat,
  Package,
  CheckCircle,
  Ban,
  Printer,
  MoreVertical,
  RefreshCw
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'معلق', color: '#f59e0b', bg: '#fef3c7' },
  processing: { label: 'قيد التنفيذ', color: '#3b82f6', bg: '#dbeafe' },
  preparing: { label: 'قيد التحضير', color: '#f59e0b', bg: '#fef3c7' },
  ready: { label: 'جاهز', color: '#06b6d4', bg: '#cffafe' },
  paid: { label: 'مدفوع', color: '#10b981', bg: '#dcfce7' },
  completed: { label: 'مكتمل', color: '#10b981', bg: '#dcfce7' },
  cancelled: { label: 'ملغي', color: '#ef4444', bg: '#fee2e2' },
};

const PAYMENT_STATUS = {
  pending: { label: 'غير مدفوع', color: '#f59e0b', bg: '#fef3c7' },
  paid: { label: 'مدفوع', color: '#10b981', bg: '#dcfce7' },
};

const DATE_RANGE_LABELS = {
  today: 'اليوم',
  week: 'هذا الأسبوع',
  month: 'هذا الشهر',
  year: 'هذه السنة',
  custom: 'تاريخ محدد',
};

const PAGE_SIZE = 15;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState<OrderFiltersState>({
    dateRange: 'today',
    status: 'all',
    paymentStatus: 'all',
    search: '',
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const dateRange = getDateRangeForFilter(
        filters.dateRange,
        filters.customStart,
        filters.customEnd
      );
      const data = await getOrdersByDateRange(dateRange);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
    setCurrentPage(1);
  }, [filters.dateRange, filters.customStart, filters.customEnd]);

  // Filtered orders (status, payment, search)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }
      
      // Payment filter
      if (filters.paymentStatus !== 'all') {
        const isPaid = order.paymentStatus === 'paid' || order.status === 'paid';
        if (filters.paymentStatus === 'paid' && !isPaid) return false;
        if (filters.paymentStatus === 'pending' && isPaid) return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const orderIdMatch = order.id.toLowerCase().includes(searchLower);
        const customerMatch = order.customerName?.toLowerCase().includes(searchLower);
        if (!orderIdMatch && !customerMatch) return false;
      }
      
      return true;
    });
  }, [orders, filters.status, filters.paymentStatus, filters.search]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      if (status === 'paid') {
        await updateOrderPaymentStatus(orderId, 'paid');
        await updateOrderStatus(orderId, 'completed');
      } else {
        await updateOrderStatus(orderId, status);
      }
      await loadOrders();
      
      // Update selected order if open
      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, status: status as any });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'staff-menu': return 'الموظفين';
      case 'cashier': return 'الكاشير';
      case 'mobile': return 'الجوال';
      default: return source || '-';
    }
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
            الطلبات
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            إدارة ومتابعة جميع الطلبات
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#475569',
            cursor: refreshing ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw 
            style={{ 
              width: '18px', 
              height: '18px',
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }} 
          />
          تحديث
        </button>
      </div>

      {/* KPIs */}
      <OrderKPIs 
        orders={orders} 
        dateRangeLabel={DATE_RANGE_LABELS[filters.dateRange]} 
      />

      {/* Filters */}
      <OrderFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            color: '#64748b',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#64748b',
          }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>لا توجد طلبات</p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              {filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all' 
                ? 'جرب تغيير الفلاتر' 
                : 'لم يتم تسجيل أي طلبات في هذه الفترة'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 140px 1fr 80px 100px 100px 100px 80px 80px',
              gap: '12px',
              padding: '14px 20px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
            }}>
              <div>رقم الطلب</div>
              <div>التاريخ/الوقت</div>
              <div>العميل/الطاولة</div>
              <div style={{ textAlign: 'center' }}>العناصر</div>
              <div style={{ textAlign: 'center' }}>الإجمالي</div>
              <div style={{ textAlign: 'center' }}>الدفع</div>
              <div style={{ textAlign: 'center' }}>الحالة</div>
              <div style={{ textAlign: 'center' }}>المصدر</div>
              <div style={{ textAlign: 'center' }}>إجراءات</div>
            </div>

            {/* Table Body */}
            {paginatedOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
              const isPaid = order.paymentStatus === 'paid' || order.status === 'paid';
              const paymentConfig = isPaid ? PAYMENT_STATUS.paid : PAYMENT_STATUS.pending;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 140px 1fr 80px 100px 100px 100px 80px 80px',
                    gap: '12px',
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Order ID */}
                  <div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#6366f1',
                      fontFamily: 'monospace',
                    }}>
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  {/* Date/Time */}
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: 0 }}>
                      {formatDate(order.createdAt)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                      {formatTime(order.createdAt)}
                    </p>
                  </div>

                  {/* Customer/Table */}
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: 0 }}>
                      {order.customerName || 'عميل'}
                    </p>
                    {order.tableNumber && (
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                        🪑 {order.tableNumber}
                      </p>
                    )}
                  </div>

                  {/* Items Count */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#475569',
                    }}>
                      {order.itemsCount || order.items?.length || 0}
                    </span>
                  </div>

                  {/* Total */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0f172a',
                    }}>
                      {order.total.toFixed(3)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '4px' }}>
                      ر.ع
                    </span>
                  </div>

                  {/* Payment Status */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: paymentConfig.bg,
                      color: paymentConfig.color,
                    }}>
                      {paymentConfig.label}
                    </span>
                  </div>

                  {/* Order Status */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.color,
                    }}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Source */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {getSourceLabel(order.source)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div 
                    style={{ textAlign: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        padding: '8px',
                        backgroundColor: '#f1f5f9',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#475569',
                      }}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
              }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  عرض {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} من {filteredOrders.length}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      color: currentPage === 1 ? '#cbd5e1' : '#475569',
                    }}
                  >
                    <ChevronRight style={{ width: '18px', height: '18px' }} />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: currentPage === pageNum ? '#6366f1' : '#ffffff',
                          border: '1px solid ' + (currentPage === pageNum ? '#6366f1' : '#e2e8f0'),
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: currentPage === pageNum ? '#ffffff' : '#475569',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      color: currentPage === totalPages ? '#cbd5e1' : '#475569',
                    }}
                  >
                    <ChevronLeft style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleStatusUpdate}
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
