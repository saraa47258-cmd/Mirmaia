import { database, RESTAURANT_ID } from './config';
import { ref, get, set, update, remove, push, query, orderByChild, limitToLast, equalTo, onValue, off, DataSnapshot } from 'firebase/database';

// Types
export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  discount?: { percent: number; amount: number };
  status: 'pending' | 'processing' | 'preparing' | 'ready' | 'paid' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'later';
  paymentStatus?: 'pending' | 'paid';
  customerName?: string;
  tableNumber?: string;
  tableId?: string;
  workerId?: string;
  workerName?: string;
  createdAt: string;
  timestamp?: number;
  restaurantId: string;
  source?: string;
  itemsCount?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  itemTotal?: number;
  emoji?: string;
  note?: string;
}

export interface ProductVariation {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  isDefault?: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  basePrice?: number;
  category: string;
  categoryId?: string;
  image?: string;
  imageUrl?: string;
  active: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  emoji?: string;
  sortOrder?: number;
  variations?: ProductVariation[];
  // Legacy fields
  sizes?: Record<string, { name: string; price: number }>;
  shishaTypes?: Record<string, { name: string; price: number; icon?: string }>;
  isShisha?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  icon?: string;
  emoji?: string;
  order: number;
  sortOrder?: number;
  active: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Worker {
  id: string;
  name: string;
  username: string;
  password: string;
  position: string;
  phone?: string;
  active: boolean;
  permissions?: 'full' | 'menu-only';
  role?: 'worker';
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  type: string;
  username: string;
  password: string;
  phone?: string;
  address?: string;
  status: string;
}

// Database paths
const getPath = (collection: string) => `restaurant-system/${collection}/${RESTAURANT_ID}`;

// Orders
export const getOrders = async (): Promise<Order[]> => {
  const snapshot = await get(ref(database, getPath('orders')));
  const data = snapshot.val() || {};
  return Object.entries(data).map(([id, order]: [string, any]) => ({
    id,
    ...order,
  }));
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  const snapshot = await get(ref(database, `${getPath('orders')}/${orderId}`));
  if (!snapshot.exists()) return null;
  return { id: orderId, ...snapshot.val() };
};

export const listenToOrders = (callback: (orders: Order[]) => void): () => void => {
  const ordersRef = ref(database, getPath('orders'));
  const unsubscribe = onValue(ordersRef, (snapshot) => {
    const data = snapshot.val() || {};
    const orders = Object.entries(data).map(([id, order]: [string, any]) => ({
      id,
      ...order,
    }));
    callback(orders);
  });
  return () => off(ordersRef, 'value', unsubscribe);
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  await update(ref(database, `${getPath('orders')}/${orderId}`), {
    status,
    updatedAt: new Date().toISOString(),
  });
};

export const createOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
  const newRef = push(ref(database, getPath('orders')));
  const orderData = {
    ...order,
    restaurantId: RESTAURANT_ID,
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
  };
  await set(newRef, orderData);
  return newRef.key!;
};

export const listenToOrder = (orderId: string, callback: (order: Order | null) => void): () => void => {
  const orderRef = ref(database, `${getPath('orders')}/${orderId}`);
  const listener = onValue(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: orderId, ...snapshot.val() });
    } else {
      callback(null);
    }
  });
  return () => off(orderRef, 'value', listener);
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await get(ref(database, getPath('menu')));
  const data = snapshot.val() || {};
  return Object.entries(data).map(([id, product]: [string, any]) => ({
    id,
    ...product,
  }));
};

export const getProduct = async (productId: string): Promise<Product | null> => {
  const snapshot = await get(ref(database, `${getPath('menu')}/${productId}`));
  if (!snapshot.exists()) return null;
  return { id: productId, ...snapshot.val() };
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  const newRef = push(ref(database, getPath('menu')));
  await set(newRef, {
    ...product,
    category: product.categoryId || product.category,
    categoryId: product.categoryId || product.category,
    active: product.isActive ?? product.active ?? true,
    isActive: product.isActive ?? product.active ?? true,
    createdAt: new Date().toISOString(),
  });
  return newRef.key!;
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
  const updateData: any = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  if (updates.categoryId) {
    updateData.category = updates.categoryId;
  }
  if (updates.isActive !== undefined) {
    updateData.active = updates.isActive;
  }
  
  await update(ref(database, `${getPath('menu')}/${productId}`), updateData);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  await remove(ref(database, `${getPath('menu')}/${productId}`));
};

export const bulkUpdateProducts = async (updates: { id: string; data: Partial<Product> }[]): Promise<void> => {
  const batchUpdates: Record<string, any> = {};
  
  updates.forEach(({ id, data }) => {
    Object.entries(data).forEach(([key, value]) => {
      batchUpdates[`${getPath('menu')}/${id}/${key}`] = value;
    });
    batchUpdates[`${getPath('menu')}/${id}/updatedAt`] = new Date().toISOString();
  });
  
  await update(ref(database), batchUpdates);
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const snapshot = await get(ref(database, getPath('categories')));
  const data = snapshot.val() || {};
  return Object.entries(data)
    .map(([id, category]: [string, any]) => ({
      id,
      ...category,
    }))
    .sort((a, b) => (a.order || a.sortOrder || 0) - (b.order || b.sortOrder || 0));
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
  const newRef = push(ref(database, getPath('categories')));
  await set(newRef, {
    ...category,
    createdAt: new Date().toISOString(),
  });
  return newRef.key!;
};

