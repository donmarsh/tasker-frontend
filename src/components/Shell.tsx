"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

export function Shell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        Promise.resolve().then(() => setIsMobileMenuOpen(false));
    }, [pathname]);

    // Check if the current path is an auth page
    const isAuthPage = ["/login", "/reset-password"].some(path => pathname?.startsWith(path)) || pathname === "/";

    useEffect(() => {
        if (!isAuthPage && !isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthPage, isLoading, isAuthenticated, router]);

    if (!isAuthPage && isLoading) {
        return <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading...</main>;
    }

    if (isAuthPage) {
        return <main className="min-h-screen bg-background">{children}</main>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden md:flex" />

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <Sidebar className="h-full w-full" />
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
