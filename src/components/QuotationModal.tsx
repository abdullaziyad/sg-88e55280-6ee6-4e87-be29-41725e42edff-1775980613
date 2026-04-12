import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { useCart } from "@/contexts/CartContext";
import type { Customer } from "@/types";

interface QuotationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuotationModal({ open, onClose, onSuccess }: QuotationModalProps) {
  const { t } = useLanguage();
  const { createQuotation } = useDocuments();
  const { cart, getSubtotal, getTaxAmount, getTotal } = useCart();

  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert(t("cartEmpty"));
      return;
    }

    if (!validUntil) {
      alert(t("validUntilRequired"));
      return;
    }

    createQuotation({
      customer,
      items: cart,
      subtotal: getSubtotal(),
      taxAmount: getTaxAmount(),
      total: getTotal(),
      status: "pending",
      validUntil,
      notes,
    });

    onSuccess?.();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setCustomer({ name: "", phone: "", email: "", address: "" });
    setValidUntil("");
    setNotes("");
  };

  // Set default valid until date (30 days from now)
  const getDefaultValidUntil = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t("createQuotation")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-medium text-sm text-muted-foreground">{t("customerDetails")}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="customerName">{t("customerName")} *</Label>
              <Input
                id="customerName"
                required
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder={t("enterCustomerName")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder={t("phoneNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder={t("emailAddress")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Textarea
                id="address"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                placeholder={t("customerAddress")}
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4 border-b pb-4">
            <h3 className="font-medium text-sm text-muted-foreground">{t("quotationDetails")}</h3>

            <div className="space-y-2">
              <Label htmlFor="validUntil">{t("validUntil")} *</Label>
              <Input
                id="validUntil"
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                placeholder={getDefaultValidUntil()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("additionalNotes")}
                rows={3}
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("subtotal")}</span>
              <span>{t("mvr")} {getSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t("gst")}</span>
              <span>{t("mvr")} {getTaxAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>{t("total")}</span>
              <span>{t("mvr")} {getTotal().toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">
              {t("createQuotation")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}