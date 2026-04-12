import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { useCart } from "@/contexts/CartContext";
import type { Customer } from "@/types";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InvoiceModal({ open, onClose, onSuccess }: InvoiceModalProps) {
  const { t } = useLanguage();
  const { createInvoice } = useDocuments();
  const { cart, getSubtotal, getTaxAmount, getTotal } = useCart();

  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "pending">("pending");
  const [status, setStatus] = useState<"paid" | "unpaid">("unpaid");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert(t("cartEmpty"));
      return;
    }

    createInvoice({
      customer,
      items: cart,
      subtotal: getSubtotal(),
      taxAmount: getTaxAmount(),
      total: getTotal(),
      paymentMethod,
      status,
      notes,
      dueDate: dueDate || undefined,
    });

    onSuccess?.();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setCustomer({ name: "", phone: "", email: "", address: "" });
    setPaymentMethod("pending");
    setStatus("unpaid");
    setNotes("");
    setDueDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t("createInvoice")}</DialogTitle>
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
            <h3 className="font-medium text-sm text-muted-foreground">{t("invoiceDetails")}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment">{t("paymentMethod")}</Label>
                <Select value={paymentMethod} onValueChange={(value: "cash" | "card" | "pending") => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("pending")}</SelectItem>
                    <SelectItem value="cash">{t("cash")}</SelectItem>
                    <SelectItem value="card">{t("card")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t("status")}</Label>
                <Select value={status} onValueChange={(value: "paid" | "unpaid") => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
                    <SelectItem value="paid">{t("paid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">{t("dueDate")}</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
              {t("createInvoice")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}