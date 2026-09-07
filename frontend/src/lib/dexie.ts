import Dexie, { Table } from "dexie";
import { OfflineSalePayload, Product } from "@/types/pos";

export class TiContaDatabase extends Dexie {
  products!: Table<Product, number>;
  offlineSales!: Table<OfflineSalePayload, string>;

  constructor() {
    super("TiContaV2DB");
    this.version(1).stores({
      products: "id, name, sku, category, active",
      offlineSales: "offline_id, created_at, synced",
    });
  }
}

export const localDb = new TiContaDatabase();
