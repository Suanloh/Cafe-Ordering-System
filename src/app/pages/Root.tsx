import { Outlet, Link, useLocation, Navigate } from "react-router";
import { ShoppingCart, Coffee, Package, User, ShieldCheck, Truck, LogOut, ChevronDown, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import { useState, useRef, useEffect } from "react";

// ─── User avatar menu ─────────────────────────────────────────────────────────

function RoleIcon({ role }: { role: string }) {
  if (role === "admin") return <ShieldCheck className="h-4 w-4" />;
  if (role === "driver") return <Truck className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
}

function roleBg(role: string) {
  if (role === "admin") return "bg-violet-100 text-violet-700 dark:bg-violet-900/40";
  if (role === "driver") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/40";
}

function UserMenu() {
  const { currentUser, logout } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!currentUser) return null;

  const initials = currentUser.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 rounded-full px-2 py-1 border transition-colors hover:bg-accent ${open ? "bg-accent" : ""}`}
      >
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${roleBg(currentUser.role)}`}>
          {initials}
        </span>
        <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{currentUser.name.split(" ")[0]}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-popover shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-muted/30">
            <p className="text-sm font-semibold truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <RoleIcon role={currentUser.role} />
              <span className="text-xs capitalize text-muted-foreground">{currentUser.role}</span>
            </div>
          </div>

          {/* Links */}
          <div className="p-1">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Edit Profile
            </Link>
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export function Root() {
  const location = useLocation();
  const { cart } = useCart();
  const { currentUser, isAuthenticated, role } = useUser();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Auth guard – redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isStaff = role === "admin" || role === "driver";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Coffee className="h-6 w-6" />
            <span className="font-semibold text-lg">USM Cafe</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Button variant={location.pathname === "/" ? "default" : "ghost"} size="sm" asChild>
              <Link to="/">Menu</Link>
            </Button>

            <Button variant={location.pathname.startsWith("/orders") ? "default" : "ghost"} size="sm" asChild>
              <Link to="/orders">
                <Package className="h-4 w-4 mr-1.5" />
                {isStaff ? "Manage Orders" : "Orders"}
              </Link>
            </Button>

            {!isStaff && (
              <Button
                variant={location.pathname === "/cart" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/cart">
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  Cart
                  {cartItemCount > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 flex items-center justify-center p-1 text-xs">
                      {cartItemCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}
          </nav>

          <UserMenu />
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>USM University Cafe — Serving the campus community</p>
          <p className="mt-1">Open Mon–Fri: 7:00 AM – 8:00 PM | Sat–Sun: 8:00 AM – 6:00 PM</p>
          {role === "admin" && (
            <Link to="/admin" className="mt-3 inline-block text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              Admin Panel
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
