import { useState } from "react";
import { SEO } from "@/components/SEO";
import { ProductCard } from "@/components/ProductCard";
import { CheckoutCart } from "@/components/CheckoutCart";
import { PaymentModal } from "@/components/PaymentModal";
import { AddProductModal } from "@/components/AddProductModal";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { mockProducts } from "@/lib/mockData";
import { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Package } from "lucide-react";

function POSContent() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (newProduct: Omit<Product, "id">) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString(),
    };
    setProducts([...products, product]);
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
              <LanguageSwitch />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
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
                <Button onClick={() => setShowAddProduct(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("addProduct")}
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
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
                <CheckoutCart onCheckout={() => setShowPayment(true)} />
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