import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/auth.store";

describe("useAuthStore & authService", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it("initializes with unauthenticated state", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.accessToken).toBe(null);
  });

  it("sets user and token on setUser and setTokens actions", () => {
    const mockUser = {
      id: 1,
      username: "admin_user",
      email: "admin@ticonta.co.mz",
      role: "admin",
      company_id: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setTokens({
      access_token: "jwt_mock_access_12345",
      refresh_token: "jwt_mock_refresh_12345",
      token_type: "bearer",
      expires_in: 3600,
    });

    const updatedState = useAuthStore.getState();
    expect(updatedState.isAuthenticated).toBe(true);
    expect(updatedState.user?.username).toBe("admin_user");
    expect(updatedState.accessToken).toBe("jwt_mock_access_12345");
  });

  it("clears state on logout", () => {
    useAuthStore.getState().setUser({
      id: 1,
      username: "user",
      role: "operator",
      company_id: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBe(null);
    expect(useAuthStore.getState().accessToken).toBe(null);
  });
});
