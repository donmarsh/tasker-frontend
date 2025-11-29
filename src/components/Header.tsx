import { Bell, Search, User } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="h-9 w-64 rounded-md border border-input bg-muted/50 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                </button>

                <div className="h-8 w-8 overflow-hidden rounded-full bg-secondary ring-2 ring-border">
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
