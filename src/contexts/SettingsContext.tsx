"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppSettings } from "@/types/settings";
import { useAuth } from "./AuthContext";
import { googleDriveBackup } from "@/lib/googleDrive";

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

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (section: keyof AppSettings, data: Partial<AppSettings[keyof AppSettings]>) => void;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentStoreId } = useAuth();

  // Load settings from Supabase when store changes
  useEffect(() => {
    if (currentStoreId) {
      loadSettings();
    }
  }, [currentStoreId]);

  const loadSettings = async () => {
    if (!currentStoreId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("settings")
        .eq("id", currentStoreId)
        .single();

      if (error) throw error;

      if (data?.settings) {
        setSettings({ ...defaultSettings, ...(data.settings as unknown as AppSettings) });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (section: keyof AppSettings, data: Partial<AppSettings[keyof AppSettings]>) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    if (!currentStoreId) {
      throw new Error("No store selected");
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("stores")
        .update({ 
          settings: settings as any,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentStoreId);

      if (error) throw error;

      setHasUnsavedChanges(false);

      // Initialize Google Drive backup if enabled
      if (settings.backup.enabled && settings.backup.schedule.daily) {
        try {
          await googleDriveBackup.initialize(settings.backup.googleDrive);
          const [hours, minutes] = settings.backup.schedule.time.split(':').map(Number);
          await googleDriveBackup.scheduleDailyBackup(
            currentStoreId, 
            settings.shop.businessName,
            hours
          );
        } catch (backupError) {
          console.error("Failed to schedule backup:", backupError);
        }
      }

      return Promise.resolve();
    } catch (error) {
      console.error("Failed to save settings:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, resetSettings, hasUnsavedChanges, isLoading }}>
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