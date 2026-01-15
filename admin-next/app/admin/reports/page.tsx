'use client';

import { useEffect, useState } from 'react';
import { getSalesStats } from '@/lib/firebase/database';
import Topbar from '@/lib/components/Topbar';
import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag, Package } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');

  // Mock data for demonstration
  const revenueData = [
    { date: 'السبت', revenue: 45, orders: 12 },
    { date: 'الأحد', revenue: 52, orders: 15 },
    { date: 'الاثنين', revenue: 38, orders: 10 },
    { date: 'الثلاثاء', revenue: 65, orders: 18 },
    { date: 'الأربعاء', revenue: 48, orders: 14 },
    { date: 'الخميس', revenue: 72, orders: 22 },
    { date: 'الجمعة', revenue: 85, orders: 28 },
  ];

  const categoryData = [
    { name: 'مشروبات ساخنة', value: 35, color: '#635bff' },
    { name: 'مشروبات باردة', value: 25, color: '#22c55e' },
    { name: 'شيشة', value: 20, color: '#f59e0b' },
    { name: 'حلويات', value: 12, color: '#ec4899' },
    { name: 'أخرى', value: 8, color: '#6b7280' },
  ];

  const topProducts = [
    { name: 'قهوة عربية', sales: 145, revenue: 72.5 },
    { name: 'شيشة تفاحتين', sales: 98, revenue: 245 },
    { name: 'لاتيه', sales: 87, revenue: 130.5 },
    { name: 'شاي أحمر', sales: 76, revenue: 38 },
    { name: 'عصير برتقال', sales: 65, revenue: 65 },
  ];

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      await getSalesStats();
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-[13px] text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Topbar title="التقارير" subtitle="تحليلات وإحصائيات المبيعات" />

      <div className="p-6 space-y-5">
        {/* Date Range Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {['today', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-accent text-white'
                    : 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-800/60'
                }`}
              >
                {range === 'today' && 'اليوم'}
                {range === 'week' && 'أسبوع'}
                {range === 'month' && 'شهر'}
                {range === 'year' && 'سنة'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800/60 rounded-lg text-[13px] text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">الإيرادات</span>
            </div>
            <p className="text-xl font-semibold text-white">405.000 <span className="text-[12px] text-gray-500">ر.ع</span></p>
            <p className="text-[11px] text-emerald-400 mt-1">+12.5% من الفترة السابقة</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">الطلبات</span>
            </div>
            <p className="text-xl font-semibold text-white">119</p>
            <p className="text-[11px] text-emerald-400 mt-1">+8.2% من الفترة السابقة</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">متوسط الطلب</span>
            </div>
            <p className="text-xl font-semibold text-white">3.400 <span className="text-[12px] text-gray-500">ر.ع</span></p>
            <p className="text-[11px] text-gray-500 mt-1">ثابت</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">الأصناف</span>
            </div>
            <p className="text-xl font-semibold text-white">471</p>
            <p className="text-[11px] text-emerald-400 mt-1">+15.3% من الفترة السابقة</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue Chart */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-white mb-4">الإيرادات اليومية</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#635bff" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#635bff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" stroke="#525252" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#635bff" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-white mb-4">توزيع المبيعات حسب التصنيف</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-[11px] text-gray-400">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800/60">
            <h3 className="text-[14px] font-semibold text-white">أفضل المنتجات مبيعاً</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/60 bg-gray-900/30">
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase">#</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase">المنتج</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase">المبيعات</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase">الإيرادات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {topProducts.map((product, idx) => (
                <tr key={product.name} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3 text-[13px] text-gray-500">{idx + 1}</td>
                  <td className="px-5 py-3 text-[13px] font-medium text-white">{product.name}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-400">{product.sales} وحدة</td>
                  <td className="px-5 py-3 text-[13px] font-medium text-emerald-400">{product.revenue.toFixed(3)} ر.ع</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
