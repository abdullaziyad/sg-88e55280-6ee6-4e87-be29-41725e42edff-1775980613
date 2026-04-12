export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  lowStockThreshold: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: "cash" | "card";
  timestamp: string;
}