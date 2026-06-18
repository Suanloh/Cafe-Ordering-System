import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, MenuItem, Order } from "../types";
import { menuItems as initialMenuItems } from "../data/menuItems";

interface CartContextType {
  cart: CartItem[];
  orders: Order[];
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, customization?: string, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  placeOrder: (orderDetails: Omit<Order, 'id' | 'items' | 'total' | 'createdAt' | 'status'>) => string;
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemStatus: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);

  const addToCart = (item: MenuItem, customization?: string, notes?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        ci => ci.menuItem.id === item.id && ci.customization === customization
      );
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prev, { menuItem: item, quantity: 1, customization, notes }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.menuItem.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () =>
    cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const placeOrder = (orderDetails: Omit<Order, 'id' | 'items' | 'total' | 'createdAt' | 'status'>) => {
    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      total: getCartTotal(),
      status: 'pending',
      createdAt: new Date(),
      ...orderDetails,
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    setTimeout(() => updateOrderStatus(orderId, 'preparing'), 2000);
    setTimeout(() => updateOrderStatus(orderId, 'ready'), orderDetails.estimatedTime * 60 * 1000 * 0.6);
    setTimeout(() => {
      if (orderDetails.deliveryType === 'delivery') updateOrderStatus(orderId, 'delivering');
    }, orderDetails.estimatedTime * 60 * 1000 * 0.7);
    setTimeout(() => updateOrderStatus(orderId, 'completed'), orderDetails.estimatedTime * 60 * 1000);

    return orderId;
  };

  const getOrder = (orderId: string) => orders.find(o => o.id === orderId);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order => order.id === orderId ? { ...order, status } : order)
    );
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const id = `custom-${Date.now()}`;
    setMenuItems(prev => [...prev, { ...item, id }]);
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    setCart(prev => prev.filter(ci => ci.menuItem.id !== id));
  };

  const toggleMenuItemStatus = (id: string) => {
    setMenuItems(prev =>
      prev.map(item => item.id === id ? { ...item, available: !item.available } : item)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        menuItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        placeOrder,
        getOrder,
        updateOrderStatus,
        addMenuItem,
        deleteMenuItem,
        toggleMenuItemStatus,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