export const updateCategory = async (categoryId: string, updates: Partial<Category>): Promise<void> => {
  await update(ref(database, `${getPath('categories')}/${categoryId}`), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await remove(ref(database, `${getPath('categories')}/${categoryId}`));
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(p => p.category === categoryId || p.categoryId === categoryId);
};

export const getCategoryProductCount = async (categoryId: string): Promise<number> => {
  const products = await getProductsByCategory(categoryId);
  return products.length;
};

export const moveProductsToCategory = async (fromCategoryId: string, toCategoryId: string): Promise<void> => {
  const products = await getProductsByCategory(fromCategoryId);
  const updates: Record<string, any> = {};
  
  products.forEach(product => {
    updates[`${getPath('menu')}/${product.id}/category`] = toCategoryId;
    updates[`${getPath('menu')}/${product.id}/categoryId`] = toCategoryId;
    updates[`${getPath('menu')}/${product.id}/updatedAt`] = new Date().toISOString();
  });
  
  if (Object.keys(updates).length > 0) {
    await update(ref(database), updates);
  }
};

// Workers
export const getWorkers = async (): Promise<Worker[]> => {
  const snapshot = await get(ref(database, getPath('workers')));
  const data = snapshot.val() || {};
  return Object.entries(data).map(([id, worker]: [string, any]) => ({
    id,
    ...worker,
  }));
};

export const getWorker = async (workerId: string): Promise<Worker | null> => {
  const snapshot = await get(ref(database, `${getPath('workers')}/${workerId}`));
  if (!snapshot.exists()) return null;
  return { id: workerId, ...snapshot.val() };
};

export const createWorker = async (worker: Omit<Worker, 'id'>): Promise<string> => {
  const newRef = push(ref(database, getPath('workers')));
  await set(newRef, {
    ...worker,
    restaurantId: RESTAURANT_ID,
  });
  return newRef.key!;
};

export const updateWorker = async (workerId: string, updates: Partial<Worker>): Promise<void> => {
  await update(ref(database, `${getPath('workers')}/${workerId}`), updates);
};

export const deleteWorker = async (workerId: string): Promise<void> => {
  await remove(ref(database, `${getPath('workers')}/${workerId}`));
};

// Restaurant
export const getRestaurant = async (): Promise<Restaurant | null> => {
  const snapshot = await get(ref(database, `restaurant-system/restaurants/${RESTAURANT_ID}`));
  if (!snapshot.exists()) return null;
  return { id: RESTAURANT_ID, ...snapshot.val() };
};

// Sales/Statistics
export const getTodayOrders = async (): Promise<Order[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  
  const orders = await getOrders();
  return orders.filter((order) => {
    const orderTime = order.timestamp || (order.createdAt ? new Date(order.createdAt).getTime() : 0);
    return orderTime >= todayStart && order.status !== 'cancelled';
  });
};

export interface DateRange {
  start: Date;
  end: Date;
}

export const getDateRangeForFilter = (filter: 'today' | 'week' | 'month' | 'year' | 'custom', customStart?: string, customEnd?: string): DateRange => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (filter) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      const daysFromSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1; // Saturday is start of week
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromSaturday, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case 'custom':
      start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = customEnd ? new Date(customEnd) : now;
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  return { start, end };
};

export const getOrdersByDateRange = async (dateRange: DateRange): Promise<Order[]> => {
  const orders = await getOrders();
  
  return orders
    .filter((order) => {
      const orderTime = order.timestamp || (order.createdAt ? new Date(order.createdAt).getTime() : 0);
      return orderTime >= dateRange.start.getTime() && orderTime <= dateRange.end.getTime();
    })
    .sort((a, b) => {
      const timeA = a.timestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.timestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA; // Newest first
    });
};

export const updateOrderPaymentStatus = async (orderId: string, paymentStatus: 'pending' | 'paid'): Promise<void> => {
  const updates: any = {
    paymentStatus,
    updatedAt: new Date().toISOString(),
  };
  
  if (paymentStatus === 'paid') {
    updates.paidAt = new Date().toISOString();
  }
  
  await update(ref(database, `${getPath('orders')}/${orderId}`), updates);
};

export const getSalesStats = async (startDate?: Date, endDate?: Date) => {
  const orders = await getOrders();
  
  let filteredOrders = orders.filter((o) => o.status !== 'cancelled');
  
  if (startDate && endDate) {
    const start = startDate.getTime();
    const end = endDate.getTime();
    filteredOrders = filteredOrders.filter((order) => {
      const orderTime = order.timestamp || (order.createdAt ? new Date(order.createdAt).getTime() : 0);
      return orderTime >= start && orderTime <= end;
    });
  }
  
  const totalRevenue = filteredOrders
    .filter((o) => o.status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const ordersCount = filteredOrders.length;
  const paidOrders = filteredOrders.filter((o) => o.status === 'paid' || o.status === 'completed').length;
  const itemsSold = filteredOrders.reduce((sum, o) => sum + (o.itemsCount || o.items?.length || 0), 0);
  
  return {
    totalRevenue,
    ordersCount,
    paidOrders,
    itemsSold,
    averageOrder: ordersCount > 0 ? totalRevenue / paidOrders : 0,
  };
};

