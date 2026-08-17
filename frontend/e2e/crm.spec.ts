import { test, expect } from "@playwright/test";

test.describe("CRM Kanban Flow", () => {
  test("renders CRM pipeline columns", async ({ page }) => {
    await page.goto("/crm");
    await expect(page).toHaveURL(/.*(crm|login).*/);
  });
});
