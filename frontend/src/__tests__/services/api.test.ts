import { describe, it, expect } from "vitest";
import { apiClient } from "@/services/auth";

describe("API Client Setup", () => {
  it("has baseURL configured for backend API v1", () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
  });

  it("sets JSON application headers by default", () => {
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
  });
});
