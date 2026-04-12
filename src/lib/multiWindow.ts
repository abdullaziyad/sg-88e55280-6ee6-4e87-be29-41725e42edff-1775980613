// Multi-window synchronization utilities using BroadcastChannel and localStorage

export interface SyncMessage {
  type: "new_transaction" | "stock_update" | "invoice_update" | "quotation_update";
  productId?: string;
  newStock?: number;
  transactionId?: string;
}

let channel: BroadcastChannel | null = null;

export function initBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  
  if (!channel) {
    try {
      channel = new BroadcastChannel("pos_sync");
    } catch (error) {
      console.error("BroadcastChannel not supported", error);
      return null;
    }
  }
  return channel;
}

export function sendMessage(message: SyncMessage) {
  const channel = initBroadcastChannel();
  if (channel) {
    channel.postMessage(message);
  }
}

export function onMessage(callback: (message: SyncMessage) => void) {
  const channel = initBroadcastChannel();
  if (channel) {
    const handler = (event: MessageEvent) => callback(event.data);
    channel.addEventListener("message", handler);
    return () => channel.removeEventListener("message", handler);
  }
  return () => {};
}

// Generate unique terminal ID
export function getTerminalId(): string {
  if (typeof window === "undefined") return "";
  
  let terminalId = sessionStorage.getItem("terminal_id");
  if (!terminalId) {
    terminalId = `T${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("terminal_id", terminalId);
  }
  return terminalId;
}

export function getTerminalName(): string {
  const id = getTerminalId();
  const terminals = JSON.parse(localStorage.getItem("active_terminals") || "[]");
  
  let index = terminals.indexOf(id);
  if (index === -1) {
    terminals.push(id);
    localStorage.setItem("active_terminals", JSON.stringify(terminals));
    index = terminals.length - 1;
  }
  
  return `Terminal ${index + 1}`;
}

// Shared inventory management
const INVENTORY_KEY = "shared_inventory";

export function getSharedInventory(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(INVENTORY_KEY);
  return data ? JSON.parse(data) : {};
}

export function updateSharedInventory(productId: string, newStock: number) {
  if (typeof window === "undefined") return;
  
  const inventory = getSharedInventory();
  inventory[productId] = newStock;
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  
  sendMessage({
    type: "stock_update",
    productId,
    newStock,
  });
}

// Shared transactions
const TRANSACTIONS_KEY = "shared_transactions";

export function getSharedTransactions() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addSharedTransaction(transaction: { id: string }) {
  if (typeof window === "undefined") return;
  
  const transactions = getSharedTransactions();
  transactions.unshift(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  
  sendMessage({
    type: "new_transaction",
    transactionId: transaction.id,
  });
}