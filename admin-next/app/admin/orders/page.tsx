'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, Order } from '@/lib/firebase/database';
import Topbar from '@/lib/components/Topbar';
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Download } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const allOrders = await getOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.tableNumber?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const sortedOrders = filteredOrders.sort((a, b) => {
    const timeA = a.timestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const timeB = b.timestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return timeB - timeA;
  });

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'pending', label: 'معلق' },
    { value: 'processing', label: 'قيد التنفيذ' },
    { value: 'preparing', label: 'قيد التحضير' },
    { value: 'ready', label: 'جاهز' },
    { value: 'paid', label: 'مدفوع' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
  ];

  // Stats
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter((o) => o.status === 'pending').length,
    completed: filteredOrders.filter((o) => o.status === 'completed' || o.status === 'paid').length,
    revenue: filteredOrders
      .filter((o) => o.status === 'paid' || o.status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0),
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
      <Topbar title="الطلبات" subtitle="إدارة ومتابعة جميع الطلبات" />

      <div className="p-6 space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg px-4 py-3">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">إجمالي الطلبات</p>
            <p className="text-xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg px-4 py-3">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">المعلقة</p>
            <p className="text-xl font-semibold text-amber-400">{stats.pending}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg px-4 py-3">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">المكتملة</p>
            <p className="text-xl font-semibold text-emerald-400">{stats.completed}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg px-4 py-3">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">إجمالي المبيعات</p>
            <p className="text-xl font-semibold text-white">{stats.revenue.toFixed(3)} <span className="text-[12px] text-gray-500">ر.ع</span></p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
              placeholder="ابحث عن طلب..."
              className="w-full pr-10 pl-4 py-2 bg-gray-900/50 border border-gray-800/60 rounded-lg text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-gray-700 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setCurrentPage(1);
              }}
              className="pr-10 pl-8 py-2 bg-gray-900/50 border border-gray-800/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-700 appearance-none cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800/60 rounded-lg text-[13px] text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>تصدير</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/60 bg-gray-900/50">
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    رقم الطلب
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    المنتجات
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    المبلغ
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[13px] text-gray-500">
                      لا توجد طلبات
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3.5 text-[13px] font-medium text-white">
                          #{order.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-300">
                          {order.customerName || order.tableNumber || 'غير محدد'}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-400">
                          <div className="max-w-[200px]">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="truncate">
                                {item.quantity}× {item.name}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-[11px] text-gray-500">
                                +{order.items.length - 2} منتج آخر
                              </span>
                            )}
                          </div>
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
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="px-2.5 py-1 bg-gray-800/80 border border-gray-700/60 rounded text-[12px] text-white focus:outline-none focus:border-gray-600 transition-colors"
                          >
                            <option value="pending">معلق</option>
                            <option value="processing">قيد التنفيذ</option>
                            <option value="preparing">قيد التحضير</option>
                            <option value="ready">جاهز</option>
                            <option value="paid">مدفوع</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-800/60 flex items-center justify-between bg-gray-900/30">
              <div className="text-[12px] text-gray-500">
                عرض {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedOrders.length)} من {sortedOrders.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 bg-gray-800/60 border border-gray-700/60 rounded text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700/60 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded text-[12px] font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-accent text-white'
                          : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-white border border-gray-700/60'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 bg-gray-800/60 border border-gray-700/60 rounded text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700/60 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
