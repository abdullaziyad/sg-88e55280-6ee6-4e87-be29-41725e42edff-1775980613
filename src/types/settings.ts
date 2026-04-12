export interface ShopSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessLogo?: string;
  taxRegistrationNumber?: string;
}

export interface TaxSettings {
  defaultGstRate: number;
  enableGst: boolean;
  taxExemptCategories: string[];
  showTaxOnReceipt: boolean;
}

export interface ReceiptSettings {
  headerText: string;
  footerText: string;
  showLogo: boolean;
  showBusinessDetails: boolean;
  paperWidth: "58mm" | "80mm";
}

export interface InvoiceSettings {
  invoicePrefix: string;
  quotationPrefix: string;
  invoiceTerms: string;
  quotationTerms: string;
  defaultDueDays: number;
  defaultValidDays: number;
}

export interface SystemSettings {
  currency: string;
  currencySymbol: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
  lowStockThreshold: number;
}

export interface AppSettings {
  shop: ShopSettings;
  tax: TaxSettings;
  receipt: ReceiptSettings;
  invoice: InvoiceSettings;
  system: SystemSettings;
}