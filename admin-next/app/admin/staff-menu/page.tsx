'use client';

import { useEffect, useState, useCallback } from 'react';
import { getProducts, getCategories, createOrder, listenToOrder, Product, Category, OrderItem } from '@/lib/firebase/database';
import { getCurrentUser } from '@/lib/auth';
import Topbar from '@/lib/components/Topbar';
import CategoryTabs from '@/lib/components/menu/CategoryTabs';
import ProductCard from '@/lib/components/menu/ProductCard';
import ProductModal from '@/lib/components/menu/ProductModal';
import SearchBar from '@/lib/components/menu/SearchBar';
import CartSidebar, { CartItem } from '@/lib/components/menu/CartSidebar';
import OrderSuccess from '@/lib/components/menu/OrderSuccess';
import { ShoppingCart, Coffee, Package } from 'lucide-react';

export default function StaffMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Order success state
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; status: string } | null>(null);

  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  // Listen to order status changes
  useEffect(() => {
    if (!orderSuccess?.orderId) return;
    
    const unsubscribe = listenToOrder(orderSuccess.orderId, (order) => {
      if (order) {
        setOrderSuccess((prev) => prev ? { ...prev, status: order.status } : null);
      }
    });

    return () => unsubscribe();
  }, [orderSuccess?.orderId]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData.filter(p => p.active));
      setCategories(categoriesData.filter(c => c.active !== false));
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (activeCategory !== 'all' && product.category !== activeCategory) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  // Cart functions
  const getCartItem = (productId: string) => {
    return cart.find(item => item.product.id === productId);
  };

  const getQuantity = (productId: string) => {
    return getCartItem(productId)?.quantity || 0;
  };

  const getNote = (productId: string) => {
    return getCartItem(productId)?.note || '';
  };

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const incrementItem = useCallback((product: Product) => {
    setCart((prev) =>
      prev.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  const decrementItem = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing && existing.quantity <= 1) {
        return prev.filter(item => item.product.id !== product.id);
      }
      return prev.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateNote = useCallback((productId: string, note: string) => {
    setCart((prev) =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, note }
          : item
      )
    );
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit order
  const submitOrder = async () => {
    if (cart.length === 0 || !tableNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        itemTotal: item.product.price * item.quantity,
        emoji: item.product.emoji,
        note: item.note,
      }));

      const orderId = await createOrder({
        items: orderItems,
        total: cartTotal,
        subtotal: cartTotal,
        status: 'pending',
        tableNumber: tableNumber.trim(),
        workerId: user?.id,
        workerName: user?.name,
        source: 'staff-menu',
        itemsCount: cartItemsCount,
        restaurantId: '',
        createdAt: '',
      });

      // Clear cart and show success
      setCart([]);
      setTableNumber('');
      setCartOpen(false);
      setOrderSuccess({ orderId: orderId.slice(-6).toUpperCase(), status: 'pending' });
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ في إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s infinite',
          }}>
            <Coffee style={{ width: '28px', height: '28px', color: '#ffffff' }} />
          </div>
          <p style={{ fontSize: '14px', color: '#64748b' }}>جاري تحميل المنيو...</p>
        </div>
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <Topbar title="منيو الموظفين" subtitle="إضافة طلبات جديدة" />

      <div style={{ padding: '24px' }}>
        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="ابحث عن منتج..."
          />
        </div>

        {/* Categories */}
        <div style={{ marginBottom: '24px' }}>
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Products Count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#64748b',
          }}>
            <Package style={{ width: '18px', height: '18px' }} />
            <span>{filteredProducts.length} منتج</span>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              borderRadius: '16px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package style={{ width: '28px', height: '28px', color: '#94a3b8' }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              لا توجد منتجات
            </p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              جرب البحث بكلمة أخرى أو اختر تصنيف مختلف
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
                isStaffMode={true}
                quantity={getQuantity(product.id)}
                onAddToCart={addToCart}
                onIncrement={incrementItem}
                onDecrement={decrementItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '16px',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            zIndex: 80,
          }}
        >
          <div style={{ position: 'relative' }}>
            <ShoppingCart style={{ width: '24px', height: '24px' }} />
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '20px',
              height: '20px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              {cartItemsCount}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>الإجمالي</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{cartTotal.toFixed(3)} ر.ع</div>
          </div>
        </button>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          category={getCategory(selectedProduct.category)}
          onClose={() => setSelectedProduct(null)}
          isStaffMode={true}
          quantity={getQuantity(selectedProduct.id)}
          note={getNote(selectedProduct.id)}
          onAddToCart={addToCart}
          onIncrement={incrementItem}
          onDecrement={decrementItem}
          onNoteChange={updateNote}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        items={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onIncrement={incrementItem}
        onDecrement={decrementItem}
        onRemove={removeItem}
        onNoteChange={updateNote}
        onSubmit={submitOrder}
        tableNumber={tableNumber}
        onTableChange={setTableNumber}
        isSubmitting={isSubmitting}
      />

      {/* Order Success Modal */}
      {orderSuccess && (
        <OrderSuccess
          orderNumber={orderSuccess.orderId}
          status={orderSuccess.status}
          onClose={() => setOrderSuccess(null)}
        />
      )}
    </div>
  );
}

