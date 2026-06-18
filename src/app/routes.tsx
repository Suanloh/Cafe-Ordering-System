import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Menu } from "./pages/Menu";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Orders } from "./pages/Orders";
import { OrderTracking } from "./pages/OrderTracking";
import { Admin } from "./pages/Admin";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  // Public routes (no layout)
  { path: "/login", Component: Login },
  { path: "/register/:role", Component: Register },

  // Protected routes (under Root layout with auth guard)
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Menu },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "orders", Component: Orders },
      { path: "orders/:orderId", Component: OrderTracking },
      { path: "admin", Component: Admin },
      { path: "profile", Component: Profile },
    ],
  },
]);
