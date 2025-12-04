import { useState } from "react";
import { useRouter } from "next/navigation";
import {  User, Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { api } from "@/lib/api";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { username, email } = useAuth();
    console.log(username);
    const handleLogout = async () => {
        try {
            // Attempt to call backend logout if it exists
            await api.post("/auth/logout/", {}).catch(() => {
                // Ignore error if endpoint doesn't exist or fails, just clear client state
            });
        } finally {
            // Try to clear any client-side cookies (though httpOnly cookies can only be cleared by backend)
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";


            // Redirect to login
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground md:hidden hover:bg-muted hover:text-foreground"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </button>
                
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* show username on md+ */}
                <div className="hidden md:block text-sm text-muted-foreground mr-2">
                    {username ?? email ?? ""}
                </div>
                <ThemeToggle />

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="h-8 w-8 overflow-hidden rounded-full bg-secondary ring-2 ring-border focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <User className="h-5 w-5" />
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border border-border bg-popover p-1 shadow-md z-40 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-2 py-1.5 text-sm font-semibold text-foreground">
                                    My Account
                                </div>
                                <div className="h-px bg-border my-1" />
                                <button
                                    onClick={() => router.push("/settings")}
                                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-red-500 hover:text-red-600"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
