'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, Order } from '@/lib/firebase/database';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
      alert('حدث خطأ في تحديث حالة الطلب');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.tableNumber?.toLowerCase().includes(searchLower) ||
        order.items.some((item) => item.name.toLowerCase().includes(searchLower))
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: 'معلق', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      processing: { text: 'قيد المعالجة', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      preparing: { text: 'قيد التحضير', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      ready: { text: 'جاهز', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
      paid: { text: 'مدفوع', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      completed: { text: 'مكتمل', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      cancelled: { text: 'ملغي', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
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
        <h1 className="text-3xl font-bold text-white mb-2">الطلبات</h1>
        <p className="text-gray-400">إدارة ومتابعة جميع الطلبات</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">البحث</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="ابحث عن طلب..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">الحالة</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">معلق</option>
              <option value="processing">قيد المعالجة</option>
              <option value="preparing">قيد التحضير</option>
              <option value="ready">جاهز</option>
              <option value="paid">مدفوع</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">إجمالي الطلبات</p>
          <p className="text-2xl font-bold text-white">{filteredOrders.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">المعلقة</p>
          <p className="text-2xl font-bold text-yellow-400">
            {filteredOrders.filter((o) => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">المكتملة</p>
          <p className="text-2xl font-bold text-green-400">
            {filteredOrders.filter((o) => o.status === 'completed' || o.status === 'paid').length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">إجمالي المبيعات</p>
          <p className="text-2xl font-bold text-purple-400">
            {filteredOrders
              .filter((o) => o.status === 'paid' || o.status === 'completed')
              .reduce((sum, o) => sum + (o.total || 0), 0)
              .toFixed(3)}{' '}
            ر.ع
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">رقم الطلب</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">العميل/الطاولة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">المنتجات</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">الوقت</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    لا توجد طلبات
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {order.customerName || order.tableNumber || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="max-w-xs">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="truncate">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-gray-500">+{order.items.length - 2} أكثر</div>
                        )}
                      </div>
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
                            day: '2-digit',
                            month: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="pending">معلق</option>
                        <option value="processing">قيد المعالجة</option>
                        <option value="preparing">قيد التحضير</option>
                        <option value="ready">جاهز</option>
                        <option value="paid">مدفوع</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              صفحة {currentPage} من {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                السابق
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

