import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { CreditProvider } from "@/contexts/CreditContext";
import { ReportsProvider } from "@/contexts/ReportsContext";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { offlineDB } from "@/lib/db";
import { syncEngine } from "@/lib/syncEngine";
import { googleDriveBackup } from "@/lib/googleDrive";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize offline database
    offlineDB.init().catch(console.error);
    
    // Start auto-sync every 30 seconds
    syncEngine.startAutoSync(30000);
    
    return () => {
      syncEngine.stopAutoSync();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <LanguageProvider>
            <CreditProvider>
              <DocumentProvider>
                <CartProvider>
                  <ReportsProvider>
                    <Component {...pageProps} />
                    <Toaster />
                  </ReportsProvider>
                </CartProvider>
              </DocumentProvider>
            </CreditProvider>
          </LanguageProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
