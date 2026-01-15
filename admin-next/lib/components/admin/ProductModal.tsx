'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, ProductVariation, Category } from '@/lib/firebase/database';
import { uploadProductImage } from '@/lib/firebase/storage';
import VariationsEditor from './VariationsEditor';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

const EMOJI_OPTIONS = ['☕', '🍵', '🧃', '🥤', '🍹', '🥛', '🍩', '🍰', '🧁', '🍪', '💨', '🍔', '🍕', '🥗', '🍜', '🍱', '🍣', '🥙', '🌮', '🍦', '🥐', '🧇', '🥞', '🍿'];

export default function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    basePrice: 0,
    categoryId: '',
    imageUrl: '',
    emoji: '☕',
    isActive: true,
    sortOrder: 0,
    variations: [] as ProductVariation[],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        nameEn: product.nameEn || '',
        description: product.description || '',
        descriptionEn: product.descriptionEn || '',
        basePrice: product.basePrice || product.price || 0,
        categoryId: product.categoryId || product.category || '',
        imageUrl: product.imageUrl || product.image || '',
        emoji: product.emoji || '☕',
        isActive: product.isActive ?? product.active ?? true,
        sortOrder: product.sortOrder || 0,
        variations: product.variations || [],
      });
    } else if (categories.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [product, categories]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المنتج مطلوب';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'التصنيف مطلوب';
    }
    
    if (formData.basePrice < 0) {
      newErrors.basePrice = 'السعر يجب أن يكون 0 أو أكبر';
    }
    
    // Validate variations
    const invalidVariations = formData.variations.filter(v => !v.name.trim());
    if (invalidVariations.length > 0) {
      newErrors.variations = 'يجب إدخال اسم لكل خيار';
    }
    
    const negativeVariations = formData.variations.filter(v => v.price < 0);
    if (negativeVariations.length > 0) {
      newErrors.variations = 'سعر الخيار يجب أن يكون 0 أو أكبر';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'يجب اختيار صورة' });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'حجم الصورة يجب أن يكون أقل من 5 ميجا' });
      return;
    }
    
    setUploading(true);
    setErrors({ ...errors, image: '' });
    
    try {
      const imageUrl = await uploadProductImage(file, product?.id);
      setFormData({ ...formData, imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors({ ...errors, image: 'حدث خطأ في رفع الصورة' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Calculate effective price (base price or first variation price)
      const effectivePrice = formData.variations.length > 0
        ? (formData.variations.find(v => v.isDefault)?.price || formData.variations[0].price)
        : formData.basePrice;
      
      await onSave({
        name: formData.name.trim(),
        nameEn: formData.nameEn.trim() || undefined,
        description: formData.description.trim() || undefined,
        descriptionEn: formData.descriptionEn.trim() || undefined,
        price: effectivePrice,
        basePrice: formData.basePrice,
        categoryId: formData.categoryId,
        category: formData.categoryId,
        imageUrl: formData.imageUrl || undefined,
        image: formData.imageUrl || undefined,
        emoji: formData.emoji,
        isActive: formData.isActive,
        active: formData.isActive,
        sortOrder: formData.sortOrder,
        variations: formData.variations,
      });
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'حدث خطأ في حفظ المنتج' });
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
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
          margin: '20px 0',
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
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
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

          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                صورة المنتج
              </label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Preview */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '16px',
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px' }}>{formData.emoji}</span>
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
                      backgroundColor: '#f1f5f9',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      marginBottom: '8px',
                    }}
                  >
                    {uploading ? (
                      <>جاري الرفع...</>
                    ) : (
                      <>
                        <Upload style={{ width: '18px', height: '18px' }} />
                        رفع صورة
                      </>
                    )}
                  </button>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                    JPG, PNG أو GIF - الحد الأقصى 5 ميجا
                  </p>
                  {errors.image && (
                    <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.image}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emoji (if no image) */}
            {!formData.imageUrl && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  الأيقونة (بديل الصورة)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        backgroundColor: formData.emoji === emoji ? '#eef2ff' : '#f8fafc',
                        border: formData.emoji === emoji ? '2px solid #6366f1' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
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
                اسم المنتج (عربي) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

            {/* Description AR */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                الوصف (عربي)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Category & Base Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  التصنيف <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: errors.categoryId ? '1px solid #dc2626' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon || cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.categoryId}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  السعر الأساسي (ر.ع) <span style={{ color: '#94a3b8', fontWeight: 400 }}>اختياري</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: errors.basePrice ? '1px solid #dc2626' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                  }}
                />
                {errors.basePrice && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.basePrice}</p>
                )}
              </div>
            </div>

            {/* Variations */}
            <div style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
            }}>
              <VariationsEditor
                variations={formData.variations}
                onChange={(variations) => setFormData({ ...formData, variations })}
              />
              {errors.variations && (
                <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px' }}>{errors.variations}</p>
              )}
            </div>

            {/* Active & Sort Order */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
                  منتج نشط
                </label>
              </div>

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
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
            padding: '20px 0 0',
            borderTop: '1px solid #e2e8f0',
          }}>
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
              {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
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
      </div>
    </div>
  );
}

