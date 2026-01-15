'use client';

import { useState, useEffect } from 'react';
import { Table, Room } from '@/lib/firebase/database';
import { CartItem, POSOrder, calculateTotals } from '@/lib/pos';
import { 
  CreditCard, 
  Banknote, 
  Users, 
  DoorOpen, 
  ShoppingBag,
  Percent,
  Receipt,
  User,
  Phone,
  ChevronDown,
  Check
} from 'lucide-react';

interface PaymentPanelProps {
  items: CartItem[];
  tables: Table[];
  rooms: Room[];
  onPlaceOrder: (order: POSOrder) => void;
  onPayNow: (order: POSOrder, paymentMethod: 'cash' | 'card', receivedAmount: number) => void;
  loading: boolean;
}

export default function PaymentPanel({ 
  items, 
  tables, 
  rooms, 
  onPlaceOrder, 
  onPayNow,
  loading 
}: PaymentPanelProps) {
  const [orderType, setOrderType] = useState<'table' | 'room' | 'takeaway'>('takeaway');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const totals = calculateTotals(items, discountPercent, 0);

  useEffect(() => {
    if (orderType === 'table') {
      setSelectedRoom(null);
    } else if (orderType === 'room') {
      setSelectedTable(null);
    } else {
      setSelectedTable(null);
      setSelectedRoom(null);
    }
  }, [orderType]);

  const change = paymentMethod === 'cash' && parseFloat(receivedAmount) > totals.total
    ? parseFloat(receivedAmount) - totals.total
    : 0;

  const canPlaceOrder = items.length > 0 && (
    orderType === 'takeaway' ||
    (orderType === 'table' && selectedTable) ||
    (orderType === 'room' && selectedRoom)
  );

  const canPay = canPlaceOrder && (
    paymentMethod === 'card' ||
    (paymentMethod === 'cash' && parseFloat(receivedAmount) >= totals.total)
  );

  const buildOrder = (): POSOrder => ({
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total,
    orderType,
    tableId: selectedTable?.id,
    tableNumber: selectedTable?.tableNumber,
    roomId: selectedRoom?.id,
    roomNumber: selectedRoom?.roomNumber,
    customerName: customerName || undefined,
    customerPhone: customerPhone || undefined,
  });

  const handlePlaceOrder = () => {
    onPlaceOrder(buildOrder());
  };

  const handlePayNow = () => {
    onPayNow(buildOrder(), paymentMethod, parseFloat(receivedAmount) || totals.total);
  };

  const quickAmounts = [1, 2, 5, 10, 20, 50];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#0f172a',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Receipt style={{ width: '20px', height: '20px', color: '#6366f1' }} />
          ملخص الطلب
        </h2>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
      }}>
        {/* Order Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '10px',
          }}>
            نوع الطلب
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { value: 'takeaway', label: 'استلام', icon: ShoppingBag },
              { value: 'table', label: 'طاولة', icon: Users },
              { value: 'room', label: 'غرفة', icon: DoorOpen },
            ].map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setOrderType(type.value as any)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: orderType === type.value 
                      ? '2px solid #6366f1' 
                      : '2px solid #e2e8f0',
                    backgroundColor: orderType === type.value 
                      ? '#eef2ff' 
                      : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon style={{
                    width: '20px',
                    height: '20px',
                    color: orderType === type.value ? '#6366f1' : '#64748b',
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: orderType === type.value ? '#4f46e5' : '#475569',
                  }}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table/Room Selection */}
        {orderType === 'table' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '10px',
            }}>
              اختر الطاولة
            </label>
            {tables.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '12px' }}>
                لا توجد طاولات متاحة
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: selectedTable?.id === table.id 
                        ? '2px solid #16a34a' 
                        : '1px solid #e2e8f0',
                      backgroundColor: selectedTable?.id === table.id 
                        ? '#dcfce7' 
                        : '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {selectedTable?.id === table.id && (
                      <Check style={{ width: '14px', height: '14px', color: '#16a34a' }} />
                    )}
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: selectedTable?.id === table.id ? '#16a34a' : '#475569',
                    }}>
                      {table.tableNumber}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {orderType === 'room' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '10px',
            }}>
              اختر الغرفة
            </label>
            {rooms.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '12px' }}>
                لا توجد غرف متاحة
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: selectedRoom?.id === room.id 
                        ? '2px solid #f59e0b' 
                        : '1px solid #e2e8f0',
                      backgroundColor: selectedRoom?.id === room.id 
                        ? '#fef3c7' 
                        : '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {selectedRoom?.id === room.id && (
                      <Check style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                    )}
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: selectedRoom?.id === room.id ? '#92400e' : '#475569',
                    }}>
                      {room.name || `غرفة ${room.roomNumber}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customer Info */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '8px',
              }}>
                <User style={{ width: '14px', height: '14px' }} />
                اسم العميل
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="اختياري"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
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
                color: '#64748b',
                marginBottom: '8px',
              }}>
                <Phone style={{ width: '14px', height: '14px' }} />
                الهاتف
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="اختياري"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  outline: 'none',
                  textAlign: 'left',
                }}
              />
            </div>
          </div>
        </div>

        {/* Discount */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '8px',
          }}>
            <Percent style={{ width: '14px', height: '14px' }} />
            خصم (%)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0, 5, 10, 15, 20].map((percent) => (
              <button
                key={percent}
                onClick={() => setDiscountPercent(percent)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: discountPercent === percent 
                    ? '2px solid #6366f1' 
                    : '1px solid #e2e8f0',
                  backgroundColor: discountPercent === percent 
                    ? '#eef2ff' 
                    : '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: discountPercent === percent ? '#4f46e5' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div style={{
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>المجموع الفرعي</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {totals.subtotal.toFixed(3)} ر.ع
            </span>
          </div>
          {totals.discount.amount > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <span style={{ fontSize: '13px', color: '#dc2626' }}>
                الخصم ({totals.discount.percent}%)
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
                -{totals.discount.amount.toFixed(3)} ر.ع
              </span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid #e2e8f0',
          }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>الإجمالي</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>
              {totals.total.toFixed(3)} ر.ع
            </span>
          </div>
        </div>

        {/* Payment Section */}
        {showPayment && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            marginBottom: '16px',
          }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#92400e',
              marginBottom: '12px',
            }}>
              طريقة الدفع
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setPaymentMethod('cash')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: paymentMethod === 'cash' 
                    ? '2px solid #16a34a' 
                    : '1px solid #e2e8f0',
                  backgroundColor: paymentMethod === 'cash' 
                    ? '#dcfce7' 
                    : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <Banknote style={{
                  width: '20px',
                  height: '20px',
                  color: paymentMethod === 'cash' ? '#16a34a' : '#64748b',
                }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: paymentMethod === 'cash' ? '#16a34a' : '#475569',
                }}>
                  نقدي
                </span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: paymentMethod === 'card' 
                    ? '2px solid #6366f1' 
                    : '1px solid #e2e8f0',
                  backgroundColor: paymentMethod === 'card' 
                    ? '#eef2ff' 
                    : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <CreditCard style={{
                  width: '20px',
                  height: '20px',
                  color: paymentMethod === 'card' ? '#6366f1' : '#64748b',
                }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: paymentMethod === 'card' ? '#4f46e5' : '#475569',
                }}>
                  بطاقة
                </span>
              </button>
            </div>

            {paymentMethod === 'cash' && (
              <>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#92400e',
                  marginBottom: '8px',
                }}>
                  المبلغ المستلم
                </label>
                <input
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder={totals.total.toFixed(3)}
                  step="0.001"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '18px',
                    fontWeight: 700,
                    border: '1px solid #fcd34d',
                    borderRadius: '10px',
                    outline: 'none',
                    textAlign: 'center',
                    marginBottom: '12px',
                  }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setReceivedAmount(amount.toString())}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {amount}
                    </button>
                  ))}
                  <button
                    onClick={() => setReceivedAmount(totals.total.toFixed(3))}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#16a34a',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    المبلغ الكامل
                  </button>
                </div>
                {change > 0 && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}>
                    <span style={{ fontSize: '13px', color: '#16a34a' }}>الباقي: </span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a' }}>
                      {change.toFixed(3)} ر.ع
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
      }}>
        {!showPayment ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePlaceOrder}
              disabled={!canPlaceOrder || loading}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#6366f1',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: !canPlaceOrder || loading ? 'not-allowed' : 'pointer',
                opacity: !canPlaceOrder || loading ? 0.5 : 1,
              }}
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء طلب'}
            </button>
            <button
              onClick={() => setShowPayment(true)}
              disabled={!canPlaceOrder}
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: !canPlaceOrder ? 'not-allowed' : 'pointer',
                opacity: !canPlaceOrder ? 0.5 : 1,
              }}
            >
              دفع الآن
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowPayment(false)}
              style={{
                padding: '14px 20px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              رجوع
            </button>
            <button
              onClick={handlePayNow}
              disabled={!canPay || loading}
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: !canPay || loading ? 'not-allowed' : 'pointer',
                opacity: !canPay || loading ? 0.5 : 1,
              }}
            >
              {loading ? 'جاري الدفع...' : 'تأكيد الدفع'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

