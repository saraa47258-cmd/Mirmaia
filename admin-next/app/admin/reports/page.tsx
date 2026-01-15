'use client';

import { useEffect, useState } from 'react';
import { getSalesStats, getOrders, Order } from '@/lib/firebase/database';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    paidOrders: 0,
    itemsSold: 0,
    averageOrder: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topProducts, setTopProducts] = useState<Array<{ name: string; quantity: number; revenue: number }>>([]);

  useEffect(() => {
    loadStats();
  }, [dateRange, startDate, endDate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      let start: Date | undefined;
      let end: Date | undefined;

      const now = new Date();
      switch (dateRange) {
        case 'today':
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date();
          break;
        case 'week':
          start = new Date(now.setDate(now.getDate() - 7));
          end = new Date();
          break;
        case 'month':
          start = new Date(now.setMonth(now.getMonth() - 1));
          end = new Date();
          break;
        case 'year':
          start = new Date(now.setFullYear(now.getFullYear() - 1));
          end = new Date();
          break;
        case 'custom':
          if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
          }
          break;
      }

      const salesData = await getSalesStats(start, end);
      setStats(salesData);

      // Calculate top products
      const orders = await getOrders();
      let filteredOrders = orders.filter((o) => o.status !== 'cancelled');
      
      if (start && end) {
        const startTime = start.getTime();
        const endTime = end.getTime();
        filteredOrders = filteredOrders.filter((order) => {
          const orderTime = order.timestamp || (order.createdAt ? new Date(order.createdAt).getTime() : 0);
          return orderTime >= startTime && orderTime <= endTime;
        });
      }

      const productMap = new Map<string, { quantity: number; revenue: number }>();
      filteredOrders.forEach((order) => {
        order.items.forEach((item) => {
          const existing = productMap.get(item.name) || { quantity: 0, revenue: 0 };
          productMap.set(item.name, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + (item.price * item.quantity),
          });
        });
      });

      const topProductsList = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setTopProducts(topProductsList);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">التقارير والإحصائيات</h1>
        <p className="text-gray-400">تحليل الأداء والمبيعات</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-gray-300">الفترة:</span>
          {(['today', 'week', 'month', 'year', 'custom'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                dateRange === range
                  ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {range === 'today' && 'اليوم'}
              {range === 'week' && 'أسبوع'}
              {range === 'month' && 'شهر'}
              {range === 'year' && 'سنة'}
              {range === 'custom' && 'مخصص'}
            </button>
          ))}
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {stats.totalRevenue.toFixed(3)} <span className="text-sm text-gray-400">ر.ع</span>
          </p>
          <p className="text-sm text-gray-400">إجمالي الإيرادات</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl">
              🛒
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{stats.ordersCount}</p>
          <p className="text-sm text-gray-400">إجمالي الطلبات</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{stats.paidOrders}</p>
          <p className="text-sm text-gray-400">الطلبات المدفوعة</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {stats.averageOrder.toFixed(3)} <span className="text-sm text-gray-400">ر.ع</span>
          </p>
          <p className="text-sm text-gray-400">متوسط قيمة الطلب</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">أكثر المنتجات مبيعاً</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">المنتج</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">الكمية المباعة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">إجمالي المبيعات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-white">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{product.quantity}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-400">
                      {product.revenue.toFixed(3)} ر.ع
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

