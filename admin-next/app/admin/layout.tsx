import ProtectedRoute from '@/lib/components/ProtectedRoute';
import Sidebar from '@/lib/components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="mr-[260px]">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
