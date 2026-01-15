'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Product, Category, Table, Room, Order, ProductVariation } from '@/lib/firebase/database';
import { 
  CartItem, 
  POSOrder, 
  getPOSProducts, 
  getPOSCategories, 
  getAvailableTables, 
  getAvailableRooms,
  createPOSOrder,
  payAndCloseOrder,
  getTodayPendingOrders,
  calculateTotals
} from '@/lib/pos';
import ProductGrid from '@/lib/components/pos/ProductGrid';
import CartPanel from '@/lib/components/pos/CartPanel';
import PaymentPanel from '@/lib/components/pos/PaymentPanel';
import VariationModal from '@/lib/components/pos/VariationModal';
import ReceiptPrint from '@/lib/components/pos/ReceiptPrint';
import { 
  RefreshCw, 
  ClipboardList, 
  Clock, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

export default function CashierPage() {
  const { user } = useAuth();
  
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, tablesData, roomsData, ordersData] = await Promise.all([
        getPOSProducts(),
        getPOSCategories(),
        getAvailableTables(),
        getAvailableRooms(),
        getTodayPendingOrders(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setTables(tablesData);
      setRooms(roomsData);
      setPendingOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('خطأ في تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedProduct) {
          setSelectedProduct(null);
        } else if (receiptData) {
          setReceiptData(null);
        } else if (cart.length > 0) {
          setShowClearConfirm(true);
        }
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="ابحث"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, receiptData, cart]);

  // Toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check if product has variations
  const hasVariations = (product: Product): boolean => {
    return !!(product.variations && product.variations.length > 0) ||
           !!(product.sizes && Object.keys(product.sizes).length > 0) ||
           !!(product.shishaTypes && Object.keys(product.shishaTypes).length > 0);
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    if (hasVariations(product)) {
      setSelectedProduct(product);
    } else {
      // Add directly to cart
      addToCart(product, null, 1, '');
    }
  };

  // Add to cart
  const addToCart = (
    product: Product,
    variation: ProductVariation | null,
    quantity: number,
    note: string
  ) => {
    const price = variation ? variation.price : (product.price || product.basePrice || 0);
    const cartItemId = `${product.id}_${variation?.id || 'default'}_${Date.now()}`;
    
    const newItem: CartItem = {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      emoji: product.emoji,
      variationId: variation?.id,
      variationName: variation?.name,
      unitPrice: price,
      quantity,
      note: note || undefined,
      lineTotal: price * quantity,
    };
    
    setCart(prev => [...prev, newItem]);
    showToast(`تم إضافة ${product.name}`, 'success');
  };

  // Update cart item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity, lineTotal: item.unitPrice * quantity };
      }
      return item;
    }));
  };

  // Remove item from cart
  const removeItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Update item note
  const updateNote = (itemId: string, note: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, note: note || undefined };
      }
      return item;
    }));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setShowClearConfirm(false);
    showToast('تم مسح السلة', 'success');
  };

  // Place order (without payment)
  const handlePlaceOrder = async (order: POSOrder) => {
    if (!user) {
      showToast('يجب تسجيل الدخول', 'error');
      return;
    }

    setProcessing(true);
    try {
      const orderId = await createPOSOrder(order, user.id, user.name);
      showToast(`تم إنشاء الطلب #${orderId.slice(-6).toUpperCase()}`, 'success');
      setCart([]);
      await loadData(); // Refresh tables/rooms
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('خطأ في إنشاء الطلب', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Pay and close order
  const handlePayNow = async (
    order: POSOrder,
    paymentMethod: 'cash' | 'card',
    receivedAmount: number
  ) => {
    if (!user) {
      showToast('يجب تسجيل الدخول', 'error');
      return;
    }

    setProcessing(true);
    try {
      // Create order first
      const orderId = await createPOSOrder(order, user.id, user.name);
      
      // Then pay
      const change = paymentMethod === 'cash' ? Math.max(0, receivedAmount - order.total) : 0;
      await payAndCloseOrder(
        orderId,
        { method: paymentMethod, receivedAmount, change },
        user.id,
        user.name
      );

      // Show receipt
      setReceiptData({
        orderNumber: orderId.slice(-6).toUpperCase(),
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount.amount,
        tax: order.tax.amount,
        total: order.total,
        paymentMethod,
        receivedAmount,
        change,
        customerName: order.customerName,
        tableNumber: order.tableNumber,
        roomNumber: order.roomNumber,
        cashierName: user.name,
        orderType: order.orderType,
      });

      setCart([]);
      showToast('تم الدفع بنجاح', 'success');
      await loadData();
    } catch (error) {
      console.error('Error processing payment:', error);
      showToast('خطأ في معالجة الدفع', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f1f5f9',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ fontSize: '16px', color: '#64748b' }}>جاري تحميل الكاشير...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      backgroundColor: '#f1f5f9',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            الكاشير
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            نقطة البيع - {user?.name || 'مستخدم'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowPendingOrders(!showPendingOrders)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: showPendingOrders ? '#6366f1' : '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: showPendingOrders ? '#ffffff' : '#475569',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <ClipboardList style={{ width: '18px', height: '18px' }} />
            الطلبات المعلقة
            {pendingOrders.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                left: '-6px',
                width: '20px',
                height: '20px',
                backgroundColor: '#dc2626',
                borderRadius: '50%',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: '18px', height: '18px' }} />
            تحديث
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: showPendingOrders ? '280px 1fr 340px 320px' : '1fr 340px 320px',
        gap: '16px',
        padding: '16px 24px',
        overflow: 'hidden',
      }}>
        {/* Pending Orders Panel */}
        {showPendingOrders && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#fef3c7',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#92400e',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Clock style={{ width: '18px', height: '18px' }} />
                الطلبات المعلقة ({pendingOrders.length})
              </h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {pendingOrders.length === 0 ? (
                <p style={{
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '13px',
                  padding: '24px',
                }}>
                  لا توجد طلبات معلقة
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#6366f1',
                        }}>
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: '#fef3c7',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#f59e0b',
                        }}>
                          {order.status === 'pending' ? 'معلق' : 'قيد التحضير'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#64748b',
                      }}>
                        <span>{order.itemsCount || order.items?.length} عناصر</span>
                        <span style={{ fontWeight: 600, color: '#16a34a' }}>
                          {order.total.toFixed(3)} ر.ع
                        </span>
                      </div>
                      {(order.tableNumber || order.roomNumber) && (
                        <p style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          marginTop: '6px',
                        }}>
                          {order.tableNumber ? `طاولة ${order.tableNumber}` : `غرفة ${order.roomNumber}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <ProductGrid
          products={products}
          categories={categories}
          onProductClick={handleProductClick}
        />

        {/* Cart Panel */}
        <CartPanel
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onUpdateNote={updateNote}
          onClearCart={() => setShowClearConfirm(true)}
        />

        {/* Payment Panel */}
        <PaymentPanel
          items={cart}
          tables={tables}
          rooms={rooms}
          onPlaceOrder={handlePlaceOrder}
          onPayNow={handlePayNow}
          loading={processing}
        />
      </div>

      {/* Variation Modal */}
      {selectedProduct && (
        <VariationModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Receipt Modal */}
      {receiptData && (
        <ReceiptPrint
          {...receiptData}
          onClose={() => setReceiptData(null)}
        />
      )}

      {/* Clear Cart Confirmation */}
      {showClearConfirm && (
        <>
          <div
            onClick={() => setShowClearConfirm(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 100,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            zIndex: 101,
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <AlertCircle style={{ width: '28px', height: '28px', color: '#f59e0b' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              مسح السلة؟
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              سيتم حذف جميع العناصر من السلة. هل أنت متأكد؟
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={clearCart}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                نعم، امسح
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 24px',
          backgroundColor: toast.type === 'success' ? '#16a34a' : '#dc2626',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 200,
          animation: 'slideUp 0.3s ease-out',
        }}>
          {toast.type === 'success' ? (
            <CheckCircle style={{ width: '20px', height: '20px', color: '#ffffff' }} />
          ) : (
            <AlertCircle style={{ width: '20px', height: '20px', color: '#ffffff' }} />
          )}
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
            {toast.message}
          </span>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

