import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onEdit }: ProductCardProps) {
  const isLowStock = product.stock <= product.lowStockThreshold;
  const { t } = useLanguage();

  const getExpiryStatus = () => {
    if (!product.hasExpiry || !product.expiryDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(product.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: "expired", days: Math.abs(daysUntilExpiry), variant: "destructive" as const };
    } else if (daysUntilExpiry === 0) {
      return { status: "expiresToday", days: 0, variant: "destructive" as const };
    } else if (daysUntilExpiry <= 7) {
      return { status: "expiringSoon", days: daysUntilExpiry, variant: "destructive" as const };
    } else if (daysUntilExpiry <= 30) {
      return { status: "expiringThisMonth", days: daysUntilExpiry, variant: "secondary" as const };
    }
    return null;
  };

  const expiryStatus = getExpiryStatus();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-base text-foreground">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("sku")}: {product.sku}</p>
          </div>
          <Package className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("category")}</span>
            <Badge variant="secondary" className="text-xs py-0">
              {product.category}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Stock</span>
            <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs py-0">
              {product.stock} units
            </Badge>
          </div>

          {product.hasExpiry && product.expiryDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t("expiry")}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(product.expiryDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {product.batchNumber && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t("batch")}</span>
              <span className="text-xs font-mono text-muted-foreground">
                {product.batchNumber}
              </span>
            </div>
          )}

          {expiryStatus && (
            <div className="pt-1.5">
              <Badge variant={expiryStatus.variant} className="w-full justify-center text-xs py-0.5">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {expiryStatus.status === "expired" && `${t("expired")} (${expiryStatus.days} ${t("daysAgo")})`}
                {expiryStatus.status === "expiresToday" && t("expiresToday")}
                {expiryStatus.status === "expiringSoon" && `${t("expires")} ${expiryStatus.days} ${t("daysLeft")}`}
                {expiryStatus.status === "expiringThisMonth" && `${expiryStatus.days} ${t("daysLeft")}`}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between pt-1.5 border-t">
            <span className="text-xs font-medium">{t("price")}</span>
            <span className="text-base font-heading font-bold text-primary">
              {t("mvr")} {product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 px-4 py-3">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onEdit(product)}
          >
            Edit
          </Button>
        )}
        {onAddToCart && (
          <Button
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0 || expiryStatus?.status === "expired"}
          >
            <Plus className="w-3 h-3 mr-1" />
            {t("addToCart")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}