import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionItem = Database["public"]["Tables"]["transaction_items"]["Row"];
type TransactionItemInsert = Database["public"]["Tables"]["transaction_items"]["Insert"];

export const transactionService = {
  async getTransactions(storeId: string, startDate?: Date, endDate?: Date) {
    let query = supabase
      .from("transactions")
      .select("*, transaction_items(*)")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }
    if (endDate) {
      query = query.lte("created_at", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getTransaction(transactionId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, transaction_items(*)")
      .eq("id", transactionId)
      .single();

    if (error) throw error;
    return data;
  },

  async createTransaction(
    transaction: Omit<TransactionInsert, "id" | "created_at">,
    items: Omit<TransactionItemInsert, "id" | "transaction_id" | "created_at">[]
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Create transaction
    const { data: newTransaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        ...transaction,
        user_id: user.id,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Create transaction items
    const itemsWithTransactionId = items.map(item => ({
      ...item,
      transaction_id: newTransaction.id,
    }));

    const { error: itemsError } = await supabase
      .from("transaction_items")
      .insert(itemsWithTransactionId);

    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of items) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (product) {
          await supabase
            .from("products")
            .update({ 
              stock: product.stock - item.quantity,
              updated_at: new Date().toISOString()
            })
            .eq("id", item.product_id);
        }
      }
    }

    return newTransaction;
  },

  async getSalesReport(storeId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("store_id", storeId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (error) throw error;

    const transactions = data || [];
    const totalSales = transactions.reduce((sum, t) => sum + Number(t.total), 0);
    const totalTransactions = transactions.length;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    return {
      totalSales,
      totalTransactions,
      averageTransaction,
      transactions,
    };
  },
};