'use client';

import { useState, useEffect } from 'react';
import { Room } from '@/lib/firebase/database';
import { X, Save, DoorOpen } from 'lucide-react';

interface RoomModalProps {
  room: Room | null;
  existingRooms: Room[];
  onClose: () => void;
  onSave: (data: Partial<Room>) => Promise<void>;
}

export default function RoomModal({ room, existingRooms, onClose, onSave }: RoomModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    name: '',
    priceType: 'gender' as 'free' | 'fixed' | 'gender',
    hourlyRate: 0,
    malePrice: 3,
    femalePrice: 0,
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        name: room.name || '',
        priceType: room.priceType || 'gender',
        hourlyRate: room.hourlyRate || 0,
        malePrice: room.malePrice ?? 3,
        femalePrice: room.femalePrice ?? 0,
        notes: room.notes || '',
        isActive: room.isActive ?? true,
      });
    }
  }, [room]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'رقم الغرفة مطلوب';
    } else {
      // Check for duplicate room number
      const isDuplicate = existingRooms.some(
        r => r.roomNumber === formData.roomNumber.trim() && r.id !== room?.id
      );
      if (isDuplicate) {
        newErrors.roomNumber = 'رقم الغرفة موجود مسبقاً';
      }
    }
    
    if (formData.priceType === 'fixed' && formData.hourlyRate < 0) {
      newErrors.hourlyRate = 'السعر لا يمكن أن يكون سالباً';
    }
    
    if (formData.priceType === 'gender') {
      if (formData.malePrice < 0) {
        newErrors.malePrice = 'السعر لا يمكن أن يكون سالباً';
      }
      if (formData.femalePrice < 0) {
        newErrors.femalePrice = 'السعر لا يمكن أن يكون سالباً';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const saveData: Partial<Room> = {
        roomNumber: formData.roomNumber.trim(),
        priceType: formData.priceType,
        isActive: formData.isActive,
      };

      // Only add optional fields if they have values
      if (formData.name.trim()) {
        saveData.name = formData.name.trim();
      }
      if (formData.notes.trim()) {
        saveData.notes = formData.notes.trim();
      }

      // Add pricing based on type
      if (formData.priceType === 'fixed') {
        saveData.hourlyRate = formData.hourlyRate;
      } else if (formData.priceType === 'gender') {
        saveData.malePrice = formData.malePrice;
        saveData.femalePrice = formData.femalePrice;
      }

      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error('Error saving room:', error);
      setErrors({ submit: 'حدث خطأ في حفظ الغرفة' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 90,
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '520px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        zIndex: 100,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DoorOpen style={{ width: '22px', height: '22px', color: '#ffffff' }} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {room ? 'تعديل الغرفة' : 'إضافة غرفة جديدة'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto' }}>
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
            {/* Room Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                رقم الغرفة <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="مثال: 1, VIP1, غ1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: errors.roomNumber ? '1px solid #dc2626' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
              {errors.roomNumber && (
                <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.roomNumber}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                اسم الغرفة <span style={{ color: '#94a3b8', fontWeight: 400 }}>(اختياري)</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: غرفة العائلات، غرفة VIP"
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

            {/* Price Type */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                نوع التسعير
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'free', label: 'مجاني' },
                  { value: 'fixed', label: 'سعر ثابت' },
                  { value: 'gender', label: 'حسب الجنس' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priceType: option.value as 'free' | 'fixed' | 'gender' })}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: formData.priceType === option.value ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: formData.priceType === option.value ? '#fef3c7' : '#ffffff',
                      color: formData.priceType === option.value ? '#b45309' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fixed Price */}
            {formData.priceType === 'fixed' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  سعر الساعة (ر.ع)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: errors.hourlyRate ? '1px solid #dc2626' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                  }}
                />
                {errors.hourlyRate && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.hourlyRate}</p>
                )}
              </div>
            )}

            {/* Gender-based Pricing */}
            {formData.priceType === 'gender' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                    سعر الذكور (ر.ع) 🚹
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.malePrice}
                    onChange={(e) => setFormData({ ...formData, malePrice: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      border: errors.malePrice ? '1px solid #dc2626' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                    }}
                  />
                  {errors.malePrice && (
                    <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.malePrice}</p>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                    سعر الإناث (ر.ع) 🚺
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.femalePrice}
                    onChange={(e) => setFormData({ ...formData, femalePrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0 = مجاني"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      border: errors.femalePrice ? '1px solid #dc2626' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                    }}
                  />
                  {errors.femalePrice && (
                    <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.femalePrice}</p>
                  )}
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>ضع 0 للمجاني</p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                ملاحظات <span style={{ color: '#94a3b8', fontWeight: 400 }}>(اختياري)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Active */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#f59e0b' }}
              />
              <label htmlFor="isActive" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
                غرفة نشطة
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
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
      </div>
    </>
  );
}
