import ProtectedRoute from '@/lib/components/ProtectedRoute';
import Sidebar from '@/lib/components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-950">
        <Sidebar />
        <div className="mr-[240px]">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
