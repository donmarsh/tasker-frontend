"use client";

import { useState, useEffect, useCallback } from "react";
import { clearStoredToken, decodeToken, getStoredToken, getUserRoles, TOKEN_STORAGE_KEY, TOKEN_CHANGE_EVENT } from "@/lib/auth";

interface UserInfo {
    authenticated: boolean;
    user_id?: number;
    email?: string;
    username?: string;
    full_name: string;
    role?: { id: number; role_name?: string; name?: string } | null;
}

export function useAuth() {
    const [roles, setRoles] = useState<string[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [full_name, setFullname] = useState<string | null>(null);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const resetState = useCallback(() => {
        setRoles([]);
        setUserId(null);
        setEmail(null);
        setUsername(null);
        setFullname(null);
        setIsAdmin(false);
        setIsManager(false);
        setIsAuthenticated(false);
    }, []);

    const syncFromToken = useCallback(() => {
        const token = getStoredToken();

        if (!token) {
            resetState();
            setIsLoading(false);
            return;
        }

        const decoded = decodeToken(token) as (UserInfo & { exp?: number }) | null;

        if (!decoded) {
            clearStoredToken();
            resetState();
            setIsLoading(false);
            return;
        }

        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            clearStoredToken();
            resetState();
            setIsLoading(false);
            return;
        }

        const derivedRoles = getUserRoles(token);
        setRoles(derivedRoles);
        setUserId(decoded.user_id || null);
        setEmail(decoded.email || null);
        const possibleUsername = decoded.username || (decoded as unknown as Record<string, unknown>).name || decoded.email;
        setUsername(typeof possibleUsername === "string" ? possibleUsername : null);
        setFullname(decoded.full_name || null);
        setIsAdmin(derivedRoles.includes('Admin') || derivedRoles.includes('admin'));
        setIsManager(derivedRoles.includes('Manager') || derivedRoles.includes('manager'));
        setIsAuthenticated(true);
        setIsLoading(false);
    }, [resetState]);

    useEffect(() => {
        Promise.resolve().then(() => {
            syncFromToken();
        });

        const handleStorage = (event: StorageEvent) => {
            if (event.key === TOKEN_STORAGE_KEY) {
                syncFromToken();
            }
        };

        const handleTokenChange = () => {
            syncFromToken();
        };

        if (typeof window !== "undefined") {
            window.addEventListener('storage', handleStorage);
            window.addEventListener(TOKEN_CHANGE_EVENT, handleTokenChange);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener('storage', handleStorage);
                window.removeEventListener(TOKEN_CHANGE_EVENT, handleTokenChange);
            }
        };
    }, [syncFromToken]);

    return { roles, userId, email, full_name, username, isAdmin, isManager, isLoading, isAuthenticated };
}
