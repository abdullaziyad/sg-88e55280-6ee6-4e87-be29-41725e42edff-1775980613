import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type StoreInsert = Database["public"]["Tables"]["stores"]["Insert"];
type StoreUpdate = Database["public"]["Tables"]["stores"]["Update"];

export const storeService = {
  async getUserStores() {
    const { data, error } = await supabase
      .from("stores")
      .select("*, store_users!inner(role)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getStore(storeId: string) {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .single();

    if (error) throw error;
    return data;
  },

  async createStore(store: Omit<StoreInsert, "id" | "created_at" | "updated_at">) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Create store
    const { data: newStore, error: storeError } = await supabase
      .from("stores")
      .insert(store)
      .select()
      .single();

    if (storeError) throw storeError;

    // Add user as owner
    const { error: userError } = await supabase
      .from("store_users")
      .insert({
        store_id: newStore.id,
        user_id: user.id,
        role: "owner",
      });

    if (userError) throw userError;

    return newStore;
  },

  async updateStore(storeId: string, updates: StoreUpdate) {
    const { data, error } = await supabase
      .from("stores")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", storeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStoreUsers(storeId: string) {
    const { data, error } = await supabase
      .from("store_users")
      .select("*, profiles(*)")
      .eq("store_id", storeId);

    if (error) throw error;
    return data;
  },

  async addStoreUser(storeId: string, userId: string, role: "admin" | "cashier") {
    const { data, error } = await supabase
      .from("store_users")
      .insert({
        store_id: storeId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeStoreUser(storeId: string, userId: string) {
    const { error } = await supabase
      .from("store_users")
      .delete()
      .eq("store_id", storeId)
      .eq("user_id", userId);

    if (error) throw error;
  },
};