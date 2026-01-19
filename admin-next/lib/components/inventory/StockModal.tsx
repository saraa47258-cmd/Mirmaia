'use client';

import { useState } from 'react';
import { InventoryProduct, STOCK_OUT_REASONS, ADJUSTMENT_REASONS } from '@/lib/inventory';
import { X, Plus, Minus, Edit, Package } from 'lucide-react';

type ModalType = 'add' | 'remove' | 'adjust';

interface StockModalProps {
  type: ModalType;
  product: InventoryProduct;
  onClose: () => void;
  onConfirm: (data: {
    quantity: number;
    reason?: string;
    note?: string;
    supplier?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function StockModal({
  type,
  product,
  onClose,
  onConfirm,
  loading,
}: StockModalProps) {
  const [quantity, setQuantity] = useState(type === 'adjust' ? product.stockQty : 1);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [supplier, setSupplier] = useState('');

  const getModalConfig = () => {
    switch (type) {
      case 'add':
        return {
          title: 'إضافة مخزون',
          icon: Plus,
          color: '#22c55e',
          bgColor: 'rgba(34, 197, 94, 0.1)',
          buttonText: 'إضافة',
          buttonBg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        };
      case 'remove':
        return {
          title: 'سحب مخزون',
          icon: Minus,
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          buttonText: 'سحب',
          buttonBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        };
      case 'adjust':
        return {
          title: 'تعديل الكمية',
          icon: Edit,
          color: '#6366f1',
          bgColor: 'rgba(99, 102, 241, 0.1)',
          buttonText: 'حفظ',
          buttonBg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        };
    }
  };

  const config = getModalConfig();
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      quantity,
      reason,
      note,
      supplier: type === 'add' ? supplier : undefined,
    });
  };

  const getNewQuantity = () => {
    switch (type) {
      case 'add':
        return product.stockQty + quantity;
      case 'remove':
        return Math.max(0, product.stockQty - quantity);
      case 'adjust':
        return quantity;
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
        width: '440px',
        maxWidth: '95vw',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        zIndex: 101,
        overflow: 'hidden',
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
              backgroundColor: config.bgColor,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon style={{ width: '24px', height: '24px', color: config.color }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {config.title}
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

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px' }}>
            {/* Current Stock Info */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  overflow: 'hidden',
                }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    product.emoji || '📦'
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>الكمية الحالية</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                    {product.stockQty}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '12px', color: '#64748b' }}>الكمية الجديدة</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: type === 'remove' ? '#ef4444' : '#22c55e',
                }}>
                  {getNewQuantity()}
                </p>
              </div>
            </div>

            {/* Quantity Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                {type === 'adjust' ? 'الكمية الجديدة' : 'الكمية'}
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                {type !== 'adjust' && (
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f1f5f9',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      color: '#475569',
                    }}
                  >
                    <Minus style={{ width: '20px', height: '20px' }} />
                  </button>
                )}
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#0f172a',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                {type !== 'adjust' && (
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    style={{
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: config.color,
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      color: '#ffffff',
                    }}
                  >
                    <Plus style={{ width: '20px', height: '20px' }} />
                  </button>
                )}
              </div>
              {/* Quick buttons */}
              {type !== 'adjust' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {[5, 10, 25, 50, 100].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuantity(n)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: quantity === n ? config.bgColor : '#f1f5f9',
                        border: quantity === n ? `1px solid ${config.color}` : '1px solid transparent',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: quantity === n ? config.color : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reason (for remove/adjust) */}
            {(type === 'remove' || type === 'adjust') && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '10px',
                }}>
                  السبب
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">اختر السبب</option>
                  {(type === 'remove' ? STOCK_OUT_REASONS : ADJUSTMENT_REASONS).map((r) => (
                    <option key={r.id} value={r.label}>{r.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Supplier (for add) */}
            {type === 'add' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '10px',
                }}>
                  المورد (اختياري)
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="اسم المورد"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Note */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '10px',
              }}>
                ملاحظة (اختياري)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="أضف ملاحظة..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#0f172a',
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
              disabled={loading || (type !== 'add' && !reason)}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? '#94a3b8' : config.buttonBg,
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: loading || (type !== 'add' && !reason) ? 'not-allowed' : 'pointer',
                opacity: loading || (type !== 'add' && !reason) ? 0.6 : 1,
              }}
            >
              {loading ? 'جاري الحفظ...' : config.buttonText}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}





