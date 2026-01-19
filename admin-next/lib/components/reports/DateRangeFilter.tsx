'use client';

import { useState } from 'react';
import { DateRange, ReportTab } from '@/lib/reports';
import { Calendar, Filter, ChevronDown } from 'lucide-react';

interface DateRangeFilterProps {
  dateRange: DateRange;
  customStart: string;
  customEnd: string;
  activeTab: ReportTab;
  onDateRangeChange: (range: DateRange) => void;
  onCustomStartChange: (date: string) => void;
  onCustomEndChange: (date: string) => void;
  onTabChange: (tab: ReportTab) => void;
  filters?: {
    paymentMethod?: 'cash' | 'card' | '';
    orderType?: 'table' | 'room' | 'takeaway' | '';
  };
  onFiltersChange?: (filters: {
    paymentMethod?: 'cash' | 'card' | '';
    orderType?: 'table' | 'room' | 'takeaway' | '';
  }) => void;
}

export default function DateRangeFilter({
  dateRange,
  customStart,
  customEnd,
  activeTab,
  onDateRangeChange,
  onCustomStartChange,
  onCustomEndChange,
  onTabChange,
  filters,
  onFiltersChange,
}: DateRangeFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const dateRanges: { value: DateRange; label: string }[] = [
    { value: 'today', label: 'اليوم' },
    { value: 'week', label: 'أسبوع' },
    { value: 'month', label: 'شهر' },
    { value: 'year', label: 'سنة' },
    { value: 'custom', label: 'مخصص' },
  ];

  const tabs: { value: ReportTab; label: string }[] = [
    { value: 'daily', label: 'يومي' },
    { value: 'weekly', label: 'أسبوعي' },
    { value: 'monthly', label: 'شهري' },
    { value: 'yearly', label: 'سنوي' },
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      marginBottom: '24px',
      overflow: 'hidden',
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: activeTab === tab.value ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.value ? '2px solid #6366f1' : '2px solid transparent',
              fontSize: '14px',
              fontWeight: activeTab === tab.value ? 600 : 500,
              color: activeTab === tab.value ? '#6366f1' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
      }}>
        {/* Date Range Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {dateRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onDateRangeChange(range.value)}
              style={{
                padding: '10px 18px',
                backgroundColor: dateRange === range.value ? '#6366f1' : '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: dateRange === range.value ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}>
            <Calendar style={{ width: '16px', height: '16px', color: '#64748b' }} />
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>إلى</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Additional Filters Toggle */}
        {onFiltersChange && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: showFilters ? '#eef2ff' : '#f1f5f9',
              border: showFilters ? '1px solid #6366f1' : '1px solid transparent',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              color: showFilters ? '#6366f1' : '#475569',
              cursor: 'pointer',
              marginRight: 'auto',
            }}
          >
            <Filter style={{ width: '16px', height: '16px' }} />
            فلاتر إضافية
            <ChevronDown style={{
              width: '16px',
              height: '16px',
              transform: showFilters ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }} />
          </button>
        )}
      </div>

      {/* Additional Filters Panel */}
      {showFilters && onFiltersChange && filters && (
        <div style={{
          padding: '0 20px 20px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          {/* Payment Method */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '8px',
            }}>
              طريقة الدفع
            </label>
            <select
              value={filters.paymentMethod || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                paymentMethod: e.target.value as any,
              })}
              style={{
                padding: '10px 32px 10px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '140px',
              }}
            >
              <option value="">الكل</option>
              <option value="cash">نقدي</option>
              <option value="card">بطاقة</option>
            </select>
          </div>

          {/* Order Type */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '8px',
            }}>
              نوع الطلب
            </label>
            <select
              value={filters.orderType || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                orderType: e.target.value as any,
              })}
              style={{
                padding: '10px 32px 10px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '140px',
              }}
            >
              <option value="">الكل</option>
              <option value="table">طاولة</option>
              <option value="room">غرفة</option>
              <option value="takeaway">استلام</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}





