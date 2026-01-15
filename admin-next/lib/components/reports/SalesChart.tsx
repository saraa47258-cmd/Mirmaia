'use client';

import { useMemo } from 'react';
import { DailyStats, formatDateArabic } from '@/lib/reports';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface SalesChartProps {
  data: DailyStats[];
  loading?: boolean;
  trend?: { percentChange: number };
}

export default function SalesChart({ data, loading, trend }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { points: [], maxSales: 0, maxOrders: 0 };
    
    const maxSales = Math.max(...data.map(d => d.totalSales), 1);
    const maxOrders = Math.max(...data.map(d => d.totalOrders), 1);
    
    return {
      points: data,
      maxSales,
      maxOrders,
    };
  }, [data]);

  const totalSales = data.reduce((sum, d) => sum + d.totalSales, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.totalOrders, 0);

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{
          height: '400px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          animation: 'pulse 1.5s infinite',
        }} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '60px 24px',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <BarChart3 style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '16px', color: '#64748b' }}>لا توجد بيانات للعرض</p>
      </div>
    );
  }

  const chartHeight = 350;
  const chartPadding = { top: 20, right: 60, bottom: 60, left: 20 };
  const barWidth = Math.max(20, Math.min(60, (800 - chartPadding.left - chartPadding.right) / data.length - 8));

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '24px',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#0f172a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <BarChart3 style={{ width: '20px', height: '20px', color: '#6366f1' }} />
            حركة المبيعات
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            {data.length} يوم
          </p>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>إجمالي المبيعات</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
              {totalSales.toFixed(3)} ر.ع
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>إجمالي الطلبات</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#6366f1' }}>
              {totalOrders}
            </p>
          </div>
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: trend.percentChange >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '10px',
            }}>
              {trend.percentChange >= 0 ? (
                <TrendingUp style={{ width: '20px', height: '20px', color: '#22c55e' }} />
              ) : (
                <TrendingDown style={{ width: '20px', height: '20px', color: '#ef4444' }} />
              )}
              <div>
                <p style={{ fontSize: '11px', color: '#64748b' }}>مقارنة بالفترة السابقة</p>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: trend.percentChange >= 0 ? '#22c55e' : '#ef4444',
                }}>
                  {trend.percentChange >= 0 ? '+' : ''}{trend.percentChange.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{
        padding: '24px',
        overflowX: 'auto',
      }}>
        <svg
          width="100%"
          height={chartHeight + chartPadding.top + chartPadding.bottom}
          style={{ minWidth: `${data.length * (barWidth + 8) + chartPadding.left + chartPadding.right}px` }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={chartPadding.left}
                y1={chartPadding.top + chartHeight * (1 - ratio)}
                x2="100%"
                y2={chartPadding.top + chartHeight * (1 - ratio)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x="100%"
                y={chartPadding.top + chartHeight * (1 - ratio)}
                dx="-10"
                dy="4"
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
              >
                {(chartData.maxSales * ratio).toFixed(1)}
              </text>
            </g>
          ))}

          {/* Bars and Area */}
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Bars */}
          {data.map((point, i) => {
            const x = chartPadding.left + i * (barWidth + 8) + 4;
            const barHeight = (point.totalSales / chartData.maxSales) * chartHeight;
            const y = chartPadding.top + chartHeight - barHeight;

            return (
              <g key={i}>
                {/* Sales bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  fill="url(#salesGradient)"
                  style={{ transition: 'all 0.3s' }}
                />

                {/* Orders indicator */}
                <circle
                  cx={x + barWidth / 2}
                  cy={chartPadding.top + chartHeight - (point.totalOrders / chartData.maxOrders) * chartHeight}
                  r="4"
                  fill="#22c55e"
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* Date label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + chartPadding.top + 20}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  transform={`rotate(-45, ${x + barWidth / 2}, ${chartHeight + chartPadding.top + 20})`}
                >
                  {point.date.slice(5)}
                </text>

                {/* Tooltip trigger area */}
                <rect
                  x={x - 4}
                  y={chartPadding.top}
                  width={barWidth + 8}
                  height={chartHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                >
                  <title>
                    {formatDateArabic(point.date)}
                    {'\n'}المبيعات: {point.totalSales.toFixed(3)} ر.ع
                    {'\n'}الطلبات: {point.totalOrders}
                  </title>
                </rect>
              </g>
            );
          })}

          {/* Orders line */}
          <path
            d={data.map((point, i) => {
              const x = chartPadding.left + i * (barWidth + 8) + 4 + barWidth / 2;
              const y = chartPadding.top + chartHeight - (point.totalOrders / chartData.maxOrders) * chartHeight;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'all 0.3s' }}
          />
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0.2) 100%)',
          }} />
          <span style={{ fontSize: '13px', color: '#64748b' }}>المبيعات (ر.ع)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#22c55e',
          }} />
          <span style={{ fontSize: '13px', color: '#64748b' }}>عدد الطلبات</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

