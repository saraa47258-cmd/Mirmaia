'use client';

import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';
import Link from 'next/link';

export default function WorkerReportsPage() {
  const { canAccessModule } = useWorkerAuth();

  if (!canAccessModule('reports')) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
          <h2>ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        </div>
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
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>التقارير</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 'bold' }}>
          التقارير
        </h2>
        <p>قريباً...</p>
      </div>
    </div>
  );
}
