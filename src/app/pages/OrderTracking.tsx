import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useCart } from "../contexts/CartContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { CheckCircle2, Clock, Package, Truck, Store, ArrowLeft } from "lucide-react";
import { Order } from "../types";

export function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder } = useCart();
  const order = orderId ? getOrder(orderId) : undefined;

  useEffect(() => {
    if (!order) {
      navigate("/orders");
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  const getStatusProgress = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 0;
      case 'preparing': return 33;
      case 'ready': return 66;
      case 'delivering': return 85;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'preparing': return <Package className="h-5 w-5" />;
      case 'ready': return <Store className="h-5 w-5" />;
      case 'delivering': return <Truck className="h-5 w-5" />;
      case 'completed': return <CheckCircle2 className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Order Received';
      case 'preparing': return 'Preparing Your Order';
      case 'ready': return order.deliveryType === 'pickup' ? 'Ready for Pickup' : 'Ready for Delivery';
      case 'delivering': return 'Out for Delivery';
      case 'completed': return 'Order Completed';
      case 'cancelled': return 'Order Cancelled';
      default: return 'Processing';
    }
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => navigate("/orders")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>

      <div className="space-y-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Order {order.id}</CardTitle>
                <CardDescription>
                  Placed on {order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString()}
                </CardDescription>
              </div>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              {getStatusText(order.status)}
            </CardTitle>
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <CardDescription>
                Estimated time: ~{order.estimatedTime} minutes
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Progress value={getStatusProgress(order.status)} className="h-2" />
            
            <div className="mt-6 space-y-3">
              <div className={`flex items-center gap-3 ${order.status === 'pending' || order.status === 'preparing' || order.status === 'ready' || order.status === 'delivering' || order.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}`}>
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Order received</span>
              </div>
              <div className={`flex items-center gap-3 ${order.status === 'preparing' || order.status === 'ready' || order.status === 'delivering' || order.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}`}>
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Preparing your order</span>
              </div>
              <div className={`flex items-center gap-3 ${order.status === 'ready' || order.status === 'delivering' || order.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}`}>
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">
                  {order.deliveryType === 'pickup' ? 'Ready for pickup at cafe' : 'Ready for delivery'}
                </span>
              </div>
              {order.deliveryType === 'delivery' && (
                <div className={`flex items-center gap-3 ${order.status === 'delivering' || order.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Out for delivery</span>
                </div>
              )}
              <div className={`flex items-center gap-3 ${order.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}`}>
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">
                  {order.deliveryType === 'pickup' ? 'Order picked up' : 'Order delivered'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">
                {order.deliveryType === 'pickup' ? 'Pickup' : 'Campus Delivery'}
              </span>
            </div>
            {order.deliveryLocation && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{order.deliveryLocation}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{order.customerPhone}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">
                      {item.quantity}x {item.menuItem.name}
                    </div>
                    {item.customization && (
                      <div className="text-sm text-muted-foreground">{item.customization}</div>
                    )}
                    {item.notes && (
                      <div className="text-sm text-muted-foreground italic">Note: {item.notes}</div>
                    )}
                  </div>
                  <div className="font-medium">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                {index < order.items.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(order.total - order.total * 0.08 - (order.deliveryType === 'delivery' ? 2.50 : 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${(order.total * 0.08 / 1.08).toFixed(2)}</span>
              </div>
              {order.deliveryType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>$2.50</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
