import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refresh_token || request.cookies.get("ticonta_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ detail: "Refresh token em falta" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json(data);
    response.cookies.set({
      name: "ticonta_access_token",
      value: data.access_token,
      httpOnly: false,
      path: "/",
      maxAge: data.expires_in,
      sameSite: "lax",
    });

    if (data.refresh_token) {
      response.cookies.set({
        name: "ticonta_refresh_token",
        value: data.refresh_token,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { detail: "Erro interno no proxy de refresh: " + error.message },
      { status: 500 }
    );
  }
}
