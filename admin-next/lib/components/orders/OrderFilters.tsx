'use client';

import { useState } from 'react';
import { Search, Calendar, Filter, X, ChevronDown } from 'lucide-react';

export interface OrderFiltersState {
  dateRange: 'today' | 'week' | 'month' | 'year' | 'custom';
  customStart?: string;
  customEnd?: string;
  status: string;
  paymentStatus: string;
  search: string;
}

interface OrderFiltersProps {
  filters: OrderFiltersState;
  onChange: (filters: OrderFiltersState) => void;
}

const DATE_RANGES = [
  { value: 'today', label: 'اليوم' },
  { value: 'week', label: 'هذا الأسبوع' },
  { value: 'month', label: 'هذا الشهر' },
  { value: 'year', label: 'هذه السنة' },
  { value: 'custom', label: 'تاريخ محدد' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'pending', label: 'معلق' },
  { value: 'preparing', label: 'قيد التحضير' },
  { value: 'ready', label: 'جاهز' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'paid', label: 'مدفوع' },
  { value: 'cancelled', label: 'ملغي' },
];

const PAYMENT_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'paid', label: 'مدفوع' },
  { value: 'pending', label: 'غير مدفوع' },
];

export default function OrderFilters({ filters, onChange }: OrderFiltersProps) {
  const [showCustomDate, setShowCustomDate] = useState(filters.dateRange === 'custom');

  const handleDateRangeChange = (value: string) => {
    const isCustom = value === 'custom';
    setShowCustomDate(isCustom);
    onChange({
      ...filters,
      dateRange: value as OrderFiltersState['dateRange'],
      customStart: isCustom ? filters.customStart : undefined,
      customEnd: isCustom ? filters.customEnd : undefined,
    });
  };

  const clearFilters = () => {
    onChange({
      dateRange: 'today',
      status: 'all',
      paymentStatus: 'all',
      search: '',
    });
    setShowCustomDate(false);
  };

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.paymentStatus !== 'all' || 
    filters.search !== '' ||
    filters.dateRange === 'custom';

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '20px',
      marginBottom: '20px',
    }}>
      {/* Date Range Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        {DATE_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => handleDateRangeChange(range.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              backgroundColor: filters.dateRange === range.value ? '#6366f1' : '#f1f5f9',
              color: filters.dateRange === range.value ? '#ffffff' : '#475569',
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {showCustomDate && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
              من تاريخ
            </label>
            <input
              type="date"
              value={filters.customStart || ''}
              onChange={(e) => onChange({ ...filters, customStart: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
              إلى تاريخ
            </label>
            <input
              type="date"
              value={filters.customEnd || ''}
              onChange={(e) => onChange({ ...filters, customEnd: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}>
        {/* Search */}
        <div style={{ flex: 2, minWidth: '200px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 14px',
            height: '44px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
          }}>
            <Search style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="ابحث برقم الطلب أو اسم العميل..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: '#0f172a',
                backgroundColor: 'transparent',
              }}
            />
            {filters.search && (
              <button
                onClick={() => onChange({ ...filters, search: '' })}
                style={{
                  padding: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#0f172a',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left 12px center',
              backgroundSize: '16px',
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Payment Filter */}
        <div style={{ flex: 1, minWidth: '130px' }}>
          <select
            value={filters.paymentStatus}
            onChange={(e) => onChange({ ...filters, paymentStatus: e.target.value })}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#0f172a',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left 12px center',
              backgroundSize: '16px',
            }}
          >
            {PAYMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 16px',
              height: '44px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#dc2626',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
            مسح
          </button>
        )}
      </div>
    </div>
  );
}





