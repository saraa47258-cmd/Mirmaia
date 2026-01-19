'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { getTodayOrders, getSalesStats, getProducts } from '@/lib/firebase/database';
import { Order } from '@/lib/firebase/database';
import Topbar from '@/lib/components/Topbar';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  Package,
  Users
} from 'lucide-react';

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    paidOrders: 0,
    productsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [todayOrders, salesData, products] = await Promise.all([
        getTodayOrders(),
        getSalesStats(),
        getProducts(),
      ]);

      const paidOrders = todayOrders.filter(
        (o) => o.status === 'paid' || o.status === 'completed'
      );
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        totalRevenue,
        ordersCount: todayOrders.length,
        paidOrders: paidOrders.length,
        productsCount: products.filter((p) => p.active).length,
      });

      setRecentOrders(
        todayOrders
          .sort((a, b) => {
            const timeA = a.timestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.timestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeB - timeA;
          })
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user can see financial data (admin and cashier only)
  const canSeeFinancialData = user?.role === 'admin' || user?.role === 'cashier';

  const allKpiCards = [
    {
      title: 'إجمالي الإيرادات',
      value: `${stats.totalRevenue.toFixed(3)}`,
      unit: 'ر.ع',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      requiresFinancial: true,
    },
    {
      title: 'الطلبات اليوم',
      value: stats.ordersCount.toString(),
      unit: 'طلب',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      shadowColor: 'rgba(59, 130, 246, 0.3)',
      requiresFinancial: false,
    },
    {
      title: 'المنتجات النشطة',
      value: stats.productsCount.toString(),
      unit: 'منتج',
      change: '0%',
      trend: 'neutral',
      icon: Package,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      shadowColor: 'rgba(245, 158, 11, 0.3)',
      requiresFinancial: false,
    },
    {
      title: 'الطلبات المدفوعة',
      value: stats.paidOrders.toString(),
      unit: 'طلب',
      change: '+5.1%',
      trend: 'up',
      icon: Users,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      shadowColor: 'rgba(139, 92, 246, 0.3)',
      requiresFinancial: true,
    },
  ];

  // Filter KPI cards based on user permissions
  const kpiCards = canSeeFinancialData 
    ? allKpiCards 
    : allKpiCards.filter(card => !card.requiresFinancial);

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      pending: { bg: '#fef3c7', color: '#b45309' },
      processing: { bg: '#dbeafe', color: '#1d4ed8' },
      preparing: { bg: '#fef3c7', color: '#b45309' },
      ready: { bg: '#cffafe', color: '#0891b2' },
      paid: { bg: '#dcfce7', color: '#16a34a' },
      completed: { bg: '#dcfce7', color: '#16a34a' },
      cancelled: { bg: '#fee2e2', color: '#dc2626' },
    };
    return styles[status] || { bg: '#f1f5f9', color: '#64748b' };
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'معلق',
      processing: 'قيد التنفيذ',
      preparing: 'قيد التحضير',
      ready: 'جاهز',
      paid: 'مدفوع',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
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
      <Topbar title="لوحة التحكم" subtitle="نظرة عامة على الأداء" />
      
      <div style={{ padding: isMobile ? '16px' : isTablet ? '20px' : '24px' }}>
        {/* KPI Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile 
            ? 'repeat(1, 1fr)' 
            : isTablet 
              ? 'repeat(2, 1fr)'
              : 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: isMobile ? '12px' : '20px', 
          marginBottom: isMobile ? '16px' : '24px' 
        }}>
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: isMobile ? '16px' : '20px',
                  padding: isMobile ? '16px' : '24px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '14px' : '20px' }}>
                  <div style={{
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                    borderRadius: isMobile ? '12px' : '14px',
                    background: kpi.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${kpi.shadowColor}`,
                  }}>
                    <Icon style={{ width: isMobile ? '18px' : '22px', height: isMobile ? '18px' : '22px', color: '#ffffff' }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: 600,
                    color: kpi.trend === 'up' ? '#16a34a' : kpi.trend === 'down' ? '#dc2626' : '#64748b',
                  }}>
                    {kpi.trend === 'up' && <TrendingUp style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />}
                    {kpi.trend === 'down' && <TrendingDown style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />}
                    <span>{kpi.change}</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: '#0f172a' }}>{kpi.value}</span>
                    <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#64748b' }}>{kpi.unit}</span>
                  </div>
                  <p style={{ fontSize: isMobile ? '12px' : '13px', color: '#94a3b8', marginTop: '4px' }}>{kpi.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: isMobile ? '16px' : '20px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>آخر الطلبات</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>آخر 5 طلبات</p>
            </div>
            <a 
              href="/admin/orders" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#6366f1',
                textDecoration: 'none',
              }}
            >
              عرض الكل
              <ArrowUpRight style={{ width: '14px', height: '14px' }} />
            </a>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '14px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>رقم الطلب</th>
                <th style={{ padding: '14px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>العميل</th>
                {canSeeFinancialData && (
                  <th style={{ padding: '14px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>المبلغ</th>
                )}
                <th style={{ padding: '14px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>الحالة</th>
                <th style={{ padding: '14px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>الوقت</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={canSeeFinancialData ? 5 : 4} style={{ padding: '48px 24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                    لا توجد طلبات
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, index) => {
                  const statusStyle = getStatusStyle(order.status);
                  return (
                    <tr key={order.id} style={{ borderTop: index > 0 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                        {order.customerName || order.tableNumber || 'غير محدد'}
                      </td>
                      {canSeeFinancialData && (
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                          {order.total.toFixed(3)} ر.ع
                        </td>
                      )}
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
