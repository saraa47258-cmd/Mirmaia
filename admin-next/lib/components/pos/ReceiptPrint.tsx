'use client';

import { CartItem } from '@/lib/pos';
import { Printer, X, FileText } from 'lucide-react';

interface ReceiptPrintProps {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  receivedAmount?: number;
  change?: number;
  customerName?: string;
  tableNumber?: string;
  roomNumber?: string;
  cashierName?: string;
  orderType: 'table' | 'room' | 'takeaway';
  onClose: () => void;
}

export default function ReceiptPrint({
  orderNumber,
  items,
  subtotal,
  discount,
  tax,
  total,
  paymentMethod,
  receivedAmount,
  change,
  customerName,
  tableNumber,
  roomNumber,
  cashierName,
  orderType,
  onClose,
}: ReceiptPrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getOrderTypeLabel = () => {
    switch (orderType) {
      case 'table': return `طاولة ${tableNumber}`;
      case 'room': return `غرفة ${roomNumber}`;
      case 'takeaway': return 'استلام';
      default: return '';
    }
  };

  // Generate text receipt for Notepad printing
  const generateTextReceipt = () => {
    const line = '='.repeat(40);
    const dash = '-'.repeat(40);
    
    let text = `
${line}
           Mirmaia
         MIRMAIA
${line}

رقم الطلب: #${orderNumber}
التاريخ: ${dateStr}
الوقت: ${timeStr}
نوع الطلب: ${getOrderTypeLabel()}
${customerName ? `العميل: ${customerName}` : ''}
${cashierName ? `الكاشير: ${cashierName}` : ''}

${dash}
الأصناف:
${dash}
`;

    items.forEach((item) => {
      const name = item.variationName ? `${item.name} (${item.variationName})` : item.name;
      text += `${name}\n`;
      text += `  ${item.quantity} x ${item.unitPrice.toFixed(3)} = ${item.lineTotal.toFixed(3)}\n`;
      if (item.note) {
        text += `  ملاحظة: ${item.note}\n`;
      }
    });

    text += `
${dash}
المجموع الفرعي:     ${subtotal.toFixed(3)} ر.ع
${discount > 0 ? `الخصم:              -${discount.toFixed(3)} ر.ع\n` : ''}${tax > 0 ? `الضريبة:            ${tax.toFixed(3)} ر.ع\n` : ''}${line}
الإجمالي:           ${total.toFixed(3)} ر.ع
${line}

طريقة الدفع: ${paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}
${paymentMethod === 'cash' && receivedAmount ? `المبلغ المستلم: ${receivedAmount.toFixed(3)} ر.ع` : ''}
${paymentMethod === 'cash' && change && change > 0 ? `الباقي: ${change.toFixed(3)} ر.ع` : ''}

${line}
    شكراً لزيارتكم
   نتمنى لكم يوماً سعيداً
${line}
`;

    return text.trim();
  };

  // Print using Notepad style (text-based)
  const handleNotePadPrint = () => {
    const receiptText = generateTextReceipt();
    
    // Open new window with text content
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>فاتورة #${orderNumber}</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              padding: 10px;
              white-space: pre-wrap;
              direction: ltr;
              text-align: left;
            }
            @media print {
              body { margin: 0; padding: 5mm; }
            }
          </style>
        </head>
        <body>${receiptText}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Auto print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100,
        }}
        className="no-print"
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '380px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        zIndex: 101,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Modal Header - Hidden in print */}
        <div 
          className="no-print"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            معاينة الفاتورة
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Receipt Content */}
        <div 
          id="receipt-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 4px 0',
            }}>
              ☕ Mirmaia
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              شكراً لزيارتكم
            </p>
          </div>

          {/* Divider */}
          <div style={{
            borderTop: '2px dashed #e2e8f0',
            margin: '16px 0',
          }} />

          {/* Order Info */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>رقم الطلب:</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#6366f1' }}>
                #{orderNumber}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>التاريخ:</span>
              <span style={{ fontSize: '12px', color: '#0f172a' }}>{dateStr}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>الوقت:</span>
              <span style={{ fontSize: '12px', color: '#0f172a' }}>{timeStr}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>نوع الطلب:</span>
              <span style={{ fontSize: '12px', color: '#0f172a' }}>{getOrderTypeLabel()}</span>
            </div>
            {customerName && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>العميل:</span>
                <span style={{ fontSize: '12px', color: '#0f172a' }}>{customerName}</span>
              </div>
            )}
            {cashierName && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>الكاشير:</span>
                <span style={{ fontSize: '12px', color: '#0f172a' }}>{cashierName}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            margin: '16px 0',
          }} />

          {/* Items */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748b',
            }}>
              <span>الصنف</span>
              <span>المجموع</span>
            </div>
            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px',
                  paddingBottom: '10px',
                  borderBottom: index < items.length - 1 ? '1px dashed #f1f5f9' : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: 0 }}>
                    {item.name}
                    {item.variationName && (
                      <span style={{ color: '#6366f1' }}> ({item.variationName})</span>
                    )}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                    {item.quantity} × {item.unitPrice.toFixed(3)}
                  </p>
                  {item.note && (
                    <p style={{ fontSize: '10px', color: '#f59e0b', margin: '2px 0 0 0' }}>
                      📝 {item.note}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {item.lineTotal.toFixed(3)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            margin: '16px 0',
          }} />

          {/* Totals */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>المجموع الفرعي</span>
              <span style={{ fontSize: '13px', color: '#0f172a' }}>{subtotal.toFixed(3)}</span>
            </div>
            {discount > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '13px', color: '#dc2626' }}>الخصم</span>
                <span style={{ fontSize: '13px', color: '#dc2626' }}>-{discount.toFixed(3)}</span>
              </div>
            )}
            {tax > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>الضريبة</span>
                <span style={{ fontSize: '13px', color: '#0f172a' }}>{tax.toFixed(3)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '2px solid #0f172a',
              marginTop: '8px',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>الإجمالي</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a' }}>
                {total.toFixed(3)} ر.ع
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>طريقة الدفع</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                {paymentMethod === 'cash' ? '💵 نقدي' : '💳 بطاقة'}
              </span>
            </div>
            {paymentMethod === 'cash' && receivedAmount && (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>المبلغ المستلم</span>
                  <span style={{ fontSize: '12px', color: '#0f172a' }}>{receivedAmount.toFixed(3)}</span>
                </div>
                {change && change > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>الباقي</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>
                      {change.toFixed(3)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
              شكراً لزيارتكم - نتمنى لكم يوماً سعيداً
            </p>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
              mirmaia-33acc.web.app
            </p>
          </div>
        </div>

        {/* Print Button - Hidden in print */}
        <div 
          className="no-print"
          style={{
            padding: '16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Row 1: Print buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleNotePadPrint}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <FileText style={{ width: '16px', height: '16px' }} />
              طباعة نصية
            </button>
            <button
              onClick={handlePrint}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <Printer style={{ width: '16px', height: '16px' }} />
              طباعة رسومية
            </button>
          </div>
          
          {/* Row 2: Close button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
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
            إغلاق
          </button>
        </div>
      </div>
    </>
  );
}





