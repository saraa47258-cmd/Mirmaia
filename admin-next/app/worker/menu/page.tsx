'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkerAuth } from '@/lib/context/WorkerAuthContext';
import {
  getProducts,
  getCategories,
  getTables,
  createOrder,
  Product,
  Category,
  Table,
} from '@/lib/firebase/database';
import { RESTAURANT_ID } from '@/lib/firebase/config';
import CategoryTabs from '@/lib/components/menu/CategoryTabs';
import ProductCard from '@/lib/components/menu/ProductCard';
import ProductModal from '@/lib/components/menu/ProductModal';
import SearchBar from '@/lib/components/menu/SearchBar';
import CartSidebar, { CartItem } from '@/lib/components/menu/CartSidebar';
import { Package, ShoppingCart, CheckCircle } from 'lucide-react';

export default function WorkerMenuPage() {
  const router = useRouter();
  const { worker, loading: authLoading, canAccessModule } = useWorkerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !worker) {
      router.replace('/worker/login');
      return;
    }
    if (!authLoading && worker && !canAccessModule('staff-menu')) {
      router.replace('/worker');
      return;
    }
  }, [authLoading, worker, canAccessModule, router]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, tablesData] = await Promise.all([
        getProducts(),
        getCategories(),
        getTables(),
      ]);
      const activeProducts = productsData.filter(
        (p) => p.active !== false && p.isActive !== false
      );
      const activeCategories = categoriesData.filter(
        (c) => c.active !== false && c.isActive !== false
      );
      setProducts(activeProducts);
      setCategories(activeCategories);
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading menu:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (
      activeCategory !== 'all' &&
      product.category !== activeCategory &&
      product.categoryId !== activeCategory
    ) {
      return false;
    }
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.nameEn?.toLowerCase().includes(searchLower) ||
        product.descriptionEn?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getCategory = (categoryId: string) => {
    if (!categoryId) return undefined;
    return categories.find((c) => c.id === categoryId);
  };

  const addToCart = (product: Product, variation?: any, note?: string) => {
    const cartItemId = variation ? `${product.id}-${variation.id}` : product.id;
    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          variation,
          cartItemId,
          ...(note && { note }),
        },
      ];
    });
    setSelectedProduct(null);
  };

  const incrementItem = (cartItemId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementItem = (cartItemId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.cartItemId === cartItemId);
      if (item && item.quantity > 1) {
        return prev.map((i) =>
          i.cartItemId === cartItemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      return prev.filter((i) => i.cartItemId !== cartItemId);
    });
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateNote = (cartItemId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, note } : item
      )
    );
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || !tableNumber.trim()) return;
    setIsSubmitting(true);
    try {
      const items = cart.map((item) => ({
        id: item.product.id,
        name: item.variation
          ? `${item.product.name} - ${item.variation.name}`
          : item.product.name,
        price: item.variation ? item.variation.price : item.product.price,
        quantity: item.quantity,
        itemTotal:
          item.quantity *
          (item.variation ? item.variation.price : item.product.price),
        emoji: item.product.emoji,
        note: item.note,
      }));
      const total = items.reduce((sum, item) => sum + item.itemTotal, 0);
      await createOrder({
        items,
        total,
        status: 'pending',
        tableNumber: tableNumber.trim(),
        orderType: 'table',
        source: 'staff-menu',
        restaurantId: RESTAURANT_ID,
        createdAt: new Date().toISOString(),
      });
      setCart([]);
      setTableNumber('');
      setIsCartOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ في إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (authLoading || !worker) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
        }}
      >
        <p style={{ color: '#64748b' }}>جاري التحميل...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package style={{ width: 28, height: 28, color: '#fff' }} />
          </div>
          <p style={{ fontSize: 14, color: '#64748b' }}>جاري تحميل المنيو...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Header - نفس منطق الأدمن بدون Topbar */}
      <header
        style={{
          background: '#ffffff',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          marginBottom: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            href="/worker"
            style={{
              textDecoration: 'none',
              color: '#6366f1',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            ← رجوع
          </Link>
          <h1
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            منيو الموظفين
          </h1>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background:
                cartItemsCount > 0
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  : '#e2e8f0',
              color: cartItemsCount > 0 ? '#fff' : '#64748b',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <ShoppingCart style={{ width: 20, height: 20 }} />
            {cartItemsCount > 0 && `(${cartItemsCount})`}
          </button>
        </div>
      </header>

      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            top: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 24px',
            backgroundColor: '#16a34a',
            color: '#fff',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 200,
            boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)',
          }}
        >
          <CheckCircle style={{ width: 22, height: 22 }} />
          <span style={{ fontWeight: 600 }}>تم إرسال الطلب بنجاح!</span>
        </div>
      )}

      <div style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 20 }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="ابحث عن منتج..."
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            fontSize: 14,
            color: '#64748b',
          }}
        >
          <Package style={{ width: 18, height: 18 }} />
          <span>{filteredProducts.length} منتج</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 16px',
                borderRadius: 16,
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package style={{ width: 28, height: 28, color: '#94a3b8' }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              لا توجد منتجات
            </p>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>
              جرب البحث بكلمة أخرى أو اختر تصنيف مختلف
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
              paddingBottom: 100,
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
                isStaffMode
                onAddToCart={() => addToCart(product)}
                onSelectVariation={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setIsCartOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
          zIndex: 50,
        }}
      >
        <ShoppingCart style={{ width: 28, height: 28, color: '#fff' }} />
        {cartItemsCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 26,
              height: 26,
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
            }}
          >
            {cartItemsCount}
          </span>
        )}
      </button>

      <CartSidebar
        items={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onIncrement={incrementItem}
        onDecrement={decrementItem}
        onRemove={removeItem}
        onNoteChange={updateNote}
        onSubmit={handleSubmitOrder}
        tableNumber={tableNumber}
        onTableChange={setTableNumber}
        isSubmitting={isSubmitting}
      />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          category={getCategory(
            selectedProduct.categoryId || selectedProduct.category
          )}
          onClose={() => setSelectedProduct(null)}
          isStaffMode
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}
