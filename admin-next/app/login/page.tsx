'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/auth';
import { Coffee, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      await loginAdmin(username, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 mb-4">
            <Coffee className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-1">قهوة الشام</h1>
          <p className="text-[13px] text-gray-500">تسجيل الدخول إلى لوحة التحكم</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[13px]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-gray-400 mb-1.5">
                اسم المستخدم
              </label>
              <input
                type="text"
                name="username"
                required
                autoComplete="username"
                className="w-full px-3.5 py-2.5 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[14px] text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-400 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pl-10 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[14px] text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[14px] font-medium transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-gray-600 mt-6">
          © 2026 قهوة الشام. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
