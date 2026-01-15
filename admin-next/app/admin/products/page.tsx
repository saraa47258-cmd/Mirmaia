'use client';

import { useEffect, useState } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, Product, Category } from '@/lib/firebase/database';
import Topbar from '@/lib/components/Topbar';
import { Plus, Search, Edit2, Trash2, X, MoreHorizontal } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await deleteProduct(productId);
      await loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData: Partial<Product> = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      description: formData.get('description') as string || undefined,
      active: formData.get('active') === 'on',
      emoji: formData.get('emoji') as string || '☕',
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData as Omit<Product, 'id'>);
      }
      setShowModal(false);
      setEditingProduct(null);
      await loadData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filterCategory !== 'all' && product.category !== filterCategory) return false;
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
      <Topbar title="المنتجات" subtitle="إدارة قائمة المنتجات" />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full sm:w-64 pr-10 pl-4 py-2 bg-gray-900/50 border border-gray-800/60 rounded-lg text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-gray-700"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-900/50 border border-gray-800/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-700 appearance-none"
            >
              <option value="all">جميع التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-[13px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/60 bg-gray-900/50">
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    التصنيف
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    السعر
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[13px] text-gray-500">
                      لا توجد منتجات
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center text-lg">
                            {product.emoji || '☕'}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-white">{product.name}</p>
                            {product.description && (
                              <p className="text-[11px] text-gray-500 max-w-xs truncate">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-400">
                        {categories.find((c) => c.id === product.category)?.name || product.category}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-white">
                        {product.price.toFixed(3)} ر.ع
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                          product.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {product.active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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
            setEditingProduct(null);
          }}
        >
          <div 
            className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-modal animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-[15px] font-semibold text-white">
                {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">اسم المنتج</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProduct?.name}
                    required
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">السعر (ر.ع)</label>
                  <input
                    type="number"
                    name="price"
                    step="0.001"
                    defaultValue={editingProduct?.price}
                    required
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">الأيقونة</label>
                  <input
                    type="text"
                    name="emoji"
                    defaultValue={editingProduct?.emoji || '☕'}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">التصنيف</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category}
                    required
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] font-medium text-gray-400 mb-1.5">الوصف</label>
                  <textarea
                    name="description"
                    defaultValue={editingProduct?.description}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/60 rounded-lg text-[13px] text-white focus:outline-none focus:border-gray-600 resize-none"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    id="active"
                    defaultChecked={editingProduct?.active !== false}
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
                    setEditingProduct(null);
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
