'use client';

import { useEffect, useState } from 'react';
import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';
import { getOrders, updateOrderStatus, Order } from '@/lib/firebase/database';
import Link from 'next/link';

const formatPrice = (price: number | undefined, hideFinancial: boolean = false): string => {
  if (hideFinancial) return '---';
  if (!price) return '0.000 ر.ع';
  return `${price.toFixed(3)} ر.ع`;
};

export default function WorkerOrdersPage() {
  const { shouldHideFinancialData } = useWorkerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }));
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('حدث خطأ في تحديث الطلب');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      preparing: '#3b82f6',
      ready: '#10b981',
      completed: '#64748b',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'قيد الانتظار',
      preparing: 'قيد التحضير',
      ready: 'جاهز',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return texts[status] || status;
  };

  const hideFinancial = shouldHideFinancialData();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{
        background: 'white',
        padding: '16px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/worker" style={{ textDecoration: 'none', color: '#6366f1', fontWeight: '600' }}>
            ← رجوع
          </Link>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>الطلبات</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      <div style={{ padding: '0 20px 20px' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            لا توجد طلبات
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map(order => (
              <div
                key={order.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold' }}>
                      طلب #{order.id?.substring(order.id.length - 6).toUpperCase()}
                    </h3>
                    {order.tableNumber && (
                      <p style={{ margin: '4px 0', color: '#64748b', fontSize: '14px' }}>
                        طاولة: {order.tableNumber}
                      </p>
                    )}
                    {order.roomNumber && (
                      <p style={{ margin: '4px 0', color: '#64748b', fontSize: '14px' }}>
                        غرفة: {order.roomNumber}
                      </p>
                    )}
                  </div>
                  <div style={{
                    padding: '4px 12px',
                    background: getStatusColor(order.status || 'pending') + '20',
                    color: getStatusColor(order.status || 'pending'),
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {getStatusText(order.status || 'pending')}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>
                    {order.items?.length || 0} عنصر
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                    {formatPrice(order.total, hideFinancial)}
                  </p>
                </div>

                {(order.status === 'pending' || order.status === 'preparing') && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}
                      >
                        بدء التحضير
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}
                      >
                        جاهز
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
