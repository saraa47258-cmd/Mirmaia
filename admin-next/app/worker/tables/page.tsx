'use client';

import { useEffect, useState } from 'react';
import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';
import { getTables, Table } from '@/lib/firebase/database';
import Link from 'next/link';

export default function WorkerTablesPage() {
  const { canAccessModule } = useWorkerAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canAccessModule('tables')) {
      return;
    }
    loadTables();
  }, [canAccessModule]);

  const loadTables = async () => {
    try {
      const tablesData = await getTables();
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canAccessModule('tables')) {
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
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>الطاولات</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      <div style={{ padding: '0 20px 20px' }}>
        {tables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            لا توجد طاولات
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '16px',
          }}>
            {tables.map(table => (
              <div
                key={table.id}
                style={{
                  background: table.status === 'available' ? 'white' : '#fee2e2',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🪑</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 'bold' }}>
                  {table.tableNumber || `طاولة ${table.id}`}
                </h3>
                <div style={{
                  padding: '4px 12px',
                  background: table.status === 'available' ? '#d1fae5' : '#fee2e2',
                  color: table.status === 'available' ? '#10b981' : '#ef4444',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block',
                }}>
                  {table.status === 'available' ? 'متاحة' : 'مشغولة'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
