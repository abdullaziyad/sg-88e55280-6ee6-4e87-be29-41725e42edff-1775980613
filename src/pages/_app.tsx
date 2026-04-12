import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DocumentProvider } from "@/contexts/DocumentContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <DocumentProvider>
            <CartProvider>
              <Component {...pageProps} />
            </CartProvider>
          </DocumentProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
