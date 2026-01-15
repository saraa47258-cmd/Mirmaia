'use client';

import { useState, useEffect, useRef } from 'react';
import { Category } from '@/lib/firebase/database';
import { uploadCategoryImage } from '@/lib/firebase/storage';
import { X, Save, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => Promise<void>;
  existingCategories: Category[];
}

const EMOJI_OPTIONS = ['☕', '🍵', '🧃', '🥤', '🍹', '🥛', '🍩', '🍰', '🧁', '🍪', '💨', '🍔', '🍕', '🥗', '🍜', '🍱', '🍣', '🥙', '🌮', '🍦'];

export default function CategoryModal({ category, onClose, onSave, existingCategories }: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    icon: '📦',
    imageUrl: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        nameEn: category.nameEn || '',
        icon: category.icon || category.emoji || '📦',
        imageUrl: (category as any).imageUrl || '',
        sortOrder: category.sortOrder || category.order || 0,
        isActive: category.isActive ?? category.active ?? true,
      });
    } else {
      const maxOrder = Math.max(...existingCategories.map(c => c.sortOrder || c.order || 0), 0);
      setFormData(prev => ({ ...prev, sortOrder: maxOrder + 1 }));
    }
  }, [category, existingCategories]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم التصنيف مطلوب';
    }
    
    if (formData.sortOrder < 0) {
      newErrors.sortOrder = 'الترتيب يجب أن يكون 0 أو أكبر';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'يجب اختيار صورة' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'حجم الصورة يجب أن يكون أقل من 5 ميجا' });
      return;
    }
    
    setUploading(true);
    setErrors({ ...errors, image: '' });
    
    try {
      const imageUrl = await uploadCategoryImage(file, category?.id);
      setFormData({ ...formData, imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors({ ...errors, image: 'حدث خطأ في رفع الصورة' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await onSave({
        name: formData.name.trim(),
        nameEn: formData.nameEn.trim() || undefined,
        icon: formData.icon,
        emoji: formData.icon,
        imageUrl: formData.imageUrl || undefined,
        sortOrder: formData.sortOrder,
        order: formData.sortOrder,
        isActive: formData.isActive,
        active: formData.isActive,
      } as any);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ submit: 'حدث خطأ في حفظ التصنيف' });
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
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          zIndex: 10,
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {category ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errors.submit && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              {errors.submit}
            </div>
          )}

          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>
                صورة التصنيف
              </label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Preview */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'relative',
                }}>
                  {formData.imageUrl ? (
                    <>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(220, 38, 38, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: '#ffffff',
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: '40px' }}>{formData.icon}</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      backgroundColor: '#6366f1',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      marginBottom: '8px',
                      opacity: uploading ? 0.7 : 1,
                    }}
                  >
                    {uploading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#ffffff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }} />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload style={{ width: '18px', height: '18px' }} />
                        رفع صورة
                      </>
                    )}
                  </button>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                    JPG, PNG أو GIF - الحد الأقصى 5 ميجا
                  </p>
                  {errors.image && (
                    <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.image}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Icon (if no image) */}
            {!formData.imageUrl && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  الأيقونة <span style={{ color: '#94a3b8', fontWeight: 400 }}>(بديل الصورة)</span>
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        backgroundColor: formData.icon === emoji ? '#eef2ff' : '#f8fafc',
                        border: formData.icon === emoji ? '2px solid #6366f1' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name AR */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                اسم التصنيف (عربي) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: المشروبات الساخنة"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: errors.name ? '1px solid #dc2626' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
              {errors.name && (
                <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.name}</p>
              )}
            </div>

            {/* Name EN */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                اسم التصنيف (إنجليزي) <span style={{ color: '#94a3b8', fontWeight: 400 }}>اختياري</span>
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Hot Drinks"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  textAlign: 'left',
                }}
              />
            </div>

            {/* Sort Order */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                الترتيب
              </label>
              <input
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: errors.sortOrder ? '1px solid #dc2626' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
              {errors.sortOrder && (
                <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.sortOrder}</p>
              )}
            </div>

            {/* Active */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#6366f1' }}
              />
              <label htmlFor="isActive" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
                تصنيف نشط
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={loading || uploading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: (loading || uploading) ? 'not-allowed' : 'pointer',
                opacity: (loading || uploading) ? 0.7 : 1,
              }}
            >
              <Save style={{ width: '18px', height: '18px' }} />
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '14px 24px',
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
        </form>

        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
