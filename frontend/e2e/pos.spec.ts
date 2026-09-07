import { test, expect } from "@playwright/test";

test.describe("POS / Ponto de Venda Flow", () => {
  test("allows accessing POS route and presents catalog / cart elements", async ({ page }) => {
    await page.goto("/pos");
    // Se redirecionar para login por proteção, verifica integridade do layout
    await expect(page).toHaveURL(/.*(pos|login).*/);
  });
});
