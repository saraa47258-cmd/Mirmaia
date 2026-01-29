'use client';

import { useEffect, useState } from 'react';
import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';
import { getProducts, getCategories, Product } from '@/lib/firebase/database';
import Link from 'next/link';

const formatPrice = (price: number | undefined, hideFinancial: boolean = false): string => {
  if (hideFinancial) return '---';
  if (!price) return '0.000 ر.ع';
  return `${price.toFixed(3)} ر.ع`;
};

export default function WorkerProductsPage() {
  const { canAccessModule, shouldHideFinancialData } = useWorkerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (!canAccessModule('products')) {
      return;
    }
    loadData();
  }, [canAccessModule]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData.filter(p => p.active !== false && p.isActive !== false));
      setCategories(categoriesData.filter(c => c.active !== false && c.isActive !== false));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canAccessModule('products')) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
          <h2>ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>جاري التحميل...</div>
      </div>
    );
  }

  const filteredProducts = products.filter((product) => {
    if (activeCategory !== 'all' && product.category !== activeCategory && product.categoryId !== activeCategory) {
      return false;
    }
    return true;
  });

  const hideFinancial = shouldHideFinancialData();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{
        background: 'white',
        padding: '16px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/worker" style={{ textDecoration: 'none', color: '#6366f1', fontWeight: '600' }}>
            ← رجوع
          </Link>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>المنتجات</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      <div style={{ padding: '0 20px 16px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '8px 16px',
              background: activeCategory === 'all' ? '#6366f1' : 'white',
              color: activeCategory === 'all' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            الكل
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 16px',
                background: activeCategory === cat.id ? '#6366f1' : 'white',
                color: activeCategory === cat.id ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            لا توجد منتجات
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '16px',
          }}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: '100%',
                  height: '120px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                }}>
                  {product.emoji || '📦'}
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600' }}>
                  {product.name}
                </h3>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>
                  {formatPrice(product.price, hideFinancial)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
