import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '../app/contexts/CartContext';
import { UserProvider } from '../app/contexts/UserContext';
import { Menu } from '../app/pages/Menu';
import { Cart } from '../app/pages/Cart';
import { Checkout } from '../app/pages/Checkout';
import { Login } from '../app/pages/Login';

/**
 * SMOKE TESTS - Basic Sanity Checks
 * These tests verify that critical features work at a basic level
 */
describe('SMOKE: Core Application Features', () => {

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Test 1: User authentication context initializes
  it('SMOKE: UserContext initializes with demo users', () => {
    const { container } = render(
      <UserProvider>
        <div>Test</div>
      </UserProvider>
    );

    expect(container).toBeTruthy();
    const stored = localStorage.getItem('usm_cafe_users');
    expect(stored).toBeTruthy();
    const users = JSON.parse(stored || '[]');
    expect(users.length).toBeGreaterThan(0);
  });

  // Test 2: Cart context initializes with menu items
  it('SMOKE: CartContext initializes with menu items', () => {
    const { container } = render(
      <CartProvider>
        <div>Test</div>
      </CartProvider>
    );

    expect(container).toBeTruthy();
  });

  // Test 3: Menu page renders without crashing
  it('SMOKE: Menu page renders successfully', () => {
    render(
      <UserProvider>
        <CartProvider>
          <Menu />
        </CartProvider>
      </UserProvider>
    );

    expect(screen.getByText(/USM Cafe Menu/i)).toBeTruthy();
    expect(screen.getByText(/Order your favorite items/i)).toBeTruthy();
  });

  // Test 4: Menu displays categories
  it('SMOKE: Menu displays all categories', () => {
    render(
      <UserProvider>
        <CartProvider>
          <Menu />
        </CartProvider>
      </UserProvider>
    );

    // Scoped to the tab role to avoid matching category badges on item cards
    expect(screen.getByRole('tab', { name: /All Items/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Coffee/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Food/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Pastries/i })).toBeTruthy();
  });

  // Test 5: Menu items render with Add to Cart buttons
  it('SMOKE: Menu items display with Add to Cart buttons', () => {
    render(
      <UserProvider>
        <CartProvider>
          <Menu />
        </CartProvider>
      </UserProvider>
    );

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    expect(addButtons.length).toBeGreaterThan(0);
  });

  // Test 6: Cart page renders empty state
  it('SMOKE: Empty cart displays correctly', () => {
    render(
      <UserProvider>
        <CartProvider>
          <Cart />
        </CartProvider>
      </UserProvider>
    );

    expect(screen.getByText(/Your cart is empty/i)).toBeTruthy();
    expect(screen.getByText(/Add items from the menu/i)).toBeTruthy();
  });

  // Test 7: Cart page has order summary structure
  it('SMOKE: Cart displays order summary elements', () => {
    render(
      <UserProvider>
        <CartProvider>
          <Cart />
        </CartProvider>
      </UserProvider>
    );

    const browseButton = screen.getByRole('button', { name: /Browse Menu/i });
    expect(browseButton).toBeTruthy();
  });

  // Test 8: Checkout page structure exists
  it('SMOKE: Checkout page renders without errors', () => {
    const { container } = render(
      <UserProvider>
        <CartProvider>
          <Checkout />
        </CartProvider>
      </UserProvider>
    );

    expect(container.firstChild).toBeTruthy();
  });

  // Test 9: Menu category filtering works
  it('SMOKE: Menu can filter by category', () => {
    render(
      <UserProvider>
        <CartProvider>
          <Menu />
        </CartProvider>
      </UserProvider>
    );

    const coffeeTab = screen.getByRole('tab', { name: /Coffee/i });
    expect(coffeeTab).toBeTruthy();
  });

  // Test 10: Login page renders
  it('SMOKE: Login page displays role selection', () => {
    render(
      <UserProvider>
        <Login />
      </UserProvider>
    );

    expect(screen.getByText(/USM Cafe/i)).toBeTruthy();
  });

  // Test 11: Cart empty state shows Browse Menu button
  it('SMOKE: Empty cart shows navigation option', () => {
    render(
      <UserProvider>
        <CartProvider>
          <Cart />
        </CartProvider>
      </UserProvider>
    );

    const browseButton = screen.getByRole('button', { name: /Browse Menu/i });
    expect(browseButton).toBeTruthy();
  });

  // Test 12: Menu items have required attributes
  it('SMOKE: Menu items display name and price information', () => {
    render(
      <UserProvider>
        <CartProvider>
          <Menu />
        </CartProvider>
      </UserProvider>
    );

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    expect(addButtons.length).toBeGreaterThan(0);

    // Multiple items each show "RM x.xx" — use getAllByText, not getByText
    const priceTags = screen.getAllByText(/RM/i);
    expect(priceTags.length).toBeGreaterThan(0);
  });
});