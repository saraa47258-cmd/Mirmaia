'use client';

import { useEffect, useState, useCallback } from 'react';
import { getProducts, getCategories, createOrder, listenToOrder, Product, Category, OrderItem, ProductVariation } from '@/lib/firebase/database';
import { getCurrentUser } from '@/lib/auth';
import Topbar from '@/lib/components/Topbar';
import CategoryTabs from '@/lib/components/menu/CategoryTabs';
import ProductCard from '@/lib/components/menu/ProductCard';
import ProductModal from '@/lib/components/menu/ProductModal';
import SearchBar from '@/lib/components/menu/SearchBar';
import CartSidebar, { CartItem } from '@/lib/components/menu/CartSidebar';
import OrderSuccess from '@/lib/components/menu/OrderSuccess';
import VariationSelector from '@/lib/components/menu/VariationSelector';
import { ShoppingCart, Coffee, Package } from 'lucide-react';

export default function StaffMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Variation selector
  const [variationProduct, setVariationProduct] = useState<Product | null>(null);
  
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

  // Generate cart item ID (unique for product + variation combo)
  const generateCartItemId = (productId: string, variationId?: string) => {
    return variationId ? `${productId}_${variationId}` : productId;
  };

  // Cart functions
  const getCartItem = (productId: string, variationId?: string) => {
    const cartItemId = generateCartItemId(productId, variationId);
    return cart.find(item => item.cartItemId === cartItemId);
  };

  const getQuantity = (productId: string) => {
    // Get total quantity for a product (all variations)
    return cart
      .filter(item => item.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getNote = (productId: string) => {
    const item = cart.find(item => item.product.id === productId);
    return item?.note || '';
  };

  // Add to cart (with optional variation)
  const addToCart = useCallback((product: Product, variation?: ProductVariation, notes?: string) => {
    const cartItemId = generateCartItemId(product.id, variation?.id);
    
    setCart((prev) => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1, note: notes || item.note }
            : item
        );
      }
      return [...prev, { 
        product, 
        quantity: 1, 
        cartItemId,
        variation,
        note: notes,
      }];
    });
  }, []);

  // Handle product click - open variation selector if has variations
  const handleSelectVariation = useCallback((product: Product) => {
    setVariationProduct(product);
  }, []);

  // Handle add from variation selector
  const handleAddWithVariation = useCallback((product: Product, variation: ProductVariation, notes?: string) => {
    addToCart(product, variation, notes);
    setVariationProduct(null);
  }, [addToCart]);

  const incrementItem = useCallback((cartItemId: string) => {
    setCart((prev) =>
      prev.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  const decrementItem = useCallback((cartItemId: string) => {
    setCart((prev) => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing && existing.quantity <= 1) {
        return prev.filter(item => item.cartItemId !== cartItemId);
      }
      return prev.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter(item => item.cartItemId !== cartItemId));
  }, []);

  const updateNote = useCallback((cartItemId: string, note: string) => {
    setCart((prev) =>
      prev.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, note }
          : item
      )
    );
  }, []);

  // Calculate cart total with variations
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.variation ? item.variation.price : item.product.price;
    return sum + (price * item.quantity);
  }, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit order
  const submitOrder = async () => {
    if (cart.length === 0 || !tableNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = cart.map(item => {
        const price = item.variation ? item.variation.price : item.product.price;
        return {
          id: item.product.id,
          name: item.product.name,
          price: price,
          quantity: item.quantity,
          itemTotal: price * item.quantity,
          emoji: item.product.emoji,
          notes: item.note,
          variation: item.variation ? {
            id: item.variation.id,
            name: item.variation.name,
            price: item.variation.price,
          } : undefined,
        };
      });

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
                onAddToCart={(p) => addToCart(p)}
                onIncrement={(p) => {
                  // Find first cart item for this product
                  const item = cart.find(i => i.product.id === p.id);
                  if (item) incrementItem(item.cartItemId);
                }}
                onDecrement={(p) => {
                  // Find first cart item for this product
                  const item = cart.find(i => i.product.id === p.id);
                  if (item) decrementItem(item.cartItemId);
                }}
                onSelectVariation={handleSelectVariation}
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
          onAddToCart={(p, v, n) => {
            addToCart(p, v, n);
            setSelectedProduct(null);
          }}
          onIncrement={(p) => {
            const item = cart.find(i => i.product.id === p.id);
            if (item) incrementItem(item.cartItemId);
          }}
          onDecrement={(p) => {
            const item = cart.find(i => i.product.id === p.id);
            if (item) decrementItem(item.cartItemId);
          }}
          onNoteChange={(id, note) => {
            const item = cart.find(i => i.product.id === id);
            if (item) updateNote(item.cartItemId, note);
          }}
        />
      )}

      {/* Variation Selector */}
      {variationProduct && (
        <VariationSelector
          product={variationProduct}
          onClose={() => setVariationProduct(null)}
          onAddToCart={handleAddWithVariation}
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
