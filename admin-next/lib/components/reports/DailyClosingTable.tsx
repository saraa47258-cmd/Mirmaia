'use client';

import { DailyClosing, formatDateArabic } from '@/lib/reports';
import { Calendar, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DailyClosingTableProps {
  closings: DailyClosing[];
  loading?: boolean;
}

export default function DailyClosingTable({ closings, loading }: DailyClosingTableProps) {
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '20px',
      }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '16px',
            padding: '16px 0',
            borderBottom: '1px solid #f1f5f9',
          }}>
            <div style={{
              width: '100px',
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              animation: 'pulse 1.5s infinite',
            }} />
            <div style={{
              flex: 1,
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              animation: 'pulse 1.5s infinite',
            }} />
          </div>
        ))}
      </div>
    );
  }

  if (closings.length === 0) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        <Calendar style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '16px', color: '#64748b' }}>لا توجد سجلات إغلاق</p>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
          ابدأ بإضافة إغلاق يومي جديد
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
    }}>
      {/* Header */}
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
          سجل الإغلاق اليومي
        </h3>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{
                padding: '14px 20px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                التاريخ
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                المبيعات
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                نقدي
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                بطاقة
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                الفعلي
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                الفرق
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                المسؤول
              </th>
            </tr>
          </thead>
          <tbody>
            {closings.map((closing) => (
              <tr 
                key={closing.id}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.15s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Calendar style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {formatDateArabic(closing.date)}
                      </p>
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(closing.closedAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>
                    {closing.totalSales.toFixed(3)}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '4px' }}>ر.ع</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#0f172a' }}>
                    {closing.cashSales.toFixed(3)}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#0f172a' }}>
                    {closing.cardSales.toFixed(3)}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    {closing.actualCash.toFixed(3)}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: closing.difference === 0 
                      ? 'rgba(34, 197, 94, 0.1)' 
                      : closing.difference > 0 
                        ? 'rgba(59, 130, 246, 0.1)' 
                        : 'rgba(239, 68, 68, 0.1)',
                    color: closing.difference === 0 
                      ? '#22c55e' 
                      : closing.difference > 0 
                        ? '#3b82f6' 
                        : '#ef4444',
                  }}>
                    {closing.difference === 0 ? (
                      <CheckCircle style={{ width: '12px', height: '12px' }} />
                    ) : (
                      <AlertCircle style={{ width: '12px', height: '12px' }} />
                    )}
                    {closing.difference > 0 ? '+' : ''}{closing.difference.toFixed(3)}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      {closing.closedByName || 'غير محدد'}
                    </span>
                  </div>
                  {closing.notes && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                    }}>
                      <FileText style={{ width: '12px', height: '12px', color: '#f59e0b' }} />
                      <span style={{ fontSize: '11px', color: '#f59e0b' }}>
                        {closing.notes.slice(0, 30)}{closing.notes.length > 30 ? '...' : ''}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

