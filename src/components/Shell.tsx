"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export function Shell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Check if the current path is an auth page
    const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].some(path => pathname?.startsWith(path));

    if (isAuthPage) {
        return <main className="min-h-screen bg-background">{children}</main>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
