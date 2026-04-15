import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { ProductCard } from "@/components/ProductCard";
import { CheckoutCart } from "@/components/CheckoutCart";
import { PaymentModal } from "@/components/PaymentModal";
import { AddProductModal } from "@/components/AddProductModal";
import { LoginModal } from "@/components/LoginModal";
import { InvoiceModal } from "@/components/InvoiceModal";
import { QuotationModal } from "@/components/QuotationModal";
import { CreditBillModal } from "@/components/CreditBillModal";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { mockProducts } from "@/lib/mockData";
import { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Package, LogIn, LogOut, ShieldCheck, History, Monitor, Settings, CreditCard, FileBarChart, Users, ScanLine, CheckCircle2, XCircle, Shield } from "lucide-react";
import Link from "next/link";
import {
  getTerminalName,
  getSharedInventory,
  updateSharedInventory,
  onMessage,
  initBroadcastChannel,
} from "@/lib/multiWindow";

function POSContent() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const [showCreditBill, setShowCreditBill] = useState(false);
  const [terminalName, setTerminalName] = useState("");
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>("");
  const { addToCart, cart, clearCart } = useCart();
  const { t } = useLanguage();
  const { user, logout, isAdmin, isCashier } = useAuth();
  const { toast } = useToast();

  // Barcode scanner integration
  useBarcodeScanner({
    onScan: (barcode) => {
      setLastScannedBarcode(barcode);
      
      // Find product by barcode
      const product = products.find((p) => p.barcode === barcode);
      
      if (product) {
        // Check if product is in stock and not expired
        if (product.stock === 0) {
          toast({
            title: t("outOfStock"),
            description: `${product.name} - ${t("productNotFound")}`,
            variant: "destructive",
          });
          return;
        }

        // Check if product is expired
        if (product.hasExpiry && product.expiryDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expiryDate = new Date(product.expiryDate);
          expiryDate.setHours(0, 0, 0, 0);
          
          if (expiryDate < today) {
            toast({
              title: t("expired"),
              description: `${product.name} - ${t("productNotFound")}`,
              variant: "destructive",
            });
            return;
          }
        }

        // Add to cart
        handleAddToCart(product);
        
        toast({
          title: t("productScanned"),
          description: `${product.name} ${t("productAddedToCart")}`,
        });
      } else {
        toast({
          title: t("productNotFound"),
          description: `${t("barcode")}: ${barcode}`,
          variant: "destructive",
        });
      }
      
      // Clear last scanned after 2 seconds
      setTimeout(() => setLastScannedBarcode(""), 2000);
    },
    onError: (error) => {
      console.error("Barcode scanner error:", error);
    },
    enabled: true,
  });

  // Initialize terminal and sync inventory
  useEffect(() => {
    setTerminalName(getTerminalName());
    
    // Load shared inventory
    const sharedInventory = getSharedInventory();
    if (Object.keys(sharedInventory).length > 0) {
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          stock: sharedInventory[p.id] !== undefined ? sharedInventory[p.id] : p.stock,
        }))
      );
    } else {
      // Initialize shared inventory with current stock
      products.forEach((p) => {
        updateSharedInventory(p.id, p.stock);
      });
    }

    // Listen for stock updates from other windows
    const cleanup = onMessage((message) => {
      if (message.type === "stock_update") {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === message.productId ? { ...p, stock: message.newStock } : p
          )
        );
      }
    });

    // Initialize BroadcastChannel
    initBroadcastChannel();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddProduct = (newProduct: Omit<Product, "id">) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString(),
      hasExpiry: newProduct.hasExpiry || false,
      expiryDate: newProduct.hasExpiry ? newProduct.expiryDate : undefined,
      batchNumber: newProduct.hasExpiry ? newProduct.batchNumber : undefined,
    };
    setProducts([...products, product]);
    updateSharedInventory(product.id, product.stock);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      // Reduce stock and sync across windows
      const newStock = product.stock - 1;
      updateSharedInventory(product.id, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );
      addToCart({ ...product, stock: newStock });
    }
  };

  return (
    <>
      <SEO
        title="Maldives Shop POS"
        description="Point of sale system for small shops in the Maldives"
      />

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-heading font-bold text-xl text-foreground">
                    {t("appTitle")}
                  </h1>
                  <p className="text-sm text-muted-foreground">{t("appSubtitle")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {terminalName && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg">
                    <Monitor className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">{terminalName}</span>
                  </div>
                )}

                {isAdmin() && (
                  <>
                    <Link href="/history">
                      <Button variant="outline" size="sm">
                        <History className="w-4 h-4 mr-2" />
                        {t("transactionHistory")}
                      </Button>
                    </Link>
                    <Link href="/credit">
                      <Button variant="outline" size="sm">
                        <CreditCard className="w-4 h-4 mr-2" />
                        {t("creditManagement")}
                      </Button>
                    </Link>
                    <Link href="/reports">
                      <Button variant="outline" size="sm">
                        <FileBarChart className="w-4 h-4 mr-2" />
                        {t("reports")}
                      </Button>
                    </Link>
                    <Link href="/users">
                      <Button variant="ghost" size="sm" className="justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        {t("userManagement")}
                      </Button>
                    </Link>
                    <Link href="/audit">
                      <Button variant="ghost" size="sm" className="justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Audit Trail
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="ghost" size="sm" className="justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                      </Button>
                    </Link>
                  </>
                )}

                {user && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">{user.name}</p>
                      <Badge variant="secondary" className="text-xs mt-0.5">
                        {user.role === "admin" ? t("admin") : t("cashier")}
                      </Badge>
                    </div>
                  </div>
                )}

                <LanguageSwitch />

                {user ? (
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("logout")}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setShowLogin(true)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {t("login")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {!user && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Welcome to Maldives Shop POS</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Browse products and explore the system. Sign in to access all features including checkout, inventory management, and reports.
                  </p>
                </div>
                <Button onClick={() => setShowLogin(true)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {isAdmin() && (
                  <Button onClick={() => setShowAddProduct(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addProduct")}
                  </Button>
                )}
                {isCashier() && (
                  <Button variant="outline" disabled className="cursor-not-allowed">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addProduct")}
                  </Button>
                )}
              </div>

              {/* Barcode Scanner Status */}
              <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className={`flex items-center gap-2 ${lastScannedBarcode ? "animate-pulse" : ""}`}>
                  <ScanLine className={`w-5 h-5 ${lastScannedBarcode ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium text-foreground">
                    {lastScannedBarcode ? t("productScanned") : t("scannerReady")}
                  </span>
                </div>
                {lastScannedBarcode && (
                  <Badge variant="default" className="font-mono">
                    {lastScannedBarcode}
                  </Badge>
                )}
                {!lastScannedBarcode && (
                  <span className="text-xs text-muted-foreground">{t("scanToAddProducts")}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("noProductsFound")}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <CheckoutCart
                  onCheckout={() => {
                    if (!user) {
                      toast({
                        title: "Sign In Required",
                        description: "Please sign in to complete checkout",
                        variant: "destructive",
                      });
                      setShowLogin(true);
                      return;
                    }
                    setShowPayment(true);
                  }}
                  onCreateInvoice={() => {
                    if (!user) {
                      toast({
                        title: "Sign In Required",
                        description: "Please sign in to create invoices",
                        variant: "destructive",
                      });
                      setShowLogin(true);
                      return;
                    }
                    setShowInvoice(true);
                  }}
                  onCreateQuotation={() => {
                    if (!user) {
                      toast({
                        title: "Sign In Required",
                        description: "Please sign in to create quotations",
                        variant: "destructive",
                      });
                      setShowLogin(true);
                      return;
                    }
                    setShowQuotation(true);
                  }}
                  onCreateCreditBill={() => {
                    if (!user) {
                      toast({
                        title: "Sign In Required",
                        description: "Please sign in to create credit bills",
                        variant: "destructive",
                      });
                      setShowLogin(true);
                      return;
                    }
                    setShowCreditBill(true);
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={() => setShowPayment(false)}
      />

      <AddProductModal
        open={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onSave={handleAddProduct}
      />

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
      />

      <InvoiceModal
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        onSuccess={() => {
          setShowInvoice(false);
          alert(t("invoiceCreated"));
        }}
      />

      <QuotationModal
        open={showQuotation}
        onClose={() => setShowQuotation(false)}
        onSuccess={() => {
          setShowQuotation(false);
          alert(t("quotationCreated"));
        }}
      />

      <CreditBillModal
        open={showCreditBill}
        onClose={() => setShowCreditBill(false)}
        onSuccess={() => {
          setShowCreditBill(false);
          clearCart();
          alert(t("creditBillCreated"));
        }}
      />
    </>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <POSContent />
    </CartProvider>
  );
}