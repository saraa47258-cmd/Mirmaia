'use client';

import { useState, useMemo, useEffect } from 'react';
import { Product, Category } from '@/lib/firebase/database';
import { Search, Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onProductClick: (product: Product) => void;
}

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export default function ProductGrid({ products, categories, onProductClick }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (activeCategory !== 'all') {
        const productCat = product.categoryId || product.category;
        if (productCat !== activeCategory) return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const nameEnMatch = product.nameEn?.toLowerCase().includes(searchLower);
        if (!nameMatch && !nameEnMatch) return false;
      }
      
      return true;
    });
  }, [products, activeCategory, searchTerm]);

  const hasVariations = (product: Product): boolean => {
    return !!(product.variations && product.variations.length > 0) ||
           !!(product.sizes && Object.keys(product.sizes).length > 0) ||
           !!(product.shishaTypes && Object.keys(product.shishaTypes).length > 0);
  };

  const getDisplayPrice = (product: Product): string => {
    if (hasVariations(product)) {
      // Get minimum price from variations
      let minPrice = product.price || product.basePrice || 0;
      
      if (product.variations && product.variations.length > 0) {
        const prices = product.variations
          .filter(v => v.isActive !== false)
          .map(v => v.price);
        if (prices.length > 0) {
          minPrice = Math.min(...prices);
        }
      }
      
      return `من ${minPrice.toFixed(3)}`;
    }
    return `${(product.price || product.basePrice || 0).toFixed(3)}`;
  };

  // Responsive sizing
  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? 'auto' : '100%',
      minHeight: isMobile ? 'calc(100vh - 200px)' : undefined,
      backgroundColor: '#ffffff',
      borderRadius: isMobile ? '12px' : '16px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
    }}>
      {/* Search Bar */}
      <div style={{
        padding: isMobile ? '12px' : '16px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: isMobile ? '0 12px' : '0 14px',
          height: isMobile ? '42px' : '48px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: isMobile ? '10px' : '12px',
        }}>
          <Search style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن منتج..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: isMobile ? '14px' : '15px',
              color: '#0f172a',
              backgroundColor: 'transparent',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                padding: '4px 8px',
                backgroundColor: '#e2e8f0',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        padding: isMobile ? '10px 12px' : '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px' }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: isMobile ? '8px 14px' : '10px 18px',
              borderRadius: isMobile ? '8px' : '10px',
              border: 'none',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: activeCategory === 'all' ? '#6366f1' : '#f1f5f9',
              color: activeCategory === 'all' ? '#ffffff' : '#475569',
              transition: 'all 0.15s',
            }}
          >
            الكل
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: isMobile ? '8px 14px' : '10px 18px',
                borderRadius: isMobile ? '8px' : '10px',
                border: 'none',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: activeCategory === category.id ? '#6366f1' : '#f1f5f9',
                color: activeCategory === category.id ? '#ffffff' : '#475569',
                transition: 'all 0.15s',
              }}
            >
              {category.icon || category.emoji}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{
        flex: 1,
        padding: isMobile ? '12px' : '16px',
        overflowY: 'auto',
      }}>
        {filteredProducts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '40px 16px' : '60px 20px',
            textAlign: 'center',
          }}>
            <Package style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', color: '#cbd5e1', marginBottom: '16px' }} />
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#64748b', marginBottom: '4px' }}>
              لا توجد منتجات
            </p>
            <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#94a3b8' }}>
              {searchTerm ? 'جرب كلمة بحث مختلفة' : 'اختر تصنيف آخر'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? 'repeat(auto-fill, minmax(100px, 1fr))' 
              : isTablet 
                ? 'repeat(auto-fill, minmax(110px, 1fr))'
                : 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: isMobile ? '8px' : '12px',
          }}>
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onProductClick(product)}
                style={{
                  padding: isMobile ? '12px 8px' : '16px 12px',
                  backgroundColor: '#f8fafc',
                  border: '2px solid transparent',
                  borderRadius: isMobile ? '10px' : '14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isMobile ? '6px' : '8px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#eef2ff';
                  e.currentTarget.style.borderColor = '#6366f1';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Product Image/Emoji */}
                <div style={{
                  width: isMobile ? '44px' : '56px',
                  height: isMobile ? '44px' : '56px',
                  borderRadius: isMobile ? '10px' : '12px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '22px' : '28px',
                  overflow: 'hidden',
                }}>
                  {product.imageUrl || product.image ? (
                    <img
                      src={product.imageUrl || product.image}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    product.emoji || '📦'
                  )}
                </div>

                {/* Product Name */}
                <p style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  margin: 0,
                  lineHeight: 1.3,
                  maxHeight: '2.6em',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {product.name}
                </p>

                {/* Price */}
                <div style={{
                  padding: '4px 10px',
                  backgroundColor: hasVariations(product) ? '#fef3c7' : '#dcfce7',
                  borderRadius: '8px',
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: hasVariations(product) ? '#92400e' : '#16a34a',
                  }}>
                    {getDisplayPrice(product)}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: hasVariations(product) ? '#92400e' : '#16a34a',
                    marginRight: '2px',
                  }}>
                    ر.ع
                  </span>
                </div>

                {/* Variations indicator */}
                {hasVariations(product) && (
                  <span style={{
                    fontSize: '10px',
                    color: '#f59e0b',
                    fontWeight: 500,
                  }}>
                    متعدد الخيارات
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}





