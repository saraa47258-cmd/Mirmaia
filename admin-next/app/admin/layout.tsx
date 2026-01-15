import ProtectedRoute from '@/lib/components/ProtectedRoute';
import Sidebar from '@/lib/components/Sidebar';
import Topbar from '@/lib/components/Topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-gray-900">
        <Sidebar />
        <div className="flex-1 mr-64">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

