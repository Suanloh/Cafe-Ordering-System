import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { CartProvider } from '../app/contexts/CartContext';
import { UserProvider } from '../app/contexts/UserContext';
import App from '../app/App';

// SMOKE TEST SUITE
describe('SMOKE: Core Application Flow', () => {
  
  // Test 1: App renders without crashing
  it('SMOKE: App initializes without crashing', () => {
    render(
      <UserProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </UserProvider>
    );
    expect(screen.queryByText(/Login|Register/i)).toBeTruthy();
  });

  // Test 2: Authentication smoke test
  it('SMOKE: User can login with valid credentials', async () => {
    const user = userEvent.setup();
    render(
      <UserProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    );
    
    // Fill in login form
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    await user.type(emailInput, 'customer@usm.my');
    await user.type(passwordInput, 'password');
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);
    
    // Verify redirect to menu
    await waitFor(() => {
      expect(screen.queryByText(/USM Cafe Menu/i)).toBeTruthy();
    }, { timeout: 2000 });
  });

  // Test 3: Menu display smoke test
  it('SMOKE: Menu items display correctly', async () => {
    render(
      <UserProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    );
    
    // Login first
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    await userEvent.type(emailInput, 'customer@usm.my');
    await userEvent.type(passwordInput, 'password');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Verify menu items render
    await waitFor(() => {
      expect(screen.getByText(/Coffee|Food|Pastries/i)).toBeTruthy();
    });
  });

  // Test 4: Add to cart smoke test
  it('SMOKE: Can add item to cart', async () => {
    const user = userEvent.setup();
    render(
      <UserProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    );
    
    // Login
    await user.type(screen.getByPlaceholderText(/email/i), 'customer@usm.my');
    await user.type(screen.getByPlaceholderText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for menu and add item
    await waitFor(() => {
      const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
      expect(addButtons.length).toBeGreaterThan(0);
    });
    
    const addButton = screen.getAllByRole('button', { name: /add to cart/i })[0];
    await user.click(addButton);
    
    // Verify success toast
    await waitFor(() => {
      expect(screen.getByText(/added to cart/i)).toBeTruthy();
    });
  });

  // Test 5: Cart total calculation smoke test
  it('SMOKE: Cart total calculates correctly', async () => {
    const user = userEvent.setup();
    render(
      <UserProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    );
    
    // Login → Add item → Navigate to cart
    await user.type(screen.getByPlaceholderText(/email/i), 'customer@usm.my');
    await user.type(screen.getByPlaceholderText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
      fireEvent.click(addButtons[0]);
    });
    
    // Navigate to cart
    await user.click(screen.getByRole('link', { name: /cart/i }));
    
    // Verify total is calculated
    await waitFor(() => {
      expect(screen.getByText(/Total/i)).toBeTruthy();
      const total = screen.getByText(/RM \d+\.\d+/).textContent;
      expect(parseFloat(total?.replace(/[^\d.-]/g, '') || '0')).toBeGreaterThan(0);
    });
  });

  // Test 6: Checkout flow smoke test
  it('SMOKE: Can proceed to checkout', async () => {
    const user = userEvent.setup();
    render(
      <UserProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    );
    
    // Login, add item, go to cart
    await user.type(screen.getByPlaceholderText(/email/i), 'customer@usm.my');
    await user.type(screen.getByPlaceholderText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
      fireEvent.click(addButtons[0]);
    });
    
    await user.click(screen.getByRole('link', { name: /cart/i }));
    
    // Proceed to checkout
    await user.click(screen.getByRole('button', { name: /checkout/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Contact Information/i)).toBeTruthy();
      expect(screen.getByText(/Delivery Method/i)).toBeTruthy();
    });
  });
});