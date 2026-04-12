"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { AppSettings } from "@/types/settings";

const defaultSettings: AppSettings = {
  shop: {
    businessName: "Maldives Shop",
    businessAddress: "Malé, Maldives",
    businessPhone: "+960 xxx-xxxx",
    businessEmail: "info@maldivesshop.mv",
    taxRegistrationNumber: "",
  },
  tax: {
    defaultGstRate: 8,
    enableGst: true,
    taxExemptCategories: ["Groceries", "Basic Food Items"],
    showTaxOnReceipt: true,
  },
  receipt: {
    headerText: "Thank you for shopping with us!",
    footerText: "Please visit us again",
    showLogo: true,
    showBusinessDetails: true,
    paperWidth: "80mm",
  },
  invoice: {
    invoicePrefix: "INV",
    quotationPrefix: "QUO",
    invoiceTerms: "Payment due within 30 days. Late payments subject to fees.",
    quotationTerms: "This quotation is valid for 30 days from the date of issue.",
    defaultDueDays: 30,
    defaultValidDays: 30,
  },
  system: {
    currency: "MVR",
    currencySymbol: "ރ.",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    lowStockThreshold: 10,
  },
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (section: keyof AppSettings, data: Partial<AppSettings[keyof AppSettings]>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = "app_settings";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error("Failed to load settings", error);
        }
      }
    }
  }, []);

  const updateSettings = (section: keyof AppSettings, data: Partial<AppSettings[keyof AppSettings]>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [section]: { ...prev[section], ...data },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SETTINGS_KEY);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}