'use client';

import { useState, useEffect } from 'react';
import { 
  getTodaySalesForClosing, 
  createEnhancedDailyClosing, 
  isDayClosed,
  DailyClosing 
} from '@/lib/reports';
import { Order } from '@/lib/firebase/database';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Calculator, 
  FileText, 
  AlertCircle,
  Lock,
  CheckCircle,
  ShoppingBag,
  CreditCard,
  Banknote,
  Users,
  Coffee,
  DoorOpen,
  Receipt,
  Clock,
  TrendingUp
} from 'lucide-react';

interface CashierDailyClosingProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userName?: string;
}

export default function CashierDailyClosing({
  onClose,
  onSuccess,
  userId,
  userName,
}: CashierDailyClosingProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [openingCash, setOpeningCash] = useState('0');
  const [expenses, setExpenses] = useState('0');
  const [actualCash, setActualCash] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'review' | 'confirm'>('review');
  const [alreadyClosed, setAlreadyClosed] = useState(false);
  
  // Sales data
  const [salesData, setSalesData] = useState({
    cashSales: 0,
    cardSales: 0,
    totalSales: 0,
    ordersCount: 0,
    paidOrdersCount: 0,
    unpaidOrdersCount: 0,
    tableOrdersCount: 0,
    roomOrdersCount: 0,
    takeawayOrdersCount: 0,
    orders: [] as Order[],
  });

  // Load sales for selected date
  useEffect(() => {
    loadSalesData();
    checkIfClosed();
  }, [date]);

  const checkIfClosed = async () => {
    try {
      const closed = await isDayClosed(date);
      setAlreadyClosed(closed);
    } catch (error) {
      console.error('Error checking if day is closed:', error);
    }
  };

  const loadSalesData = async () => {
    setLoadingSales(true);
    try {
      const data = await getTodaySalesForClosing(date);
      setSalesData(data);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoadingSales(false);
    }
  };

  const expectedCash = parseFloat(openingCash) + salesData.cashSales - parseFloat(expenses);
  const difference = parseFloat(actualCash) - expectedCash;

  const handleSubmit = async () => {
    if (step === 'review') {
      // Validate before proceeding
      if (salesData.unpaidOrdersCount > 0) {
        const confirmProceed = confirm(
          `يوجد ${salesData.unpaidOrdersCount} طلب غير مدفوع. هل تريد المتابعة بالإغلاق؟`
        );
        if (!confirmProceed) return;
      }
      setStep('confirm');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createEnhancedDailyClosing({
        date,
        openingCash: parseFloat(openingCash),
        cashSales: salesData.cashSales,
        cardSales: salesData.cardSales,
        totalSales: salesData.totalSales,
        expenses: parseFloat(expenses),
        actualCash: parseFloat(actualCash),
        difference,
        notes: notes || undefined,
        closedBy: userId,
        closedByName: userName,
        ordersCount: salesData.ordersCount,
        paidOrdersCount: salesData.paidOrdersCount,
        unpaidOrdersCount: salesData.unpaidOrdersCount,
        tableOrdersCount: salesData.tableOrdersCount,
        roomOrdersCount: salesData.roomOrdersCount,
        takeawayOrdersCount: salesData.takeawayOrdersCount,
        isLocked: true,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الإغلاق');
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
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
        width: '680px',
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
                إغلاق اليوم
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                {step === 'review' ? 'مراجعة ملخص اليوم' : 'تأكيد وإغلاق اليوم'}
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {alreadyClosed ? (
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
            </div>
          ) : (
            <>
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

              {/* Date Selection */}
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

              {/* Daily Summary Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '20px',
              }}>
                {/* Total Sales */}
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  borderRadius: '16px',
                  color: '#ffffff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <TrendingUp style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontSize: '12px', opacity: 0.9 }}>إجمالي المبيعات</span>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                    {loadingSales ? '...' : `${salesData.totalSales.toFixed(3)}`}
                  </p>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>ر.ع</span>
                </div>

                {/* Cash Sales */}
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '16px',
                  color: '#ffffff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Banknote style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontSize: '12px', opacity: 0.9 }}>مبيعات نقدية</span>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                    {loadingSales ? '...' : `${salesData.cashSales.toFixed(3)}`}
                  </p>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>ر.ع</span>
                </div>

                {/* Card Sales */}
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '16px',
                  color: '#ffffff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CreditCard style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontSize: '12px', opacity: 0.9 }}>مبيعات بطاقة</span>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                    {loadingSales ? '...' : `${salesData.cardSales.toFixed(3)}`}
                  </p>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>ر.ع</span>
                </div>
              </div>

              {/* Orders Statistics */}
              <div style={{
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                marginBottom: '20px',
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>
                  إحصائيات الطلبات
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#dbeafe',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}>
                      <ShoppingBag style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {salesData.ordersCount}
                    </p>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>إجمالي الطلبات</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}>
                      <CheckCircle style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e', margin: 0 }}>
                      {salesData.paidOrdersCount}
                    </p>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>طلبات مدفوعة</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: salesData.unpaidOrdersCount > 0 ? '#fef3c7' : '#f1f5f9',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}>
                      <Clock style={{ width: '20px', height: '20px', color: salesData.unpaidOrdersCount > 0 ? '#f59e0b' : '#94a3b8' }} />
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: salesData.unpaidOrdersCount > 0 ? '#f59e0b' : '#94a3b8', margin: 0 }}>
                      {salesData.unpaidOrdersCount}
                    </p>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>طلبات معلقة</span>
                  </div>
                </div>

                {/* Order Types */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '24px',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DoorOpen style={{ width: '16px', height: '16px', color: '#6366f1' }} />
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      طاولات: <strong>{salesData.tableOrdersCount}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Coffee style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      غرف: <strong>{salesData.roomOrdersCount}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      تيك أواي: <strong>{salesData.takeawayOrdersCount}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {step === 'confirm' && (
                <>
                  {/* Cash Reconciliation */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fbbf24',
                    borderRadius: '16px',
                    marginBottom: '20px',
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#92400e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calculator style={{ width: '18px', height: '18px' }} />
                      تسوية الصندوق
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
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
                            padding: '12px 14px',
                            backgroundColor: '#ffffff',
                            border: '2px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '14px',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
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
                            padding: '12px 14px',
                            backgroundColor: '#ffffff',
                            border: '2px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '14px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
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
                          backgroundColor: '#ffffff',
                          border: '2px solid #f59e0b',
                          borderRadius: '10px',
                          fontSize: '16px',
                          fontWeight: 600,
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Difference Display */}
                    <div style={{
                      padding: '16px',
                      backgroundColor: difference === 0 ? 'rgba(34, 197, 94, 0.15)' :
                                    difference > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
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
                  </div>

                  {/* Notes */}
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

                  {/* Warning */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                  }}>
                    <AlertCircle style={{ width: '20px', height: '20px', color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', margin: 0 }}>
                        تحذير: هذا الإجراء نهائي
                      </p>
                      <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', margin: 0 }}>
                        بعد الإغلاق لن يمكن إضافة أو تعديل طلبات هذا اليوم
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!alreadyClosed && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
            backgroundColor: '#f8fafc',
          }}>
            {step === 'confirm' && (
              <button
                type="button"
                onClick={() => setStep('review')}
                style={{
                  padding: '14px 24px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                رجوع
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: step === 'review' ? 1 : 'none',
                padding: '14px 24px',
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
              type="button"
              onClick={handleSubmit}
              disabled={loading || loadingSales}
              style={{
                flex: 1,
                padding: '14px 24px',
                background: loading ? '#94a3b8' : step === 'review' 
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
              ) : step === 'review' ? (
                <>
                  <Calculator style={{ width: '18px', height: '18px' }} />
                  متابعة للتسوية
                </>
              ) : (
                <>
                  <Lock style={{ width: '18px', height: '18px' }} />
                  تأكيد وإغلاق اليوم
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
