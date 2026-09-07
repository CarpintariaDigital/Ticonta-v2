import { describe, it, expect } from "vitest";
import { db } from "@/services/db";
import { syncEngine } from "@/services/sync-engine";

describe("Offline DB & Sync Operations", () => {
  it("can initialize offline indexedDB tables in db", async () => {
    expect(db.syncQueue).toBeDefined();
    expect(db.sales).toBeDefined();
    expect(db.customers).toBeDefined();
    expect(db.products).toBeDefined();
  });

  it("queues and retrieves offline mutations in syncQueue", async () => {
    const mutationId = await syncEngine.queueOperation(
      "Sale",
      "CREATE",
      "/api/v1/sales",
      { total_amount: 5000 }
    );

    expect(mutationId).toBeDefined();
    const item = await db.syncQueue.where("client_mutation_id").equals(mutationId).first();
    expect(item).toBeDefined();
    expect(item?.entity).toBe("Sale");
    expect(item?.operation).toBe("CREATE");
  });
});
