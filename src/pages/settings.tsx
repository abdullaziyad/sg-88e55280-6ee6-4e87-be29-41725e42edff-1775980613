import { useState } from "react";
import { SEO } from "@/components/SEO";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Store, Receipt, FileText, Settings as SettingsIcon, RotateCcw, ShieldAlert, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Settings() {
  const { settings, updateSettings, resetSettings, saveSettings, hasUnsavedChanges, isLoading } = useSettings();
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("shop");

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl mb-2">{t("accessDenied")}</h2>
            <p className="text-muted-foreground mb-6">{t("adminOnly")}</p>
            <Link href="/">
              <Button>{t("backToHome")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      resetSettings();
      toast({
        title: "Settings Reset",
        description: "Settings have been reset to default values. Click Save to apply.",
      });
    }
  };

  const handleSave = async () => {
    try {
      await saveSettings();
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEO title="Settings - Admin" description="Customize your POS system" />

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("backToPos")}
                  </Button>
                </Link>
                <div>
                  <h1 className="font-heading font-bold text-xl">{t("settings")}</h1>
                  <p className="text-sm text-muted-foreground">{t("customizeSettings")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t("resetToDefault")}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={!hasUnsavedChanges || isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="shop">
                <Store className="w-4 h-4 mr-2" />
                {t("shopDetails")}
              </TabsTrigger>
              <TabsTrigger value="tax">
                <FileText className="w-4 h-4 mr-2" />
                {t("taxSettings")}
              </TabsTrigger>
              <TabsTrigger value="receipt">
                <Receipt className="w-4 h-4 mr-2" />
                {t("receiptSettings")}
              </TabsTrigger>
              <TabsTrigger value="invoice">
                <FileText className="w-4 h-4 mr-2" />
                {t("invoiceSettings")}
              </TabsTrigger>
              <TabsTrigger value="system">
                <SettingsIcon className="w-4 h-4 mr-2" />
                {t("systemSettings")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shop">
              <Card>
                <CardHeader>
                  <CardTitle>{t("businessInformation")}</CardTitle>
                  <CardDescription>{t("businessInfoDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">{t("businessName")}</Label>
                    <Input
                      id="businessName"
                      value={settings.shop.businessName}
                      onChange={(e) => updateSettings("shop", { businessName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">{t("businessAddress")}</Label>
                    <Input
                      id="businessAddress"
                      value={settings.shop.businessAddress}
                      onChange={(e) => updateSettings("shop", { businessAddress: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessPhone">{t("businessPhone")}</Label>
                      <Input
                        id="businessPhone"
                        value={settings.shop.businessPhone}
                        onChange={(e) => updateSettings("shop", { businessPhone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessEmail">{t("businessEmail")}</Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        value={settings.shop.businessEmail}
                        onChange={(e) => updateSettings("shop", { businessEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRegNumber">{t("taxRegistrationNumber")}</Label>
                    <Input
                      id="taxRegNumber"
                      value={settings.shop.taxRegistrationNumber || ""}
                      onChange={(e) => updateSettings("shop", { taxRegistrationNumber: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tax">
              <Card>
                <CardHeader>
                  <CardTitle>{t("taxConfiguration")}</CardTitle>
                  <CardDescription>{t("taxConfigDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("enableGst")}</Label>
                      <p className="text-sm text-muted-foreground">{t("enableGstDescription")}</p>
                    </div>
                    <Switch
                      checked={settings.tax.enableGst}
                      onCheckedChange={(checked) => updateSettings("tax", { enableGst: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("showTaxOnReceipt")}</Label>
                      <p className="text-sm text-muted-foreground">{t("showTaxDescription")}</p>
                    </div>
                    <Switch
                      checked={settings.tax.showTaxOnReceipt}
                      onCheckedChange={(checked) => updateSettings("tax", { showTaxOnReceipt: checked })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultGst">{t("defaultGstRate")}</Label>
                    <Select
                      value={settings.tax.defaultGstRate.toString()}
                      onValueChange={(value) => updateSettings("tax", { defaultGstRate: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% - {t("taxExempt")}</SelectItem>
                        <SelectItem value="6">6% - {t("standardRate")}</SelectItem>
                        <SelectItem value="8">8% - {t("touristRate")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receipt">
              <Card>
                <CardHeader>
                  <CardTitle>{t("receiptCustomization")}</CardTitle>
                  <CardDescription>{t("receiptCustomDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="headerText">{t("receiptHeader")}</Label>
                    <Input
                      id="headerText"
                      value={settings.receipt.headerText}
                      onChange={(e) => updateSettings("receipt", { headerText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerText">{t("receiptFooter")}</Label>
                    <Input
                      id="footerText"
                      value={settings.receipt.footerText}
                      onChange={(e) => updateSettings("receipt", { footerText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("paperWidth")}</Label>
                    <Select
                      value={settings.receipt.paperWidth}
                      onValueChange={(value: "58mm" | "80mm") => updateSettings("receipt", { paperWidth: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="58mm">58mm (Small)</SelectItem>
                        <SelectItem value="80mm">80mm (Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t("showBusinessDetails")}</Label>
                    <Switch
                      checked={settings.receipt.showBusinessDetails}
                      onCheckedChange={(checked) => updateSettings("receipt", { showBusinessDetails: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoice">
              <Card>
                <CardHeader>
                  <CardTitle>{t("invoiceConfiguration")}</CardTitle>
                  <CardDescription>{t("invoiceConfigDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoicePrefix">{t("invoicePrefix")}</Label>
                      <Input
                        id="invoicePrefix"
                        value={settings.invoice.invoicePrefix}
                        onChange={(e) => updateSettings("invoice", { invoicePrefix: e.target.value })}
                        placeholder="INV"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quotationPrefix">{t("quotationPrefix")}</Label>
                      <Input
                        id="quotationPrefix"
                        value={settings.invoice.quotationPrefix}
                        onChange={(e) => updateSettings("invoice", { quotationPrefix: e.target.value })}
                        placeholder="QUO"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDays">{t("defaultDueDays")}</Label>
                      <Input
                        id="dueDays"
                        type="number"
                        value={settings.invoice.defaultDueDays}
                        onChange={(e) => updateSettings("invoice", { defaultDueDays: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validDays">{t("defaultValidDays")}</Label>
                      <Input
                        id="validDays"
                        type="number"
                        value={settings.invoice.defaultValidDays}
                        onChange={(e) => updateSettings("invoice", { defaultValidDays: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceTerms">{t("invoiceTerms")}</Label>
                    <Textarea
                      id="invoiceTerms"
                      value={settings.invoice.invoiceTerms}
                      onChange={(e) => updateSettings("invoice", { invoiceTerms: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quotationTerms">{t("quotationTerms")}</Label>
                    <Textarea
                      id="quotationTerms"
                      value={settings.invoice.quotationTerms}
                      onChange={(e) => updateSettings("invoice", { quotationTerms: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>{t("systemPreferences")}</CardTitle>
                  <CardDescription>{t("systemPrefsDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("currency")}</Label>
                      <Input
                        value={settings.system.currency}
                        onChange={(e) => updateSettings("system", { currency: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("currencySymbol")}</Label>
                      <Input
                        value={settings.system.currencySymbol}
                        onChange={(e) => updateSettings("system", { currencySymbol: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("dateFormat")}</Label>
                      <Select
                        value={settings.system.dateFormat}
                        onValueChange={(value: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD") =>
                          updateSettings("system", { dateFormat: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeFormat")}</Label>
                      <Select
                        value={settings.system.timeFormat}
                        onValueChange={(value: "12h" | "24h") => updateSettings("system", { timeFormat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStock">{t("lowStockThreshold")}</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      value={settings.system.lowStockThreshold}
                      onChange={(e) => updateSettings("system", { lowStockThreshold: parseInt(e.target.value) })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}