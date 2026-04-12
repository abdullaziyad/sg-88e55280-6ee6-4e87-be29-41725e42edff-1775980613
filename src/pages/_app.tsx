import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </ThemeProvider>
  );
}
