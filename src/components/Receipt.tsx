import { useLanguage } from "@/contexts/LanguageContext";
import { Transaction } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Store } from "lucide-react";

interface ReceiptProps {
  transaction: Transaction;
  onPrint?: () => void;
}

export function Receipt({ transaction, onPrint }: ReceiptProps) {
  const { t } = useLanguage();
  const date = new Date(transaction.timestamp);

  return (
    <div className="flex flex-col gap-4">
      <Card className="receipt-content max-w-sm mx-auto shadow-none border-dashed border-2">
        <CardHeader className="text-center pb-2 border-b border-dashed">
          <div className="flex justify-center mb-2">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-bold text-xl">{t("appTitle")}</h2>
          <p className="text-sm text-muted-foreground">Maldives</p>
        </CardHeader>

        <CardContent className="py-4 text-sm space-y-4">
          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <div>
              <p>{t("date")}: {date.toLocaleDateString()}</p>
              <p>{t("time")}: {date.toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <p>{t("receiptNumber")}</p>
              <p className="font-mono">{transaction.id.slice(-6)}</p>
            </div>
          </div>

          <div className="border-t border-dashed pt-4">
            <table className="w-full">
              <thead>
                <tr className="text-muted-foreground border-b border-dashed">
                  <th className="text-left font-normal pb-2">{t("receiptItems")}</th>
                  <th className="text-center font-normal pb-2">Qty</th>
                  <th className="text-right font-normal pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {transaction.items.map((item) => (
                  <tr key={item.product.id}>
                    <td className="py-2 pr-2">
                      <p className="font-medium truncate max-w-[150px]">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.product.price.toFixed(2)}</p>
                    </td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{(item.product.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter className="flex-col pt-4 border-t border-dashed gap-4">
          <div className="w-full space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>{t("subtotal")}</span>
              <span>{transaction.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>{t("total")}</span>
              <span>{t("mvr")} {transaction.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground pt-2 text-xs">
              <span>Payment</span>
              <span className="capitalize">{transaction.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center space-y-1 pt-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t("thankYou")}</p>
            <p>{t("visitAgain")}</p>
          </div>
        </CardFooter>
      </Card>

      {onPrint && (
        <Button onClick={onPrint} className="max-w-sm mx-auto w-full">
          <Printer className="w-4 h-4 mr-2" />
          {t("printReceipt")}
        </Button>
      )}
    </div>
  );
}