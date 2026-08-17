import { test, expect } from "@playwright/test";

test.describe("Offline to Online Flow", () => {
  test("handles network status transitions gracefully", async ({ page, context }) => {
    await page.goto("/login");

    // Simular modo offline
    await context.setOffline(true);
    await expect(page.locator("body")).toBeVisible();

    // Restaurar online
    await context.setOffline(false);
    await expect(page.locator("body")).toBeVisible();
  });
});
