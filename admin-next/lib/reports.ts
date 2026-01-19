import { database, RESTAURANT_ID } from './firebase/config';
import { 
  ref, 
  get, 
  set, 
  update, 
  push,
  query,
  orderByChild,
  startAt,
  endAt
} from 'firebase/database';
import { Order } from './firebase/database';

// Types
export interface ReportStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  cashSales: number;
  cardSales: number;
  paidOrders: number;
  unpaidOrders: number;
  tableOrders: number;
  roomOrders: number;
  takeawayOrders: number;
  topProduct?: { name: string; quantity: number; revenue: number };
}

export interface DailyStats {
  date: string;
  totalSales: number;
  totalOrders: number;
  cashSales: number;
  cardSales: number;
  averageOrder: number;
}

export interface DailyClosing {
  id: string;
  date: string;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  totalSales: number;
  expenses: number;
  actualCash: number;
  difference: number;
  notes?: string;
  closedBy: string;
  closedByName?: string;
  closedAt: string;
  timestamp: number;
  // Enhanced fields for daily closing
  ordersCount?: number;
  paidOrdersCount?: number;
  unpaidOrdersCount?: number;
  tableOrdersCount?: number;
  roomOrdersCount?: number;
  takeawayOrdersCount?: number;
  isLocked?: boolean;
  lockedAt?: string;
}

export interface TopProduct {
  id: string;
  name: string;
  emoji?: string;
  quantity: number;
  revenue: number;
  category?: string;
}

export interface TopCategory {
  id: string;
  name: string;
  icon?: string;
  quantity: number;
  revenue: number;
  ordersCount: number;
}

export type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';
export type ReportTab = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Database paths
const getPath = (collection: string) => `restaurant-system/${collection}/${RESTAURANT_ID}`;

// Get date range boundaries
export const getDateRangeBounds = (
  range: DateRange,
  customStart?: Date,
  customEnd?: Date
): { start: Date; end: Date } => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (range) {
    case 'today':
      // Already set to today
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'custom':
      if (customStart) start = new Date(customStart);
      if (customEnd) {
        end.setTime(customEnd.getTime());
        end.setHours(23, 59, 59, 999);
      }
      break;
  }

  return { start, end };
};

