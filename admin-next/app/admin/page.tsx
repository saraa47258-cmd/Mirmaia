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
  ShoppingBag,
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

      // Generate chart data (last 7 days)
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
    },
    {
      title: 'الطلبات اليوم',
      value: stats.ordersCount.toString(),
      unit: 'طلب',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
    },
    {
      title: 'المنتجات النشطة',
      value: stats.productsCount.toString(),
      unit: 'منتج',
      change: '0%',
      trend: 'neutral',
      icon: Package,
    },
    {
      title: 'الطلبات المدفوعة',
      value: stats.paidOrders.toString(),
      unit: 'طلب',
      change: '+5.1%',
      trend: 'up',
      icon: Users,
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      pending: { label: 'معلق', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      processing: { label: 'قيد التنفيذ', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      preparing: { label: 'قيد التحضير', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      ready: { label: 'جاهز', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
      paid: { label: 'مدفوع', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      completed: { label: 'مكتمل', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      cancelled: { label: 'ملغي', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
    };
    return configs[status] || { label: status, className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
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
      <Topbar title="لوحة التحكم" subtitle="نظرة عامة على الأداء" />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-5 hover:border-gray-700/60 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-medium ${
                    kpi.trend === 'up' ? 'text-emerald-400' : 
                    kpi.trend === 'down' ? 'text-red-400' : 'text-gray-500'
                  }`}>
                    {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                    {kpi.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                    <span>{kpi.change}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold text-white tracking-tight">{kpi.value}</span>
                    <span className="text-[12px] text-gray-500">{kpi.unit}</span>
                  </div>
                  <p className="text-[12px] text-gray-500">{kpi.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue Chart */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[14px] font-semibold text-white">الإيرادات</h3>
                <p className="text-[12px] text-gray-500">آخر 7 أيام</p>
              </div>
              <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#635bff" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#635bff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#525252" 
                  tick={{ fill: '#737373', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#525252" 
                  tick={{ fill: '#737373', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#a3a3a3' }}
                  itemStyle={{ color: '#fafafa' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#635bff"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[14px] font-semibold text-white">الطلبات</h3>
                <p className="text-[12px] text-gray-500">آخر 7 أيام</p>
              </div>
              <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#525252" 
                  tick={{ fill: '#737373', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#525252" 
                  tick={{ fill: '#737373', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#a3a3a3' }}
                  itemStyle={{ color: '#fafafa' }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#635bff" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800/60 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-white">آخر الطلبات</h3>
              <p className="text-[12px] text-gray-500">آخر 5 طلبات</p>
            </div>
            <a 
              href="/admin/orders" 
              className="flex items-center gap-1 text-[12px] text-accent hover:text-accent-light transition-colors"
            >
              عرض الكل
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/60">
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    رقم الطلب
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    المبلغ
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    الوقت
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
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
                      <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3.5 text-[13px] font-medium text-white">
                          #{order.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-300">
                          {order.customerName || order.tableNumber || 'غير محدد'}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-white">
                          {order.total.toFixed(3)} ر.ع
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${statusConfig.className}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
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
