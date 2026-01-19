'use client';

import { useState } from 'react';
import { Category } from '@/lib/firebase/database';
import { AlertTriangle, Trash2, ArrowRight, X } from 'lucide-react';

interface DeleteCategoryModalProps {
  category: Category;
  productCount: number;
  categories: Category[];
  onClose: () => void;
  onDelete: () => Promise<void>;
  onMoveProducts: (toCategoryId: string) => Promise<void>;
  onDeactivate: () => Promise<void>;
}

export default function DeleteCategoryModal({
  category,
  productCount,
  categories,
  onClose,
  onDelete,
  onMoveProducts,
  onDeactivate,
}: DeleteCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'delete' | 'move' | 'deactivate'>('move');
  const [targetCategory, setTargetCategory] = useState('');

  const otherCategories = categories.filter(c => c.id !== category.id);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (action === 'delete') {
        await onDelete();
      } else if (action === 'move' && targetCategory) {
        await onMoveProducts(targetCategory);
        await onDelete();
      } else if (action === 'deactivate') {
        await onDeactivate();
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AlertTriangle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              حذف التصنيف
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              التصنيف &quot;{category.name}&quot; يحتوي على {productCount} منتج
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
        <div style={{ padding: '24px' }}>
          {productCount > 0 ? (
            <>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
                لا يمكن حذف التصنيف مباشرة لأنه يحتوي على منتجات. اختر أحد الخيارات التالية:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Move Products Option */}
                {otherCategories.length > 0 && (
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: action === 'move' ? '#eef2ff' : '#f8fafc',
                    border: action === 'move' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="action"
                      checked={action === 'move'}
                      onChange={() => setAction('move')}
                      style={{ marginTop: '2px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                        نقل المنتجات إلى تصنيف آخر
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                        سيتم نقل جميع المنتجات ثم حذف التصنيف
                      </p>
                      {action === 'move' && (
                        <select
                          value={targetCategory}
                          onChange={(e) => setTargetCategory(e.target.value)}
                          style={{
                            marginTop: '12px',
                            width: '100%',
                            padding: '10px 14px',
                            fontSize: '14px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            outline: 'none',
                          }}
                        >
                          <option value="">اختر التصنيف الجديد</option>
                          {otherCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon || cat.emoji} {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>
                )}

                {/* Deactivate Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: action === 'deactivate' ? '#fef3c7' : '#f8fafc',
                  border: action === 'deactivate' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}>
                  <input
                    type="radio"
                    name="action"
                    checked={action === 'deactivate'}
                    onChange={() => setAction('deactivate')}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                      تعطيل التصنيف فقط
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      سيتم إخفاء التصنيف ومنتجاته بدون حذف
                    </p>
                  </div>
                </label>

                {/* Force Delete Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: action === 'delete' ? '#fef2f2' : '#f8fafc',
                  border: action === 'delete' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}>
                  <input
                    type="radio"
                    name="action"
                    checked={action === 'delete'}
                    onChange={() => setAction('delete')}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>
                      حذف التصنيف والمنتجات نهائياً
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      ⚠️ سيتم حذف {productCount} منتج بشكل دائم
                    </p>
                  </div>
                </label>
              </div>
            </>
          ) : (
            <p style={{ fontSize: '14px', color: '#475569' }}>
              هل أنت متأكد من حذف التصنيف &quot;{category.name}&quot;؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={handleSubmit}
            disabled={loading || (action === 'move' && !targetCategory)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: action === 'deactivate' ? '#f59e0b' : '#dc2626',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: (loading || (action === 'move' && !targetCategory)) ? 'not-allowed' : 'pointer',
              opacity: (loading || (action === 'move' && !targetCategory)) ? 0.7 : 1,
            }}
          >
            {loading ? (
              'جاري التنفيذ...'
            ) : action === 'deactivate' ? (
              'تعطيل التصنيف'
            ) : (
              <>
                <Trash2 style={{ width: '16px', height: '16px' }} />
                {action === 'move' ? 'نقل وحذف' : 'حذف'}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
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
        </div>
      </div>
    </div>
  );
}