// Get orders by date range
export const getOrdersByDateRange = async (
  startDate: Date,
  endDate: Date,
  filters?: {
    paymentMethod?: 'cash' | 'card';
    orderType?: 'table' | 'room' | 'takeaway';
    status?: string;
  }
): Promise<Order[]> => {
  const snapshot = await get(ref(database, getPath('orders')));
  const data = snapshot.val() || {};

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  let orders = Object.entries(data)
    .map(([id, order]: [string, any]) => ({ id, ...order }))
    .filter((order: Order) => {
      const orderTime = order.timestamp || new Date(order.createdAt).getTime();
      return orderTime >= startTime && orderTime <= endTime;
    });

  // Apply filters
  if (filters?.paymentMethod) {
    orders = orders.filter(o => o.paymentMethod === filters.paymentMethod);
  }
  if (filters?.orderType) {
    orders = orders.filter(o => o.orderType === filters.orderType);
  }
  if (filters?.status) {
    orders = orders.filter(o => o.status === filters.status);
  }

  return orders.sort((a, b) => {
    const timeA = a.timestamp || new Date(a.createdAt).getTime();
    const timeB = b.timestamp || new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
};

// Calculate report stats from orders
export const calculateReportStats = (orders: Order[]): ReportStats => {
  const completedOrders = orders.filter(o => o.status !== 'cancelled');
  
  const totalSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = completedOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  const cashSales = completedOrders
    .filter(o => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const cardSales = completedOrders
    .filter(o => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const paidOrders = completedOrders.filter(o => o.paymentStatus === 'paid' || o.status === 'completed').length;
  const unpaidOrders = completedOrders.length - paidOrders;
  
  const tableOrders = completedOrders.filter(o => o.orderType === 'table').length;
  const roomOrders = completedOrders.filter(o => o.orderType === 'room').length;
  const takeawayOrders = completedOrders.filter(o => o.orderType === 'takeaway' || !o.orderType).length;

  // Calculate top product
  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  completedOrders.forEach(order => {
    order.items?.forEach(item => {
      const existing = productMap.get(item.id) || { name: item.name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += (item.itemTotal || item.price * item.quantity);
      productMap.set(item.id, existing);
    });
  });

  let topProduct: { name: string; quantity: number; revenue: number } | undefined;
  let maxRevenue = 0;
  productMap.forEach((value) => {
    if (value.revenue > maxRevenue) {
      maxRevenue = value.revenue;
      topProduct = value;
    }
  });

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    cashSales,
    cardSales,
    paidOrders,
    unpaidOrders,
    tableOrders,
    roomOrders,
    takeawayOrders,
    topProduct,
  };
};

// Get daily stats for chart
export const getDailyStatsForRange = async (
  startDate: Date,
  endDate: Date
): Promise<DailyStats[]> => {
  const orders = await getOrdersByDateRange(startDate, endDate);
  
  // Group by date
  const dailyMap = new Map<string, {
    totalSales: number;
    totalOrders: number;
    cashSales: number;
    cardSales: number;
  }>();

  orders.filter(o => o.status !== 'cancelled').forEach(order => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    const existing = dailyMap.get(date) || {
      totalSales: 0,
      totalOrders: 0,
      cashSales: 0,
      cardSales: 0,
    };
    existing.totalSales += order.total || 0;
    existing.totalOrders += 1;
    if (order.paymentMethod === 'cash') {
      existing.cashSales += order.total || 0;
    } else if (order.paymentMethod === 'card') {
      existing.cardSales += order.total || 0;
    }
    dailyMap.set(date, existing);
  });

  // Fill in missing dates
  const result: DailyStats[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const stats = dailyMap.get(dateStr) || {
      totalSales: 0,
      totalOrders: 0,
      cashSales: 0,
      cardSales: 0,
    };
    result.push({
      date: dateStr,
      ...stats,
      averageOrder: stats.totalOrders > 0 ? stats.totalSales / stats.totalOrders : 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
};

// Get weekly stats
export const getWeeklyStats = async (
  startDate: Date,
  endDate: Date
): Promise<{ week: string; stats: DailyStats }[]> => {
  const dailyStats = await getDailyStatsForRange(startDate, endDate);
  
  const weeklyMap = new Map<string, DailyStats>();
  
  dailyStats.forEach(day => {
    const date = new Date(day.date);
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    const existing = weeklyMap.get(weekKey) || {
      date: weekKey,
      totalSales: 0,
      totalOrders: 0,
      cashSales: 0,
      cardSales: 0,
      averageOrder: 0,
    };
    existing.totalSales += day.totalSales;
    existing.totalOrders += day.totalOrders;
    existing.cashSales += day.cashSales;
    existing.cardSales += day.cardSales;
    weeklyMap.set(weekKey, existing);
  });

  return Array.from(weeklyMap.entries())
    .map(([week, stats]) => ({
      week,
      stats: {
        ...stats,
        averageOrder: stats.totalOrders > 0 ? stats.totalSales / stats.totalOrders : 0,
      },
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
};

// Get monthly stats
export const getMonthlyStats = async (
  startDate: Date,
  endDate: Date
): Promise<{ month: string; stats: DailyStats }[]> => {
  const dailyStats = await getDailyStatsForRange(startDate, endDate);
  
  const monthlyMap = new Map<string, DailyStats>();
  
  dailyStats.forEach(day => {
    const monthKey = day.date.substring(0, 7); // YYYY-MM
    
    const existing = monthlyMap.get(monthKey) || {
      date: monthKey,
      totalSales: 0,
      totalOrders: 0,
      cashSales: 0,
      cardSales: 0,
      averageOrder: 0,
    };
    existing.totalSales += day.totalSales;
    existing.totalOrders += day.totalOrders;
    existing.cashSales += day.cashSales;
    existing.cardSales += day.cardSales;
    monthlyMap.set(monthKey, existing);
  });

  return Array.from(monthlyMap.entries())
    .map(([month, stats]) => ({
      month,
      stats: {
        ...stats,
        averageOrder: stats.totalOrders > 0 ? stats.totalSales / stats.totalOrders : 0,
      },
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

// Get top products
export const getTopProducts = async (
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<TopProduct[]> => {
  const orders = await getOrdersByDateRange(startDate, endDate);
  
  const productMap = new Map<string, TopProduct>();
  
  orders.filter(o => o.status !== 'cancelled').forEach(order => {
    order.items?.forEach(item => {
      const existing = productMap.get(item.id) || {
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += (item.itemTotal || item.price * item.quantity);
      productMap.set(item.id, existing);
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

// Daily Closings
export const getDailyClosings = async (
  limit: number = 30
): Promise<DailyClosing[]> => {
  const snapshot = await get(ref(database, getPath('daily_closings')));
  const data = snapshot.val() || {};

  return Object.entries(data)
    .map(([id, closing]: [string, any]) => ({ id, ...closing }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

export const getDailyClosingByDate = async (
  date: string
): Promise<DailyClosing | null> => {
  const closings = await getDailyClosings(100);
  return closings.find(c => c.date === date) || null;
};

export const createDailyClosing = async (
  closing: Omit<DailyClosing, 'id' | 'closedAt' | 'timestamp'>
): Promise<string> => {
  // Check if closing already exists for this date
  const existing = await getDailyClosingByDate(closing.date);
  if (existing) {
    throw new Error('تم إغلاق هذا اليوم مسبقاً');
  }

  const closingRef = push(ref(database, getPath('daily_closings')));
  
  // Build data object without undefined values
  const closingData: any = {
    id: closingRef.key!,
    date: closing.date,
    openingCash: closing.openingCash,
    cashSales: closing.cashSales,
    cardSales: closing.cardSales,
    totalSales: closing.totalSales,
    expenses: closing.expenses,
    actualCash: closing.actualCash,
    difference: closing.difference,
    closedBy: closing.closedBy,
    closedAt: new Date().toISOString(),
    timestamp: Date.now(),
  };

  // Add optional fields only if they have values
  if (closing.notes) closingData.notes = closing.notes;
  if (closing.closedByName) closingData.closedByName = closing.closedByName;

  await set(closingRef, closingData);
  return closingData.id;
};

// Get sales trend (compare with previous period)
export const getSalesTrend = async (
  startDate: Date,
  endDate: Date
): Promise<{ current: number; previous: number; percentChange: number }> => {
  const periodLength = endDate.getTime() - startDate.getTime();
  
  const prevStart = new Date(startDate.getTime() - periodLength);
  const prevEnd = new Date(startDate.getTime() - 1);

  const currentOrders = await getOrdersByDateRange(startDate, endDate);
  const previousOrders = await getOrdersByDateRange(prevStart, prevEnd);

  const currentSales = currentOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const previousSales = previousOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const percentChange = previousSales > 0 
    ? ((currentSales - previousSales) / previousSales) * 100 
    : currentSales > 0 ? 100 : 0;

  return {
    current: currentSales,
    previous: previousSales,
    percentChange,
  };
};

// Format date for display
export const formatDateArabic = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatMonthArabic = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
  });
};

// Calculate today's sales for closing
export const getTodaySalesForClosing = async (
  date: string
): Promise<{ 
  cashSales: number; 
  cardSales: number; 
  totalSales: number; 
  ordersCount: number;
  paidOrdersCount: number;
  unpaidOrdersCount: number;
  tableOrdersCount: number;
  roomOrdersCount: number;
  takeawayOrdersCount: number;
  orders: Order[];
}> => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const orders = await getOrdersByDateRange(start, end);
  const completedOrders = orders.filter(o => 
    o.status === 'completed' || o.paymentStatus === 'paid'
  );
  const allOrders = orders.filter(o => o.status !== 'cancelled');

  const cashSales = completedOrders
    .filter(o => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const cardSales = completedOrders
    .filter(o => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const paidOrdersCount = completedOrders.length;
  const unpaidOrdersCount = allOrders.filter(o => 
    o.paymentStatus !== 'paid' && o.status !== 'completed'
  ).length;
  
  const tableOrdersCount = allOrders.filter(o => o.orderType === 'table').length;
  const roomOrdersCount = allOrders.filter(o => o.orderType === 'room').length;
  const takeawayOrdersCount = allOrders.filter(o => 
    o.orderType === 'takeaway' || !o.orderType
  ).length;

  return {
    cashSales,
    cardSales,
    totalSales: cashSales + cardSales,
    ordersCount: allOrders.length,
    paidOrdersCount,
    unpaidOrdersCount,
    tableOrdersCount,
    roomOrdersCount,
    takeawayOrdersCount,
    orders: allOrders,
  };
};

// Check if a day is already closed
export const isDayClosed = async (date: string): Promise<boolean> => {
  const existing = await getDailyClosingByDate(date);
  return existing !== null;
};

// Get detailed closing data for a day
export const getClosingDetails = async (date: string): Promise<DailyClosing | null> => {
  return getDailyClosingByDate(date);
};

// Lock a day (no more edits allowed)
export const lockDay = async (closingId: string): Promise<void> => {
  const closingRef = ref(database, `${getPath('daily_closings')}/${closingId}`);
  await update(closingRef, {
    isLocked: true,
    lockedAt: new Date().toISOString(),
  });
};

// Enhanced createDailyClosing with order details
export const createEnhancedDailyClosing = async (
  closing: Omit<DailyClosing, 'id' | 'closedAt' | 'timestamp'>
): Promise<string> => {
  // Check if closing already exists for this date
  const existing = await getDailyClosingByDate(closing.date);
  if (existing) {
    throw new Error('تم إغلاق هذا اليوم مسبقاً');
  }

  const closingRef = push(ref(database, getPath('daily_closings')));
  
  const closingData: Record<string, any> = {
    id: closingRef.key!,
    date: closing.date,
    openingCash: closing.openingCash,
    cashSales: closing.cashSales,
    cardSales: closing.cardSales,
    totalSales: closing.totalSales,
    expenses: closing.expenses,
    actualCash: closing.actualCash,
    difference: closing.difference,
    closedBy: closing.closedBy,
    closedAt: new Date().toISOString(),
    timestamp: Date.now(),
    isLocked: true,
    lockedAt: new Date().toISOString(),
  };

  // Add optional fields
  if (closing.notes) closingData.notes = closing.notes;
  if (closing.closedByName) closingData.closedByName = closing.closedByName;
  if (closing.ordersCount !== undefined) closingData.ordersCount = closing.ordersCount;
  if (closing.paidOrdersCount !== undefined) closingData.paidOrdersCount = closing.paidOrdersCount;
  if (closing.unpaidOrdersCount !== undefined) closingData.unpaidOrdersCount = closing.unpaidOrdersCount;
  if (closing.tableOrdersCount !== undefined) closingData.tableOrdersCount = closing.tableOrdersCount;
  if (closing.roomOrdersCount !== undefined) closingData.roomOrdersCount = closing.roomOrdersCount;
  if (closing.takeawayOrdersCount !== undefined) closingData.takeawayOrdersCount = closing.takeawayOrdersCount;

  await set(closingRef, closingData);
  return closingData.id;
};





