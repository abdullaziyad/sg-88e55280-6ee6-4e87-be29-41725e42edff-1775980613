import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { CreditProvider } from "@/contexts/CreditContext";
import { ReportsProvider } from "@/contexts/ReportsContext";

export default function App({ Component, pageProps }: AppProps) {
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
