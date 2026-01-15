import ProtectedRoute from '@/lib/components/ProtectedRoute';
import Sidebar from '@/lib/components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f1f5f9',
      }}>
        <Sidebar />
        <div style={{ marginRight: '260px' }}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
