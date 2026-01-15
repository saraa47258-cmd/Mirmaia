'use client';

import { useEffect, useState } from 'react';
import { getWorkers, createWorker, updateWorker, deleteWorker, Worker } from '@/lib/firebase/database';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const workersData = await getWorkers();
      setWorkers(workersData);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العامل؟')) return;
    try {
      await deleteWorker(workerId);
      await loadWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      alert('حدث خطأ في حذف العامل');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const workerData: Partial<Worker> = {
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      position: formData.get('position') as string,
      phone: formData.get('phone') as string || undefined,
      active: formData.get('active') === 'on',
      permissions: (formData.get('permissions') as 'full' | 'menu-only') || 'full',
      role: 'worker',
    };

    try {
      if (editingWorker) {
        await updateWorker(editingWorker.id, workerData);
      } else {
        await createWorker(workerData as Omit<Worker, 'id'>);
      }
      setShowModal(false);
      setEditingWorker(null);
      await loadWorkers();
    } catch (error) {
      console.error('Error saving worker:', error);
      alert('حدث خطأ في حفظ العامل');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">العمال</h1>
          <p className="text-gray-400">إدارة بيانات العمال</p>
        </div>
        <button
          onClick={() => {
            setEditingWorker(null);
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-orange-700 transition-all"
        >
          + إضافة عامل
        </button>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                  {worker.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{worker.name}</h3>
                  <p className="text-sm text-gray-400">{worker.position}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  worker.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {worker.active ? 'نشط' : 'غير نشط'}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>👤</span>
                <span>{worker.username}</span>
              </div>
              {worker.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>📱</span>
                  <span>{worker.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>🔐</span>
                <span>
                  {worker.permissions === 'full' ? 'صلاحيات كاملة' : 'منيو فقط'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingWorker(worker);
                  setShowModal(true);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(worker.id)}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {workers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">لا يوجد عمال</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingWorker ? 'تعديل عامل' : 'إضافة عامل جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">الاسم</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingWorker?.name}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  name="username"
                  defaultValue={editingWorker?.username}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  name="password"
                  defaultValue={editingWorker?.password}
                  required={!editingWorker}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {editingWorker && (
                  <p className="text-xs text-gray-500 mt-1">اتركه فارغاً للحفاظ على كلمة المرور الحالية</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">المنصب</label>
                <input
                  type="text"
                  name="position"
                  defaultValue={editingWorker?.position}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingWorker?.phone}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">الصلاحيات</label>
                <select
                  name="permissions"
                  defaultValue={editingWorker?.permissions || 'full'}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="full">صلاحيات كاملة</option>
                  <option value="menu-only">منيو فقط</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editingWorker?.active !== false}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                />
                <label className="text-sm text-gray-300">نشط</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-orange-700 transition-all"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingWorker(null);
                  }}
                  className="px-6 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

