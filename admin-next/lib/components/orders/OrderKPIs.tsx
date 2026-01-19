'use client';

import { Order } from '@/lib/firebase/database';
import { 
  ShoppingCart, 
  DollarSign, 
  CreditCard, 
  Clock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface OrderKPIsProps {
  orders: Order[];
  dateRangeLabel: string;
}

export default function OrderKPIs({ orders, dateRangeLabel }: OrderKPIsProps) {
  const totalOrders = orders.length;
  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid' || o.status === 'paid').length;
  const unpaidOrders = orders.filter(o => o.paymentStatus !== 'paid' && o.status !== 'paid' && o.status !== 'cancelled').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid').length;

  const kpis = [
    {
      title: 'إجمالي الطلبات',
      value: totalOrders.toString(),
      subtitle: dateRangeLabel,
      icon: ShoppingCart,
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      title: 'إجمالي المبيعات',
      value: `${totalSales.toFixed(3)}`,
      subtitle: 'ر.ع',
      icon: DollarSign,
      color: '#10b981',
      bg: '#dcfce7',
    },
    {
      title: 'مدفوع',
      value: paidOrders.toString(),
      subtitle: `${unpaidOrders} غير مدفوع`,
      icon: CreditCard,
      color: '#10b981',
      bg: '#dcfce7',
    },
    {
      title: 'معلق',
      value: pendingOrders.toString(),
      subtitle: 'في انتظار المعالجة',
      icon: Clock,
      color: '#f59e0b',
      bg: '#fef3c7',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '20px',
    }}>
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: kpi.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon style={{ width: '24px', height: '24px', color: kpi.color }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{kpi.title}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{kpi.value}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{kpi.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}





