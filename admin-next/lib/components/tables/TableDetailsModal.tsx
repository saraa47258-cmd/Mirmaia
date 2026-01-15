'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Order, setTableStatus } from '@/lib/firebase/database';
import { 
  X, 
  Users, 
  Clock, 
  MapPin,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Printer,
  Unlock,
  Lock,
  UserCircle
} from 'lucide-react';

interface TableDetailsModalProps {
  table: Table;
  activeOrder?: Order | null;
  onClose: () => void;
  onStatusChange: () => void;
}

const STATUS_CONFIG = {
  available: { label: 'متاحة', color: '#16a34a', bg: '#dcfce7' },
  reserved: { label: 'محجوزة', color: '#dc2626', bg: '#fee2e2' },
  occupied: { label: 'مشغولة', color: '#dc2626', bg: '#fee2e2' },
};

const AREA_LABELS = {
  indoor: 'داخلي',
  outdoor: 'خارجي',
  room: 'غرفة',
  vip: 'VIP',
  terrace: 'تراس',
};

export default function TableDetailsModal({ 
  table, 
  activeOrder, 
  onClose, 
  onStatusChange 
}: TableDetailsModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [reservedBy, setReservedBy] = useState('');

  const statusConfig = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
  const isActive = table.status !== 'available';

  const handleSetAvailable = async () => {
    setLoading(true);
    try {
      await setTableStatus(table.id, 'available');
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error setting table available:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetReserved = async () => {
    if (!reservedBy.trim()) return;
    
    setLoading(true);
    try {
      await setTableStatus(table.id, 'reserved', null, reservedBy.trim());
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error setting table reserved:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetOccupied = async () => {
    setLoading(true);
    try {
      await setTableStatus(table.id, 'occupied', activeOrder?.id);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error setting table occupied:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInCashier = () => {
    router.push(`/admin/cashier?tableId=${table.id}&orderId=${activeOrder?.id || ''}`);
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
    if (!table.reservedAt && !activeOrder?.createdAt) return null;
    
    const startTime = new Date(activeOrder?.createdAt || table.reservedAt || '').getTime();
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
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 90,
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
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
                {table.tableNumber}
              </span>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {table.name || `طاولة ${table.tableNumber}`}
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
                  {AREA_LABELS[table.area as keyof typeof AREA_LABELS] || table.area}
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
          {/* Table Info */}
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
                <Users style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>السعة</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {table.capacity} أشخاص
              </p>
            </div>
            <div style={{
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <MapPin style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>المنطقة</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {AREA_LABELS[table.area as keyof typeof AREA_LABELS] || table.area}
              </p>
            </div>
          </div>

          {/* Reserved By */}
          {table.reservedBy && (
            <div style={{
              padding: '14px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <UserCircle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
              <div>
                <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>محجوزة لـ</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#dc2626', margin: 0 }}>
                  {table.reservedBy}
                </p>
              </div>
              {getTimeSinceOpened() && (
                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                  <span style={{ fontSize: '12px', color: '#dc2626' }}>{getTimeSinceOpened()}</span>
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
              
              {/* Order Header */}
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
                  {activeOrder.paymentStatus === 'paid' || activeOrder.status === 'paid' ? (
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

              {/* Order Items */}
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '0 0 12px 12px',
                overflow: 'hidden',
              }}>
                {activeOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < activeOrder.items.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                        {item.quantity} × {item.price.toFixed(3)} ر.ع
                      </p>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      {(item.itemTotal || item.quantity * item.price).toFixed(3)} ر.ع
                    </span>
                  </div>
                ))}

                {/* Total */}
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
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#dc2626', marginBottom: '8px' }}>
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
                  border: '1px solid #fecaca',
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
                    backgroundColor: '#dc2626',
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
          {/* Primary Actions */}
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
                تحرير الطاولة
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
                    backgroundColor: '#dc2626',
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
                  onClick={handleSetOccupied}
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
                  <Users style={{ width: '18px', height: '18px' }} />
                  مشغولة
                </button>
              </>
            )}
          </div>

          {/* Secondary Actions */}
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

