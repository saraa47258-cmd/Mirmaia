'use client';

import { Product } from '@/lib/firebase/database';
import { Plus, Minus, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  // Staff menu props
  isStaffMode?: boolean;
  quantity?: number;
  onAddToCart?: (product: Product) => void;
  onIncrement?: (product: Product) => void;
  onDecrement?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  isStaffMode = false,
  quantity = 0,
  onAddToCart,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image / Emoji */}
      <div
        onClick={() => onViewDetails(product)}
        style={{
          height: '140px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
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
          <span style={{ fontSize: '48px' }}>{product.emoji || '☕'}</span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <div
          onClick={() => onViewDetails(product)}
          style={{ marginBottom: '12px' }}
        >
          <h3 style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.name}
          </h3>
          {product.description && (
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.5',
            }}>
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#16a34a',
          }}>
            {product.price.toFixed(3)} <span style={{ fontSize: '12px', fontWeight: 500 }}>ر.ع</span>
          </div>

          {isStaffMode ? (
            quantity > 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '10px',
                padding: '4px',
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecrement?.(product);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#dc2626',
                  }}
                >
                  <Minus style={{ width: '16px', height: '16px' }} />
                </button>
                <span style={{
                  minWidth: '28px',
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0f172a',
                }}>
                  {quantity}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onIncrement?.(product);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#6366f1',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(product);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: '#6366f1',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                إضافة
              </button>
            )
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <Eye style={{ width: '16px', height: '16px' }} />
              التفاصيل
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

