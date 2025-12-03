"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface User {
    id: number;
    username?: string
    full_name?: string;
    email?: string;
    role?: { id: number; role_name: string } | null;
    created_at?: string;
}

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams() as { id?: string };
    const id = params?.id ? Number(params.id) : null;

    const { isAdmin, isLoading: authLoading } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // form
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // optional: set new password
    const [roles, setRoles] = useState<{ id: number; role_name: string }[]>([]);
    const [selectedRole, setSelectedRole] = useState<number | "">("");

    useEffect(() => {
        if (!id || authLoading) return;

        const load = async () => {
            try {
                setLoading(true);
                const [data, rolesData] = await Promise.all([
                    api.get<User>(`/auth/users/${id}/`),
                    api.get<{ id: number; role_name: string }[]>("/auth/roles/")
                ]);

                setUser(data || null);
                setRoles(rolesData || []);
                setName(data?.full_name || "");
                setUsername(data?.username || "");
                setEmail(data?.email || "");
                // pre-select role if user has a role object
                const firstRoleId = data?.role?.id ?? "";
                setSelectedRole(firstRoleId === "" ? "" : Number(firstRoleId));
            } catch (err) {
                console.error("Failed to load user", err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, authLoading]);

    if (!isAdmin && !authLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">You do not have permission to view this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const save = async () => {
        if (!id) return;
        try {
            setSaving(true);
            const payload: Record<string, unknown> = {
                name,
                full_name: name,
                email,
                username,
                // send role object (or null to clear)
                role_id: selectedRole ?  selectedRole  : null,
            };
            if (password) payload["password"] = password;

            // debug the outgoing payload in case backend isn't applying the change
            console.debug("PATCH /auth/users/ payload:", payload);

            await api.patch(`/auth/users/${id}/`, payload);
            router.push("/users");
        } catch (err) {
            console.error("Save failed", err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
                <div className="p-8 text-center text-muted-foreground">User not found.</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/users")}>Back</Button>
                </div>
            </div>

            {error && <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600">{error}</div>}

            <Card>
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <Label>Username</Label>
                            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                        </div>
                        <div>
                            <Label>New password</Label>
                            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Leave blank to keep current" />
                        </div>

                        <div>
                            <Label>Role</Label>
                            <select
                                value={selectedRole === "" ? "" : String(selectedRole)}
                                onChange={(e) => setSelectedRole(e.target.value ? Number(e.target.value) : "")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">No role</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={String(r.id)}>{r.role_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-3 flex items-end">
                            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
