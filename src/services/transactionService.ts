import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { offlineDB } from "@/lib/db";
import { auditService } from "./auditService";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionItemInsert = Database["public"]["Tables"]["transaction_items"]["Insert"];

export const transactionService = {
  async createTransaction(
    transaction: Omit<TransactionInsert, "id" | "created_at" | "user_id" | "transaction_number">,
    items: Omit<TransactionItemInsert, "id" | "transaction_id" | "created_at">[]
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const transaction_number = `TRX-${Date.now().toString().slice(-6)}`;
    const transactionId = crypto.randomUUID();
    
    const newTransaction = {
      id: transactionId,
      ...transaction,
      user_id: user.id,
      transaction_number,
      created_at: new Date().toISOString(),
    };

    const transactionItems = items.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      transaction_id: transactionId,
      created_at: new Date().toISOString(),
    }));

    // Save offline immediately
    await offlineDB.addTransaction({
      ...newTransaction,
      transaction_items: transactionItems,
    });

    // Try to sync online if available
    if (navigator.onLine) {
      try {
        const { data: txData, error: transactionError } = await supabase
          .from("transactions")
          .insert({
            ...transaction,
            user_id: user.id,
            transaction_number,
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        const { error: itemsError } = await supabase
          .from("transaction_items")
          .insert(items.map(item => ({ ...item, transaction_id: txData.id })));

        if (itemsError) throw itemsError;

        // Update product stock
        await Promise.all(
          items.map(item =>
            supabase.rpc("decrement_product_stock", {
              product_id: item.product_id,
              quantity: item.quantity,
            })
          )
        );

        // Log audit trail
        await auditService.logAction({
          storeId: transaction.store_id,
          action: "transaction_complete",
          entityType: "transaction",
          entityId: newTransaction.id,
          newData: {
            transaction: newTransaction,
            items: newItems,
            total: transaction.total,
          },
        });

        return newTransaction;
      } catch (error) {
        console.error("Online transaction failed, queued for sync:", error);
      }
    }

    return { ...newTransaction, transaction_items: transactionItems };
  },

  async getTransactions(storeId: string, useOffline = false) {
    // Try offline first if requested or if offline
    if (useOffline || !navigator.onLine) {
      try {
        const transactions = await offlineDB.getTransactions(storeId);
        return transactions;
      } catch (error) {
        console.error("Offline fetch failed:", error);
      }
    }

    // Try online
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, transaction_items(*)")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Cache to offline DB
      if (data && navigator.onLine) {
        const db = await offlineDB.ensureDB();
        const tx = db.transaction('transactions', 'readwrite');
        await Promise.all(data.map(t => tx.store.put(t)));
      }

      return data || [];
    } catch (error) {
      console.error("Online fetch failed, using offline:", error);
      return offlineDB.getTransactions(storeId);
    }
  },

  async getRecentTransactions(storeId: string, limit = 10) {
    const transactions = await this.getTransactions(storeId);
    return transactions.slice(0, limit);
  },

  async getTransactionsByDateRange(
    storeId: string,
    startDate: string,
    endDate: string
  ) {
    const transactions = await this.getTransactions(storeId);
    return transactions.filter(t => {
      const date = t.created_at.split('T')[0];
      return date >= startDate && date <= endDate;
    });
  },

  async getDailySalesReport(storeId: string, date: string) {
    const transactions = await this.getTransactionsByDateRange(storeId, date, date);
    
    const totalSales = transactions.reduce((sum, t) => sum + Number(t.total), 0);
    const totalTransactions = transactions.length;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    return {
      date,
      totalSales,
      totalTransactions,
      averageTransaction,
      transactions,
    };
  },

  async getSalesReport(storeId: string, startDate: Date, endDate: Date) {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const transactions = await this.getTransactionsByDateRange(storeId, startStr, endStr);
    
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