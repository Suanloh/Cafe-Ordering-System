import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../app/contexts/CartContext';
import type { MenuItem } from '../app/types';

/**
 * STRESS TESTS - High Load and Performance
 * These exercise the REAL CartContext/useCart hook under load, not
 * synthetic local arrays — a red test here means an actual app bug.
 *
 * NOTE: I don't have your `../app/types` file, so a couple of payloads
 * below use `as any` to avoid guessing at fields I can't see (e.g. Order
 * may require more than customerName/customerPhone/deliveryType/
 * estimatedTime). Share types.ts and I'll tighten these.
 */

function makeMenuItem(i: number): MenuItem {
  return {
    id: `item-${i}`,
    name: `Item ${i}`,
    price: Math.random() * 20,
    description: 'Test item',
    category: 'coffee',
    available: true,
    image: 'https://example.com/image.jpg',
  } as MenuItem;
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('STRESS: CartContext under load', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useRealTimers(); // always restore, even if a test above threw
  });

  // STRESS Test 1: Adding the same item rapidly (e.g. fast double/triple clicks)
  it('STRESS: addToCart on the same item 1000x increments quantity correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = makeMenuItem(1);

    const startTime = performance.now();
    act(() => {
      for (let i = 0; i < 1000; i++) {
        result.current.addToCart(item);
      }
    });
    const duration = performance.now() - startTime;

    expect(result.current.cart.length).toBe(1);
    expect(result.current.cart[0].quantity).toBe(1000);
    expect(duration).toBeLessThan(1000);
  });

  // STRESS Test 2: Adding 1000 distinct items
  it('STRESS: addToCart with 1000 distinct items keeps cart consistent', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const startTime = performance.now();
    act(() => {
      for (let i = 0; i < 1000; i++) {
        result.current.addToCart(makeMenuItem(i));
      }
    });
    const duration = performance.now() - startTime;

    expect(result.current.cart.length).toBe(1000);
    expect(duration).toBeLessThan(1000);
  });

  // STRESS Test 3: getCartTotal performance/correctness with a large cart
  it('STRESS: getCartTotal stays accurate with 1000 items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const items = Array.from({ length: 1000 }, (_, i) => makeMenuItem(i));

    act(() => {
      items.forEach(item => result.current.addToCart(item));
    });

    const expectedTotal = items.reduce((sum, item) => sum + item.price, 0);

    const startTime = performance.now();
    const total = result.current.getCartTotal();
    const duration = performance.now() - startTime;

    expect(total).toBeCloseTo(expectedTotal, 5);
    expect(duration).toBeLessThan(20);
  });

  // STRESS Test 4: Rapid quantity updates don't corrupt cart state
  it('STRESS: updateQuantity 500 times on different items stays consistent', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const items = Array.from({ length: 500 }, (_, i) => makeMenuItem(i));

    act(() => {
      items.forEach(item => result.current.addToCart(item));
    });
    act(() => {
      items.forEach(item => result.current.updateQuantity(item.id, 5));
    });

    expect(result.current.cart.length).toBe(500);
    expect(result.current.cart.every(ci => ci.quantity === 5)).toBe(true);
  });

  // STRESS Test 5: removeFromCart for half the items leaves the rest intact
  it('STRESS: removeFromCart 500 times leaves remaining items untouched', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const items = Array.from({ length: 1000 }, (_, i) => makeMenuItem(i));

    act(() => {
      items.forEach(item => result.current.addToCart(item));
    });
    act(() => {
      items.slice(0, 500).forEach(item => result.current.removeFromCart(item.id));
    });

    expect(result.current.cart.length).toBe(500);
    expect(
      result.current.cart.every(ci => Number(ci.menuItem.id.split('-')[1]) >= 500)
    ).toBe(true);
  });

  // STRESS Test 6: Interleaved add/remove operations end in a consistent state
  it('STRESS: 200 interleaved add/remove operations leave no orphaned entries', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      for (let i = 0; i < 200; i++) {
        const item = makeMenuItem(i);
        result.current.addToCart(item);
        if (i % 3 === 0) {
          result.current.removeFromCart(item.id);
        }
      }
    });

    const removedCount = Math.ceil(200 / 3);
    expect(result.current.cart.length).toBe(200 - removedCount);
  });

  // STRESS Test 7: placeOrder rapidly should produce UNIQUE order IDs.
  // Fake timers freeze Date.now(), so this deterministically reproduces
  // the ID-collision bug (placeOrder uses `ORD-${Date.now()}` only) —
  // this test is EXPECTED TO FAIL until that's fixed.
  it('STRESS: placeOrder 200 times in a tight loop produces unique order IDs', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCart(), { wrapper });
    const orderIds: string[] = [];

    act(() => {
      for (let i = 0; i < 200; i++) {
        result.current.addToCart(makeMenuItem(i));
        const id = result.current.placeOrder({
          customerName: `Customer ${i}`,
          customerPhone: '012-3456789',
          deliveryType: 'pickup',
          estimatedTime: 15,
        } as any);
        orderIds.push(id);
      }
    });

    const uniqueIds = new Set(orderIds);
    expect(uniqueIds.size).toBe(orderIds.length);
  });

  // STRESS Test 8: addMenuItem rapidly should also produce UNIQUE IDs.
  // Same Date.now()-only ID generation as placeOrder — same expected failure.
  it('STRESS: addMenuItem 200 times in a tight loop produces unique menu item IDs', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCart(), { wrapper });
    const before = result.current.menuItems.length;

    act(() => {
      for (let i = 0; i < 200; i++) {
        result.current.addMenuItem({
          name: `Special ${i}`,
          price: 5,
          description: 'Limited time',
          category: 'coffee',
          available: true,
          image: 'https://example.com/image.jpg',
        } as any);
      }
    });

    const newItems = result.current.menuItems.slice(before);
    const uniqueIds = new Set(newItems.map(item => item.id));
    expect(uniqueIds.size).toBe(newItems.length);
  });

  // STRESS Test 9: deleteMenuItem also removes the item from an existing cart
  it('STRESS: deleting 300 menu items also clears them from the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const items = Array.from({ length: 300 }, (_, i) => makeMenuItem(i));

    act(() => {
      items.forEach(item => {
        result.current.addMenuItem(item);
        result.current.addToCart(item);
      });
    });
    act(() => {
      items.forEach(item => result.current.deleteMenuItem(item.id));
    });

    const stillInCart = result.current.cart.filter(ci =>
      items.some(item => item.id === ci.menuItem.id)
    );
    expect(stillInCart.length).toBe(0);
  });

  // STRESS Test 10: toggling availability an even number of times is idempotent
  it('STRESS: toggling availability 1000 times on the same item is idempotent', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = result.current.menuItems[0];
    const originalAvailability = item.available;

    act(() => {
      for (let i = 0; i < 1000; i++) {
        result.current.toggleMenuItemStatus(item.id);
      }
    });

    const finalItem = result.current.menuItems.find(m => m.id === item.id);
    expect(finalItem?.available).toBe(originalAvailability);
  });

  // STRESS Test 11: clearCart after a large cart is instant and complete
  it('STRESS: clearCart empties a 1000-item cart immediately', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const items = Array.from({ length: 1000 }, (_, i) => makeMenuItem(i));

    act(() => {
      items.forEach(item => result.current.addToCart(item));
    });
    expect(result.current.cart.length).toBe(1000);

    const startTime = performance.now();
    act(() => {
      result.current.clearCart();
    });
    const duration = performance.now() - startTime;

    expect(result.current.cart.length).toBe(0);
    expect(duration).toBeLessThan(50);
  });
});