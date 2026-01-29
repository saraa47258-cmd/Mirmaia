'use client';

import { useEffect, useState } from 'react';
import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';
import { getRooms, Room } from '@/lib/firebase/database';
import Link from 'next/link';

const formatPrice = (price: number | undefined, hideFinancial: boolean = false): string => {
  if (hideFinancial) return '---';
  if (!price) return '0.000 ر.ع';
  return `${price.toFixed(3)} ر.ع`;
};

export default function WorkerRoomsPage() {
  const { canAccessModule, shouldHideFinancialData } = useWorkerAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canAccessModule('rooms')) {
      return;
    }
    loadRooms();
  }, [canAccessModule]);

  const loadRooms = async () => {
    try {
      const roomsData = await getRooms();
      setRooms(roomsData.filter(r => r.isActive !== false));
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canAccessModule('rooms')) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
          <h2>ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>جاري التحميل...</div>
      </div>
    );
  }

  const hideFinancial = shouldHideFinancialData();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{
        background: 'white',
        padding: '16px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/worker" style={{ textDecoration: 'none', color: '#6366f1', fontWeight: '600' }}>
            ← رجوع
          </Link>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>الغرف</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      <div style={{ padding: '0 20px 20px' }}>
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            لا توجد غرف
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {rooms.map(room => (
              <div
                key={room.id}
                style={{
                  background: room.status === 'available' ? 'white' : '#fee2e2',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center' }}>🚪</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
                  {room.roomNumber || `غرفة ${room.id}`}
                </h3>
                <div style={{
                  padding: '4px 12px',
                  background: room.status === 'available' ? '#d1fae5' : '#fee2e2',
                  color: room.status === 'available' ? '#10b981' : '#ef4444',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '8px',
                }}>
                  {room.status === 'available' ? 'متاحة' : 'مشغولة'}
                </div>
                {room.price && (
                  <p style={{ margin: '8px 0 0', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                    {formatPrice(room.price, hideFinancial)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
