export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  lowStockThreshold: number;
  taxRate: number;
  taxExempt: boolean;
  expiryDate?: string;
  batchNumber?: string;
  hasExpiry: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod: "cash" | "card";
  timestamp: string;
}

export interface Customer {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod?: "cash" | "card" | "pending";
  status: "paid" | "unpaid" | "cancelled";
  createdAt: string;
  dueDate?: string;
  notes?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: "pending" | "accepted" | "rejected" | "converted";
  createdAt: string;
  validUntil: string;
  notes?: string;
  convertedToInvoiceId?: string;
}

export interface CreditBill {
  id: string;
  billNumber: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: "pending" | "partial" | "paid" | "overdue";
  createdAt: string;
  dueDate: string;
  payments: CreditPayment[];
  notes?: string;
}

export interface CreditPayment {
  id: string;
  amount: number;
  paymentMethod: "cash" | "card";
  paymentDate: string;
  notes?: string;
}

export interface CustomerLedger {
  customerId: string;
  customer: Customer;
  totalCredit: number;
  totalPaid: number;
  outstandingBalance: number;
  creditBills: CreditBill[];
  creditLimit?: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "admin" | "cashier";
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}