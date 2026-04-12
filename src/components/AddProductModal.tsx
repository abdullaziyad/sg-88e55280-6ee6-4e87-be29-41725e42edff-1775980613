import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/types";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, "id">) => void;
  editProduct?: Product;
}

export function AddProductModal({ open, onClose, onSave, editProduct }: AddProductModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: editProduct?.name || "",
    sku: editProduct?.sku || "",
    price: editProduct?.price.toString() || "",
    stock: editProduct?.stock.toString() || "",
    category: editProduct?.category || "",
    lowStockThreshold: editProduct?.lowStockThreshold.toString() || "10",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      lowStockThreshold: parseInt(formData.lowStockThreshold),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {t("addNewProduct")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("productName")}</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("productNamePlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">{t("sku")}</Label>
              <Input
                id="sku"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder={t("skuPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("category")}</Label>
              <Input
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder={t("categoryPlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t("price")}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder={t("pricePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">{t("stockQuantity")}</Label>
              <Input
                id="stock"
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder={t("stockPlaceholder")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">{t("lowStockThreshold")}</Label>
            <Input
              id="threshold"
              type="number"
              required
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              placeholder={t("thresholdPlaceholder")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}