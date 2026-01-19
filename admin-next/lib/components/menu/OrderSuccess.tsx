'use client';

import { CheckCircle, Clock, X } from 'lucide-react';

interface OrderSuccessProps {
  orderNumber: string;
  status: string;
  onClose: () => void;
}

export default function OrderSuccess({ orderNumber, status, onClose }: OrderSuccessProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return { text: 'في انتظار التأكيد', color: '#f59e0b', bg: '#fef3c7' };
      case 'confirmed':
        return { text: 'تم التأكيد', color: '#3b82f6', bg: '#dbeafe' };
      case 'preparing':
        return { text: 'قيد التحضير', color: '#f59e0b', bg: '#fef3c7' };
      case 'ready':
        return { text: 'جاهز للتسليم', color: '#10b981', bg: '#dcfce7' };
      default:
        return { text: status, color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
        }}>
          <CheckCircle style={{ width: '40px', height: '40px', color: '#ffffff' }} />
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '8px',
        }}>
          تم إرسال الطلب بنجاح!
        </h2>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '24px',
        }}>
          سيتم تحضير طلبك في أقرب وقت
        </p>

        {/* Order Number */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <p style={{
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '8px',
          }}>
            رقم الطلب
          </p>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#0f172a',
            fontFamily: 'monospace',
          }}>
            #{orderNumber}
          </p>
        </div>

        {/* Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: statusInfo.bg,
          borderRadius: '12px',
          marginBottom: '24px',
        }}>
          <Clock style={{ width: '18px', height: '18px', color: statusInfo.color }} />
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: statusInfo.color,
          }}>
            {statusInfo.text}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
          }}
        >
          تم
        </button>
      </div>
    </div>
  );
}





