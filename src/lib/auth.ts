export interface DecodedToken {
    user_id: number;
    email: string;
    // New token shape: single `role` object. Keep `roles` optional for backward compatibility.
    role?: { id: number; role_name?: string; name?: string } | null;
    username?:string;
    full_name?:string;
    exp: number;
    iat: number;
}

export const TOKEN_STORAGE_KEY = "tasker_access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "tasker_refresh_token";
export const TOKEN_CHANGE_EVENT = "tasker-auth-token-changed";

const emitTokenChange = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
};

export function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    emitTokenChange();
}

export function clearStoredToken() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    emitTokenChange();
}

export function getStoredRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setStoredRefreshToken(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    emitTokenChange();
}

export function clearStoredRefreshToken() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    emitTokenChange();
}

/**
 * Decode a JWT token (client-side)
 */
export function decodeToken(token: string): DecodedToken | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
}

/**
 * Get user roles from token (client-side)
 */
export function getUserRoles(token: string): string[] {
    const decoded = decodeToken(token);
    if (!decoded) return [];
    // If token contains a single `role` object, derive roles array from it
    if (decoded.role) {
        const r = decoded.role as { role_name?: string; name?: string; id?: number };
        const roleName = r.role_name || r.name || (r.id !== undefined ? String(r.id) : undefined);
        return roleName ? [roleName] : [];
    }
    // Fallback: if token has legacy `roles` array, return it
    const legacyRoles = (decoded as unknown as { roles?: string[] }).roles;
    if (Array.isArray(legacyRoles)) {
        return legacyRoles;
    }

    return [];
}

/**
 * Check if user is admin (client-side)
 */
export function isAdmin(token: string): boolean {
    const roles = getUserRoles(token);
    console.log("User roles:", roles);
    return roles.includes('Admin') || roles.includes('admin');
}

/**
 * Get token from cookies (client-side)
 */
export function getClientToken(): string | null {
    return getStoredToken();
}

/**
 * Get user roles from client-side cookies
 */
export function getClientUserRoles(): string[] {
    const token = getClientToken();
    if (!token) return [];
    return getUserRoles(token);
}

/**
 * Check if user is admin (client-side)
 */
export function isClientAdmin(): boolean {
    const roles = getClientUserRoles();
    return roles.includes('Admin') || roles.includes('admin');
}
