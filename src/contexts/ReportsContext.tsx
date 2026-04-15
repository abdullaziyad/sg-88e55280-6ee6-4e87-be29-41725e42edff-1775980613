"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { transactionService } from "@/services/transactionService";
import type { Product } from "@/types";

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

interface ReportsContextType {
  getDailySalesReport: (date?: string) => Promise<SalesReport>;
  getDateRangeSalesReport: (startDate: string, endDate: string) => Promise<SalesReport>;
  exportToCSV: (data: any[], filename: string) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const { currentStoreId } = useAuth();

  const getDailySalesReport = async (date?: string): Promise<SalesReport> => {
    if (!currentStoreId) {
      return {
        totalSales: 0,
        totalTransactions: 0,
        totalTax: 0,
        cashSales: 0,
        cardSales: 0,
        averageTransaction: 0,
      };
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const report = await transactionService.getSalesReport(
      currentStoreId,
      startOfDay,
      endOfDay
    );

    const cashSales = report.transactions
      .filter((t) => t.payment_method === "cash")
      .reduce((sum, t) => sum + Number(t.total), 0);
    
    const cardSales = report.transactions
      .filter((t) => t.payment_method === "card")
      .reduce((sum, t) => sum + Number(t.total), 0);
    
    const totalTax = report.transactions.reduce((sum, t) => sum + Number(t.tax), 0);

    return {
      totalSales: report.totalSales,
      totalTransactions: report.totalTransactions,
      totalTax,
      cashSales,
      cardSales,
      averageTransaction: report.averageTransaction,
    };
  };

  const getDateRangeSalesReport = async (startDate: string, endDate: string): Promise<SalesReport> => {
    if (!currentStoreId) {
      return {
        totalSales: 0,
        totalTransactions: 0,
        totalTax: 0,
        cashSales: 0,
        cardSales: 0,
        averageTransaction: 0,
      };
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const report = await transactionService.getSalesReport(currentStoreId, start, end);

    const cashSales = report.transactions
      .filter((t) => t.payment_method === "cash")
      .reduce((sum, t) => sum + Number(t.total), 0);
    
    const cardSales = report.transactions
      .filter((t) => t.payment_method === "card")
      .reduce((sum, t) => sum + Number(t.total), 0);
    
    const totalTax = report.transactions.reduce((sum, t) => sum + Number(t.tax), 0);

    return {
      totalSales: report.totalSales,
      totalTransactions: report.totalTransactions,
      totalTax,
      cashSales,
      cardSales,
      averageTransaction: report.averageTransaction,
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