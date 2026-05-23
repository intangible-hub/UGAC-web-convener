// lib/api.ts — Centralised API helper for making authenticated requests to the Django backend.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Wrapper around fetch that adds the JWT token from localStorage
 * and sets JSON content type. Returns the parsed JSON response.
 */
export async function api(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return res;
}

/**
 * Login — POST /auth/login/ — returns JWT tokens.
 */
export async function login(email: string, password: string) {
  const res = await api("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Invalid credentials");
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  return data;
}

/**
 * Register — POST /auth/register/ — creates a new user.
 */
export async function register(
  name: string,
  email: string,
  password: string,
  role: string = "student"
) {
  const res = await api("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!res.ok) {
    const err = await res.json();
    const message = Object.values(err).flat().join(", ");
    throw new Error(message || "Registration failed");
  }

  return res.json();
}

/**
 * Get current user — GET /auth/me/
 */
export async function getMe() {
  const res = await api("/auth/me/");
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

/**
 * Logout — clears tokens from localStorage.
 */
export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
