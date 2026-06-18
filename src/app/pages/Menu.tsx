import { useState } from "react";
import { MenuItem } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Plus, ShoppingCart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <CardDescription className="mt-1">{item.description}</CardDescription>
          </div>
          {!item.available && (
            <Badge variant="secondary">Sold Out</Badge>
          )}
        </div>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <span className="font-semibold text-lg">RM {item.price.toFixed(2)}</span>
        <Button
          onClick={() => onAdd(item)}
          disabled={!item.available}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

export function Menu() {
  const { addToCart, menuItems } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customization, setCustomization] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'food', label: 'Food' },
    { value: 'pastries', label: 'Pastries' },
    { value: 'drinks', label: 'Drinks' }
  ];

  const handleAddToCart = (item: MenuItem) => {
    if (item.customizations && item.customizations.length > 0) {
      setSelectedItem(item);
      setCustomization(item.customizations[0]);
      setNotes("");
      setIsDialogOpen(true);
    } else {
      addToCart(item);
      toast.success(`${item.name} added to cart!`);
    }
  };

  const handleConfirmAddToCart = () => {
    if (selectedItem) {
      addToCart(selectedItem, customization || undefined, notes || undefined);
      toast.success(`${selectedItem.name} added to cart!`);
      setIsDialogOpen(false);
      setSelectedItem(null);
      setCustomization("");
      setNotes("");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">USM Cafe Menu</h1>
        <p className="text-muted-foreground">Order your favorite items for pickup or delivery</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.value} value={cat.value}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems
                .filter(item => cat.value === 'all' || item.category === cat.value)
                .map(item => (
                  <MenuItemCard key={item.id} item={item} onAdd={handleAddToCart} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Customization Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize {selectedItem?.name}</DialogTitle>
            <DialogDescription>
              Choose your preferences for this item
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedItem?.customizations && selectedItem.customizations.length > 0 && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.customizations.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCustomization(option)}
                      className={`rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-all ${
                        customization === option
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Special Instructions (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
