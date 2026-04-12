// Multi-window synchronization utilities using BroadcastChannel and localStorage

export interface StockUpdateMessage {
  type: "stock_update";
  productId: string;
  newStock: number;
}

export interface TransactionMessage {
  type: "new_transaction";
  transactionId: string;
}

export type SyncMessage = StockUpdateMessage | TransactionMessage;

// BroadcastChannel for real-time sync across tabs
let broadcastChannel: BroadcastChannel | null = null;

export function initBroadcastChannel() {
  if (typeof window === "undefined") return null;
  
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel("pos_sync");
  }
  return broadcastChannel;
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
  if (typeof window === "undefined") return "server";
  
  let terminalId = localStorage.getItem("terminal_id");
  if (!terminalId) {
    terminalId = `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("terminal_id", terminalId);
  }
  return terminalId;
}

// Get terminal name (cashier-friendly)
export function getTerminalName(): string {
  const id = getTerminalId();
  const parts = id.split("-");
  return `Terminal ${parts[parts.length - 1].toUpperCase().slice(0, 4)}`;
}

// Shared inventory in localStorage
export function getSharedInventory() {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem("shared_inventory");
  return data ? JSON.parse(data) : {};
}

export function updateSharedInventory(productId: string, stock: number) {
  if (typeof window === "undefined") return;
  
  const inventory = getSharedInventory();
  inventory[productId] = stock;
  localStorage.setItem("shared_inventory", JSON.stringify(inventory));
  
  // Notify other windows
  sendMessage({
    type: "stock_update",
    productId,
    newStock: stock,
  });
}

// Shared transactions in localStorage
export function getSharedTransactions() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("shared_transactions");
  return data ? JSON.parse(data) : [];
}

export function addSharedTransaction(transaction: unknown) {
  if (typeof window === "undefined") return;
  
  const transactions = getSharedTransactions();
  transactions.unshift(transaction);
  localStorage.setItem("shared_transactions", JSON.stringify(transactions));
  
  // Notify other windows
  sendMessage({
    type: "new_transaction",
    transactionId: (transaction as { id: string }).id,
  });
}