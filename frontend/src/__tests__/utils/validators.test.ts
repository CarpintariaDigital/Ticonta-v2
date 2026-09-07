import { describe, it, expect } from "vitest";

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateNUIT(nuit: string): boolean {
  if (!/^\d{9}$/.test(nuit)) return false;
  return true;
}

export function validateMozPhone(phone: string): boolean {
  const clean = phone.replace(/[\s+-]/g, "");
  return (
    (clean.startsWith("25884") ||
      clean.startsWith("25882") ||
      clean.startsWith("25885") ||
      clean.startsWith("25886") ||
      clean.startsWith("25887") ||
      clean.startsWith("84") ||
      clean.startsWith("82") ||
      clean.startsWith("85") ||
      clean.startsWith("86") ||
      clean.startsWith("87")) &&
    clean.length >= 9
  );
}

describe("Frontend Validators", () => {
  it("validates emails properly", () => {
    expect(validateEmail("admin@ticonta.co.mz")).toBe(true);
    expect(validateEmail("user.name+tag@domain.com")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
  });

  it("validates Mozambique NUIT (9 digits)", () => {
    expect(validateNUIT("400123456")).toBe(true);
    expect(validateNUIT("100200300")).toBe(true);
    expect(validateNUIT("12345")).toBe(false);
    expect(validateNUIT("abcdefghi")).toBe(false);
  });

  it("validates Mozambique cellular phone operators (Vodacom, mcel, Movitel)", () => {
    expect(validateMozPhone("+258 84 123 4567")).toBe(true);
    expect(validateMozPhone("82 999 8888")).toBe(true);
    expect(validateMozPhone("86 444 3322")).toBe(true);
    expect(validateMozPhone("12345678")).toBe(false);
  });
});
