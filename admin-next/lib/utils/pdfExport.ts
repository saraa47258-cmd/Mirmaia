import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportStats, DailyStats, TopProduct, DailyClosing } from '../reports';

const formatNumber = (num: number, decimals: number = 3) => {
  return num.toFixed(decimals);
};

interface ExportReportOptions {
  stats: ReportStats;
  dailyStats: DailyStats[];
  topProducts: TopProduct[];
  closings: DailyClosing[];
  dateRange: { start: Date; end: Date };
  restaurantName?: string;
}

export const exportReportToPDF = async (options: ExportReportOptions) => {
  const {
    stats,
    dailyStats,
    topProducts,
    closings,
    dateRange,
    restaurantName = 'Sham Coffee',
  } = options;

  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 20;

  // Helper to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };

  // ========== HEADER ==========
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(restaurantName, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Sales Report', pageWidth / 2, 32, { align: 'center' });
  
  // Date range
  doc.setFontSize(11);
  const startDate = dateRange.start.toLocaleDateString('en-GB');
  const endDate = dateRange.end.toLocaleDateString('en-GB');
  doc.text(`Period: ${startDate} - ${endDate}`, pageWidth / 2, 40, { align: 'center' });

  currentY = 60;

  // ========== SUMMARY SECTION ==========
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales Summary', 15, currentY);
  currentY += 10;

  // Summary Cards (as table)
  autoTable(doc, {
    startY: currentY,
    head: [['Metric', 'Value']],
    body: [
      ['Total Sales', `${formatNumber(stats.totalSales)} OMR`],
      ['Total Orders', `${stats.totalOrders}`],
      ['Average Order Value', `${formatNumber(stats.averageOrderValue)} OMR`],
      ['Cash Sales', `${formatNumber(stats.cashSales)} OMR`],
      ['Card Sales', `${formatNumber(stats.cardSales)} OMR`],
      ['Paid Orders', `${stats.paidOrders}`],
      ['Unpaid Orders', `${stats.unpaidOrders}`],
      ['Table Orders', `${stats.tableOrders}`],
      ['Room Orders', `${stats.roomOrders}`],
      ['Takeaway Orders', `${stats.takeawayOrders}`],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 11,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 90 },
      1: { halign: 'right', cellWidth: 70, fontStyle: 'bold' },
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    margin: { left: 15, right: 15 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;

  // ========== DAILY STATS ==========
  checkNewPage(60);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Daily Sales', 15, currentY);
  currentY += 10;

  if (dailyStats.length > 0) {
    // Show last 15 days max
    const recentStats = dailyStats.slice(-15);
    
    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Total Sales', 'Orders', 'Average Order']],
      body: recentStats.map(day => [
        day.date,
        `${formatNumber(day.totalSales)} OMR`,
        `${day.totalOrders}`,
        `${formatNumber(day.averageOrder)} OMR`,
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 40 },
        1: { halign: 'right', cellWidth: 45 },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 45 },
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      margin: { left: 15, right: 15 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No daily data available', 15, currentY);
    currentY += 15;
  }

  // ========== TOP PRODUCTS ==========
  checkNewPage(60);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Top Selling Products', 15, currentY);
  currentY += 10;

  if (topProducts.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Rank', 'Product Name', 'Quantity Sold', 'Revenue']],
      body: topProducts.slice(0, 10).map((product, index) => [
        `#${index + 1}`,
        product.nameEn || `Product ${index + 1}`,
        `${product.quantity}`,
        `${formatNumber(product.revenue)} OMR`,
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'left', cellWidth: 80 },
        2: { halign: 'center', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 40 },
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      margin: { left: 15, right: 15 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No product data available', 15, currentY);
    currentY += 15;
  }

  // ========== DAILY CLOSINGS ==========
  checkNewPage(60);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Daily Closings', 15, currentY);
  currentY += 10;

  if (closings.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Total Sales', 'Cash', 'Card', 'Difference']],
      body: closings.slice(0, 10).map(closing => [
        closing.date,
        `${formatNumber(closing.totalSales)} OMR`,
        `${formatNumber(closing.cashSales)} OMR`,
        `${formatNumber(closing.cardSales)} OMR`,
        `${formatNumber(closing.difference || 0)} OMR`,
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 35 },
        1: { halign: 'right', cellWidth: 35 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 30 },
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      margin: { left: 15, right: 15 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No closing data available', 15, currentY);
  }

  // ========== FOOTER ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    doc.text(
      restaurantName,
      15,
      pageHeight - 8
    );
    doc.text(
      `Generated: ${new Date().toLocaleString('en-GB')}`,
      pageWidth - 15,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  // Save the PDF
  const fileName = `sales-report-${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);

  return fileName;
};

// Export single day closing as PDF
export const exportClosingToPDF = (closing: DailyClosing, restaurantName: string = 'Sham Coffee') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // Header
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(restaurantName, pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Daily Closing Report - ${closing.date}`, pageWidth / 2, 32, { align: 'center' });

  currentY = 55;

  // Closing Details
  doc.setTextColor(15, 23, 42);
  
  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Amount (OMR)']],
    body: [
      ['Opening Cash', formatNumber(closing.openingCash)],
      ['Cash Sales', formatNumber(closing.cashSales)],
      ['Card Sales', formatNumber(closing.cardSales)],
      ['Total Sales', formatNumber(closing.totalSales)],
      ['Expenses', formatNumber(closing.expenses)],
      ['Expected Cash', formatNumber(closing.openingCash + closing.cashSales - closing.expenses)],
      ['Actual Cash', formatNumber(closing.actualCash)],
      ['Difference', formatNumber(closing.difference || 0)],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 12,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 60, fontStyle: 'bold' },
    },
    styles: {
      fontSize: 11,
      cellPadding: 6,
    },
    margin: { left: 20, right: 20 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 25;

  // Notes
  if (closing.notes) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, currentY);
    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Word wrap for notes
    const splitNotes = doc.splitTextToSize(closing.notes, 170);
    doc.text(splitNotes, 20, currentY);
    currentY += splitNotes.length * 5 + 10;
  }

  // Closed by info
  currentY += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  
  if (closing.closedByName) {
    doc.text(`Closed by: ${closing.closedByName}`, 20, currentY);
    currentY += 6;
  }
  if (closing.closedAt) {
    doc.text(`Time: ${new Date(closing.closedAt).toLocaleString('en-GB')}`, 20, currentY);
  }

  // Save
  doc.save(`daily-closing-${closing.date}.pdf`);
};
