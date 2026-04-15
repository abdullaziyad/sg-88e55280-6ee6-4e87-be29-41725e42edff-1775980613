"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Invoice, Quotation, CartItem } from "@/types";

interface DocumentContextType {
  invoices: Invoice[];
  quotations: Quotation[];
  createInvoice: (invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">) => Invoice;
  createQuotation: (quotation: Omit<Quotation, "id" | "quotationNumber" | "createdAt">) => Quotation;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  convertQuotationToInvoice: (quotationId: string) => Invoice;
  getInvoiceByNumber: (invoiceNumber: string) => Invoice | undefined;
  getQuotationByNumber: (quotationNumber: string) => Quotation | undefined;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const INVOICES_KEY = "pos_invoices";
const QUOTATIONS_KEY = "pos_quotations";

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    const savedInvoices = localStorage.getItem(INVOICES_KEY);
    const savedQuotations = localStorage.getItem(QUOTATIONS_KEY);

    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
    if (savedQuotations) {
      setQuotations(JSON.parse(savedQuotations));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
  }, [quotations]);

  const generateInvoiceNumber = () => {
    const count = invoices.length + 1;
    return `INV-${String(count).padStart(4, "0")}`;
  };

  const generateQuotationNumber = () => {
    const count = quotations.length + 1;
    return `QUO-${String(count).padStart(4, "0")}`;
  };

  const createInvoice = (data: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">) => {
    const invoice: Invoice = {
      ...data,
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [invoice, ...prev]);
    return invoice;
  };

  const createQuotation = (data: Omit<Quotation, "id" | "quotationNumber" | "createdAt">) => {
    const quotation: Quotation = {
      ...data,
      id: Date.now().toString(),
      quotationNumber: generateQuotationNumber(),
      createdAt: new Date().toISOString(),
    };
    setQuotations((prev) => [quotation, ...prev]);
    return quotation;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) =>
      prev.map((quo) => (quo.id === id ? { ...quo, ...updates } : quo))
    );
  };

  const convertQuotationToInvoice = (quotationId: string) => {
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation) throw new Error("Quotation not found");

    const invoice = createInvoice({
      customer: quotation.customer,
      items: quotation.items,
      subtotal: quotation.subtotal,
      taxAmount: quotation.taxAmount,
      total: quotation.total,
      paymentMethod: "pending",
      status: "unpaid",
      notes: quotation.notes,
    });

    updateQuotation(quotationId, {
      status: "converted",
      convertedToInvoiceId: invoice.id,
    });

    return invoice;
  };

  const getInvoiceByNumber = (invoiceNumber: string) => {
    return invoices.find((inv) => inv.invoiceNumber === invoiceNumber);
  };

  const getQuotationByNumber = (quotationNumber: string) => {
    return quotations.find((quo) => quo.quotationNumber === quotationNumber);
  };

  return (
    <DocumentContext.Provider
      value={{
        invoices,
        quotations,
        createInvoice,
        createQuotation,
        updateInvoice,
        updateQuotation,
        convertQuotationToInvoice,
        getInvoiceByNumber,
        getQuotationByNumber,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocuments must be used within DocumentProvider");
  }
  return context;
}