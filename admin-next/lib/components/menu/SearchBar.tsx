'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'ابحث...' }: SearchBarProps) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
    }}>
      <Search style={{
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        color: '#94a3b8',
      }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '14px 44px 14px 44px',
          fontSize: '15px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          outline: 'none',
          color: '#0f172a',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f1f5f9',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      )}
    </div>
  );
}

