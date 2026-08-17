import { describe, it, expect } from "vitest";
import { syncEngine } from "@/services/sync-engine";
import { useSyncStore } from "@/store/sync.store";

describe("Sync Engine Infrastructure", () => {
  it("initializes sync engine singleton instance", () => {
    expect(syncEngine).toBeDefined();
    expect(typeof syncEngine.sync).toBe("function");
    expect(typeof syncEngine.queueOperation).toBe("function");
    expect(typeof syncEngine.checkConnectivity).toBe("function");
  });

  it("can inspect and update sync store state", () => {
    useSyncStore.getState().setIsOnline(true);
    useSyncStore.getState().setPendingCount(3);

    const state = useSyncStore.getState();
    expect(state.isOnline).toBe(true);
    expect(state.pendingCount).toBe(3);
  });
});
