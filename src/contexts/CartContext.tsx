"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Product, CartItem } from "@/types";
import { transactionService } from "@/services/transactionService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
  completeTransaction: (paymentMethod: "cash" | "card") => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { currentStoreId, user } = useAuth();

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getTaxAmount = () => {
    return cart.reduce((sum, item) => {
      if (item.product.taxExempt) return sum;
      const itemTotal = item.product.price * item.quantity;
      const itemTax = itemTotal * (item.product.taxRate / 100);
      return sum + itemTax;
    }, 0);
  };

  const getTotal = () => {
    return getSubtotal() + getTaxAmount();
  };

  const completeTransaction = async (paymentMethod: "cash" | "card"): Promise<any> => {
    console.log("completeTransaction called with:", { paymentMethod, currentStoreId, hasUser: !!user });
    
    if (!currentStoreId) {
      console.error("No store ID available");
      throw new Error("Please select a store first. Try logging out and back in.");
    }

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error("No active session");
      throw new Error("Your session has expired. Please sign in again.");
    }

    console.log("Creating transaction for store:", currentStoreId);

    const items = cart.map(item => ({
      product_id: item.product.id,
      product_name: item.product.name,
      product_sku: item.product.sku,
      quantity: item.quantity,
      unit_price: item.product.price,
      total: item.product.price * item.quantity,
    }));

    const transaction = await transactionService.createTransaction(
      {
        store_id: currentStoreId,
        total: getTotal(),
        subtotal: getSubtotal(),
        tax: getTaxAmount(),
        payment_method: paymentMethod,
      },
      items
    );

    console.log("Transaction created:", transaction.id);
    setCart([]);
    return transaction;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        getTaxAmount,
        getTotal,
        completeTransaction,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}