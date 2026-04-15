import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ShopDB extends DBSchema {
  products: {
    key: string;
    value: any;
    indexes: { 'by-store': string };
  };
  transactions: {
    key: string;
    value: any;
    indexes: { 'by-store': string; 'by-date': string };
  };
  settings: {
    key: string;
    value: any;
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      table: string;
      operation: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
      synced: boolean;
    };
    indexes: { 'by-synced': number };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: any;
      updated_at: string;
    };
  };
}

const DB_NAME = 'maldives-shop-db';
const DB_VERSION = 1;

class OfflineDatabase {
  private db: IDBPDatabase<ShopDB> | null = null;

  async init() {
    this.db = await openDB<ShopDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('by-store', 'store_id');
        }

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by-store', 'store_id');
          txStore.createIndex('by-date', 'created_at');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('by-synced', 'synced');
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });
  }

  async ensureDB() {
    if (!this.db) await this.init();
    return this.db!;
  }

  // Products
  async getProducts(storeId: string) {
    const db = await this.ensureDB();
    return db.getAllFromIndex('products', 'by-store', storeId);
  }

  async addProduct(product: any) {
    const db = await this.ensureDB();
    await db.put('products', product);
    await this.addToSyncQueue('products', 'create', product);
  }

  async updateProduct(product: any) {
    const db = await this.ensureDB();
    await db.put('products', product);
    await this.addToSyncQueue('products', 'update', product);
  }

  async deleteProduct(id: string) {
    const db = await this.ensureDB();
    await db.delete('products', id);
    await this.addToSyncQueue('products', 'delete', { id });
  }

  // Transactions
  async getTransactions(storeId: string) {
    const db = await this.ensureDB();
    return db.getAllFromIndex('transactions', 'by-store', storeId);
  }

  async addTransaction(transaction: any) {
    const db = await this.ensureDB();
    await db.put('transactions', transaction);
    await this.addToSyncQueue('transactions', 'create', transaction);
  }

  // Settings
  async getSettings(storeId: string) {
    const db = await this.ensureDB();
    return db.get('settings', storeId);
  }

  async saveSettings(storeId: string, settings: any) {
    const db = await this.ensureDB();
    await db.put('settings', { id: storeId, ...settings });
    await this.addToSyncQueue('settings', 'update', { id: storeId, settings });
  }

  // Sync queue
  async addToSyncQueue(table: string, operation: 'create' | 'update' | 'delete', data: any) {
    const db = await this.ensureDB();
    await db.put('sync_queue', {
      id: `${table}-${operation}-${Date.now()}-${Math.random()}`,
      table,
      operation,
      data,
      timestamp: Date.now(),
      synced: false,
    });
  }

  async getPendingSync() {
    const db = await this.ensureDB();
    return db.getAllFromIndex('sync_queue', 'by-synced', 0);
  }

  async markSynced(id: string) {
    const db = await this.ensureDB();
    const item = await db.get('sync_queue', id);
    if (item) {
      item.synced = true;
      await db.put('sync_queue', item);
    }
  }

  async clearSyncedItems() {
    const db = await this.ensureDB();
    const items = await db.getAllFromIndex('sync_queue', 'by-synced', 1);
    const tx = db.transaction('sync_queue', 'readwrite');
    await Promise.all(items.map(item => tx.store.delete(item.id)));
  }

  // Metadata
  async getMetadata(key: string) {
    const db = await this.ensureDB();
    const item = await db.get('metadata', key);
    return item?.value;
  }

  async setMetadata(key: string, value: any) {
    const db = await this.ensureDB();
    await db.put('metadata', {
      key,
      value,
      updated_at: new Date().toISOString(),
    });
  }

  // Export all data for backup
  async exportAllData() {
    const db = await this.ensureDB();
    const [products, transactions, settings] = await Promise.all([
      db.getAll('products'),
      db.getAll('transactions'),
      db.getAll('settings'),
    ]);

    return {
      products,
      transactions,
      settings,
      exported_at: new Date().toISOString(),
      version: DB_VERSION,
    };
  }

  // Import data from backup
  async importData(data: any) {
    const db = await this.ensureDB();
    const tx = db.transaction(['products', 'transactions', 'settings'], 'readwrite');

    await Promise.all([
      ...data.products.map((p: any) => tx.objectStore('products').put(p)),
      ...data.transactions.map((t: any) => tx.objectStore('transactions').put(t)),
      ...data.settings.map((s: any) => tx.objectStore('settings').put(s)),
    ]);

    await tx.done;
  }
}

export const offlineDB = new OfflineDatabase();