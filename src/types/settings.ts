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
  backup: BackupSettings;
}

export interface BackupSettings {
  enabled: boolean;
  googleDrive: {
    clientId: string;
    apiKey: string;
    appId: string;
  };
  schedule: {
    daily: boolean;
    time: string; // HH:MM format
  };
}

export const defaultSettings: AppSettings = {
  shop: {
    businessName: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
  },
  tax: {
    defaultGstRate: 0,
    enableGst: false,
    taxExemptCategories: [],
    showTaxOnReceipt: false,
  },
  receipt: {
    headerText: "",
    footerText: "",
    showLogo: false,
    showBusinessDetails: false,
    paperWidth: "58mm",
  },
  invoice: {
    invoicePrefix: "",
    quotationPrefix: "",
    invoiceTerms: "",
    quotationTerms: "",
    defaultDueDays: 0,
    defaultValidDays: 0,
  },
  system: {
    currency: "USD",
    currencySymbol: "$",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    lowStockThreshold: 0,
  },
  backup: {
    enabled: false,
    googleDrive: {
      clientId: "",
      apiKey: "",
      appId: "",
    },
    schedule: {
      daily: false,
      time: "00:00",
    },
  },
};