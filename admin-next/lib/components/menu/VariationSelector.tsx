'use client';

import { useState } from 'react';
import { Product, ProductVariation } from '@/lib/firebase/database';
import { X, Check, ShoppingCart, Layers, MessageSquare } from 'lucide-react';

interface VariationSelectorProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, variation: ProductVariation, notes?: string) => void;
}

export default function VariationSelector({
  product,
  onClose,
  onAddToCart,
}: VariationSelectorProps) {
  const activeVariations = product.variations?.filter(v => v.isActive !== false) || [];
  const defaultVariation = activeVariations.find(v => v.isDefault) || activeVariations[0];
  
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(defaultVariation || null);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleAdd = () => {
    if (selectedVariation) {
      onAddToCart(product, selectedVariation, notes || undefined);
      onClose();
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
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '85vh',
        backgroundColor: '#ffffff',
        borderRadius: '24px 24px 0 0',
        zIndex: 101,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Product Image */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {product.image || product.imageUrl ? (
              <img
                src={product.image || product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '28px' }}>{product.emoji || '☕'}</span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '4px',
            }}>
              {product.name}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#6366f1',
            }}>
              <Layers style={{ width: '14px', height: '14px' }} />
              اختر الحجم أو النوع
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
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Variations */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
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
                    padding: '16px 20px',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : '#f8fafc',
                    border: isSelected ? '2px solid #6366f1' : '2px solid transparent',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Radio Circle */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? 'none' : '2px solid #cbd5e1',
                      backgroundColor: isSelected ? '#6366f1' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {isSelected && (
                        <Check style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? '#6366f1' : '#0f172a',
                      }}>
                        {variation.name}
                      </p>
                      {variation.isDefault && (
                        <span style={{
                          fontSize: '11px',
                          color: '#64748b',
                          backgroundColor: '#e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          marginTop: '4px',
                          display: 'inline-block',
                        }}>
                          الافتراضي
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: isSelected ? '#6366f1' : '#16a34a',
                  }}>
                    {variation.price.toFixed(3)} <span style={{ fontSize: '12px', fontWeight: 500 }}>ر.ع</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Notes Section */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setShowNotes(!showNotes)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: showNotes ? 'rgba(99, 102, 241, 0.1)' : '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                color: showNotes ? '#6366f1' : '#475569',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <MessageSquare style={{ width: '18px', height: '18px' }} />
              إضافة ملاحظة (اختياري)
            </button>

            {showNotes && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: بدون سكر، حليب قليل..."
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none',
                  minHeight: '80px',
                }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}>
          {/* Selected Summary */}
          {selectedVariation && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
            }}>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b' }}>اخترت</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  {product.name} - {selectedVariation.name}
                </p>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>
                {selectedVariation.price.toFixed(3)} ر.ع
              </p>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!selectedVariation}
            style={{
              width: '100%',
              padding: '16px',
              background: selectedVariation 
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : '#e2e8f0',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 700,
              color: selectedVariation ? '#ffffff' : '#94a3b8',
              cursor: selectedVariation ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <ShoppingCart style={{ width: '20px', height: '20px' }} />
            إضافة إلى السلة
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

