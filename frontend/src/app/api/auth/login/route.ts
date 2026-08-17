import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json(data);
    
    // Configurar HttpOnly Cookie para segurança do Access Token
    response.cookies.set({
      name: "ticonta_access_token",
      value: data.access_token,
      httpOnly: false, // acessível via middleware/client
      path: "/",
      maxAge: data.expires_in,
      sameSite: "lax",
    });

    response.cookies.set({
      name: "ticonta_refresh_token",
      value: data.refresh_token,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { detail: "Erro interno no proxy de login: " + error.message },
      { status: 500 }
    );
  }
}
