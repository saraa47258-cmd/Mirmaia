'use client';

import { useState, useEffect } from 'react';
import { DailyClosing, getTodaySalesForClosing, createDailyClosing } from '@/lib/reports';
import { X, Calendar, DollarSign, Calculator, FileText, AlertCircle } from 'lucide-react';

interface DailyClosingModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userName?: string;
}

export default function DailyClosingModal({
  onClose,
  onSuccess,
  userId,
  userName,
}: DailyClosingModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [openingCash, setOpeningCash] = useState('0');
  const [cashSales, setCashSales] = useState('0');
  const [cardSales, setCardSales] = useState('0');
  const [expenses, setExpenses] = useState('0');
  const [actualCash, setActualCash] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [error, setError] = useState('');

  // Load sales for selected date
  useEffect(() => {
    loadSalesData();
  }, [date]);

  const loadSalesData = async () => {
    setLoadingSales(true);
    try {
      const sales = await getTodaySalesForClosing(date);
      setCashSales(sales.cashSales.toFixed(3));
      setCardSales(sales.cardSales.toFixed(3));
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoadingSales(false);
    }
  };

  const totalSales = parseFloat(cashSales) + parseFloat(cardSales);
  const expectedCash = parseFloat(openingCash) + parseFloat(cashSales) - parseFloat(expenses);
  const difference = parseFloat(actualCash) - expectedCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createDailyClosing({
        date,
        openingCash: parseFloat(openingCash),
        cashSales: parseFloat(cashSales),
        cardSales: parseFloat(cardSales),
        totalSales,
        expenses: parseFloat(expenses),
        actualCash: parseFloat(actualCash),
        difference,
        notes: notes || undefined,
        closedBy: userId,
        closedByName: userName,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الإغلاق');
    } finally {
      setLoading(false);
    }
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
        width: '520px',
        maxWidth: '95vw',
        maxHeight: '90vh',
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
          backgroundColor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calculator style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                إغلاق يومي
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                سجل إغلاق الصندوق
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

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px' }}>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                marginBottom: '20px',
              }}>
                <AlertCircle style={{ width: '18px', height: '18px', color: '#ef4444' }} />
                <span style={{ fontSize: '14px', color: '#ef4444' }}>{error}</span>
              </div>
            )}

            {/* Date */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                <Calendar style={{ width: '16px', height: '16px' }} />
                التاريخ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Sales Info (Auto-loaded) */}
            <div style={{
              padding: '16px',
              backgroundColor: loadingSales ? '#f8fafc' : 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e', marginBottom: '12px' }}>
                مبيعات اليوم (محسوبة تلقائياً)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b' }}>مبيعات نقدية</label>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    {loadingSales ? '...' : `${cashSales} ر.ع`}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b' }}>مبيعات بطاقة</label>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    {loadingSales ? '...' : `${cardSales} ر.ع`}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b' }}>الإجمالي</label>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#22c55e' }}>
                    {loadingSales ? '...' : `${totalSales.toFixed(3)} ر.ع`}
                  </p>
                </div>
              </div>
            </div>

            {/* Opening Cash & Expenses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '10px',
                }}>
                  رصيد الافتتاح
                </label>
                <input
                  type="number"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  step="0.001"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '10px',
                }}>
                  المصروفات
                </label>
                <input
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  step="0.001"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Actual Cash */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                <DollarSign style={{ width: '16px', height: '16px' }} />
                النقد الفعلي في الصندوق
              </label>
              <input
                type="number"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                step="0.001"
                min="0"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* Difference */}
            <div style={{
              padding: '16px',
              backgroundColor: difference === 0 ? 'rgba(34, 197, 94, 0.1)' :
                            difference > 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                الفرق (الفعلي - المتوقع)
              </p>
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: difference === 0 ? '#22c55e' :
                       difference > 0 ? '#3b82f6' : '#ef4444',
              }}>
                {difference > 0 ? '+' : ''}{difference.toFixed(3)} ر.ع
              </p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                المتوقع: {expectedCash.toFixed(3)} ر.ع
              </p>
            </div>

            {/* Notes */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                <FileText style={{ width: '16px', height: '16px' }} />
                ملاحظات (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'جاري الحفظ...' : 'تأكيد الإغلاق'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}





