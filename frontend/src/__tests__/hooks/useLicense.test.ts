import { describe, it, expect, beforeEach, vi } from "vitest";
import { licensingService } from "@/services/licensing";
import { useLicenseStore } from "@/store/license.store";

describe("Licensing Frontend System", () => {
  beforeEach(() => {
    useLicenseStore.setState({
      status: "unlicensed",
      plan: null,
      activeModules: [],
      licenseKey: null,
      expiresAt: null,
      daysRemaining: 0,
      isLoading: false,
      error: null,
    });
  });

  it("validates standard TiConta license key format", () => {
    expect(licensingService.validateLicenseFormat("TIC-A8B9C-COMPLETE-271231-9F8A1B2C")).toBe(true);
    expect(licensingService.validateLicenseFormat("INVALID-KEY")).toBe(false);
    expect(licensingService.validateLicenseFormat("TIC-SHORT-KEY")).toBe(false);
  });

  it("checks module permissions correctly via useLicenseStore", () => {
    const store = useLicenseStore.getState();

    // Estado inicial: não licenciado
    expect(store.hasModule("manufacturing")).toBe(false);

    // Ativar plano COMPLETE com módulos
    useLicenseStore.setState({
      status: "licensed",
      plan: "complete",
      activeModules: ["pos", "crm", "accounting", "manufacturing"],
    });

    expect(useLicenseStore.getState().hasModule("pos")).toBe(true);
    expect(useLicenseStore.getState().hasModule("manufacturing")).toBe(true);
    expect(useLicenseStore.getState().hasModule("hr")).toBe(false);

    // Plano ENTERPRISE com acesso wildcard '*'
    useLicenseStore.setState({
      status: "licensed",
      plan: "enterprise",
      activeModules: ["*"],
    });
    expect(useLicenseStore.getState().hasModule("hr")).toBe(true);
    expect(useLicenseStore.getState().hasModule("any_custom_module")).toBe(true);
  });
});
