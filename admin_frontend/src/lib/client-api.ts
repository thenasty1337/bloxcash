/**
 * Client-side API helper for making authenticated requests to the backend.
 * This is used in client components where server actions can't be called directly.
 */
export async function clientApi<T>(
  endpoint: string,
  init: RequestInit & { jsonBody?: unknown } = { method: 'GET' }
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8080';

  const { jsonBody, ...rest } = init;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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

  // Parse the JSON response
  const data = (await res.json()) as T;

  // Check if the response contains an error field (even with successful HTTP status)
  if (data && typeof data === 'object' && 'error' in data) {
    const errorData = data as any;
    const error = new Error(errorData.error || 'Unknown API error');
    
    // Attach the full response data to the error for better debugging
    (error as any).data = data;
    (error as any).status = res.status;
    
    throw error;
  }

  return data;
} 