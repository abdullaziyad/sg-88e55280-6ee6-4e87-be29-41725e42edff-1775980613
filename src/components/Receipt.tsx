import { useLanguage } from "@/contexts/LanguageContext";
import { Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";

interface ReceiptProps {
  transaction: Transaction;
  onPrint: () => void;
}

export function Receipt({ transaction, onPrint }: ReceiptProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="receipt-content bg-white text-black p-6 rounded-lg border-2 border-dashed">
        <div className="text-center mb-6">
          <h2 className="font-heading font-bold text-2xl">{t("appTitle")}</h2>
          <p className="text-sm text-gray-600 mt-1">{t("receipt")}</p>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t("date")}:</span>
            <span className="font-medium">
              {new Date(transaction.timestamp).toLocaleDateString("en-GB")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("time")}:</span>
            <span className="font-medium">
              {new Date(transaction.timestamp).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("receiptNumber")}:</span>
            <span className="font-medium font-mono">#{transaction.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("paymentMethod")}:</span>
            <span className="font-medium capitalize">{transaction.paymentMethod}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="font-semibold text-sm">{t("items")}:</div>
          {transaction.items.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-start">
                <span className="flex-1 text-sm font-medium">{item.product.name}</span>
                <span className="text-sm font-medium">
                  {t("mvr")} {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 pl-2">
                <span>
                  {item.quantity} × {t("mvr")} {item.product.price.toFixed(2)}
                </span>
                <span className="text-gray-500">{item.product.sku}</span>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t("subtotal")}:</span>
            <span>{t("mvr")} {transaction.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>{t("total")}:</span>
            <span className="text-primary">
              {t("mvr")} {transaction.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
          <p>{t("thankYou")}</p>
          <p className="mt-1">{t("visitAgain")}</p>
        </div>
      </div>

      <Button onClick={onPrint} className="w-full" size="lg">
        <Printer className="w-4 h-4 mr-2" />
        {t("printReceipt")}
      </Button>
    </div>
  );
}