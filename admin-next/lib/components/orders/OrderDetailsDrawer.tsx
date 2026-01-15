'use client';

import { Order, OrderItem } from '@/lib/firebase/database';
import { 
  X, 
  Clock, 
  User, 
  MapPin, 
  CreditCard, 
  FileText,
  CheckCircle,
  ChefHat,
  Package,
  Ban,
  Printer,
  Receipt
} from 'lucide-react';

interface OrderDetailsDrawerProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
}

const STATUS_CONFIG = {
  pending: { label: 'معلق', color: '#f59e0b', bg: '#fef3c7', icon: Clock },
  processing: { label: 'قيد التنفيذ', color: '#3b82f6', bg: '#dbeafe', icon: Clock },
  preparing: { label: 'قيد التحضير', color: '#f59e0b', bg: '#fef3c7', icon: ChefHat },
  ready: { label: 'جاهز', color: '#06b6d4', bg: '#cffafe', icon: Package },
  paid: { label: 'مدفوع', color: '#10b981', bg: '#dcfce7', icon: CheckCircle },
  completed: { label: 'مكتمل', color: '#10b981', bg: '#dcfce7', icon: CheckCircle },
  cancelled: { label: 'ملغي', color: '#ef4444', bg: '#fee2e2', icon: Ban },
};

const PAYMENT_STATUS = {
  pending: { label: 'غير مدفوع', color: '#f59e0b', bg: '#fef3c7' },
  paid: { label: 'مدفوع', color: '#10b981', bg: '#dcfce7' },
};

export default function OrderDetailsDrawer({ order, onClose, onUpdateStatus }: OrderDetailsDrawerProps) {
  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const paymentConfig = PAYMENT_STATUS[order.paymentStatus as keyof typeof PAYMENT_STATUS] || PAYMENT_STATUS.pending;

  const handleStatusUpdate = async (newStatus: string) => {
    await onUpdateStatus(order.id, newStatus);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const subtotal = order.subtotal || order.total;
  const discount = order.discount?.amount || 0;
  const tax = 0; // Add if you have tax
  const total = order.total;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 90,
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '480px',
        maxWidth: '100vw',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                طلب #{order.id.slice(-6).toUpperCase()}
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
              }}>
                <StatusIcon style={{ width: '14px', height: '14px' }} />
                {statusConfig.label}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              {formatDate(order.createdAt)}
            </p>
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
          {/* Customer & Table Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <div style={{
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <User style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>العميل</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                {order.customerName || 'غير محدد'}
              </p>
            </div>
            <div style={{
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <MapPin style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>الطاولة/الغرفة</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                {order.tableNumber || 'غير محدد'}
              </p>
            </div>
          </div>

          {/* Payment & Source */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <div style={{
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CreditCard style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>الدفع</span>
              </div>
              <span style={{
                display: 'inline-flex',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: paymentConfig.bg,
                color: paymentConfig.color,
              }}>
                {paymentConfig.label}
              </span>
            </div>
            <div style={{
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <FileText style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>المصدر</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                {order.source === 'staff-menu' ? 'منيو الموظفين' : 
                 order.source === 'cashier' ? 'الكاشير' : 
                 order.source === 'mobile' ? 'الجوال' : order.source || 'غير محدد'}
              </p>
            </div>
          </div>

          {/* Items List */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>
              المنتجات ({order.items?.length || 0})
            </h3>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {order.items?.map((item: OrderItem, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: '14px 16px',
                    borderBottom: index < order.items.length - 1 ? '1px solid #e2e8f0' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>
                    {item.emoji || '☕'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                          {item.quantity} × {item.price.toFixed(3)} ر.ع
                        </p>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {(item.itemTotal || item.quantity * item.price).toFixed(3)} ر.ع
                      </p>
                    </div>
                    {item.note && (
                      <p style={{
                        fontSize: '12px',
                        color: '#f59e0b',
                        margin: '6px 0 0 0',
                        padding: '6px 10px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '6px',
                      }}>
                        📝 {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>المجموع الفرعي</span>
              <span style={{ fontSize: '14px', color: '#0f172a' }}>{subtotal.toFixed(3)} ر.ع</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>الخصم</span>
                <span style={{ fontSize: '14px', color: '#dc2626' }}>-{discount.toFixed(3)} ر.ع</span>
              </div>
            )}
            {tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>الضريبة</span>
                <span style={{ fontSize: '14px', color: '#0f172a' }}>{tax.toFixed(3)} ر.ع</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid #e2e8f0',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>الإجمالي</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a' }}>{total.toFixed(3)} ر.ع</span>
            </div>
          </div>

          {/* Worker Info */}
          {order.workerName && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#64748b',
            }}>
              تم إنشاء الطلب بواسطة: <span style={{ fontWeight: 600, color: '#0f172a' }}>{order.workerName}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}>
          {/* Status Actions */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {order.status === 'pending' && (
              <button
                onClick={() => handleStatusUpdate('preparing')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  backgroundColor: '#f59e0b',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <ChefHat style={{ width: '16px', height: '16px' }} />
                بدء التحضير
              </button>
            )}
            {order.status === 'preparing' && (
              <button
                onClick={() => handleStatusUpdate('ready')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  backgroundColor: '#06b6d4',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <Package style={{ width: '16px', height: '16px' }} />
                جاهز للتسليم
              </button>
            )}
            {order.status === 'ready' && (
              <button
                onClick={() => handleStatusUpdate('completed')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <CheckCircle style={{ width: '16px', height: '16px' }} />
                مكتمل
              </button>
            )}
            {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
              <button
                onClick={() => handleStatusUpdate('paid')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <CreditCard style={{ width: '16px', height: '16px' }} />
                تم الدفع
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px',
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
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#dc2626',
                  cursor: 'pointer',
                }}
              >
                <Ban style={{ width: '16px', height: '16px' }} />
                إلغاء
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

