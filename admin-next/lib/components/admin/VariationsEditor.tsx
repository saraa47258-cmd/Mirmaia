'use client';

import { ProductVariation } from '@/lib/firebase/database';
import { Plus, Trash2, GripVertical, Star } from 'lucide-react';
import { useState } from 'react';

interface VariationsEditorProps {
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
}

export default function VariationsEditor({ variations, onChange }: VariationsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addVariation = () => {
    const newVariation: ProductVariation = {
      id: `var_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: '',
      price: 0,
      isDefault: variations.length === 0,
      isActive: true,
      sortOrder: variations.length,
    };
    onChange([...variations, newVariation]);
  };

  const updateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    
    // If setting as default, unset others
    if (field === 'isDefault' && value === true) {
      updated.forEach((v, i) => {
        if (i !== index) v.isDefault = false;
      });
    }
    
    onChange(updated);
  };

  const removeVariation = (index: number) => {
    const updated = variations.filter((_, i) => i !== index);
    // If removed was default, set first as default
    if (variations[index].isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    // Update sort orders
    updated.forEach((v, i) => v.sortOrder = i);
    onChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...variations];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    updated.forEach((v, i) => v.sortOrder = i);
    
    setDraggedIndex(index);
    onChange(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
          الخيارات / الأحجام
        </label>
        <button
          type="button"
          onClick={addVariation}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: '#eef2ff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#6366f1',
            cursor: 'pointer',
          }}
        >
          <Plus style={{ width: '14px', height: '14px' }} />
          إضافة خيار
        </button>
      </div>

      {variations.length === 0 ? (
        <div style={{
          padding: '24px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            لا توجد خيارات
          </p>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            أضف خيارات مثل: صغير / وسط / كبير أو نكهات مختلفة
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 100px 70px 32px',
            gap: '8px',
            padding: '8px 0',
            borderBottom: '1px solid #e2e8f0',
          }}>
            <span></span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>الاسم</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>السعر</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>افتراضي</span>
            <span></span>
          </div>

          {/* Rows */}
          {variations.map((variation, index) => (
            <div
              key={variation.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 100px 70px 32px',
                gap: '8px',
                padding: '8px',
                backgroundColor: draggedIndex === index ? '#f1f5f9' : '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                alignItems: 'center',
                opacity: !variation.isActive ? 0.5 : 1,
              }}
            >
              {/* Drag Handle */}
              <div style={{ cursor: 'grab', color: '#94a3b8' }}>
                <GripVertical style={{ width: '16px', height: '16px' }} />
              </div>

              {/* Name */}
              <input
                type="text"
                value={variation.name}
                onChange={(e) => updateVariation(index, 'name', e.target.value)}
                placeholder="مثال: كبير"
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                }}
              />

              {/* Price */}
              <input
                type="number"
                min="0"
                step="0.001"
                value={variation.price}
                onChange={(e) => updateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  textAlign: 'center',
                }}
              />

              {/* Default */}
              <button
                type="button"
                onClick={() => updateVariation(index, 'isDefault', !variation.isDefault)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  backgroundColor: variation.isDefault ? '#fef3c7' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: variation.isDefault ? '#f59e0b' : '#cbd5e1',
                }}
              >
                <Star style={{ width: '18px', height: '18px', fill: variation.isDefault ? '#f59e0b' : 'none' }} />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeVariation(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  backgroundColor: '#fef2f2',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#dc2626',
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
        💡 اسحب وأفلت لإعادة ترتيب الخيارات
      </p>
    </div>
  );
}

