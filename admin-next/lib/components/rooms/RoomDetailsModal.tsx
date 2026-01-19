'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Room, Order, setRoomStatus, closeRoomOrder, getOrders } from '@/lib/firebase/database';
import { 
  X, 
  Clock, 
  DoorOpen,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Printer,
  Unlock,
  Lock,
  UserCircle,
  FileText
} from 'lucide-react';

interface RoomDetailsModalProps {
  room: Room;
  activeOrder?: Order | null;
  onClose: () => void;
  onStatusChange: () => void;
}

const STATUS_CONFIG = {
  available: { label: 'متاحة', color: '#16a34a', bg: '#dcfce7' },
  reserved: { label: 'محجوزة', color: '#f59e0b', bg: '#fef3c7' },
  occupied: { label: 'مشغولة', color: '#dc2626', bg: '#fee2e2' },
};

export default function RoomDetailsModal({ 
  room, 
  activeOrder: propActiveOrder, 
  onClose, 
  onStatusChange 
}: RoomDetailsModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [reservedBy, setReservedBy] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null | undefined>(propActiveOrder);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Try to find active order if not provided but room is occupied
  useEffect(() => {
    const findActiveOrder = async () => {
      if (!propActiveOrder && room.status === 'occupied') {
        setLoadingOrder(true);
        try {
          const allOrders = await getOrders();
          const roomOrder = allOrders.find(o => 
            o.roomId === room.id && 
            o.status !== 'completed' && 
            o.status !== 'cancelled' &&
            o.paymentStatus !== 'paid'
          );
          if (roomOrder) {
            setActiveOrder(roomOrder);
          }
        } catch (error) {
          console.error('Error finding order:', error);
        } finally {
          setLoadingOrder(false);
        }
      }
    };
    
    findActiveOrder();
  }, [room.id, room.status, propActiveOrder]);

  const statusConfig = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
  const isActive = room.status !== 'available';

  const handleSetAvailable = async () => {
    setLoading(true);
    try {
      if (activeOrder && room.activeOrderId) {
        await closeRoomOrder(room.activeOrderId, room.id);
      } else {
        await setRoomStatus(room.id, 'available');
      }
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error setting room available:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetReserved = async () => {
    if (!reservedBy.trim()) return;
    
    setLoading(true);
    try {
      await setRoomStatus(room.id, 'reserved', null, reservedBy.trim());
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error setting room reserved:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetOccupied = async () => {
    setLoading(true);
    try {
      await setRoomStatus(room.id, 'occupied', activeOrder?.id);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error setting room occupied:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInCashier = () => {
    router.push(`/admin/cashier?roomId=${room.id}&orderId=${activeOrder?.id || ''}`);
  };

  const handleNewOrder = () => {
    router.push(`/admin/staff-menu?roomId=${room.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSinceOpened = () => {
    if (!room.reservedAt && !activeOrder?.createdAt) return null;
    
    const startTime = new Date(activeOrder?.createdAt || room.reservedAt || '').getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((now - startTime) / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} دقيقة`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours} ساعة و ${mins} دقيقة`;
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 90,
        }}
      />
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
        zIndex: 100,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isActive 
            ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' 
            : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: isActive ? '#dc2626' : '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DoorOpen style={{ width: '26px', height: '26px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {room.name || `غرفة ${room.roomNumber}`}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                  fontSize: '11px',
                  fontWeight: 700,
                }}>
                  {statusConfig.label}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  رقم {room.roomNumber}
                </span>
              </div>
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
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Room Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <div style={{
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CreditCard style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>التسعير</span>
              </div>
              {room.priceType === 'free' ? (
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e', margin: 0 }}>
                  مجاني
                </p>
              ) : room.priceType === 'gender' ? (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#3b82f6', margin: '0 0 4px 0' }}>
                    🚹 ذكور: {room.malePrice || 3} ر.ع
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#ec4899', margin: 0 }}>
                    🚺 إناث: {room.femalePrice === 0 ? 'مجاني' : `${room.femalePrice} ر.ع`}
                  </p>
                </div>
              ) : room.hourlyRate && room.hourlyRate > 0 ? (
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', margin: 0 }}>
                  {room.hourlyRate.toFixed(3)} ر.ع/ساعة
                </p>
              ) : (
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>غير محدد</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {room.notes && (
            <div style={{
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <FileText style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>ملاحظات</span>
              </div>
              <p style={{ fontSize: '14px', color: '#0f172a', margin: 0 }}>{room.notes}</p>
            </div>
          )}

          {/* Reserved By */}
          {room.reservedBy && (
            <div style={{
              padding: '14px',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <UserCircle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
              <div>
                <p style={{ fontSize: '12px', color: '#f59e0b', margin: 0 }}>محجوزة لـ</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#92400e', margin: 0 }}>
                  {room.reservedBy}
                </p>
              </div>
              {getTimeSinceOpened() && (
                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                  <span style={{ fontSize: '12px', color: '#f59e0b' }}>{getTimeSinceOpened()}</span>
                </div>
              )}
            </div>
          )}

          {/* Active Order */}
          {activeOrder && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>
                الطلب الحالي
              </h3>
              
              {/* عرض جنس الحاجز */}
              {(activeOrder as any).roomGender && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px',
                  marginBottom: '12px',
                  borderRadius: '12px',
                  backgroundColor: (activeOrder as any).roomGender === 'male' ? '#dbeafe' : '#fce7f3',
                  border: (activeOrder as any).roomGender === 'male' ? '2px solid #3b82f6' : '2px solid #ec4899',
                }}>
                  <span style={{ fontSize: '28px' }}>
                    {(activeOrder as any).roomGender === 'male' ? '👦' : '👧'}
                  </span>
                  <div>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: (activeOrder as any).roomGender === 'male' ? '#1d4ed8' : '#be185d',
                    }}>
                      {(activeOrder as any).roomGender === 'male' ? 'ولد' : 'بنت'}
                    </span>
                    <p style={{
                      fontSize: '12px',
                      color: (activeOrder as any).roomGender === 'male' ? '#3b82f6' : '#ec4899',
                      margin: '2px 0 0 0',
                    }}>
                      {(activeOrder as any).roomGender === 'male' 
                        ? `سعر الغرفة: ${((activeOrder as any).roomPrice || 0).toFixed(3)} ر.ع`
                        : 'الغرفة مجانية ✨'}
                    </p>
                  </div>
                </div>
              )}
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px 12px 0 0',
                border: '1px solid #e2e8f0',
                borderBottom: 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#6366f1',
                    fontFamily: 'monospace',
                  }}>
                    #{activeOrder.id.slice(-6).toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {formatDate(activeOrder.createdAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {activeOrder.paymentStatus === 'paid' ? (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      <CheckCircle style={{ width: '12px', height: '12px' }} />
                      مدفوع
                    </span>
                  ) : (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#fef3c7',
                      color: '#f59e0b',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      <AlertCircle style={{ width: '12px', height: '12px' }} />
                      غير مدفوع
                    </span>
                  )}
                </div>
              </div>

              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '0 0 12px 12px',
                overflow: 'hidden',
              }}>
                {activeOrder.items?.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: 0 }}>
                        {item.emoji && <span style={{ marginLeft: '6px' }}>{item.emoji}</span>}
                        {item.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                        {item.quantity} × {(item.price || 0).toFixed(3)} ر.ع
                      </p>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      {(item.itemTotal || item.quantity * (item.price || 0)).toFixed(3)} ر.ع
                    </span>
                  </div>
                ))}
                
                {activeOrder.items && activeOrder.items.length > 5 && (
                  <div style={{
                    padding: '10px 16px',
                    backgroundColor: '#f8fafc',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#64748b',
                  }}>
                    و {activeOrder.items.length - 5} عناصر أخرى...
                  </div>
                )}

                <div style={{
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>الإجمالي</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a' }}>
                    {activeOrder.total.toFixed(3)} ر.ع
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Reserve Form */}
          {showReserveForm && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#92400e', marginBottom: '8px' }}>
                اسم الحجز
              </label>
              <input
                type="text"
                value={reservedBy}
                onChange={(e) => setReservedBy(e.target.value)}
                placeholder="أدخل اسم العميل أو الحجز..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14px',
                  border: '1px solid #fcd34d',
                  borderRadius: '10px',
                  outline: 'none',
                  marginBottom: '12px',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSetReserved}
                  disabled={loading || !reservedBy.trim()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#f59e0b',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: loading || !reservedBy.trim() ? 'not-allowed' : 'pointer',
                    opacity: loading || !reservedBy.trim() ? 0.7 : 1,
                  }}
                >
                  {loading ? 'جاري الحفظ...' : 'تأكيد الحجز'}
                </button>
                <button
                  onClick={() => setShowReserveForm(false)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {isActive ? (
              <button
                onClick={handleSetAvailable}
                disabled={loading}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  backgroundColor: '#16a34a',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <Unlock style={{ width: '18px', height: '18px' }} />
                {activeOrder ? 'إغلاق الطلب وتحرير الغرفة' : 'تحرير الغرفة'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowReserveForm(true)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    backgroundColor: '#f59e0b',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <Lock style={{ width: '18px', height: '18px' }} />
                  حجز
                </button>
                <button
                  onClick={handleNewOrder}
                  disabled={loading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    backgroundColor: '#6366f1',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <ShoppingBag style={{ width: '18px', height: '18px' }} />
                  طلب جديد
                </button>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {activeOrder && (
              <button
                onClick={handleOpenInCashier}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #6366f1',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#6366f1',
                  cursor: 'pointer',
                }}
              >
                <ExternalLink style={{ width: '16px', height: '16px' }} />
                فتح في الكاشير
              </button>
            )}
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <Printer style={{ width: '16px', height: '16px' }} />
              طباعة
            </button>
          </div>
        </div>
      </div>
    </>
  );
}



