'use client';

import { InventoryStats } from '@/lib/inventory';
import { Package, AlertTriangle, XCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface InventoryKPIsProps {
  stats: InventoryStats;
  loading?: boolean;
}

export default function InventoryKPIs({ stats, loading }: InventoryKPIsProps) {
  const kpis = [
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts,
      icon: Package,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      subtitle: `${stats.totalInStock} متوفر`,
    },
    {
      title: 'مخزون منخفض',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      subtitle: 'يحتاج إعادة تعبئة',
      alert: stats.lowStockCount > 0,
    },
    {
      title: 'نفد المخزون',
      value: stats.outOfStockCount,
      icon: XCircle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      subtitle: 'منتجات غير متوفرة',
      alert: stats.outOfStockCount > 0,
    },
    {
      title: 'حركة اليوم (وارد)',
      value: stats.todayMovementsIn,
      icon: TrendingUp,
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      subtitle: 'إضافات اليوم',
    },
    {
      title: 'حركة اليوم (صادر)',
      value: stats.todayMovementsOut,
      icon: TrendingDown,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      subtitle: 'سحوبات اليوم',
    },
    {
      title: 'قيمة المخزون',
      value: stats.totalStockValue.toFixed(2),
      icon: DollarSign,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      subtitle: 'ر.ع',
      isPrice: true,
    },
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
              animation: 'pulse 1.5s infinite',
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              marginBottom: '16px',
            }} />
            <div style={{
              width: '60%',
              height: '14px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              marginBottom: '8px',
            }} />
            <div style={{
              width: '40%',
              height: '28px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
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
              border: kpi.alert ? `2px solid ${kpi.color}40` : '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s',
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
            <p style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
            }}>
              {kpi.value}
              {kpi.isPrice && (
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                  {kpi.subtitle}
                </span>
              )}
            </p>
            {!kpi.isPrice && (
              <p style={{
                fontSize: '12px',
                color: kpi.alert ? kpi.color : '#94a3b8',
                fontWeight: kpi.alert ? 500 : 400,
              }}>
                {kpi.subtitle}
              </p>
            )}

            {/* Alert indicator */}
            {kpi.alert && (
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                width: '8px',
                height: '8px',
                backgroundColor: kpi.color,
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite',
              }} />
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





