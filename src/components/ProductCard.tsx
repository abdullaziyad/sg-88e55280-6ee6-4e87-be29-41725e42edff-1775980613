import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Calendar } from "lucide-react";
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
    <div className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:shadow-md transition-shadow">
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-heading font-semibold text-sm text-foreground truncate">
            {product.name}
          </h3>
          {expiryStatus && (
            <Badge variant={expiryStatus.variant} className="text-xs py-0 px-2">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {expiryStatus.status === "expired" && `${t("expired")}`}
              {expiryStatus.status === "expiresToday" && t("expiresToday")}
              {expiryStatus.status === "expiringSoon" && `${expiryStatus.days}d`}
              {expiryStatus.status === "expiringThisMonth" && `${expiryStatus.days}d`}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{t("sku")}: {product.sku}</span>
          <span>•</span>
          <span>{product.category}</span>
          {product.batchNumber && (
            <>
              <span>•</span>
              <span className="font-mono">{product.batchNumber}</span>
            </>
          )}
          {product.hasExpiry && product.expiryDate && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(product.expiryDate).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stock */}
      <div className="flex-shrink-0">
        <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs">
          {product.stock} {t("units")}
        </Badge>
      </div>

      {/* Price */}
      <div className="flex-shrink-0 text-right min-w-[100px]">
        <span className="text-lg font-heading font-bold text-primary">
          {t("mvr")} {product.price.toFixed(2)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => onEdit(product)}
          >
            {t("edit")}
          </Button>
        )}
        {onAddToCart && (
          <Button
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0 || expiryStatus?.status === "expired"}
          >
            <Plus className="w-3 h-3 mr-1" />
            {t("addToCart")}
          </Button>
        )}
      </div>
    </div>
  );
}