import { useState } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../contexts/CartContext";
import { PaymentMethod } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { MapPin, Store, ArrowLeft, Building2, Wallet, Landmark } from "lucide-react";
import { toast } from "sonner";

// ─── Reusable selection card ──────────────────────────────────────────────────

function OptionCard({
  selected, onClick, icon, title, subtitle, badge,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-xl border-2 p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30'
      }`}
    >
      <div className="flex items-start gap-3 pr-6">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${selected ? 'text-primary' : ''}`}>{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          {badge && (
            <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              selected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>{badge}</span>
          )}
        </div>
      </div>
      {/* Radio dot */}
      <div className={`absolute right-3 top-4 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? 'border-primary bg-primary' : 'border-border'
      }`}>
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

// ─── Checkout page ────────────────────────────────────────────────────────────

export function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, placeOrder } = useCart();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fpx');

  const locations = [
    "Engineering Building", "Science Complex", "Library",
    "Student Center", "Sports Complex", "Dormitory A",
    "Dormitory B", "Administration Building",
  ];

  const handlePlaceOrder = () => {
    if (!customerName || !customerPhone) {
      toast.error("Please fill in your contact information");
      return;
    }
    if (deliveryType === 'delivery' && !deliveryLocation) {
      toast.error("Please select a delivery location");
      return;
    }
    const orderId = placeOrder({
      deliveryType,
      deliveryLocation: deliveryType === 'delivery' ? deliveryLocation : undefined,
      estimatedTime: deliveryType === 'pickup' ? 15 : 30,
      customerName,
      customerPhone,
      paymentMethod,
    });
    toast.success("Order placed successfully!");
    navigate(`/orders/${orderId}`);
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const deliveryFee = deliveryType === 'delivery' ? 2.50 : 0;
  const total = subtotal + tax + deliveryFee;

  const paymentLabel: Record<PaymentMethod, string> = {
    fpx: 'FPX',
    tng: 'Touch n Go',
    'online-banking': 'Online Banking',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate("/cart")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cart
      </Button>

      <h1 className="text-3xl mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1 · Contact */}
          <Card>
            <CardHeader>
              <CardTitle>1. Contact Information</CardTitle>
              <CardDescription>We'll notify you about your order status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+60 12-345 6789" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* 2 · Delivery method */}
          <Card>
            <CardHeader>
              <CardTitle>2. Delivery Method</CardTitle>
              <CardDescription>How would you like to receive your order?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OptionCard
                  selected={deliveryType === 'pickup'}
                  onClick={() => setDeliveryType('pickup')}
                  icon={<Store className="h-5 w-5" />}
                  title="Pickup"
                  subtitle="Collect at the cafe counter"
                  badge="~15 min · Free"
                />
                <OptionCard
                  selected={deliveryType === 'delivery'}
                  onClick={() => setDeliveryType('delivery')}
                  icon={<MapPin className="h-5 w-5" />}
                  title="Campus Delivery"
                  subtitle="Delivered to your location"
                  badge="~30 min · $2.50"
                />
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="location">Delivery Location</Label>
                  <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select a campus location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3 · Payment method */}
          <Card>
            <CardHeader>
              <CardTitle>3. Payment Method</CardTitle>
              <CardDescription>Select how you'd like to pay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <OptionCard
                selected={paymentMethod === 'fpx'}
                onClick={() => setPaymentMethod('fpx')}
                icon={<Building2 className="h-5 w-5" />}
                title="FPX"
                subtitle="Instant interbank transfer via your bank's secure portal"
                badge="Recommended"
              />
              <OptionCard
                selected={paymentMethod === 'tng'}
                onClick={() => setPaymentMethod('tng')}
                icon={<Wallet className="h-5 w-5" />}
                title="Touch 'n Go (TNG)"
                subtitle="Pay using your TNG e-wallet balance"
              />
              <OptionCard
                selected={paymentMethod === 'online-banking'}
                onClick={() => setPaymentMethod('online-banking')}
                icon={<Landmark className="h-5 w-5" />}
                title="Online Banking"
                subtitle="Direct transfer from your savings or current account"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={`${item.menuItem.id}-${item.customization}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="rounded-lg bg-muted/50 px-3 py-2 space-y-1 text-xs text-muted-foreground">
                <p>📦 Est. {deliveryType === 'pickup' ? 'pickup' : 'delivery'}: ~{deliveryType === 'pickup' ? '15' : '30'} min</p>
                <p>💳 Payment: {paymentLabel[paymentMethod]}</p>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button className="w-full" onClick={handlePlaceOrder}>Place Order</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
