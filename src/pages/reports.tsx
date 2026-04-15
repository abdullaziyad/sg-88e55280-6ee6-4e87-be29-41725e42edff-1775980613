import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useReports } from "@/contexts/ReportsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Banknote,
  Package,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { productService } from "@/services/productService";
import { transactionService } from "@/services/transactionService";

export default function ReportsPage() {
  const { user, isAdmin, currentStoreId } = useAuth();
  const { getDailySalesReport, getDateRangeSalesReport, exportToCSV } = useReports();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const [dailyReport, setDailyReport] = useState<any>({
    totalSales: 0,
    totalTransactions: 0,
    totalTax: 0,
    cashSales: 0,
    cardSales: 0,
    averageTransaction: 0,
  });
  const [rangeReport, setRangeReport] = useState<any>({
    totalSales: 0,
    totalTransactions: 0,
    totalTax: 0,
    cashSales: 0,
    cardSales: 0,
    averageTransaction: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [expiryProducts, setExpiryProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!currentStoreId || !isAdmin()) return;

    const loadData = async () => {
      try {
        const dReport = await getDailySalesReport(selectedDate.toISOString().split("T")[0]);
        setDailyReport(dReport);

        const rReport = await getDateRangeSalesReport(
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0]
        );
        setRangeReport(rReport);

        // Fetch low stock
        const lowStock = await productService.getLowStockProducts(currentStoreId, settings.system.lowStockThreshold);
        setLowStockProducts(lowStock);

        // Fetch products for expiry
        const products = await productService.getProducts(currentStoreId);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const expiry = products
          .filter((p: any) => p.hasExpiry && p.expiryDate)
          .map((p: any) => {
            const expiryDate = new Date(p.expiryDate);
            expiryDate.setHours(0, 0, 0, 0);
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            let status = "normal";
            if (daysUntilExpiry < 0) status = "expired";
            else if (daysUntilExpiry === 0) status = "today";
            else if (daysUntilExpiry <= 7) status = "critical";
            else if (daysUntilExpiry <= 30) status = "warning";

            return {
              ...p,
              daysUntilExpiry,
              status,
            };
          })
          .filter((p: any) => p.daysUntilExpiry <= 30)
          .sort((a: any, b: any) => a.daysUntilExpiry - b.daysUntilExpiry);
        
        setExpiryProducts(expiry);

        const allTrans = await transactionService.getTransactions(currentStoreId);
        setTransactions(allTrans);

        // Top products calculation from allTrans based on date range
        const productSales: Record<string, { name: string, qty: number, revenue: number }> = {};
        allTrans.forEach(t => {
          const tDate = new Date(t.created_at).toISOString().split("T")[0];
          if (tDate >= startDate.toISOString().split("T")[0] && tDate <= endDate.toISOString().split("T")[0]) {
            t.transaction_items?.forEach((item: any) => {
              if (item.product_id) {
                if (!productSales[item.product_id]) {
                  const p = products.find(prod => prod.id === item.product_id);
                  productSales[item.product_id] = {
                    name: p?.name || "Unknown",
                    qty: 0,
                    revenue: 0
                  };
                }
                productSales[item.product_id].qty += item.quantity;
                productSales[item.product_id].revenue += Number(item.total);
              }
            });
          }
        });

        const top = Object.entries(productSales)
          .map(([id, data]) => ({ productId: id, productName: data.name, quantitySold: data.qty, revenue: data.revenue }))
          .sort((a, b) => b.quantitySold - a.quantitySold)
          .slice(0, 10);
        
        setTopProducts(top);

      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [currentStoreId, isAdmin, selectedDate, startDate, endDate, getDailySalesReport, getDateRangeSalesReport, settings.system.lowStockThreshold]);


  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
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

  const handlePrintDayEnd = () => {
    window.print();
  };

  const handleExportSales = () => {
    const data = transactions
      .filter((t) => {
        const tDate = new Date(t.created_at).toISOString().split("T")[0];
        return tDate >= startDate.toISOString().split("T")[0] && tDate <= endDate.toISOString().split("T")[0];
      })
      .map((t) => ({
        Date: new Date(t.created_at).toLocaleDateString(),
        Time: new Date(t.created_at).toLocaleTimeString(),
        Receipt: t.transaction_number || t.id.slice(-6),
        Items: t.transaction_items?.length || 0,
        Subtotal: Number(t.subtotal).toFixed(2),
        Tax: Number(t.tax).toFixed(2),
        Total: Number(t.total).toFixed(2),
        Payment: t.payment_method,
      }));

    const filename = `sales_report_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}`;
    exportToCSV(data, filename);
  };

  const getExpiryBadgeVariant = (status: string) => {
    switch (status) {
      case "expired": return "destructive";
      case "today": return "destructive";
      case "critical": return "destructive";
      case "warning": return "secondary";
      default: return "outline";
    }
  };

  const getExpiryStatusText = (status: string, days: number) => {
    if (status === "expired") return `${t("expired")} (${Math.abs(days)} ${t("daysAgo")})`;
    if (status === "today") return t("expiresToday");
    if (status === "critical") return `${t("expires")} ${days} ${t("daysLeft")}`;
    if (status === "warning") return `${days} ${t("daysLeft")}`;
    return "";
  };

  return (
    <>
      <SEO title={`${t("reports")} - ${t("appTitle")}`} />

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card print:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("backToPos")}
                </Button>
              </Link>
              <div>
                <h1 className="font-heading font-bold text-xl">{t("reportsAndAnalytics")}</h1>
                <p className="text-sm text-muted-foreground">{t("viewSalesReports")}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          <Tabs defaultValue="dayend" className="space-y-6">
            <TabsList className="print:hidden">
              <TabsTrigger value="dayend">{t("dayEndReport")}</TabsTrigger>
              <TabsTrigger value="sales">{t("salesReports")}</TabsTrigger>
              <TabsTrigger value="products">{t("productReports")}</TabsTrigger>
              <TabsTrigger value="inventory">{t("inventoryReport")}</TabsTrigger>
              <TabsTrigger value="expiry">{t("expiryAlert")}</TabsTrigger>
            </TabsList>

            <TabsContent value="dayend" className="space-y-6">
              <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button onClick={handlePrintDayEnd}>
                  <Printer className="w-4 h-4 mr-2" />
                  {t("printReport")}
                </Button>
              </div>

              <div className="print-content">
                <div className="text-center mb-6 print:block hidden">
                  <h1 className="font-heading font-bold text-2xl">{settings.shop.businessName}</h1>
                  <p className="text-muted-foreground">{t("dayEndReport")}</p>
                  <p className="text-sm">{format(selectedDate, "PPPP")}</p>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("totalSales")}</p>
                          <p className="text-2xl font-heading font-bold">{t("mvr")} {dailyReport.totalSales.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("totalTransactions")}</p>
                          <p className="text-2xl font-heading font-bold">{dailyReport.totalTransactions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("totalGst")}</p>
                          <p className="text-2xl font-heading font-bold">{t("mvr")} {dailyReport.totalTax.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("averageTransaction")}</p>
                          <p className="text-2xl font-heading font-bold">{t("mvr")} {dailyReport.averageTransaction.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-heading">{t("paymentBreakdown")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Banknote className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{t("cash")}</span>
                        </div>
                        <span className="font-semibold">{t("mvr")} {dailyReport.cashSales.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{t("card")}</span>
                        </div>
                        <span className="font-semibold">{t("mvr")} {dailyReport.cardSales.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-muted-foreground">{t("to")}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, "PP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button onClick={handleExportSales}>
                  <Download className="w-4 h-4 mr-2" />
                  {t("exportCSV")}
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("totalSales")}</p>
                        <p className="text-2xl font-heading font-bold">{t("mvr")} {rangeReport.totalSales.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("transactions")}</p>
                        <p className="text-2xl font-heading font-bold">{rangeReport.totalTransactions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("totalGst")}</p>
                        <p className="text-2xl font-heading font-bold">{t("mvr")} {rangeReport.totalTax.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">{t("topSellingProducts")}</CardTitle>
                  <CardDescription>{t("basedOnQuantitySold")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("rank")}</TableHead>
                        <TableHead>{t("product")}</TableHead>
                        <TableHead className="text-right">{t("quantitySold")}</TableHead>
                        <TableHead className="text-right">{t("revenue")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product, index) => (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell className="text-right">{product.quantitySold}</TableCell>
                          <TableCell className="text-right font-semibold">{t("mvr")} {product.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {topProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">{t("noData")}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    {t("lowStockAlert")}
                  </CardTitle>
                  <CardDescription>{t("productsNeedingRestock")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("product")}</TableHead>
                        <TableHead>{t("sku")}</TableHead>
                        <TableHead className="text-right">{t("currentStock")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell className="text-right">
                            <span className={product.stock === 0 ? "text-destructive font-semibold" : ""}>{product.stock}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {lowStockProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">{t("allStockNormal")}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expiry" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    {t("expiryAlert")}
                  </CardTitle>
                  <CardDescription>{t("productsExpiringSoon")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("product")}</TableHead>
                        <TableHead>{t("sku")}</TableHead>
                        <TableHead>{t("batch")}</TableHead>
                        <TableHead>{t("expiryDate")}</TableHead>
                        <TableHead className="text-right">{t("expiryStatus")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiryProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell className="font-mono text-sm">{product.batchNumber || "-"}</TableCell>
                          <TableCell>{new Date(product.expiryDate!).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={getExpiryBadgeVariant(product.status)}>
                              {getExpiryStatusText(product.status, product.daysUntilExpiry)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {expiryProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">{t("noExpiringProducts")}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}