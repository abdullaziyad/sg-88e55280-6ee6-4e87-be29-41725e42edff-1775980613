import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onEdit }: ProductCardProps) {
  const isLowStock = product.stock <= product.lowStockThreshold;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-lg text-foreground">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
          </div>
          <Package className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Category</span>
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Stock</span>
            <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs">
              {product.stock} units
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium">Price</span>
            <span className="text-lg font-heading font-bold text-primary">
              MVR {product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            Edit
          </Button>
        )}
        {onAddToCart && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}