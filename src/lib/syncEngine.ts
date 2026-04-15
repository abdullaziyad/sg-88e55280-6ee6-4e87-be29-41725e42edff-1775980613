import { supabase } from "@/integrations/supabase/client";
import { offlineDB } from "./db";

class SyncEngine {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;

  async startAutoSync(intervalMs = 30000) {
    // Initial sync
    await this.syncToCloud();

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.syncToCloud();
    }, intervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncToCloud() {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    try {
      const pendingItems = await offlineDB.getPendingSync();

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await offlineDB.markSynced(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Don't mark as synced if failed
        }
      }

      // Clean up synced items older than 7 days
      await offlineDB.clearSyncedItems();

      // Update last sync timestamp
      await offlineDB.setMetadata('last_sync', new Date().toISOString());

      console.log(`Synced ${pendingItems.length} items to cloud`);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: any) {
    const { table, operation, data } = item;

    switch (table) {
      case 'products':
        if (operation === 'create' || operation === 'update') {
          const { error } = await supabase.from('products').upsert(data);
          if (error) throw error;
        } else if (operation === 'delete') {
          const { error } = await supabase.from('products').delete().eq('id', data.id);
          if (error) throw error;
        }
        break;

      case 'transactions':
        if (operation === 'create') {
          const { error } = await supabase.from('transactions').insert(data);
          if (error) throw error;
        }
        break;

      case 'settings':
        if (operation === 'update') {
          const { error } = await supabase
            .from('stores')
            .update({ settings: data.settings })
            .eq('id', data.id);
          if (error) throw error;
        }
        break;
    }
  }

  async syncFromCloud(storeId: string) {
    if (!navigator.onLine) return;

    try {
      // Sync products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId);

      if (products) {
        const db = await offlineDB.ensureDB();
        const tx = db.transaction('products', 'readwrite');
        await Promise.all(products.map(p => tx.store.put(p)));
      }

      // Sync recent transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (transactions) {
        const db = await offlineDB.ensureDB();
        const tx = db.transaction('transactions', 'readwrite');
        await Promise.all(transactions.map(t => tx.store.put(t)));
      }

      console.log('Synced data from cloud');
    } catch (error) {
      console.error('Failed to sync from cloud:', error);
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    return offlineDB.getMetadata('last_sync');
  }
}

export const syncEngine = new SyncEngine();