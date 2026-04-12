import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckoutCartProps {
  onCheckout: () => void;
}

export function CheckoutCart({ onCheckout }: CheckoutCartProps) {
  const { cart, removeFromCart, updateQuantity, getTotal } = useCart();

  if (cart.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="font-heading font-semibold text-lg">Cart is Empty</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add products to start a transaction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-heading">Shopping Cart ({cart.length})</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    MVR {item.product.price.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.product.id, parseInt(e.target.value) || 1)
                    }
                    className="h-7 w-12 text-center p-0"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="text-right min-w-[80px]">
                  <p className="font-semibold text-sm">
                    MVR {(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-6 pt-6 border-t space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-heading font-semibold">Total</span>
            <span className="text-2xl font-heading font-bold text-primary">
              MVR {getTotal().toFixed(2)}
            </span>
          </div>

          <Button className="w-full" size="lg" onClick={onCheckout}>
            Complete Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}