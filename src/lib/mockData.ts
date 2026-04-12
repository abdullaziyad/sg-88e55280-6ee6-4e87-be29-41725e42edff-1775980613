import type { Product } from "@/types";

// Helper to get dates relative to today
const getDateOffset = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Rice (5kg)",
    sku: "RICE-5KG-001",
    price: 85,
    stock: 45,
    category: "Groceries",
    lowStockThreshold: 20,
    taxRate: 0,
    taxExempt: true,
    hasExpiry: false,
  },
  {
    id: "2",
    name: "Cooking Oil (1L)",
    sku: "OIL-1L-001",
    price: 35,
    stock: 30,
    category: "Groceries",
    lowStockThreshold: 15,
    taxRate: 0,
    taxExempt: true,
    hasExpiry: true,
    expiryDate: getDateOffset(120), // Expires in 4 months
    batchNumber: "OIL2024-03",
  },
  {
    id: "3",
    name: "Instant Noodles",
    sku: "NOODLE-001",
    price: 8,
    stock: 120,
    category: "Snacks",
    lowStockThreshold: 40,
    taxRate: 8,
    taxExempt: false,
    hasExpiry: true,
    expiryDate: getDateOffset(45), // Expires in 1.5 months
    batchNumber: "NOO-2024-12",
  },
  {
    id: "4",
    name: "Coca Cola (330ml)",
    sku: "COKE-330-001",
    price: 15,
    stock: 80,
    category: "Beverages",
    lowStockThreshold: 30,
    taxRate: 8,
    taxExempt: false,
    hasExpiry: true,
    expiryDate: getDateOffset(5), // Expires in 5 days - WARNING
    batchNumber: "COKE-DEC24",
  },
  {
    id: "5",
    name: "Shampoo (500ml)",
    sku: "SHAMP-500-001",
    price: 45,
    stock: 25,
    category: "Personal Care",
    lowStockThreshold: 10,
    taxRate: 6,
    taxExempt: false,
    hasExpiry: true,
    expiryDate: getDateOffset(180), // Expires in 6 months
    batchNumber: "SHP-2025-06",
  },
  {
    id: "6",
    name: "Flour (1kg)",
    sku: "FLOUR-1KG-001",
    price: 18,
    stock: 55,
    category: "Groceries",
    lowStockThreshold: 25,
    taxRate: 0,
    taxExempt: true,
    hasExpiry: false,
  },
  {
    id: "7",
    name: "Notebook (A4)",
    sku: "NOTE-A4-001",
    price: 25,
    stock: 40,
    category: "Stationery",
    lowStockThreshold: 15,
    taxRate: 6,
    taxExempt: false,
    hasExpiry: false,
  },
  {
    id: "8",
    name: "Bottled Water (1.5L)",
    sku: "WATER-1.5L-002",
    price: 10,
    stock: 60,
    category: "Beverages",
    lowStockThreshold: 30,
    taxRate: 8,
    taxExempt: false,
    hasExpiry: true,
    expiryDate: getDateOffset(-3), // Expired 3 days ago - EXPIRED
    batchNumber: "H2O-NOV24",
  },
];