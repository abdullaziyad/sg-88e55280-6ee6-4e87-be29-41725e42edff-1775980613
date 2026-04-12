import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { CreditCard, Banknote, Receipt } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentModal({ open, onClose, onComplete }: PaymentModalProps) {
  const { getTotal, completeTransaction } = useCart();
  const [showReceipt, setShowReceipt] = useState(false);

  const handlePayment = (method: "cash" | "card") => {
    completeTransaction(method);
    setShowReceipt(true);
    setTimeout(() => {
      setShowReceipt(false);
      onClose();
      onComplete();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {!showReceipt ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading">Select Payment Method</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="text-center py-6 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
                <p className="text-3xl font-heading font-bold text-primary">
                  MVR {getTotal().toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-24 flex-col gap-2"
                  onClick={() => handlePayment("cash")}
                >
                  <Banknote className="w-8 h-8" />
                  <span>Cash</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-24 flex-col gap-2"
                  onClick={() => handlePayment("card")}
                >
                  <CreditCard className="w-8 h-8" />
                  <span>Card</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Receipt className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="font-heading font-semibold text-xl mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">Transaction completed</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}