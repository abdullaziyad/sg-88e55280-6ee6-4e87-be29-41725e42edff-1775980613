import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingCart, FileText, Receipt, CreditCard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckoutCartProps {
  onCheckout: () => void;
  onCreateInvoice?: () => void;
  onCreateQuotation?: () => void;
  onCreateCreditBill?: () => void;
}

export function CheckoutCart({ onCheckout, onCreateInvoice, onCreateQuotation, onCreateCreditBill }: CheckoutCartProps) {
  const { cart, removeFromCart, updateQuantity, getSubtotal, getTaxAmount, getTotal } = useCart();
  const { t } = useLanguage();

  if (cart.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="font-heading font-semibold text-lg">{t("emptyCart")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("emptyCartMessage")}
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
        <CardTitle className="font-heading">{t("cart")} ({cart.length})</CardTitle>
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
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {t("mvr")} {item.product.price.toFixed(2)}
                    </p>
                    {!item.product.taxExempt && (
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        {item.product.taxRate}% GST
                      </Badge>
                    )}
                  </div>
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
                    {t("mvr")} {(item.product.price * item.quantity).toFixed(2)}
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

        <div className="mt-6 pt-6 border-t space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t("subtotal")}</span>
              <span>{t("mvr")} {getSubtotal().toFixed(2)}</span>
            </div>
            {getTaxAmount() > 0 && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{t("gst")}</span>
                <span>{t("mvr")} {getTaxAmount().toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-lg font-heading font-semibold">{t("total")}</span>
            <span className="text-2xl font-heading font-bold text-primary">
              {t("mvr")} {getTotal().toFixed(2)}
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <Button className="w-full" size="lg" onClick={onCheckout}>
              <Receipt className="w-4 h-4 mr-2" />
              {t("completePayment")}
            </Button>

            {onCreateInvoice && (
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={onCreateInvoice}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t("createInvoice")}
              </Button>
            )}

            {onCreateQuotation && (
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={onCreateQuotation}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t("createQuotation")}
              </Button>
            )}

            {onCreateCreditBill && (
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={onCreateCreditBill}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {t("createCreditBill")}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}