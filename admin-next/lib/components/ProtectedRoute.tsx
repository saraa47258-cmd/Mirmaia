'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth, getCurrentUser, User } from '../auth';

export default function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuth();
      
      if (!authResult.isAuthenticated || !authResult.user) {
        router.push('/login');
        return;
      }
      
      if (requireAdmin && authResult.user.role !== 'admin') {
        router.push('/login');
        return;
      }
      
      setUser(authResult.user);
      setLoading(false);
    };
    
    verifyAuth();
  }, [router, requireAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

