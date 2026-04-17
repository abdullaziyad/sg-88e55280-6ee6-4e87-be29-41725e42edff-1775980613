import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Receipt } from "@/components/Receipt";
import { Transaction } from "@/types";
import { CreditCard, Banknote, CheckCircle2 } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentModal({ open, onClose, onComplete }: PaymentModalProps) {
  const { getTotal, completeTransaction, cart } = useCart();
  const { t } = useLanguage();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handlePayment = async (method: "cash" | "card") => {
    try {
      const completedTransaction = await completeTransaction(method);
      setTransaction(completedTransaction);
      setShowReceipt(true);
    } catch (error: any) {
      console.error("Payment error:", error);
      
      // If it's an authentication error, close modal and let parent handle login
      if (error.message.includes("session") || error.message.includes("sign in")) {
        alert(error.message);
        handleClose();
      } else {
        alert(error.message || "Payment failed. Please try again.");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setShowReceipt(false);
    setTransaction(null);
    onClose();
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!showReceipt ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading">{t("selectPaymentMethod")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="text-center py-6 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">{t("total")}</p>
                <p className="text-3xl font-heading font-bold text-primary">
                  {t("mvr")} {getTotal().toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-24 flex-col gap-2"
                  onClick={() => handlePayment("cash")}
                  disabled={cart.length === 0}
                >
                  <Banknote className="w-8 h-8" />
                  <span>{t("cash")}</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-24 flex-col gap-2"
                  onClick={() => handlePayment("card")}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="w-8 h-8" />
                  <span>{t("card")}</span>
                </Button>
              </div>
            </div>
          </>
        ) : transaction ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                {t("paymentSuccessful")}
              </DialogTitle>
            </DialogHeader>
            <Receipt transaction={transaction} onPrint={handlePrint} />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}