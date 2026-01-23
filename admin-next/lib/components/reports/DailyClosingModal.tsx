'use client';

import { useState, useEffect } from 'react';
import { DailyClosing, createDailyClosing, isDayClosed } from '@/lib/reports';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Calculator, 
  FileText, 
  AlertCircle,
  Lock,
  CheckCircle,
  Banknote,
  CreditCard,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

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
  const [ordersCount, setOrdersCount] = useState('0');
  const [expenses, setExpenses] = useState('0');
  const [actualCash, setActualCash] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadyClosed, setAlreadyClosed] = useState(false);
  const [checkingClosed, setCheckingClosed] = useState(true);

  // Check if day is already closed
  useEffect(() => {
    checkIfClosed();
  }, [date]);

  const checkIfClosed = async () => {
    setCheckingClosed(true);
    try {
      const closed = await isDayClosed(date);
      setAlreadyClosed(closed);
    } catch (error) {
      console.error('Error checking if day is closed:', error);
    } finally {
      setCheckingClosed(false);
    }
  };

  const totalSales = parseFloat(cashSales || '0') + parseFloat(cardSales || '0');
  const expectedCash = parseFloat(openingCash || '0') + parseFloat(cashSales || '0') - parseFloat(expenses || '0');
  const difference = parseFloat(actualCash || '0') - expectedCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (alreadyClosed) {
      setError('هذا اليوم مغلق بالفعل');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createDailyClosing({
        date,
        openingCash: parseFloat(openingCash || '0'),
        cashSales: parseFloat(cashSales || '0'),
        cardSales: parseFloat(cardSales || '0'),
        totalSales,
        expenses: parseFloat(expenses || '0'),
        actualCash: parseFloat(actualCash || '0'),
        difference,
        notes: notes || undefined,
        closedBy: userId,
        closedByName: userName,
        ordersCount: parseInt(ordersCount || '0'),
        isLocked: true,
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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 100,
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '560px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        zIndex: 101,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
            }}>
              <Lock style={{ width: '28px', height: '28px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                إغلاق يومي يدوي
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                إدخال بيانات الإغلاق يدوياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        {checkingClosed ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>جاري التحقق...</p>
          </div>
        ) : alreadyClosed ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <CheckCircle style={{ width: '40px', height: '40px', color: '#ffffff' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              تم إغلاق هذا اليوم
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              لا يمكن إجراء إغلاق آخر لنفس اليوم
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: '24px',
                padding: '12px 32px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              إغلاق
            </button>
          </div>
        ) : (
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
                  تاريخ الإغلاق
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
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

              {/* Sales Input (Manual) */}
              <div style={{
                padding: '20px',
                backgroundColor: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '16px',
                marginBottom: '20px',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '16px',
                }}>
                  <TrendingUp style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>
                    بيانات المبيعات (إدخال يدوي)
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      <Banknote style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
                      المبيعات النقدية
                    </label>
                    <input
                      type="number"
                      value={cashSales}
                      onChange={(e) => setCashSales(e.target.value)}
                      step="0.001"
                      min="0"
                      placeholder="0.000"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      <CreditCard style={{ width: '14px', height: '14px', color: '#8b5cf6' }} />
                      مبيعات البطاقة
                    </label>
                    <input
                      type="number"
                      value={cardSales}
                      onChange={(e) => setCardSales(e.target.value)}
                      step="0.001"
                      min="0"
                      placeholder="0.000"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px',
                  }}>
                    <ShoppingBag style={{ width: '14px', height: '14px', color: '#6366f1' }} />
                    عدد الطلبات
                  </label>
                  <input
                    type="number"
                    value={ordersCount}
                    onChange={(e) => setOrdersCount(e.target.value)}
                    min="0"
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: '#ffffff',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Total Sales Display */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #22c55e',
                }}>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    إجمالي المبيعات
                  </p>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e', margin: 0 }}>
                    {totalSales.toFixed(3)} ر.ع
                  </p>
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
                    backgroundColor: '#fffbeb',
                    border: '2px solid #f59e0b',
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
                  الفرق (الفعلي - المتوقع: {expectedCash.toFixed(3)})
                </p>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: difference === 0 ? '#22c55e' :
                         difference > 0 ? '#3b82f6' : '#ef4444',
                  margin: 0,
                }}>
                  {difference > 0 ? '+' : ''}{difference.toFixed(3)} ر.ع
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
                  placeholder="أي ملاحظات إضافية عن إغلاق اليوم..."
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
              backgroundColor: '#f8fafc',
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
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
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? (
                  'جاري الحفظ...'
                ) : (
                  <>
                    <Lock style={{ width: '18px', height: '18px' }} />
                    تأكيد وإغلاق اليوم
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
