"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, CheckSquare, Users, Settings, FolderKanban, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { clearStoredToken } from "@/lib/auth";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, adminOnly: false, managerOnly: false },
    // Managers and admins can manage projects
    { name: "Manage Projects", href: "/projects", icon: FolderKanban, adminOnly: true, managerOnly: false },
    // Only admins can manage users
    { name: "Manage Users", href: "/users", icon: Users, adminOnly: true, managerOnly: false },
    // Managers and admins can manage tasks
    { name: "Manage Tasks", href: "/tasks", icon: Users, adminOnly: false, managerOnly: true },
    { name: "My Tasks", href: "/my-tasks", icon: CheckSquare, adminOnly: false, managerOnly: false },
    { name: "Settings", href: "/settings", icon: Settings, adminOnly: false, managerOnly: false },
];

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const pathname = usePathname();
    const { isAdmin, roles } = useAuth();
    const isManager = roles && (roles.includes("Manager") || roles.includes("manager"));
    const router = useRouter();
    const [settingsOpen, setSettingsOpen] = useState<boolean>(
        pathname === "/settings" || pathname === "/change-password" || !!pathname?.startsWith("/settings")
    );

    const handleSignOut = async () => {
        try {
            await api.post("/auth/logout/", {}).catch(() => {});
        } finally {
            clearStoredToken();
            router.push("/login");
            router.refresh();
        }
    };

    // Filter navigation based on user role
    const filteredNavigation = navigation.filter((item) => {
        // Admin-only routes
        if (item.adminOnly) return !!isAdmin;

        // Manager-only routes (managers or admins)
        if (item.managerOnly) return !!isManager || !!isAdmin;

        // Public routes
        return true;
    });

    return (
        <div className={cn("flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-accent", className)}>
            <div className="flex h-16 items-center px-6 border-b border-sidebar-accent">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        T
                    </div>
                    <span>Tasker</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3">
                <nav className="space-y-1">
                    {filteredNavigation.map((item) => {
                        const isActive = pathname === item.href;

                        // Render Settings as a toggle that expands a submenu for Change Password
                        if (item.name === "Settings") {
                            const parentActive = pathname === item.href || pathname === "/change-password" || pathname?.startsWith("/settings");
                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={() => setSettingsOpen((s) => !s)}
                                        className={cn(
                                            "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left",
                                            parentActive
                                                ? "bg-sidebar-accent text-sidebar-foreground"
                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5 shrink-0" />
                                        {item.name}
                                    </button>

                                    {settingsOpen && (
                                        <nav className="mt-1 ml-8 flex flex-col space-y-1">
                                            <Link
                                                href="/settings/change-password"
                                                className={cn(
                                                    "group flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
                                                    pathname === "/change-password"
                                                        ? "bg-sidebar-accent text-sidebar-foreground"
                                                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                                )}
                                            >
                                                <LogOut className="h-4 w-4 shrink-0" />
                                                Change password
                                            </Link>
                                        </nav>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-foreground"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-sidebar-accent">
                <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
