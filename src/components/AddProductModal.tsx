import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    barcode: editProduct?.barcode || "",
    price: editProduct?.price.toString() || "",
    stock: editProduct?.stock.toString() || "",
    category: editProduct?.category || "",
    lowStockThreshold: editProduct?.lowStockThreshold.toString() || "10",
    taxRate: editProduct?.taxRate.toString() || "0",
    taxExempt: editProduct?.taxExempt ?? false,
    hasExpiry: editProduct?.hasExpiry ?? false,
    expiryDate: editProduct?.expiryDate || "",
    batchNumber: editProduct?.batchNumber || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      sku: formData.sku,
      barcode: formData.barcode || undefined,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      taxRate: parseFloat(formData.taxRate),
      taxExempt: formData.taxExempt,
      hasExpiry: formData.hasExpiry,
      expiryDate: formData.hasExpiry ? formData.expiryDate : undefined,
      batchNumber: formData.hasExpiry ? formData.batchNumber : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {editProduct ? t("editProduct") : t("addNewProduct")}
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
              <Label htmlFor="barcode">{t("barcode")} ({t("optional")})</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder={t("barcodePlaceholder")}
              />
            </div>
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

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taxExempt">{t("taxExempt")}</Label>
                <p className="text-xs text-muted-foreground">{t("taxExemptDescription")}</p>
              </div>
              <Switch
                id="taxExempt"
                checked={formData.taxExempt}
                onCheckedChange={(checked) => setFormData({ ...formData, taxExempt: checked, taxRate: checked ? "0" : formData.taxRate })}
              />
            </div>

            {!formData.taxExempt && (
              <div className="space-y-2">
                <Label htmlFor="taxRate">{t("gstRate")}</Label>
                <Select
                  value={formData.taxRate}
                  onValueChange={(value) => setFormData({ ...formData, taxRate: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectGstRate")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6% - {t("standardRate")}</SelectItem>
                    <SelectItem value="8">8% - {t("touristRate")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hasExpiry">{t("trackExpiry")}</Label>
                <p className="text-xs text-muted-foreground">{t("trackExpiryDescription")}</p>
              </div>
              <Switch
                id="hasExpiry"
                checked={formData.hasExpiry}
                onCheckedChange={(checked) => setFormData({ ...formData, hasExpiry: checked })}
              />
            </div>

            {formData.hasExpiry && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">{t("expiryDate")}</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchNumber">{t("batchNumber")}</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder={t("batchPlaceholder")}
                  />
                </div>
              </div>
            )}
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