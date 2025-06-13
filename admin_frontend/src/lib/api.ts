'use server';

import { cookies } from 'next/headers';

/**
 * Simple typed helper to call our backend admin API.
 * Usage (in a Server Action / Route Handler):
 *   const users = await api<User[]>("/admin/users?page=1", { method: "GET" });
 *
 * The helper automatically:
 *   • prefixes the request with NEXT_PUBLIC_BACKEND_API_URL
 *   • forwards the authentication cookies from the current request
 */
export async function api<T>(
  endpoint: string,
  init: RequestInit & { jsonBody?: unknown } = { method: 'GET' }
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8080';

  // Get cookies from the current request
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const { jsonBody, ...rest } = init;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Cookie: cookieHeader,
    ...(rest.headers ?? {})
  };

  const res = await fetch(`${base}${endpoint}`, {
    ...rest,
    body: jsonBody ? JSON.stringify(jsonBody) : rest.body,
    headers,
    credentials: 'include'
  });

  if (!res.ok) {
    let message: string;
    try {
      // Assume error response is JSON { message }
      const err = (await res.json()) as { message?: string };
      message = err.message ?? res.statusText;
    } catch {
      message = res.statusText;
    }
    throw new Error(`API ${res.status}: ${message}`);
  }

  // If caller expects no body (204) just return as undefined
  if (res.status === 204) return undefined as unknown as T;

  return (await res.json()) as T;
} 