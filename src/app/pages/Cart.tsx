import { useState } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../contexts/CartContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";

const VOUCHERS: Record<string, { discount: number; label: string }> = {
  "CAMPUS10": { discount: 0.10, label: "10% student discount" },
  "WELCOME15": { discount: 0.15, label: "15% welcome offer" },
  "STAFF20":  { discount: 0.20, label: "20% staff discount" },
};

export function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; label: string } | null>(null);

  const handleApplyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    const voucher = VOUCHERS[code];
    if (!voucher) {
      toast.error("Invalid voucher code");
      return;
    }
    setAppliedVoucher({ code, ...voucher });
    setVoucherInput("");
    toast.success(`Voucher applied — ${voucher.label}`);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    toast.info("Voucher removed");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
        <h2 className="text-2xl mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add items from the menu to get started</p>
        <Button onClick={() => navigate("/")}>Browse Menu</Button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const deliveryFee = 2.50;
  const discountAmount = appliedVoucher ? subtotal * appliedVoucher.discount : 0;
  const total = subtotal + tax + deliveryFee - discountAmount;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={`${item.menuItem.id}-${item.customization}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                    <ImageWithFallback
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{item.menuItem.name}</h3>
                        {item.customization && (
                          <p className="text-sm text-muted-foreground">{item.customization}</p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-muted-foreground italic">Note: {item.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.menuItem.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold">
                        RM {(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>RM {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>RM {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>RM {deliveryFee.toFixed(2)}</span>
              </div>

              {/* Voucher */}
              {appliedVoucher ? (
                <div className="flex items-center justify-between rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Tag className="h-3.5 w-3.5" />
                    <span className="font-medium">{appliedVoucher.code}</span>
                    <span className="text-green-600/70 dark:text-green-500/70">−RM {discountAmount.toFixed(2)}</span>
                  </div>
                  <button onClick={handleRemoveVoucher} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Voucher code"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                    className="h-8 text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={handleApplyVoucher} className="shrink-0">
                    Apply
                  </Button>
                </div>
              )}

              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>RM {total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
