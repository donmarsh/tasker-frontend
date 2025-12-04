"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface User {
    id: number;
    username?: string;
    full_name?: string;
    email?: string;
    role?: { id: number; role_name: string } | null;
    created_at?: string;
}

export default function UsersPage() {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) fetchUsers();
    }, [authLoading]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.get<User[]>("/auth/users/");
            console.log("Fetched users:", data);
            setUsers(data || []);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/users/${id}/edit`);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this user?")) return;
        try {
            await api.delete(`/auth/users/${id}/`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error("Failed to delete user", err);
            alert("Failed to delete user");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                <div className="p-8 text-center text-muted-foreground">Loading users...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">You do not have permission to view this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">Manage user accounts</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push('/users/create')} className="flex items-center">New User</Button>
                    <Button variant="outline" onClick={fetchUsers}>Refresh</Button>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No users found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Email</th>
                                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Role</th>
                                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Created</th>
                                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 font-medium">{u.username ?? `User ${u.id}`}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{u.email}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{u.role?.role_name ?? "—"}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(u.id)} className="px-3 py-1 rounded-md bg-primary/5 hover:bg-primary/10 text-sm">Edit</button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="px-3 py-1 rounded-md bg-red hover:bg-red-100 text-sm text-white-700 dark:bg-red-600 dark:text-red dark:hover:bg-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
