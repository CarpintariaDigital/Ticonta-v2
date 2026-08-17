import Dexie, { Table } from "dexie";
import { Product } from "@/types/pos";

export interface SyncQueueItem {
  id?: number;
  client_mutation_id: string;
  entity: string; // Sale, Customer, Product, etc.
  entity_id?: number | string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  endpoint: string;
  payload: any;
  retry_count: number;
  status: "PENDING" | "SYNCING" | "FAILED" | "COMPLETED";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineCustomer {
  id?: number;
  name: string;
  nuit?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  debt_amount: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface OfflineSale {
  id?: number;
  offline_id: string;
  customer_id?: number;
  items: { product_id: number; quantity: number; unit_price: number; tax_rate: number }[];
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  payment_method: string;
  payment_status: string;
  sale_date: string;
  synced: boolean;
  server_id?: number;
}

export interface SyncMeta {
  key: string;
  value: any;
  updated_at: string;
}

export class TiContaDatabase extends Dexie {
  products!: Table<Product, number>;
  customers!: Table<OfflineCustomer, number>;
  sales!: Table<OfflineSale, number>;
  syncQueue!: Table<SyncQueueItem, number>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super("TiContaV2Database");

    this.version(1).stores({
      products: "++id, sku, category, active",
      customers: "++id, name, nuit",
      sales: "++id, offline_id, synced, sale_date",
      syncQueue: "++id, client_mutation_id, entity, operation, status, created_at",
      syncMeta: "key",
    });
  }

  async cleanupOldCompletedQueue(daysToKeep = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffStr = cutoffDate.toISOString();

    return this.syncQueue
      .where("created_at")
      .below(cutoffStr)
      .and((item) => item.status === "COMPLETED")
      .delete();
  }
}

export const db = new TiContaDatabase();
