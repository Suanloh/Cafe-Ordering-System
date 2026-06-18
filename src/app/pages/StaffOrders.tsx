import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../contexts/CartContext";
import { Order } from "../types";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  Clock, ChefHat, CheckCircle2, Truck, Package,
  MapPin, Store, Phone, CreditCard, ChevronRight,
  RefreshCw,
} from "lucide-react";

const STATUS_ORDER: Order['status'][] = ['pending', 'preparing', 'ready', 'delivering', 'completed'];

const STATUS_META: Record<Order['status'], { label: string; color: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-600',  badgeVariant: 'outline' },
  preparing:  { label: 'Preparing',  color: 'text-blue-600',    badgeVariant: 'secondary' },
  ready:      { label: 'Ready',      color: 'text-green-600',   badgeVariant: 'secondary' },
  delivering: { label: 'Delivering', color: 'text-purple-600',  badgeVariant: 'secondary' },
  completed:  { label: 'Completed',  color: 'text-gray-600',    badgeVariant: 'default' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-600',     badgeVariant: 'destructive' },
};

const PAYMENT_LABEL: Record<string, string> = {
  fpx: 'FPX',
  tng: 'Touch n Go',
  'online-banking': 'Online Banking',
};

function nextActions(order: Order): { label: string; next: Order['status']; variant?: 'default' | 'outline' }[] {
  if (order.status === 'pending') return [{ label: 'Start Preparing', next: 'preparing' }];
  if (order.status === 'preparing') return [{ label: 'Mark Ready', next: 'ready' }];
  if (order.status === 'ready') {
    if (order.deliveryType === 'delivery') return [{ label: 'Pick Up for Delivery', next: 'delivering' }];
    return [{ label: 'Complete Order', next: 'completed' }];
  }
  if (order.status === 'delivering') return [{ label: 'Mark Delivered', next: 'completed' }];
  return [];
}

function StatPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-white/20' : 'bg-muted'}`}>{count}</span>
    </button>
  );
}

function OrderCard({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (id: string, status: Order['status']) => void }) {
  const navigate = useNavigate();
  const actions = nextActions(order);
  const meta = STATUS_META[order.status];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{order.id}</CardTitle>
              <Badge variant={meta.badgeVariant} className="text-xs">{meta.label}</Badge>
              {order.deliveryType === 'delivery' && (
                <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-950/20">
                  <Truck className="h-3 w-3 mr-1" /> Delivery
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.createdAt.toLocaleDateString()} · {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className="font-semibold text-lg shrink-0">RM {order.total.toFixed(2)}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Customer info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="font-medium">{order.customerName}</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />{order.customerPhone}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
          </span>
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-2 text-sm">
          {order.deliveryType === 'pickup' ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Store className="h-3.5 w-3.5" /> Pickup at cafe
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Deliver to: <span className="font-medium text-foreground">{order.deliveryLocation}</span>
            </span>
          )}
        </div>

        {/* Items */}
        <div className="rounded-md bg-muted/50 px-3 py-2 space-y-1">
          {order.items.map((ci, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{ci.quantity}× {ci.menuItem.name}{ci.customization ? ` (${ci.customization})` : ''}</span>
              <span>RM {(ci.menuItem.price * ci.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1">
          {STATUS_ORDER.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                STATUS_ORDER.indexOf(order.status) >= i ? 'bg-primary' : 'bg-muted'
              }`} />
            </div>
          ))}
        </div>

        <Separator />

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/orders/${order.id}`)}>
            View Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          <div className="flex gap-2">
            {actions.map(action => (
              <Button
                key={action.next}
                size="sm"
                onClick={() => onUpdateStatus(order.id, action.next)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StaffOrders() {
  const { orders, updateOrderStatus } = useCart();
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');
  const [tab, setTab] = useState<'all' | 'delivery'>('all');

  const activeOrders = useMemo(() => {
    if (tab === 'delivery') {
      return orders.filter(o => o.deliveryType === 'delivery' && ['ready', 'delivering'].includes(o.status));
    }
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter, tab]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      result[o.status] = (result[o.status] ?? 0) + 1;
    }
    return result;
  }, [orders]);

  const deliveryPending = orders.filter(o => o.deliveryType === 'delivery' && ['ready', 'delivering'].includes(o.status)).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Order Management</h1>
          <p className="text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-3">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 -mb-3 ${
            tab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setTab('delivery')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 -mb-3 ${
            tab === 'delivery' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Truck className="h-4 w-4" />
          Delivery Requests
          {deliveryPending > 0 && (
            <span className="rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5">{deliveryPending}</span>
          )}
        </button>
      </div>

      {/* Status filter (all orders tab only) */}
      {tab === 'all' && (
        <div className="flex flex-wrap gap-2">
          <StatPill label="All" count={counts.all ?? 0} active={filter === 'all'} onClick={() => setFilter('all')} />
          {(['pending', 'preparing', 'ready', 'delivering', 'completed'] as Order['status'][]).map(s => (
            <StatPill key={s} label={STATUS_META[s].label} count={counts[s] ?? 0} active={filter === s} onClick={() => setFilter(s)} />
          ))}
        </div>
      )}

      {/* Order cards */}
      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          {tab === 'delivery' ? <Truck className="h-12 w-12 mb-3 opacity-30" /> : <Package className="h-12 w-12 mb-3 opacity-30" />}
          <p className="text-lg font-medium">No orders here</p>
          <p className="text-sm mt-1">
            {tab === 'delivery' ? 'No pending delivery requests at the moment.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
