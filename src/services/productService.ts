import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { offlineDB } from "@/lib/db";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export const productService = {
  async getProducts(storeId: string, useOffline = false) {
    // Try offline first if requested or if offline
    if (useOffline || !navigator.onLine) {
      try {
        const products = await offlineDB.getProducts(storeId);
        return products;
      } catch (error) {
        console.error("Offline fetch failed:", error);
      }
    }

    // Try online
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .order("name");

      if (error) throw error;

      // Cache to offline DB
      if (data && navigator.onLine) {
        const db = await offlineDB.ensureDB();
        const tx = db.transaction('products', 'readwrite');
        await Promise.all(data.map(p => tx.store.put(p)));
      }

      return data || [];
    } catch (error) {
      // Fallback to offline
      console.error("Online fetch failed, using offline:", error);
      return offlineDB.getProducts(storeId);
    }
  },

  async createProduct(product: ProductInsert) {
    // Save offline immediately
    const newProduct = {
      ...product,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    await offlineDB.addProduct(newProduct);

    // Try to sync online if available
    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from("products")
          .insert(product)
          .select()
          .single();

        if (error) throw error;
        
        // Update offline with server ID
        if (data) {
          await offlineDB.updateProduct(data);
        }
        
        return data;
      } catch (error) {
        console.error("Online create failed, queued for sync:", error);
      }
    }

    return newProduct;
  },

  async updateProduct(id: string, updates: ProductUpdate) {
    const updated = { ...updates, id };
    
    // Update offline immediately
    await offlineDB.updateProduct(updated);

    // Try to sync online if available
    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from("products")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Online update failed, queued for sync:", error);
      }
    }

    return updated;
  },

  async deleteProduct(id: string) {
    // Delete offline immediately
    await offlineDB.deleteProduct(id);

    // Try to sync online if available
    if (navigator.onLine) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
      } catch (error) {
        console.error("Online delete failed, queued for sync:", error);
      }
    }
  },

  async getLowStockProducts(storeId: string, threshold = 10) {
    const products = await this.getProducts(storeId);
    return products.filter(p => p.stock <= threshold);
  },
};