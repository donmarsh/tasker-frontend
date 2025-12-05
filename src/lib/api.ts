const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { headers, ...rest } = options;

    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        // Important: This ensures cookies are sent with the request
        credentials: 'include',
        ...rest,
    });

    if (!res.ok) {
        // Handle 401 Unauthorized globally if needed, though middleware catches most
        if (res.status === 401) {
            // Optional: Redirect to login or clear local state
            // window.location.href = '/login';
        }

        // Parse JSON body if possible. The backend returns a simple
        // `{ "error": "..." }` or `{ "detail": "..." }` structure on failure — prefer that.
        const errorBody = await res.json();
        console.log('API error body:', errorBody);
        let message = `API Error: ${res.status}`;

        if (errorBody && typeof errorBody['error'] === 'string') {
            message = String(errorBody['error']);
        } else if (errorBody && typeof errorBody['detail'] === 'string') {
            message = String(errorBody['detail']);
        }

        const e = new Error(message) as Error & { body?: unknown; status?: number };
        e.body = errorBody;
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
