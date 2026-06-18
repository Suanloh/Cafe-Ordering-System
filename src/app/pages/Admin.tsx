import { useState, useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import { MenuItem, Order } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import {
  ShieldCheck, Plus, Trash2, Search, Package, Coffee,
  UtensilsCrossed, Croissant, GlassWater, Download, Calendar,
  TrendingUp, BarChart3, DollarSign, ShoppingBag, CheckCircle2,
  ToggleLeft, ToggleRight, AlertTriangle, Star, ImageOff,
} from "lucide-react";
import { toast } from "sonner";

// ── helpers ───────────────────────────────────────────────────────────────────

const CATEGORIES: MenuItem["category"][] = ["coffee", "food", "pastries", "drinks"];

const CAT_META: Record<MenuItem["category"], { label: string; icon: React.ReactNode; chip: string }> = {
  coffee:   { label: "Coffee",   icon: <Coffee className="h-3.5 w-3.5" />,          chip: "bg-amber-50 text-amber-700 border-amber-200" },
  food:     { label: "Food",     icon: <UtensilsCrossed className="h-3.5 w-3.5" />, chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pastries: { label: "Pastries", icon: <Croissant className="h-3.5 w-3.5" />,       chip: "bg-pink-50 text-pink-700 border-pink-200" },
  drinks:   { label: "Drinks",   icon: <GlassWater className="h-3.5 w-3.5" />,      chip: "bg-cyan-50 text-cyan-700 border-cyan-200" },
};

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

function exportCSV(rows: string[][], filename: string) {
  const csv = rows
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

// ── shared stat card ──────────────────────────────────────────────────────────

function KpiCard({ label, value, note, icon, color }: {
  label: string; value: string; note?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5 pb-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold truncate">{value}</p>
          {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MENU MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

const BLANK = {
  name: "", description: "", price: "",
  category: "coffee" as MenuItem["category"],
  image: "", customizations: "",
};

function AddItemDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addMenuItem } = useCart();
  const [f, setF] = useState(BLANK);
  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.description.trim() || !f.price) {
      toast.error("Name, description and price are required");
      return;
    }
    const price = parseFloat(f.price);
    if (isNaN(price) || price <= 0) { toast.error("Enter a valid price"); return; }
    addMenuItem({
      name: f.name.trim(),
      description: f.description.trim(),
      price,
      category: f.category,
      image: f.image.trim() ||
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format",
      available: true,
      customizations: f.customizations
        ? f.customizations.split(",").map(s => s.trim()).filter(Boolean)
        : undefined,
    });
    toast.success(`"${f.name}" added to menu`);
    setF(BLANK);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
          <DialogDescription>Fill in the details below to add a new item to the menu.</DialogDescription>
        </DialogHeader>
        <form id="add-form" onSubmit={submit} className="grid grid-cols-2 gap-3 py-1">
          <div className="space-y-1.5">
            <Label>Item Name *</Label>
            <Input placeholder="Caramel Latte" value={f.name} onChange={set("name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Price (USD) *</Label>
            <Input type="number" step="0.01" min="0.01" placeholder="4.50" value={f.price} onChange={set("price")} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Description *</Label>
            <Input placeholder="Rich espresso with sweet caramel drizzle…" value={f.description} onChange={set("description")} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={f.category} onValueChange={(v: MenuItem["category"]) => setF(p => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{CAT_META[c].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Customizations <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input placeholder="Hot, Iced, Decaf" value={f.customizations} onChange={set("customizations")} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Image URL <span className="text-muted-foreground text-xs">(optional — leave blank for default)</span></Label>
            <Input placeholder="https://images.unsplash.com/…" value={f.image} onChange={set("image")} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-form">
            <Plus className="h-4 w-4 mr-1.5" />Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ item, onConfirm, onClose }: {
  item: MenuItem | null; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2 mx-auto">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Delete Menu Item?</DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-semibold text-foreground">"{item?.name}"</span> will be permanently
            removed from the menu. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Yes, Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ItemCard({ item }: { item: MenuItem }) {
  const { deleteMenuItem, toggleMenuItemStatus } = useCart();
  const [delTarget, setDelTarget] = useState(false);
  const meta = CAT_META[item.category];

  function confirmDelete() {
    deleteMenuItem(item.id);
    toast.success(`"${item.name}" removed`);
    setDelTarget(false);
  }

  function toggle() {
    toggleMenuItemStatus(item.id);
    toast.success(`"${item.name}" is now ${item.available ? "unavailable" : "available"}`);
  }

  return (
    <>
      <div className={`group flex flex-col rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md ${!item.available ? "opacity-60" : ""}`}>
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={e => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.nextElementSibling as HTMLElement | null)?.classList.remove("hidden");
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
            <ImageOff className="h-8 w-8 text-muted-foreground/40" />
          </div>
          {/* Category chip */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.chip}`}>
              {meta.icon}{meta.label}
            </span>
          </div>
          {/* Unavailable overlay */}
          {!item.available && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="rounded-full bg-background border px-3 py-1 text-xs font-semibold text-muted-foreground">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 p-3 gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-tight">{item.name}</p>
            <span className="shrink-0 font-bold text-base">${item.price.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{item.description}</p>
          {item.customizations && item.customizations.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {item.customizations.slice(0, 3).map(c => (
                <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{c}</span>
              ))}
              {item.customizations.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">+{item.customizations.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex border-t divide-x">
          <button
            onClick={toggle}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              item.available
                ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {item.available
              ? <><ToggleRight className="h-4 w-4" />Available</>
              : <><ToggleLeft className="h-4 w-4" />Unavailable</>}
          </button>
          <button
            onClick={() => setDelTarget(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />Delete
          </button>
        </div>
      </div>

      <DeleteDialog
        item={delTarget ? item : null}
        onConfirm={confirmDelete}
        onClose={() => setDelTarget(false)}
      />
    </>
  );
}

function MenuManagement() {
  const { menuItems } = useCart();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<"all" | MenuItem["category"]>("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() =>
    menuItems.filter(item =>
      (cat === "all" || item.category === cat) &&
      (!search || item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()))
    ),
    [menuItems, cat, search]
  );

  const available = menuItems.filter(i => i.available).length;

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Items", value: menuItems.length, cls: "" },
          { label: "Available", value: available, cls: "text-emerald-600" },
          { label: "Unavailable", value: menuItems.length - available, cls: "text-muted-foreground" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input className="pl-9" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setShowAdd(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />Add New Item
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {([["all", "All", menuItems.length], ...CATEGORIES.map(c => [c, CAT_META[c].label, menuItems.filter(i => i.category === c).length])] as [string, string, number][]).map(([val, lbl, count]) => (
          <button
            key={val}
            onClick={() => setCat(val as typeof cat)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
              cat === val
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {val !== "all" && CAT_META[val as MenuItem["category"]].icon}
            {lbl}
            <span className={`rounded-full px-1.5 py-0.5 text-xs ${cat === val ? "bg-white/20" : "bg-muted"}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Package className="h-10 w-10 opacity-25" />
          <p className="text-sm">{search ? "No items match your search" : "No items in this category"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      )}

      <AddItemDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SALES REPORTS
// ══════════════════════════════════════════════════════════════════════════════

function buildSummary(orders: Order[]) {
  const done = orders.filter(o => o.status === "completed");
  const revenue = done.reduce((s, o) => s + o.total, 0);

  /* top items */
  const itemMap: Record<string, { name: string; qty: number; rev: number }> = {};
  for (const o of done) {
    for (const ci of o.items) {
      const k = ci.menuItem.id;
      if (!itemMap[k]) itemMap[k] = { name: ci.menuItem.name, qty: 0, rev: 0 };
      itemMap[k].qty += ci.quantity;
      itemMap[k].rev += ci.menuItem.price * ci.quantity;
    }
  }
  const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  /* by category */
  const catRev: Record<string, number> = {};
  for (const o of done)
    for (const ci of o.items) {
      catRev[ci.menuItem.category] = (catRev[ci.menuItem.category] ?? 0) + ci.menuItem.price * ci.quantity;
    }
  const catData = Object.entries(catRev).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: +value.toFixed(2),
  }));

  return { total: orders.length, done: done.length, revenue, avg: done.length ? revenue / done.length : 0, topItems, catData };
}

function buildHourBars(orders: Order[]) {
  const h: Record<number, number> = {};
  for (let i = 7; i <= 20; i++) h[i] = 0;
  for (const o of orders) { const hr = o.createdAt.getHours(); if (hr in h) h[hr]++; }
  return Object.entries(h).map(([hr, n]) => ({ x: `${hr}h`, n }));
}

function buildDayBars(orders: Order[], ref: Date) {
  const days = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const d: Record<number, number> = {};
  for (let i = 1; i <= days; i++) d[i] = 0;
  for (const o of orders) { const day = o.createdAt.getDate(); if (day in d) d[day]++; }
  return Object.entries(d).map(([day, n]) => ({ x: day, n }));
}

function doExport(orders: Order[], label: string) {
  const header = ["Order ID", "Date", "Customer", "Phone", "Delivery", "Location", "Payment", "Items", "Total", "Status"];
  const rows = orders.map(o => [
    o.id,
    o.createdAt.toLocaleString(),
    o.customerName,
    o.customerPhone,
    o.deliveryType,
    o.deliveryLocation ?? "—",
    o.paymentMethod,
    o.items.map(ci => `${ci.quantity}x ${ci.menuItem.name}`).join("; "),
    o.total.toFixed(2),
    o.status,
  ]);
  exportCSV([header, ...rows], `usm-cafe-${label}-${new Date().toISOString().slice(0, 10)}.csv`);
  toast.success("Report exported as CSV");
}

function ReportView({ orders, period, barData }: {
  orders: Order[];
  period: "daily" | "monthly";
  barData: { x: string | number; n: number }[];
}) {
  const s = useMemo(() => buildSummary(orders), [orders]);

  const RANK_BG = ["bg-amber-100 text-amber-700", "bg-slate-100 text-slate-600", "bg-orange-100 text-orange-700"];

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Orders" value={String(s.total)}
          icon={<ShoppingBag className="h-5 w-5" />} color="bg-blue-50 text-blue-600" />
        <KpiCard label="Completed" value={String(s.done)}
          note={`${s.total ? Math.round(s.done / s.total * 100) : 0}% rate`}
          icon={<CheckCircle2 className="h-5 w-5" />} color="bg-green-50 text-green-600" />
        <KpiCard label="Revenue" value={`$${s.revenue.toFixed(2)}`}
          note="from completed orders"
          icon={<DollarSign className="h-5 w-5" />} color="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Avg Order" value={s.avg ? `$${s.avg.toFixed(2)}` : "—"}
          icon={<Star className="h-5 w-5" />} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {period === "daily" ? "Orders by Hour" : "Orders by Day"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">
                No orders yet for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <XAxis dataKey="x" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    interval={period === "daily" ? 1 : 4} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    formatter={(v: number) => [v, "Orders"]}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  <Bar dataKey="n" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {s.catData.length === 0 ? (
              <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={s.catData} dataKey="value" nameKey="name"
                    cx="50%" cy="45%" outerRadius={60} paddingAngle={3}>
                    {s.catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top items */}
      {s.topItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {s.topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${RANK_BG[i] ?? "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline text-sm mb-1">
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="text-muted-foreground ml-2 shrink-0 text-xs">
                      {item.qty} sold · <span className="font-semibold text-foreground">${item.rev.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(item.qty / (s.topItems[0]?.qty || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Order log table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm">Order Log</CardTitle>
              <CardDescription className="text-xs">{orders.length} order{orders.length !== 1 ? "s" : ""} this period</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => doExport(orders, period)}>
              <Download className="h-4 w-4 mr-1.5" />Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-2">
              <Package className="h-9 w-9 opacity-25" />
              <p className="text-sm">No orders in this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground">
                    {["Order ID", "Customer", "Items", "Payment", "Total", "Status"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap
                        [&:nth-child(3)]:hidden [&:nth-child(3)]:md:table-cell
                        [&:nth-child(4)]:hidden [&:nth-child(4)]:sm:table-cell">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-semibold">{o.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{o.customerName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {o.deliveryType}{o.deliveryLocation ? ` · ${o.deliveryLocation}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {o.items.slice(0, 2).map(ci => `${ci.quantity}× ${ci.menuItem.name}`).join(", ")}
                        {o.items.length > 2 && ` +${o.items.length - 2}`}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground uppercase">
                          {o.paymentMethod === "tng" ? "TNG" : o.paymentMethod === "fpx" ? "FPX" : "Online"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">${o.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={o.status === "completed" ? "default" : o.status === "cancelled" ? "destructive" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SalesReports() {
  const { orders } = useCart();
  const now = new Date();

  const daily = useMemo(() => orders.filter(o => sameDay(o.createdAt, now)), [orders]);
  const monthly = useMemo(() => orders.filter(o => sameMonth(o.createdAt, now)), [orders]);
  const hourBars = useMemo(() => buildHourBars(daily), [daily]);
  const dayBars = useMemo(() => buildDayBars(monthly, now), [monthly]);

  const dayLabel = now.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const monthLabel = now.toLocaleDateString("en-MY", { month: "long", year: "numeric" });

  return (
    <Tabs defaultValue="daily" className="space-y-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <TabsList>
          <TabsTrigger value="daily">
            <Calendar className="h-4 w-4 mr-1.5" />Daily Report
          </TabsTrigger>
          <TabsTrigger value="monthly">
            <TrendingUp className="h-4 w-4 mr-1.5" />Monthly Report
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="daily" className="space-y-1 mt-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Daily Sales Report</h3>
            <p className="text-sm text-muted-foreground">{dayLabel}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => doExport(daily, "daily")}>
            <Download className="h-4 w-4 mr-1.5" />Export
          </Button>
        </div>
        <ReportView orders={daily} period="daily" barData={hourBars} />
      </TabsContent>

      <TabsContent value="monthly" className="space-y-1 mt-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Monthly Sales Report</h3>
            <p className="text-sm text-muted-foreground">{monthLabel}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => doExport(monthly, "monthly")}>
            <Download className="h-4 w-4 mr-1.5" />Export
          </Button>
        </div>
        <ReportView orders={monthly} period="monthly" barData={dayBars} />
      </TabsContent>
    </Tabs>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN SHELL
// ══════════════════════════════════════════════════════════════════════════════

export function Admin() {
  const { role, currentUser } = useUser();
  const { menuItems, orders } = useCart();
  const now = new Date();

  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          This page is only accessible to admin accounts. Please sign in with an admin account.
        </p>
      </div>
    );
  }

  const todayRevenue = orders
    .filter(o => sameDay(o.createdAt, now) && o.status === "completed")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-none">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome, {currentUser?.name.split(" ")[0]} · {currentUser?.department ?? "Admin"}
            </p>
          </div>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Menu Items" value={String(menuItems.length)}
          note={`${menuItems.filter(i => i.available).length} available`}
          icon={<Package className="h-5 w-5" />} color="bg-indigo-50 text-indigo-600" />
        <KpiCard label="Today's Orders" value={String(orders.filter(o => sameDay(o.createdAt, now)).length)}
          note={`${orders.filter(o => sameDay(o.createdAt, now) && ["pending", "preparing", "ready"].includes(o.status)).length} active`}
          icon={<ShoppingBag className="h-5 w-5" />} color="bg-blue-50 text-blue-600" />
        <KpiCard label="Today's Revenue" value={`$${todayRevenue.toFixed(2)}`}
          note="completed orders"
          icon={<DollarSign className="h-5 w-5" />} color="bg-emerald-50 text-emerald-600" />
        <KpiCard label="All-time Orders" value={String(orders.length)}
          note={`${orders.filter(o => o.status === "completed").length} completed`}
          icon={<CheckCircle2 className="h-5 w-5" />} color="bg-green-50 text-green-600" />
      </div>

      <Separator />

      {/* Main tabs */}
      <Tabs defaultValue="menu">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="menu" className="flex-1 sm:flex-none">
            <Package className="h-4 w-4 mr-1.5" />Menu Management
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex-1 sm:flex-none">
            <BarChart3 className="h-4 w-4 mr-1.5" />Sales Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <MenuManagement />
        </TabsContent>

        <TabsContent value="sales">
          <SalesReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
