const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

        const error = await res.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `API Error: ${res.status}`);
    }

    return res.json();
}

// Helper methods
export const api = {
    get: <T>(endpoint: string, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body: any, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

    put: <T>(endpoint: string, body: any, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

    patch: <T>(endpoint: string, body: any, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

    delete: <T>(endpoint: string, options?: FetchOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
