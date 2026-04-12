"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Product, CartItem, Transaction } from "@/types";
import {
  getSharedTransactions,
  addSharedTransaction,
  onMessage,
  initBroadcastChannel,
} from "@/lib/multiWindow";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
  completeTransaction: (paymentMethod: "cash" | "card") => Transaction;
  transactions: Transaction[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load shared transactions on mount
  useEffect(() => {
    setTransactions(getSharedTransactions());
    
    // Listen for new transactions from other windows
    const cleanup = onMessage((message) => {
      if (message.type === "new_transaction") {
        setTransactions(getSharedTransactions());
      }
    });

    // Initialize BroadcastChannel
    initBroadcastChannel();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

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

  const completeTransaction = (paymentMethod: "cash" | "card"): Transaction => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      items: [...cart],
      subtotal: getSubtotal(),
      taxAmount: getTaxAmount(),
      total: getTotal(),
      paymentMethod,
      timestamp: new Date().toISOString(),
    };
    
    // Save to shared localStorage and notify other windows
    addSharedTransaction(transaction);
    setTransactions(getSharedTransactions());
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
        transactions,
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