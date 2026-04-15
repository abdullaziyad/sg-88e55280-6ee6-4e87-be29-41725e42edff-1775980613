import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export const productService = {
  async getProducts(storeId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getProduct(productId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<ProductInsert, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(productId: string, updates: ProductUpdate) {
    const { data, error } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(productId: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;
  },

  async updateStock(productId: string, quantity: number) {
    const { data, error } = await supabase
      .from("products")
      .update({ 
        stock: quantity,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLowStockProducts(storeId: string, threshold: number = 10) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .lte("stock", threshold)
      .order("stock", { ascending: true });

    if (error) throw error;
    return data || [];
  },
};