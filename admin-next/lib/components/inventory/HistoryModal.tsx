'use client';

import { useState, useEffect } from 'react';
import { InventoryProduct, StockMovement, getProductStockHistory } from '@/lib/inventory';
import { X, History, TrendingUp, TrendingDown, Edit, Calendar, User, FileText } from 'lucide-react';

interface HistoryModalProps {
  product: InventoryProduct;
  onClose: () => void;
}

type DateRange = 'today' | 'week' | 'month' | 'custom';

export default function HistoryModal({ product, onClose }: HistoryModalProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    loadHistory();
  }, [dateRange, customStart, customEnd]);

  const getDateRange = (): { start?: Date; end?: Date } => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        return { start: todayStart };
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        return { start: weekStart };
      case 'month':
        const monthStart = new Date(now);
        monthStart.setMonth(monthStart.getMonth() - 1);
        return { start: monthStart };
      case 'custom':
        return {
          start: customStart ? new Date(customStart) : undefined,
          end: customEnd ? new Date(customEnd) : undefined,
        };
      default:
        return {};
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const data = await getProductStockHistory(product.id, start, end);
      setMovements(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return { icon: TrendingUp, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'وارد' };
      case 'out':
        return { icon: TrendingDown, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'صادر' };
      case 'adjust':
        return { icon: Edit, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)', label: 'تعديل' };
      default:
        return { icon: History, color: '#64748b', bgColor: '#f1f5f9', label: 'حركة' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        maxWidth: '95vw',
        maxHeight: '85vh',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        zIndex: 101,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <History style={{ width: '24px', height: '24px', color: '#6366f1' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                سجل الحركات
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                {product.name}
              </p>
            </div>
          </div>
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
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { value: 'today', label: 'اليوم' },
              { value: 'week', label: 'أسبوع' },
              { value: 'month', label: 'شهر' },
              { value: 'custom', label: 'مخصص' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as DateRange)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: dateRange === option.value ? '#6366f1' : '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: dateRange === option.value ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <span style={{ color: '#94a3b8' }}>إلى</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p style={{ fontSize: '14px', color: '#64748b' }}>جاري التحميل...</p>
            </div>
          ) : movements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <History style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '4px' }}>
                لا توجد حركات
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                لم يتم تسجيل أي حركات مخزون في هذه الفترة
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {movements.map((movement) => {
                const config = getMovementIcon(movement.type);
                const Icon = config.icon;

                return (
                  <div
                    key={movement.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: config.bgColor,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon style={{ width: '20px', height: '20px', color: config.color }} />
                        </div>
                        <div>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            backgroundColor: config.bgColor,
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: config.color,
                            marginBottom: '4px',
                          }}>
                            {config.label}
                          </span>
                          <p style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                            {movement.reason || 'بدون سبب'}
                          </p>
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                      }}>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: movement.qtyChange > 0 ? '#22c55e' : 
                                 movement.qtyChange < 0 ? '#ef4444' : '#6366f1',
                        }}>
                          {movement.qtyChange > 0 ? '+' : ''}{movement.qtyChange}
                        </p>
                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {movement.prevQty} → {movement.newQty}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      fontSize: '12px',
                      color: '#64748b',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar style={{ width: '14px', height: '14px' }} />
                        {formatDate(movement.createdAt)}
                      </div>
                      {movement.createdByName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User style={{ width: '14px', height: '14px' }} />
                          {movement.createdByName}
                        </div>
                      )}
                      {movement.supplier && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>المورد: {movement.supplier}</span>
                        </div>
                      )}
                    </div>

                    {movement.note && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}>
                        <FileText style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ fontSize: '13px', color: '#92400e' }}>{movement.note}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            إجمالي الحركات: {movements.length}
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

