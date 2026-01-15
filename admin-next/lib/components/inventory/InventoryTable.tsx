'use client';

import { useState, useMemo } from 'react';
import { InventoryProduct, getStockStatus, StockStatus } from '@/lib/inventory';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Plus,
  Minus,
  Edit,
  History,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  MoreVertical,
  Download
} from 'lucide-react';

interface InventoryTableProps {
  products: InventoryProduct[];
  categories: { id: string; name: string }[];
  loading?: boolean;
  onAddStock: (product: InventoryProduct) => void;
  onRemoveStock: (product: InventoryProduct) => void;
  onAdjustStock: (product: InventoryProduct) => void;
  onViewHistory: (product: InventoryProduct) => void;
  onExport: () => void;
}

type SortField = 'name' | 'stockQty' | 'price' | 'lastStockUpdate';
type SortOrder = 'asc' | 'desc';

export default function InventoryTable({
  products,
  categories,
  loading,
  onAddStock,
  onRemoveStock,
  onAdjustStock,
  onViewHistory,
  onExport,
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | StockStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const pageSize = 15;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search) ||
        p.barcode?.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(p => p.categoryId === filterCategory || p.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(p => getStockStatus(p) === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'ar');
          break;
        case 'stockQty':
          comparison = a.stockQty - b.stockQty;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'lastStockUpdate':
          comparison = (a.lastStockUpdate || '').localeCompare(b.lastStockUpdate || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [products, searchTerm, filterCategory, filterStatus, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'in_stock':
        return {
          label: 'متوفر',
          color: '#22c55e',
          bgColor: 'rgba(34, 197, 94, 0.1)',
          icon: CheckCircle,
        };
      case 'low_stock':
        return {
          label: 'منخفض',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          icon: AlertTriangle,
        };
      case 'out_of_stock':
        return {
          label: 'نفد',
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          icon: XCircle,
        };
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp style={{ width: '14px', height: '14px' }} /> :
      <ChevronDown style={{ width: '14px', height: '14px' }} />;
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ width: '200px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '8px' }} />
        </div>
        <div style={{ padding: '20px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '16px',
              padding: '16px 0',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '40%', height: '16px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '20%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{
          flex: '1 1 300px',
          position: 'relative',
        }}>
          <Search style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
            color: '#94a3b8',
          }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="بحث بالاسم أو SKU أو الباركود..."
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: '10px 32px 10px 12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">كل التصنيفات</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as any);
            setCurrentPage(1);
          }}
          style={{
            padding: '10px 32px 10px 12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">كل الحالات</option>
          <option value="in_stock">متوفر</option>
          <option value="low_stock">منخفض</option>
          <option value="out_of_stock">نفد</option>
        </select>

        {/* Export Button */}
        <button
          onClick={onExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          <Download style={{ width: '16px', height: '16px' }} />
          تصدير
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{
                padding: '14px 20px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                المنتج
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                التصنيف
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                SKU / الباركود
              </th>
              <th 
                onClick={() => handleSort('stockQty')}
                style={{
                  padding: '14px 16px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  الكمية
                  <SortIcon field="stockQty" />
                </span>
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                الحد الأدنى
              </th>
              <th 
                onClick={() => handleSort('price')}
                style={{
                  padding: '14px 16px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  السعر
                  <SortIcon field="price" />
                </span>
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                الحالة
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Package style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '4px' }}>
                    لا توجد منتجات
                  </p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                      ? 'جرب تغيير معايير البحث'
                      : 'لم يتم إضافة منتجات بعد'}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => {
                const status = getStockStatus(product);
                const badge = getStatusBadge(status);
                const StatusIcon = badge.icon;

                return (
                  <tr 
                    key={product.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Product */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          fontSize: '24px',
                        }}>
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            product.emoji || '📦'
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                            {product.name}
                          </p>
                          {product.nameEn && (
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>{product.nameEn}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#475569',
                      }}>
                        {categories.find(c => c.id === product.categoryId)?.name || product.category || '-'}
                      </span>
                    </td>

                    {/* SKU / Barcode */}
                    <td style={{ padding: '16px' }}>
                      <div>
                        {product.sku && (
                          <p style={{ fontSize: '13px', color: '#0f172a', fontFamily: 'monospace' }}>
                            {product.sku}
                          </p>
                        )}
                        {product.barcode && (
                          <p style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                            {product.barcode}
                          </p>
                        )}
                        {!product.sku && !product.barcode && (
                          <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                      </div>
                    </td>

                    {/* Stock Qty */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: status === 'out_of_stock' ? '#ef4444' : 
                               status === 'low_stock' ? '#f59e0b' : '#0f172a',
                      }}>
                        {product.stockQty}
                      </span>
                    </td>

                    {/* Min Stock */}
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        {product.minStock}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {product.price.toFixed(3)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '2px' }}>ر.ع</span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: badge.bgColor,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: badge.color,
                      }}>
                        <StatusIcon style={{ width: '14px', height: '14px' }} />
                        {badge.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === product.id ? null : product.id)}
                          style={{
                            padding: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#64748b',
                          }}
                        >
                          <MoreVertical style={{ width: '18px', height: '18px' }} />
                        </button>

                        {openActionMenu === product.id && (
                          <>
                            <div
                              onClick={() => setOpenActionMenu(null)}
                              style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 10,
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              backgroundColor: '#ffffff',
                              borderRadius: '12px',
                              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                              border: '1px solid #e2e8f0',
                              padding: '8px',
                              minWidth: '160px',
                              zIndex: 20,
                            }}>
                              <button
                                onClick={() => {
                                  onAddStock(product);
                                  setOpenActionMenu(null);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '10px 12px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  color: '#22c55e',
                                  cursor: 'pointer',
                                  textAlign: 'right',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <Plus style={{ width: '16px', height: '16px' }} />
                                إضافة مخزون
                              </button>
                              <button
                                onClick={() => {
                                  onRemoveStock(product);
                                  setOpenActionMenu(null);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '10px 12px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  textAlign: 'right',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <Minus style={{ width: '16px', height: '16px' }} />
                                سحب مخزون
                              </button>
                              <button
                                onClick={() => {
                                  onAdjustStock(product);
                                  setOpenActionMenu(null);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '10px 12px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  color: '#6366f1',
                                  cursor: 'pointer',
                                  textAlign: 'right',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <Edit style={{ width: '16px', height: '16px' }} />
                                تعديل الكمية
                              </button>
                              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />
                              <button
                                onClick={() => {
                                  onViewHistory(product);
                                  setOpenActionMenu(null);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '10px 12px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  color: '#475569',
                                  cursor: 'pointer',
                                  textAlign: 'right',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <History style={{ width: '16px', height: '16px' }} />
                                سجل الحركات
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            عرض {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredProducts.length)} من {filteredProducts.length}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                color: currentPage === 1 ? '#94a3b8' : '#475569',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#6366f1',
                border: '1px solid transparent',
                borderRadius: '8px',
                fontSize: '13px',
                color: currentPage === totalPages ? '#94a3b8' : '#ffffff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

