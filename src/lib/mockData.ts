import type { Product } from "@/types";

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
    taxExempt: true, // Basic food items are GST exempt
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
    taxExempt: true, // Basic food items are GST exempt
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
    taxExempt: false, // Processed foods subject to 8% GST
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
    taxExempt: false, // Beverages subject to 8% GST
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
    taxExempt: false, // Personal care items subject to 6% GST
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
    taxExempt: true, // Basic food items are GST exempt
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
    taxExempt: false, // Stationery subject to 6% GST
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
    taxExempt: false, // Bottled water subject to 8% GST
  },
];