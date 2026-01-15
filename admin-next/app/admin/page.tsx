'use client';

import { useEffect, useState } from 'react';
import { getTodayOrders, getSalesStats, getProducts } from '@/lib/firebase/database';
import { Order, Product } from '@/lib/firebase/database';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    paidOrders: 0,
    itemsSold: 0,
    productsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [todayOrders, salesData, products] = await Promise.all([
          getTodayOrders(),
          getSalesStats(),
          getProducts(),
        ]);

        const paidOrders = todayOrders.filter(
          (o) => o.status === 'paid' || o.status === 'completed'
        );
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const itemsSold = todayOrders.reduce(
          (sum, o) => sum + (o.itemsCount || o.items?.length || 0),
          0
        );

        setStats({
          totalRevenue,
          ordersCount: todayOrders.length,
          paidOrders: paidOrders.length,
          itemsSold,
          productsCount: products.filter((p) => p.active).length,
        });

        setRecentOrders(
          todayOrders
            .sort((a, b) => {
              const timeA = a.timestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
              const timeB = b.timestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
              return timeB - timeA;
            })
            .slice(0, 10)
        );
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const statCards = [
    {
      title: 'مبيعات اليوم',
      value: stats.totalRevenue.toFixed(3),
      unit: 'ر.ع',
      icon: '💰',
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'طلبات اليوم',
      value: stats.ordersCount,
      unit: 'طلب',
      icon: '🛒',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'المنتجات',
      value: stats.productsCount,
      unit: 'منتج',
      icon: '☕',
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'أصناف مباعة',
      value: stats.itemsSold,
      unit: 'صنف',
      icon: '📦',
      color: 'from-orange-500 to-red-600',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: 'معلق', color: 'bg-yellow-500/20 text-yellow-400' },
      processing: { text: 'قيد المعالجة', color: 'bg-blue-500/20 text-blue-400' },
      preparing: { text: 'قيد التحضير', color: 'bg-orange-500/20 text-orange-400' },
      ready: { text: 'جاهز', color: 'bg-cyan-500/20 text-cyan-400' },
      paid: { text: 'مدفوع', color: 'bg-green-500/20 text-green-400' },
      completed: { text: 'مكتمل', color: 'bg-green-500/20 text-green-400' },
      cancelled: { text: 'ملغي', color: 'bg-red-500/20 text-red-400' },
    };
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-500/20 text-gray-400' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
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
        <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم</h1>
        <p className="text-gray-400">نظرة عامة على الأداء والمبيعات</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-white">
                {stat.value} <span className="text-sm text-gray-400">{stat.unit}</span>
              </p>
            </div>
            <p className="text-sm text-gray-400">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">آخر الطلبات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">رقم الطلب</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    لا توجد طلبات
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {order.customerName || order.tableNumber || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-400">
                      {order.total.toFixed(3)} ر.ع
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
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

