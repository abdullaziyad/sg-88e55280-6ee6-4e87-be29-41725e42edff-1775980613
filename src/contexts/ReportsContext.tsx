"use client";

import { createContext, useContext, ReactNode } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCredit } from "@/contexts/CreditContext";
import { useDocuments } from "@/contexts/DocumentContext";
import type { Transaction, Product } from "@/types";

interface SalesReport {
  totalSales: number;
  totalTransactions: number;
  totalTax: number;
  cashSales: number;
  cardSales: number;
  averageTransaction: number;
}

interface ProductReport {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

interface DayEndReport {
  date: string;
  sales: SalesReport;
  topProducts: ProductReport[];
  lowStockProducts: Product[];
  creditSummary: {
    newCreditBills: number;
    paymentsReceived: number;
    totalOutstanding: number;
  };
}

interface ReportsContextType {
  getDailySalesReport: (date?: string) => SalesReport;
  getDateRangeSalesReport: (startDate: string, endDate: string) => SalesReport;
  getTopSellingProducts: (limit?: number, startDate?: string, endDate?: string) => ProductReport[];
  getLowStockProducts: (products: Product[], threshold?: number) => Product[];
  getDayEndReport: (date?: string) => DayEndReport;
  exportToCSV: (data: any[], filename: string) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const { transactions } = useCart();
  const { getAllLedgers } = useCredit();

  const getDailySalesReport = (date?: string): SalesReport => {
    const targetDate = date || new Date().toISOString().split("T")[0];
    
    const dailyTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.timestamp).toISOString().split("T")[0];
      return transactionDate === targetDate;
    });

    return calculateSalesReport(dailyTransactions);
  };

  const getDateRangeSalesReport = (startDate: string, endDate: string): SalesReport => {
    const rangeTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.timestamp).toISOString().split("T")[0];
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    return calculateSalesReport(rangeTransactions);
  };

  const calculateSalesReport = (txns: Transaction[]): SalesReport => {
    const totalSales = txns.reduce((sum, t) => sum + t.total, 0);
    const totalTax = txns.reduce((sum, t) => sum + t.taxAmount, 0);
    const cashSales = txns.filter((t) => t.paymentMethod === "cash").reduce((sum, t) => sum + t.total, 0);
    const cardSales = txns.filter((t) => t.paymentMethod === "card").reduce((sum, t) => sum + t.total, 0);

    return {
      totalSales,
      totalTransactions: txns.length,
      totalTax,
      cashSales,
      cardSales,
      averageTransaction: txns.length > 0 ? totalSales / txns.length : 0,
    };
  };

  const getTopSellingProducts = (
    limit = 10,
    startDate?: string,
    endDate?: string
  ): ProductReport[] => {
    let relevantTransactions = transactions;

    if (startDate && endDate) {
      relevantTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.timestamp).toISOString().split("T")[0];
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    const productMap = new Map<string, ProductReport>();

    relevantTransactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const existing = productMap.get(item.product.id);
        if (existing) {
          existing.quantitySold += item.quantity;
          existing.revenue += item.product.price * item.quantity;
        } else {
          productMap.set(item.product.id, {
            productId: item.product.id,
            productName: item.product.name,
            quantitySold: item.quantity,
            revenue: item.product.price * item.quantity,
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);
  };

  const getLowStockProducts = (products: Product[], threshold = 10): Product[] => {
    return products
      .filter((p) => p.stock <= (p.lowStockThreshold || threshold))
      .sort((a, b) => a.stock - b.stock);
  };

  const getDayEndReport = (date?: string): DayEndReport => {
    const targetDate = date || new Date().toISOString().split("T")[0];
    const sales = getDailySalesReport(targetDate);
    const topProducts = getTopSellingProducts(5, targetDate, targetDate);
    
    const ledgers = getAllLedgers();
    const totalOutstanding = ledgers.reduce((sum, l) => sum + l.outstandingBalance, 0);

    return {
      date: targetDate,
      sales,
      topProducts,
      lowStockProducts: [],
      creditSummary: {
        newCreditBills: 0,
        paymentsReceived: 0,
        totalOutstanding,
      },
    };
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ReportsContext.Provider
      value={{
        getDailySalesReport,
        getDateRangeSalesReport,
        getTopSellingProducts,
        getLowStockProducts,
        getDayEndReport,
        exportToCSV,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports must be used within ReportsProvider");
  }
  return context;
}