'use client';

import { useState } from 'react';
import { Product, Category, ProductVariation } from '@/lib/firebase/database';
import { X, Plus, Minus, Check, Layers } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  category?: Category;
  onClose: () => void;
  // Staff mode props
  isStaffMode?: boolean;
  quantity?: number;
  note?: string;
  onAddToCart?: (product: Product, variation?: ProductVariation, notes?: string) => void;
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
  // Check for variations
  const activeVariations = product.variations?.filter(v => v.isActive !== false) || [];
  const hasVariations = activeVariations.length > 0;
  const defaultVariation = activeVariations.find(v => v.isDefault) || activeVariations[0];
  
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    hasVariations ? defaultVariation : null
  );
  const [localNote, setLocalNote] = useState(note);

  // Get current price
  const currentPrice = selectedVariation ? selectedVariation.price : product.price;

  const handleAdd = () => {
    if (hasVariations && selectedVariation) {
      onAddToCart?.(product, selectedVariation, localNote || undefined);
    } else {
      onAddToCart?.(product, undefined, localNote || undefined);
    }
    onClose();
  };

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
          maxWidth: '440px',
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
          {product.image || product.imageUrl ? (
            <img
              src={product.image || product.imageUrl}
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

          {/* Variations Badge */}
          {hasVariations && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              backgroundColor: 'rgba(99, 102, 241, 0.9)',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#ffffff',
              backdropFilter: 'blur(4px)',
            }}>
              <Layers style={{ width: '14px', height: '14px' }} />
              {activeVariations.length} خيارات
            </div>
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

          {/* Variations Selector */}
          {hasVariations ? (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '10px',
              }}>
                اختر الحجم أو النوع
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeVariations.map((variation) => {
                  const isSelected = selectedVariation?.id === variation.id;
                  return (
                    <button
                      key={variation.id}
                      onClick={() => setSelectedVariation(variation)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : '#f8fafc',
                        border: isSelected ? '2px solid #6366f1' : '2px solid transparent',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: isSelected ? 'none' : '2px solid #cbd5e1',
                          backgroundColor: isSelected ? '#6366f1' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {isSelected && (
                            <Check style={{ width: '12px', height: '12px', color: '#ffffff' }} />
                          )}
                        </div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#6366f1' : '#0f172a',
                        }}>
                          {variation.name}
                        </span>
                        {variation.isDefault && (
                          <span style={{
                            fontSize: '10px',
                            color: '#64748b',
                            backgroundColor: '#e2e8f0',
                            padding: '2px 6px',
                            borderRadius: '8px',
                          }}>
                            الافتراضي
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isSelected ? '#6366f1' : '#16a34a',
                      }}>
                        {variation.price.toFixed(3)} ر.ع
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Price for non-variation products */
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#16a34a',
              marginBottom: '24px',
            }}>
              {product.price.toFixed(3)} <span style={{ fontSize: '16px', fontWeight: 500 }}>ر.ع</span>
            </div>
          )}

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
                value={localNote}
                onChange={(e) => {
                  setLocalNote(e.target.value);
                  onNoteChange?.(product.id, e.target.value);
                }}
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
                  backgroundColor: '#f8fafc',
                }}
              />
            </div>
          )}

          {/* Selected Summary for variations */}
          {hasVariations && selectedVariation && (
            <div style={{
              padding: '14px 18px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '14px', color: '#475569' }}>
                السعر المحدد
              </span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a' }}>
                {selectedVariation.price.toFixed(3)} ر.ع
              </span>
            </div>
          )}

          {/* Actions */}
          {isStaffMode ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              {quantity > 0 && !hasVariations ? (
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
                    {(currentPrice * quantity).toFixed(3)} ر.ع
                  </div>
                </>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={hasVariations && !selectedVariation}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px',
                    background: (hasVariations && !selectedVariation)
                      ? '#e2e8f0'
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: (hasVariations && !selectedVariation) ? '#94a3b8' : '#ffffff',
                    cursor: (hasVariations && !selectedVariation) ? 'not-allowed' : 'pointer',
                    boxShadow: (hasVariations && !selectedVariation)
                      ? 'none'
                      : '0 4px 12px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  <Plus style={{ width: '20px', height: '20px' }} />
                  {hasVariations && selectedVariation
                    ? `إضافة (${selectedVariation.name})`
                    : 'إضافة إلى الطلب'}
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
