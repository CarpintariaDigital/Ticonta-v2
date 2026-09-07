import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("loads the login page with PIN pad and credentials input", async ({ page }) => {
    await page.goto("/login");

    // Verificar branding TiConta v2 e subtítulo
    await expect(page.getByRole("heading", { name: /TiConta v2/i })).toBeVisible();
    await expect(page.getByText("Aceda ao sistema com o seu nome de utilizador e PIN")).toBeVisible();

    // Inputs de utilizador e PIN (placeholder='Ex: operador1' e '••••')
    const usernameInput = page.getByPlaceholder("Ex: operador1");
    const pinInput = page.getByPlaceholder("••••");

    await expect(usernameInput).toBeVisible();
    await expect(pinInput).toBeVisible();

    // Preencher dados no formulário
    await usernameInput.fill("admin_user");
    await pinInput.fill("1234");

    // Botão de submissão
    const submitBtn = page.getByRole("button", { name: /entrar/i });
    await expect(submitBtn).toBeVisible();
  });
});
