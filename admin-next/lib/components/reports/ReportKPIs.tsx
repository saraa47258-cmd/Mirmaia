'use client';

import { ReportStats } from '@/lib/reports';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  CreditCard, 
  Banknote,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface ReportKPIsProps {
  stats: ReportStats;
  trend?: { percentChange: number };
  loading?: boolean;
}

export default function ReportKPIs({ stats, trend, loading }: ReportKPIsProps) {
  const kpis = [
    {
      title: 'إجمالي المبيعات',
      value: stats.totalSales.toFixed(3),
      unit: 'ر.ع',
      icon: DollarSign,
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      trend: trend?.percentChange,
    },
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
    },
    {
      title: 'متوسط قيمة الطلب',
      value: stats.averageOrderValue.toFixed(3),
      unit: 'ر.ع',
      icon: TrendingUp,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'مبيعات نقدية',
      value: stats.cashSales.toFixed(3),
      unit: 'ر.ع',
      icon: Banknote,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      subtitle: `${stats.paidOrders} طلب مدفوع`,
    },
    {
      title: 'مبيعات بطاقة',
      value: stats.cardSales.toFixed(3),
      unit: 'ر.ع',
      icon: CreditCard,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      subtitle: stats.unpaidOrders > 0 ? `${stats.unpaidOrders} غير مدفوع` : undefined,
      alert: stats.unpaidOrders > 0,
    },
    ...(stats.topProduct ? [{
      title: 'المنتج الأكثر مبيعاً',
      value: stats.topProduct.name,
      icon: Award,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      subtitle: `${stats.topProduct.quantity} وحدة`,
      isText: true,
    }] : []),
  ];

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              marginBottom: '16px',
              animation: 'pulse 1.5s infinite',
            }} />
            <div style={{
              width: '60%',
              height: '14px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s infinite',
            }} />
            <div style={{
              width: '40%',
              height: '28px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              animation: 'pulse 1.5s infinite',
            }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    }}>
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: kpi.alert ? '2px solid rgba(239, 68, 68, 0.3)' : '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              width: '100px',
              height: '100px',
              background: kpi.bgColor,
              borderRadius: '50%',
              opacity: 0.5,
            }} />

            {/* Icon */}
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: kpi.bgColor,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              position: 'relative',
            }}>
              <Icon style={{ width: '24px', height: '24px', color: kpi.color }} />
            </div>

            {/* Content */}
            <p style={{
              fontSize: '13px',
              color: '#64748b',
              marginBottom: '6px',
              fontWeight: 500,
            }}>
              {kpi.title}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <p style={{
                fontSize: kpi.isText ? '16px' : '28px',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
              }}>
                {kpi.value}
              </p>
              {kpi.unit && (
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                  {kpi.unit}
                </span>
              )}
              
              {/* Trend indicator */}
              {kpi.trend !== undefined && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: kpi.trend >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                }}>
                  {kpi.trend >= 0 ? (
                    <ArrowUpRight style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                  ) : (
                    <ArrowDownRight style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                  )}
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: kpi.trend >= 0 ? '#22c55e' : '#ef4444',
                  }}>
                    {Math.abs(kpi.trend).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {kpi.subtitle && (
              <p style={{
                fontSize: '12px',
                color: kpi.alert ? '#ef4444' : '#94a3b8',
                marginTop: '6px',
                fontWeight: kpi.alert ? 500 : 400,
              }}>
                {kpi.subtitle}
              </p>
            )}
          </div>
        );
      })}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

