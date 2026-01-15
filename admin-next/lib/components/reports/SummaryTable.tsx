'use client';

import { DailyStats, TopProduct, formatDateArabic, formatMonthArabic } from '@/lib/reports';
import { Calendar, TrendingUp, Award } from 'lucide-react';

interface SummaryTableProps {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: { period: string; stats: DailyStats }[];
  topProducts?: TopProduct[];
  loading?: boolean;
}

export default function SummaryTable({ type, data, topProducts, loading }: SummaryTableProps) {
  const formatPeriod = (period: string): string => {
    switch (type) {
      case 'daily':
        return formatDateArabic(period);
      case 'weekly':
        const weekStart = new Date(period);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
      case 'monthly':
        return formatMonthArabic(period);
      case 'yearly':
        return period;
      default:
        return period;
    }
  };

  const getPeriodLabel = (): string => {
    switch (type) {
      case 'daily': return 'اليوم';
      case 'weekly': return 'الأسبوع';
      case 'monthly': return 'الشهر';
      case 'yearly': return 'السنة';
      default: return 'الفترة';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {[1, 2].map((i) => (
          <div key={i} style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
          }}>
            <div style={{
              width: '150px',
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              marginBottom: '16px',
              animation: 'pulse 1.5s infinite',
            }} />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} style={{
                height: '48px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '8px',
                animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      {/* Period Breakdown */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#0f172a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#6366f1' }} />
            تفاصيل حسب {getPeriodLabel()}
          </h3>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                <th style={{
                  padding: '12px 20px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  {getPeriodLabel()}
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  المبيعات
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  الطلبات
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  المتوسط
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>لا توجد بيانات</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>
                        {formatPeriod(item.period)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>
                        {item.stats.totalSales.toFixed(3)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '2px' }}>ر.ع</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#6366f1' }}>
                        {item.stats.totalOrders}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {item.stats.averageOrder.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        {data.length > 0 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>الإجمالي</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>
                {data.reduce((sum, d) => sum + d.stats.totalSales, 0).toFixed(3)} ر.ع
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#6366f1' }}>
                {data.reduce((sum, d) => sum + d.stats.totalOrders, 0)} طلب
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top Products */}
      {topProducts && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <Award style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
              المنتجات الأكثر مبيعاً
            </h3>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {topProducts.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>لا توجد بيانات</p>
              </div>
            ) : (
              <div style={{ padding: '16px' }}>
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: index === 0 ? 'rgba(245, 158, 11, 0.1)' : '#f8fafc',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      border: index === 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                    }}
                  >
                    {/* Rank */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: index === 0 ? '#f59e0b' : 
                                       index === 1 ? '#94a3b8' :
                                       index === 2 ? '#cd7f32' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: index < 3 ? '#ffffff' : '#64748b',
                    }}>
                      {index + 1}
                    </div>

                    {/* Product */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}>
                      {product.emoji || '📦'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                        {product.quantity} وحدة
                      </p>
                    </div>

                    {/* Revenue */}
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#22c55e' }}>
                        {product.revenue.toFixed(3)}
                      </p>
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>ر.ع</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

