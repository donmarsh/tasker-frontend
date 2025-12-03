export interface DecodedToken {
    user_id: number;
    email: string;
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
    // Support either `roles` array or a single `role` object in the token
    if (Array.isArray(decoded.roles) && decoded.roles.length) return decoded.roles;
    if (decoded.role) {
        // role object may have `role_name` or `name`
        const rn = (decoded.role as any).role_name || (decoded.role as any).name || String((decoded.role as any).id);
        return [rn];
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
