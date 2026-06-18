export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'coffee' | 'food' | 'pastries' | 'drinks';
  image: string;
  available: boolean;
  customizations?: string[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customization?: string;
  notes?: string;
}

export type PaymentMethod = 'fpx' | 'tng' | 'online-banking';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  deliveryType: 'pickup' | 'delivery';
  deliveryLocation?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  createdAt: Date;
  estimatedTime: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
}

export type UserRole = 'customer' | 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  // Customer
  studentId?: string;
  // Admin
  staffId?: string;
  department?: string;
  // Driver
  vehicleNumber?: string;
  vehicleType?: string;
}
