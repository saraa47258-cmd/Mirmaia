'use client';

import { Category } from '@/lib/firebase/database';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      padding: '4px',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      {/* All Categories */}
      <button
        onClick={() => onCategoryChange('all')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '12px',
          border: 'none',
          fontSize: '14px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backgroundColor: activeCategory === 'all' ? '#6366f1' : '#ffffff',
          color: activeCategory === 'all' ? '#ffffff' : '#475569',
          boxShadow: activeCategory === 'all' 
            ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
            : '0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
      >
        <span style={{ fontSize: '16px' }}>📋</span>
        <span>الكل</span>
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: activeCategory === category.id ? '#6366f1' : '#ffffff',
            color: activeCategory === category.id ? '#ffffff' : '#475569',
            boxShadow: activeCategory === category.id 
              ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
              : '0 1px 3px rgba(0, 0, 0, 0.08)',
          }}
        >
          <span style={{ fontSize: '16px' }}>{category.icon || '📦'}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}

