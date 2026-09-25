import Dexie, { Table } from "dexie";

export interface SyncQueueItem {
  id?: number;
  client_mutation_id: string;
  entity: string;
  operation: string;
  endpoint: string;
  payload: any;
  retry_count?: number;
  status: "PENDING" | "SYNCING" | "COMPLETED" | "FAILED";
  created_at: string;
  updated_at?: string;
}

export interface DBSaleItem {
  id?: number;
  total: number;
  currency?: string;
  items: any[];
  client_id?: string;
  created_at?: string;
}

export interface DBProductItem {
  id?: number;
  name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  active: boolean;
}

export interface DBCustomerItem {
  id?: number;
  name: string;
  phone?: string;
  total_owed?: number;
}

export interface DBSessionItem {
  id?: number;
  user_id: number;
  opening_amount: number;
  status: string;
  opened_at: string;
}

export class TiContaDatabase extends Dexie {
  syncQueue!: Table<SyncQueueItem, number>;
  sales!: Table<DBSaleItem, number>;
  products!: Table<DBProductItem, number>;
  customers!: Table<DBCustomerItem, number>;
  sessions!: Table<DBSessionItem, number>;

  constructor() {
    super("TiContaDB");
    this.version(1).stores({
      syncQueue: "++id, client_mutation_id, entity, operation, status, created_at",
      sales: "++id, total, client_id, created_at",
      products: "++id, sku, name, active",
      customers: "++id, name, phone",
      sessions: "++id, user_id, status, opened_at",
    });
  }

  async clearAllTables(): Promise<void> {
    await Promise.all([
      this.syncQueue.clear(),
      this.sales.clear(),
      this.products.clear(),
      this.customers.clear(),
      this.sessions.clear(),
    ]);
  }
}

export const db = new TiContaDatabase();
export const clearAllTables = () => db.clearAllTables();
