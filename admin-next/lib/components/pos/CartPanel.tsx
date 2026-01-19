'use client';

import { CartItem } from '@/lib/pos';
import { Plus, Minus, Trash2, ShoppingCart, FileText, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateNote: (itemId: string, note: string) => void;
  onClearCart: () => void;
}

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export default function CartPanel({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onUpdateNote,
  onClearCart 
}: CartPanelProps) {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize === 'mobile';

  const handleEditNote = (item: CartItem) => {
    setEditingNote(item.id);
    setTempNote(item.note || '');
  };

  const handleSaveNote = (itemId: string) => {
    onUpdateNote(itemId, tempNote);
    setEditingNote(null);
    setTempNote('');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? 'auto' : '100%',
      minHeight: isMobile ? 'calc(100vh - 200px)' : undefined,
      backgroundColor: '#ffffff',
      borderRadius: isMobile ? '12px' : '16px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
    }}>
      {/* Header */}
      <div style={{
        padding: isMobile ? '12px 14px' : '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px' }}>
          <ShoppingCart style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', color: '#6366f1' }} />
          <h2 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            السلة
          </h2>
          {totalItems > 0 && (
            <span style={{
              padding: '2px 10px',
              backgroundColor: '#6366f1',
              borderRadius: '20px',
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: 700,
              color: '#ffffff',
            }}>
              {totalItems}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={onClearCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '5px 10px' : '6px 12px',
              backgroundColor: '#fee2e2',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: 600,
              color: '#dc2626',
              cursor: 'pointer',
            }}
          >
            <Trash2 style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />
            مسح
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: items.length === 0 ? (isMobile ? '24px 12px' : '40px 20px') : (isMobile ? '10px' : '12px'),
      }}>
        {items.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <ShoppingCart style={{ width: '36px', height: '36px', color: '#cbd5e1' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748b', margin: 0 }}>
              السلة فارغة
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              اختر منتجات لإضافتها
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Item Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{item.emoji || '📦'}</span>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#0f172a',
                        margin: 0,
                      }}>
                        {item.name}
                      </p>
                    </div>
                    {item.variationName && (
                      <p style={{
                        fontSize: '12px',
                        color: '#6366f1',
                        margin: '4px 0 0 26px',
                        fontWeight: 500,
                      }}>
                        {item.variationName}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    style={{
                      padding: '6px',
                      backgroundColor: '#fee2e2',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#dc2626',
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                {/* Note */}
                {editingNote === item.id ? (
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="أضف ملاحظة..."
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '12px',
                        border: '1px solid #6366f1',
                        borderRadius: '8px',
                        outline: 'none',
                        marginBottom: '6px',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveNote(item.id);
                        if (e.key === 'Escape') setEditingNote(null);
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleSaveNote(item.id)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#6366f1',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingNote(null)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#e2e8f0',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : item.note ? (
                  <div 
                    onClick={() => handleEditNote(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <FileText style={{ width: '12px', height: '12px', color: '#f59e0b' }} />
                    <span style={{ fontSize: '11px', color: '#92400e' }}>{item.note}</span>
                    <Edit2 style={{ width: '10px', height: '10px', color: '#f59e0b', marginRight: 'auto' }} />
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditNote(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      backgroundColor: '#f1f5f9',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#64748b',
                      cursor: 'pointer',
                      marginBottom: '10px',
                    }}
                  >
                    <FileText style={{ width: '12px', height: '12px' }} />
                    إضافة ملاحظة
                  </button>
                )}

                {/* Quantity & Price */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  {/* Quantity Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    padding: '4px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f1f5f9',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#475569',
                      }}
                    >
                      <Minus style={{ width: '14px', height: '14px' }} />
                    </button>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#0f172a',
                      minWidth: '28px',
                      textAlign: 'center',
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
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
                      <Plus style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'left' }}>
                    <p style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      margin: 0,
                    }}>
                      {item.unitPrice.toFixed(3)} × {item.quantity}
                    </p>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#16a34a',
                      margin: '2px 0 0 0',
                    }}>
                      {item.lineTotal.toFixed(3)}
                      <span style={{ fontSize: '11px', marginRight: '2px' }}>ر.ع</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}





