export interface DecodedToken {
    user_id: number;
    email: string;
    // New token shape: single `role` object. Keep `roles` optional for backward compatibility.
    role?: { id: number; role_name?: string; name?: string } | null;
    roles?: string[];
    exp: number;
    iat: number;
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
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));

    if (tokenCookie) {
        return tokenCookie.split('=')[1];
    }

    return null;
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
