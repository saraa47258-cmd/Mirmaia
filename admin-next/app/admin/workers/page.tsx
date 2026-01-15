'use client';

import { useEffect, useState } from 'react';
import { getWorkers, createWorker, updateWorker, deleteWorker, Worker } from '@/lib/firebase/database';
import Topbar from '@/lib/components/Topbar';
import { Plus, Edit2, Trash2, X, User, Phone, Shield, Check } from 'lucide-react';

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
      <Topbar title="العمال" subtitle="إدارة بيانات العمال" />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-[13px] text-gray-500">
            {workers.length} عامل • {workers.filter(w => w.active).length} نشط
          </div>
          <button
            onClick={() => {
              setEditingWorker(null);
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-[13px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة عامل
          </button>
        </div>

        {/* Workers Table */}
        <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/60 bg-gray-900/50">
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    العامل
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    المنصب
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    الهاتف
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    الصلاحيات
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {workers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[13px] text-gray-500">
                      لا يوجد عمال
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center text-[12px] font-semibold text-gray-300">
                            {worker.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-white">{worker.name}</p>
                            <p className="text-[11px] text-gray-500">@{worker.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-400">
                        {worker.position}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-400">
                        {worker.phone || '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                          worker.permissions === 'full'
                            ? 'bg-accent/10 text-accent border-accent/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {worker.permissions === 'full' ? 'كاملة' : 'منيو فقط'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                          worker.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {worker.active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingWorker(worker);
                              setShowModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(worker.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => {
            setShowModal(false);
            setEditingWorker(null);
          }}
        >
          <div 
            className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-modal animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-[15px] font-semibold text-white">
                {editingWorker ? 'تعديل عامل' : 'إضافة عامل جديد'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingWorker(null);
                }}
                className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">الاسم</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingWorker?.name}
                    required
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">اسم المستخدم</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={editingWorker?.username}
                    required
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">كلمة المرور</label>
                  <input
                    type="password"
                    name="password"
                    defaultValue={editingWorker?.password}
                    required={!editingWorker}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">المنصب</label>
                  <input
                    type="text"
                    name="position"
                    defaultValue={editingWorker?.position}
                    required
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingWorker?.phone}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">الصلاحيات</label>
                  <select
                    name="permissions"
                    defaultValue={editingWorker?.permissions || 'full'}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  >
                    <option value="full">صلاحيات كاملة</option>
                    <option value="menu-only">منيو فقط</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    id="active"
                    defaultChecked={editingWorker?.active !== false}
                    className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-accent focus:ring-accent"
                  />
                  <label htmlFor="active" className="text-[13px] text-gray-300">نشط</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-[13px] font-medium transition-colors"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingWorker(null);
                  }}
                  className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 rounded-lg text-[13px] font-medium transition-colors"
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
