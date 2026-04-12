import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useCredit } from "@/contexts/CreditContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Customer } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface CreditBillModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreditBillModal({ open, onClose, onSuccess }: CreditBillModalProps) {
  const { cart, getSubtotal, getTaxAmount, getTotal } = useCart();
  const { createCreditBill } = useCredit();
  const { t } = useLanguage();
  
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  
  const [dueDate, setDueDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert(t("cartEmpty"));
      return;
    }

    if (!customer.name || !customer.phone) {
      alert(t("customerNamePhoneRequired"));
      return;
    }

    createCreditBill({
      customer,
      items: cart,
      subtotal: getSubtotal(),
      taxAmount: getTaxAmount(),
      total: getTotal(),
      createdAt: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      notes,
    });

    // Reset form
    setCustomer({ name: "", phone: "", email: "", address: "" });
    setNotes("");
    setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t("createCreditBill")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">{t("customerDetails")}</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">{t("customerName")} *</Label>
                  <Input
                    id="name"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder={t("enterCustomerName")}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{t("phone")} *</Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder={t("phoneNumber")}
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder={t("emailAddress")}
                  />
                </div>

                <div>
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
            </div>

            <div>
              <h3 className="font-medium mb-3">{t("creditBillDetails")}</h3>
              <div className="space-y-3">
                <div>
                  <Label>{t("dueDate")} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dueDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => date && setDueDate(date)}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="notes">{t("notes")}</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("additionalNotes")}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("items")}</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span>{t("mvr")} {getSubtotal().toFixed(2)}</span>
                </div>
                {getTaxAmount() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("gst")}</span>
                    <span>{t("mvr")} {getTaxAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>{t("total")}</span>
                  <span className="text-primary">{t("mvr")} {getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">
              {t("createCreditBill")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}