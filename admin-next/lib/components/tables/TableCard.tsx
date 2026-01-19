'use client';

import { Table, Order } from '@/lib/firebase/database';
import { Clock, ShoppingBag, Coffee, Crown } from 'lucide-react';

interface TableCardProps {
  table: Table;
  activeOrder?: Order | null;
  onClick: () => void;
}

const STATUS_CONFIG = {
  available: {
    label: 'متاحة',
    bgColor: '#dcfce7',
    borderColor: '#16a34a',
    textColor: '#15803d',
    cardBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
  },
  reserved: {
    label: 'محجوزة',
    bgColor: '#fee2e2',
    borderColor: '#dc2626',
    textColor: '#dc2626',
    cardBg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
  },
  occupied: {
    label: 'مشغولة',
    bgColor: '#fee2e2',
    borderColor: '#dc2626',
    textColor: '#dc2626',
    cardBg: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
  },
};

const AREA_CONFIG = {
  'داخلي': { label: 'داخلي', icon: Coffee, color: '#6366f1' },
  'VIP': { label: 'VIP', icon: Crown, color: '#a855f7' },
  // Legacy support
  indoor: { label: 'داخلي', icon: Coffee, color: '#6366f1' },
  vip: { label: 'VIP', icon: Crown, color: '#a855f7' },
};

export default function TableCard({ table, activeOrder, onClick }: TableCardProps) {
  const statusConfig = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
  const areaConfig = AREA_CONFIG[table.area as keyof typeof AREA_CONFIG] || AREA_CONFIG.indoor;
  const AreaIcon = areaConfig.icon;

  const getTimeSinceOpened = () => {
    if (!table.reservedAt && !activeOrder?.createdAt) return null;
    
    const startTime = new Date(activeOrder?.createdAt || table.reservedAt || '').getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((now - startTime) / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} دقيقة`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}س ${mins}د`;
    }
  };

  const timeSinceOpened = getTimeSinceOpened();
  const itemsCount = activeOrder?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const isActive = table.status !== 'available';

  return (
    <div
      onClick={onClick}
      style={{
        background: statusConfig.cardBg,
        borderRadius: '16px',
        border: `2px solid ${statusConfig.borderColor}`,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 24px ${statusConfig.borderColor}30`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '4px 10px',
        borderRadius: '8px',
        backgroundColor: statusConfig.bgColor,
        border: `1px solid ${statusConfig.borderColor}`,
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: statusConfig.textColor,
        }}>
          {statusConfig.label}
        </span>
      </div>

      {/* Area Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
      }}>
        <AreaIcon style={{ width: '12px', height: '12px', color: areaConfig.color }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
          {areaConfig.label}
        </span>
      </div>

      {/* Table Number */}
      <div style={{
        marginTop: '36px',
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: isActive ? statusConfig.borderColor : '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
        }}>
          <span style={{
            fontSize: '24px',
            fontWeight: 800,
            color: isActive ? '#ffffff' : '#475569',
          }}>
            {table.tableNumber}
          </span>
        </div>
        <p style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#0f172a',
          margin: 0,
        }}>
          {table.name || `طاولة ${table.tableNumber}`}
        </p>
      </div>

      {/* Active Order Info */}
      {isActive && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px solid ${statusConfig.borderColor}40`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {/* Items & Time */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {itemsCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShoppingBag style={{ width: '14px', height: '14px', color: '#64748b' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    {itemsCount}
                  </span>
                </div>
              )}
              {timeSinceOpened && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{ width: '14px', height: '14px', color: '#64748b' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    {timeSinceOpened}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            {activeOrder && activeOrder.total > 0 && (
              <div style={{
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {activeOrder.total.toFixed(3)}
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginRight: '4px' }}>
                  ر.ع
                </span>
              </div>
            )}
          </div>

          {/* Reserved By */}
          {table.reservedBy && (
            <p style={{
              fontSize: '12px',
              color: '#dc2626',
              marginTop: '8px',
              textAlign: 'center',
            }}>
              محجوزة لـ: {table.reservedBy}
            </p>
          )}
        </div>
      )}
    </div>
  );
}



