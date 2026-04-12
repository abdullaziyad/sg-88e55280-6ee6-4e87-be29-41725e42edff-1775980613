import { useState } from "react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useCredit } from "@/contexts/CreditContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Users, TrendingUp, AlertCircle, DollarSign, Phone, Mail, MapPin, Calendar, Receipt } from "lucide-react";
import { CreditBill, CreditPayment } from "@/types";

export default function CreditManagement() {
  const { user, isAdmin } = useAuth();
  const { getAllLedgers, getOverdueBills, recordPayment } = useCredit();
  const { t } = useLanguage();
  const [selectedBill, setSelectedBill] = useState<CreditBill | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold mb-2">{t("accessDenied")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminOnly")}</p>
            <Link href="/">
              <Button>{t("backToHome")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ledgers = getAllLedgers();
  const overdueBills = getOverdueBills();
  const totalOutstanding = ledgers.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalOverdue = overdueBills.reduce((sum, b) => sum + b.amountDue, 0);

  const handleRecordPayment = () => {
    if (!selectedBill) return;
    
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || amount > selectedBill.amountDue) {
      alert(t("invalidPaymentAmount"));
      return;
    }

    recordPayment(selectedBill.id, {
      amount,
      paymentMethod,
      paymentDate: new Date().toISOString(),
      notes: paymentNotes,
    });

    setShowPaymentModal(false);
    setSelectedBill(null);
    setPaymentAmount("");
    setPaymentNotes("");
  };

  const getStatusBadge = (status: CreditBill["status"]) => {
    const variants: Record<CreditBill["status"], "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      partial: "default",
      paid: "outline",
      overdue: "destructive",
    };
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <>
      <SEO title={`${t("creditManagement")} - ${t("appTitle")}`} />

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("backToPos")}
                </Button>
              </Link>
              <div>
                <h1 className="font-heading font-bold text-xl">{t("creditManagement")}</h1>
                <p className="text-sm text-muted-foreground">{t("manageCreditBills")}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalCustomers")}</p>
                    <p className="text-2xl font-heading font-bold">{ledgers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalOutstanding")}</p>
                    <p className="text-2xl font-heading font-bold">{t("mvr")} {totalOutstanding.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("overdueBills")}</p>
                    <p className="text-2xl font-heading font-bold">{overdueBills.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalOverdue")}</p>
                    <p className="text-2xl font-heading font-bold">{t("mvr")} {totalOverdue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">{t("customerLedgers")}</CardTitle>
            </CardHeader>
            <CardContent>
              {ledgers.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("noCreditBills")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ledgers.map((ledger) => (
                    <Card key={ledger.customerId} className="border-2">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-heading font-semibold text-lg">{ledger.customer.name}</h3>
                              <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                                {ledger.customer.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    <span>{ledger.customer.phone}</span>
                                  </div>
                                )}
                                {ledger.customer.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    <span>{ledger.customer.email}</span>
                                  </div>
                                )}
                                {ledger.customer.address && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    <span>{ledger.customer.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{t("outstandingBalance")}</p>
                              <p className="text-2xl font-heading font-bold text-destructive">
                                {t("mvr")} {ledger.outstandingBalance.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="space-y-3">
                              {ledger.creditBills.map((bill) => (
                                <div key={bill.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{bill.billNumber}</span>
                                      {getStatusBadge(bill.status)}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                                      <span>{bill.items.length} items</span>
                                    </div>
                                  </div>
                                  <div className="text-right mr-4">
                                    <p className="text-sm text-muted-foreground">Due Amount</p>
                                    <p className="font-semibold">{t("mvr")} {bill.amountDue.toFixed(2)}</p>
                                  </div>
                                  {bill.status !== "paid" && (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedBill(bill);
                                        setPaymentAmount(bill.amountDue.toString());
                                        setShowPaymentModal(true);
                                      }}
                                    >
                                      {t("recordPayment")}
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("recordPayment")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedBill && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("billNumber")}</span>
                  <span className="font-medium">{selectedBill.billNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("totalAmount")}</span>
                  <span className="font-medium">{t("mvr")} {selectedBill.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("amountPaid")}</span>
                  <span className="font-medium">{t("mvr")} {selectedBill.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>{t("amountDue")}</span>
                  <span className="text-destructive">{t("mvr")} {selectedBill.amountDue.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="amount">{t("paymentAmount")} *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="method">{t("paymentMethod")} *</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "cash" | "card")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t("cash")}</SelectItem>
                    <SelectItem value="card">{t("card")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea
                  id="notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder={t("additionalNotes")}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleRecordPayment}>
              {t("recordPayment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}