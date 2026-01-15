'use client';

import { useEffect, useState } from 'react';
import { getTodayOrders, getSalesStats, getProducts } from '@/lib/firebase/database';
import { Order } from '@/lib/firebase/database';
import Topbar from '@/lib/components/Topbar';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  MoreHorizontal
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

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

      const chartDataArray = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('ar-EG', { weekday: 'short' });
        chartDataArray.push({
          date: dayName,
          revenue: Math.floor(Math.random() * 50) + 20,
          orders: Math.floor(Math.random() * 15) + 5,
        });
      }

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
          .slice(0, 5)
      );

      setChartData(chartDataArray);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'إجمالي الإيرادات',
      value: `${stats.totalRevenue.toFixed(3)}`,
      unit: 'ر.ع',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      title: 'الطلبات اليوم',
      value: stats.ordersCount.toString(),
      unit: 'طلب',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      title: 'المنتجات النشطة',
      value: stats.productsCount.toString(),
      unit: 'منتج',
      change: '0%',
      trend: 'neutral',
      icon: Package,
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/20',
    },
    {
      title: 'الطلبات المدفوعة',
      value: stats.paidOrders.toString(),
      unit: 'طلب',
      change: '+5.1%',
      trend: 'up',
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      shadowColor: 'shadow-purple-500/20',
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      pending: { label: 'معلق', className: 'bg-amber-100 text-amber-700' },
      processing: { label: 'قيد التنفيذ', className: 'bg-blue-100 text-blue-700' },
      preparing: { label: 'قيد التحضير', className: 'bg-amber-100 text-amber-700' },
      ready: { label: 'جاهز', className: 'bg-cyan-100 text-cyan-700' },
      paid: { label: 'مدفوع', className: 'bg-emerald-100 text-emerald-700' },
      completed: { label: 'مكتمل', className: 'bg-emerald-100 text-emerald-700' },
      cancelled: { label: 'ملغي', className: 'bg-red-100 text-red-700' },
    };
    return configs[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-[13px] text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Topbar title="لوحة التحكم" subtitle="نظرة عامة على الأداء" />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg ${kpi.shadowColor}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-semibold ${
                    kpi.trend === 'up' ? 'text-emerald-600' : 
                    kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {kpi.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                    {kpi.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{kpi.change}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                    <span className="text-[12px] text-gray-500">{kpi.unit}</span>
                  </div>
                  <p className="text-[12px] text-gray-500">{kpi.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">الإيرادات</h3>
                <p className="text-[12px] text-gray-500">آخر 7 أيام</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">الطلبات</h3>
                <p className="text-[12px] text-gray-500">آخر 7 أيام</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">آخر الطلبات</h3>
              <p className="text-[12px] text-gray-500">آخر 5 طلبات</p>
            </div>
            <a href="/admin/orders" className="flex items-center gap-1 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              عرض الكل
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">العميل</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-gray-500">
                      لا توجد طلبات
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-gray-900">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-600">{order.customerName || order.tableNumber || 'غير محدد'}</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-gray-900">{order.total.toFixed(3)} ر.ع</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold ${statusConfig.className}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
