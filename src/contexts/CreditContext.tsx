"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { CreditBill, CreditPayment, CustomerLedger } from "@/types";

interface CreditContextType {
  creditBills: CreditBill[];
  createCreditBill: (bill: Omit<CreditBill, "id" | "billNumber" | "amountPaid" | "amountDue" | "payments" | "status">) => void;
  recordPayment: (billId: string, payment: Omit<CreditPayment, "id">) => void;
  getCustomerLedger: (customerPhone: string) => CustomerLedger | null;
  getAllLedgers: () => CustomerLedger[];
  getOverdueBills: () => CreditBill[];
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

const CREDIT_BILLS_KEY = "credit_bills";

export function CreditProvider({ children }: { children: ReactNode }) {
  const [creditBills, setCreditBills] = useState<CreditBill[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CREDIT_BILLS_KEY);
      if (stored) {
        setCreditBills(JSON.parse(stored));
      }
    }
  }, []);

  const createCreditBill = (bill: Omit<CreditBill, "id" | "billNumber" | "amountPaid" | "amountDue" | "payments" | "status">) => {
    const billNumber = `CREDIT-${Date.now().toString().slice(-6)}`;
    const newBill: CreditBill = {
      ...bill,
      id: Date.now().toString(),
      billNumber,
      amountPaid: 0,
      amountDue: bill.total,
      payments: [],
      status: new Date(bill.dueDate) < new Date() ? "overdue" : "pending",
    };

    const updated = [newBill, ...creditBills];
    setCreditBills(updated);
    localStorage.setItem(CREDIT_BILLS_KEY, JSON.stringify(updated));
  };

  const recordPayment = (billId: string, payment: Omit<CreditPayment, "id">) => {
    const newPayment: CreditPayment = {
      ...payment,
      id: Date.now().toString(),
    };

    const updated = creditBills.map((bill) => {
      if (bill.id === billId) {
        const updatedPayments = [...bill.payments, newPayment];
        const amountPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const amountDue = bill.total - amountPaid;
        
        let status: CreditBill["status"] = "pending";
        if (amountDue === 0) {
          status = "paid";
        } else if (amountPaid > 0) {
          status = "partial";
        } else if (new Date(bill.dueDate) < new Date()) {
          status = "overdue";
        }

        return {
          ...bill,
          payments: updatedPayments,
          amountPaid,
          amountDue,
          status,
        };
      }
      return bill;
    });

    setCreditBills(updated);
    localStorage.setItem(CREDIT_BILLS_KEY, JSON.stringify(updated));
  };

  const getCustomerLedger = (customerPhone: string): CustomerLedger | null => {
    const customerBills = creditBills.filter(
      (bill) => bill.customer.phone === customerPhone
    );

    if (customerBills.length === 0) return null;

    const totalCredit = customerBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalPaid = customerBills.reduce((sum, bill) => sum + bill.amountPaid, 0);
    const outstandingBalance = totalCredit - totalPaid;

    return {
      customerId: customerPhone,
      customer: customerBills[0].customer,
      totalCredit,
      totalPaid,
      outstandingBalance,
      creditBills: customerBills,
    };
  };

  const getAllLedgers = (): CustomerLedger[] => {
    const ledgerMap = new Map<string, CustomerLedger>();

    creditBills.forEach((bill) => {
      const phone = bill.customer.phone || "unknown";
      
      if (ledgerMap.has(phone)) {
        const ledger = ledgerMap.get(phone)!;
        ledger.totalCredit += bill.total;
        ledger.totalPaid += bill.amountPaid;
        ledger.outstandingBalance = ledger.totalCredit - ledger.totalPaid;
        ledger.creditBills.push(bill);
      } else {
        ledgerMap.set(phone, {
          customerId: phone,
          customer: bill.customer,
          totalCredit: bill.total,
          totalPaid: bill.amountPaid,
          outstandingBalance: bill.total - bill.amountPaid,
          creditBills: [bill],
        });
      }
    });

    return Array.from(ledgerMap.values()).sort(
      (a, b) => b.outstandingBalance - a.outstandingBalance
    );
  };

  const getOverdueBills = (): CreditBill[] => {
    return creditBills.filter((bill) => bill.status === "overdue");
  };

  return (
    <CreditContext.Provider
      value={{
        creditBills,
        createCreditBill,
        recordPayment,
        getCustomerLedger,
        getAllLedgers,
        getOverdueBills,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
}

export function useCredit() {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCredit must be used within CreditProvider");
  }
  return context;
}