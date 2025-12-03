"use client";

import { useState, useEffect } from "react";

interface UserInfo {
    authenticated: boolean;
    user_id?: number;
    email?: string;
    roles?: string[];
}

export function useAuth() {
    const [roles, setRoles] = useState<string[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
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
                    const userRoles = data.roles || [];
                    setRoles(userRoles);
                    setUserId(data.user_id || null);
                    setEmail(data.email || null);
                    setIsAdmin(userRoles.includes('Admin') || userRoles.includes('admin'));
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

    return { roles, userId, email, isAdmin, isLoading, isAuthenticated };
}
