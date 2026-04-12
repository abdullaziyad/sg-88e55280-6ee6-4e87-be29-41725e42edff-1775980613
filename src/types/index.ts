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