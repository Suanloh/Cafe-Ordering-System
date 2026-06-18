import { useNavigate } from "react-router";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Package, ArrowRight } from "lucide-react";
import { Order } from "../types";
import { StaffOrders } from "./StaffOrders";

function getStatusVariant(status: Order['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'completed') return 'default';
  if (status === 'cancelled') return 'destructive';
  if (status === 'pending') return 'outline';
  return 'secondary';
}

function CustomerOrders() {
  const navigate = useNavigate();
  const { orders } = useCart();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Package className="h-24 w-24 text-muted-foreground mb-4" />
        <h2 className="text-2xl mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">Start by ordering from our menu</p>
        <Button onClick={() => navigate("/")}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track and view your order history</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Order {order.id}</CardTitle>
                  <CardDescription>
                    {order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString()} · {order.items.length} items
                  </CardDescription>
                </div>
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index}>
                      {item.quantity}x {item.menuItem.name}
                      {item.customization && ` (${item.customization})`}
                    </div>
                  ))}
                  {order.items.length > 2 && <div>+{order.items.length - 2} more items</div>}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {order.deliveryType === 'pickup' ? 'Pickup' : `Delivery to ${order.deliveryLocation}`}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-semibold">RM {order.total.toFixed(2)}</span>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                    View Details <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Orders() {
  const { role } = useUser();
  return (role === 'admin' || role === 'driver') ? <StaffOrders /> : <CustomerOrders />;
}
