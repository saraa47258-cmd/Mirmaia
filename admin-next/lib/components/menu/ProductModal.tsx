'use client';

import { Product, Category } from '@/lib/firebase/database';
import { X, Plus, Minus } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  category?: Category;
  onClose: () => void;
  // Staff mode props
  isStaffMode?: boolean;
  quantity?: number;
  note?: string;
  onAddToCart?: (product: Product) => void;
  onIncrement?: (product: Product) => void;
  onDecrement?: (product: Product) => void;
  onNoteChange?: (productId: string, note: string) => void;
}

export default function ProductModal({
  product,
  category,
  onClose,
  isStaffMode = false,
  quantity = 0,
  note = '',
  onAddToCart,
  onIncrement,
  onDecrement,
  onNoteChange,
}: ProductModalProps) {
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
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Image */}
        <div style={{
          position: 'relative',
          height: '200px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <span style={{ fontSize: '80px' }}>{product.emoji || '☕'}</span>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Category */}
          {category && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '12px',
            }}>
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </div>
          )}

          {/* Name */}
          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '8px',
          }}>
            {product.name}
          </h2>

          {/* Description */}
          {product.description && (
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              lineHeight: '1.7',
              marginBottom: '20px',
            }}>
              {product.description}
            </p>
          )}

          {/* Price */}
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#16a34a',
            marginBottom: '24px',
          }}>
            {product.price.toFixed(3)} <span style={{ fontSize: '16px', fontWeight: 500 }}>ر.ع</span>
          </div>

          {/* Staff Mode: Notes */}
          {isStaffMode && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '8px',
              }}>
                ملاحظات (اختياري)
              </label>
              <textarea
                value={note}
                onChange={(e) => onNoteChange?.(product.id, e.target.value)}
                placeholder="مثال: بدون سكر، حار جداً..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  resize: 'none',
                  minHeight: '80px',
                }}
              />
            </div>
          )}

          {/* Actions */}
          {isStaffMode ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              {quantity > 0 ? (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '8px',
                  }}>
                    <button
                      onClick={() => onDecrement?.(product)}
                      style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        color: '#dc2626',
                      }}
                    >
                      <Minus style={{ width: '18px', height: '18px' }} />
                    </button>
                    <span style={{
                      minWidth: '40px',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#0f172a',
                    }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => onIncrement?.(product)}
                      style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#6366f1',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        color: '#ffffff',
                      }}
                    >
                      <Plus style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>
                  <div style={{
                    flex: 1,
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0f172a',
                    textAlign: 'center',
                  }}>
                    {(product.price * quantity).toFixed(3)} ر.ع
                  </div>
                </>
              ) : (
                <button
                  onClick={() => onAddToCart?.(product)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
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
                  <Plus style={{ width: '20px', height: '20px' }} />
                  إضافة إلى الطلب
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              إغلاق
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

