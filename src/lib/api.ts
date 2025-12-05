import { getStoredToken, clearStoredToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { headers, ...rest } = options;
    console.log(API_URL + endpoint, options);
    const token = typeof window !== "undefined" ? getStoredToken() : null;
    const finalHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(headers ?? {}),
    };

    if (token) {
        finalHeaders.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: finalHeaders,
        ...rest,
    });

    if (!res.ok) {
        // Handle 401 Unauthorized globally if needed, though middleware catches most
        if (res.status === 401) {
            if (typeof window !== "undefined") {
                clearStoredToken();
            }
        }

        const rawBody = await res.text();
        let parsedBody: unknown = null;
        let message = `API Error: ${res.status}`;

        if (rawBody) {
            try {
                parsedBody = JSON.parse(rawBody);
                if (parsedBody && typeof (parsedBody as Record<string, unknown>)['error'] === 'string') {
                    message = String((parsedBody as Record<string, unknown>)['error']);
                } else if (parsedBody && typeof (parsedBody as Record<string, unknown>)['detail'] === 'string') {
                    message = String((parsedBody as Record<string, unknown>)['detail']);
                }
            } catch {
                message = "An unexpected error occurred";
            }
        }

        const e = new Error(message) as Error & { body?: unknown; status?: number };
        e.body = parsedBody ?? rawBody;
        e.status = res.status;
        throw e;
    }

    if (res.status === 204 || res.headers.get('content-length') === '0') {
        return undefined as T;
    }

    return res.json();
}

// Helper methods
export const api = {
    get: <T>(endpoint: string, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'GET' }),

    post: <T, B = unknown>(endpoint: string, body: B, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

    put: <T, B = unknown>(endpoint: string, body: B, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

    patch: <T, B = unknown>(endpoint: string, body: B, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

    delete: <T>(endpoint: string, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
