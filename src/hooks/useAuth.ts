"use client";

import { useState, useEffect } from "react";

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

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include', // Important: include cookies
            });

            if (response.ok) {
                const data: UserInfo = await response.json();

                if (data.authenticated) {
                    // derive roles array from `role` object, or fall back to legacy `roles`
                    const derivedRoles = data.role ? [data.role.role_name || data.role.name || String(data.role.id)] : (data.role || []);
                    setRoles(derivedRoles);
                    setUserId(data.user_id || null);
                    setEmail(data.email || null);
                    // prefer explicit username/name if available, otherwise fall back to email
                    const possibleUsername = (data as unknown as Record<string, unknown>).username || (data as unknown as Record<string, unknown>).name || data.email;
                    setFullname(data.full_name || null);
                    setUsername(typeof possibleUsername === "string" ? possibleUsername : null);
                    setIsAdmin(derivedRoles.includes('Admin') || derivedRoles.includes('admin'));
                    setIsManager(derivedRoles.includes('Manager') || derivedRoles.includes('manager'));
                    setIsAuthenticated(true);
                    console.log("User info:", data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { roles, userId, email, full_name, username, isAdmin, isManager, isLoading, isAuthenticated };
}
