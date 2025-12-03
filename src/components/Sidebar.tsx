"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Users, Settings, FolderKanban, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, adminOnly: false },
    { name: "Manage Projects", href: "/projects", icon: FolderKanban, adminOnly: true },
    { name: "Manage Users", href: "/users", icon: Users, adminOnly: true },
    { name: "Manage Tasks", href: "/tasks", icon: Users, adminOnly: true },
    { name: "My Tasks", href: "/mytasks", icon: CheckSquare, adminOnly: false },
    { name: "Settings", href: "/settings", icon: Settings, adminOnly: false },
];

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const pathname = usePathname();
    const { isAdmin, isLoading } = useAuth();

    // Filter navigation based on user role
    const filteredNavigation = navigation.filter(item => {
        if (item.adminOnly) {
            return isAdmin;
        }
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
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
