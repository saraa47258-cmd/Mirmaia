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

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  active: boolean;
  createdAt?: string;
  emoji?: string;
  sizes?: Record<string, { name: string; price: number }>;
  shishaTypes?: Record<string, { name: string; price: number; icon?: string }>;
  isShisha?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
  active: boolean;
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
    createdAt: new Date().toISOString(),
  });
  return newRef.key!;
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
  await update(ref(database, `${getPath('menu')}/${productId}`), updates);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  await remove(ref(database, `${getPath('menu')}/${productId}`));
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
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
  const newRef = push(ref(database, getPath('categories')));
  await set(newRef, category);
  return newRef.key!;
};

export const updateCategory = async (categoryId: string, updates: Partial<Category>): Promise<void> => {
  await update(ref(database, `${getPath('categories')}/${categoryId}`), updates);
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await remove(ref(database, `${getPath('categories')}/${categoryId}`));
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

