import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, Calendar, CreditCard, Banknote, ShieldAlert, Receipt as ReceiptIcon } from "lucide-react";
import Link from "next/link";
import { transactionService } from "@/services/transactionService";

export default function History() {
  const { t } = useLanguage();
  const { isAdmin, currentStoreId } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (currentStoreId && isAdmin()) {
      transactionService.getTransactions(currentStoreId).then(setTransactions).catch(console.error);
    }
  }, [currentStoreId, isAdmin]);

  // Redirect if not admin
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl mb-2">{t("accessDenied")}</h2>
            <p className="text-muted-foreground mb-6">{t("adminOnly")}</p>
            <Button onClick={() => router.push("/")}>{t("backToHome")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.transaction_number?.toLowerCase().includes(searchQuery.toLowerCase()) || tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = paymentFilter === "all" || tx.payment_method === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  // Calculate totals
  const totalSales = transactions.reduce((sum, tx) => sum + Number(tx.total), 0);
  const totalTax = transactions.reduce((sum, tx) => sum + Number(tx.tax), 0);

  return (
    <>
      <SEO
        title={`${t("transactionHistory")} - ${t("appTitle")}`}
        description="View all past transactions and tax breakdowns"
      />

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("backToPos")}
                </Button>
              </Link>
              <div>
                <h1 className="font-heading font-bold text-xl">{t("transactionHistory")}</h1>
                <p className="text-sm text-muted-foreground">{t("viewPastSales")}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Summary Cards */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("totalTransactions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-heading font-bold">{transactions.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("totalSales")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-heading font-bold text-primary">
                  {t("mvr")} {totalSales.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("totalGst")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-heading font-bold text-accent">
                  {t("mvr")} {totalTax.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("netSales")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-heading font-bold">
                  {t("mvr")} {(totalSales - totalTax).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchByReceiptNumber")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t("filterByPayment")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allPayments")}</SelectItem>
                    <SelectItem value="cash">{t("cash")}</SelectItem>
                    <SelectItem value="card">{t("card")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <ReceiptIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("noTransactionsFound")}</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction) => {
                      const date = new Date(transaction.created_at);
                      const isExpanded = selectedTransaction === transaction.id;

                      return (
                        <Card
                          key={transaction.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() =>
                            setSelectedTransaction(isExpanded ? null : transaction.id)
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <ReceiptIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {t("receiptNumber")}: {transaction.transaction_number || transaction.id.slice(-6)}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                      {date.toLocaleDateString()} {date.toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="font-heading font-bold text-lg text-primary">
                                  {t("mvr")} {Number(transaction.total).toFixed(2)}
                                </p>
                                <Badge
                                  variant={
                                    transaction.payment_method === "cash"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="mt-1"
                                >
                                  {transaction.payment_method === "cash" ? (
                                    <Banknote className="w-3 h-3 mr-1" />
                                  ) : (
                                    <CreditCard className="w-3 h-3 mr-1" />
                                  )}
                                  {transaction.payment_method === "cash"
                                    ? t("cash")
                                    : t("card")}
                                </Badge>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t pt-3 mt-3 space-y-3">
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground">
                                    {t("items")}:
                                  </p>
                                  {transaction.transaction_items?.map((item: any) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded"
                                    >
                                      <div className="flex-1">
                                        <p className="font-medium">Product ID: {item.product_id}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {item.quantity} x {t("mvr")} {Number(item.unit_price).toFixed(2)}
                                        </p>
                                      </div>
                                      <p className="font-medium">
                                        {t("mvr")}{" "}
                                        {Number(item.total).toFixed(2)}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                <div className="border-t pt-3 space-y-1">
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{t("subtotal")}</span>
                                    <span>{t("mvr")} {Number(transaction.subtotal).toFixed(2)}</span>
                                  </div>
                                  {Number(transaction.tax) > 0 && (
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                      <span>{t("gst")}</span>
                                      <span>{t("mvr")} {Number(transaction.tax).toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-semibold pt-1 border-t">
                                    <span>{t("total")}</span>
                                    <span className="text-primary">
                                      {t("mvr")} {Number(transaction.total).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}