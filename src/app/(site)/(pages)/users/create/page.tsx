"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function CreateUserPage() {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();

    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [telephone, setTelephone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roles, setRoles] = useState<{ id: number; role_name: string }[]>([]);
    const [selectedRole, setSelectedRole] = useState<number | "">("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!authLoading) {
            api.get<{ id: number; role_name: string }[]>("/auth/roles/")
                .then((r) => setRoles(r || []))
                .catch(() => setRoles([]));
        }
    }, [authLoading]);

    if (!isAdmin && !authLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Create User</h2>
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">You do not have permission to view this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const create = async () => {
        if (!username || !fullName || !email || !password || !telephone) {
            alert("Username, full name, email, password and telephone are required");
            return;
        }

        try {
            setSaving(true);
            const payload: Record<string, unknown> = {
                username,
                email,
                full_name: fullName,
                telephone,
                password,
            };
            // also include legacy `name` for compatibility
            payload["name"] = fullName;
            // include selected role as nested object if chosen
            if (selectedRole) payload.role = { id: selectedRole };
            await api.post("/auth/register/", payload);
            router.push("/users");
        } catch (err) {
            console.error("Create user failed", err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Create User</h2>
            </div>

            {error && <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600">{error}</div>}

            <Card>
                <CardHeader>
                    <CardTitle>New User</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Username</Label>
                            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div>
                            <Label>Full name</Label>
                            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div>
                            <Label>Telephone</Label>
                            <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <select
                                value={selectedRole === "" ? "" : String(selectedRole)}
                                onChange={(e) => setSelectedRole(e.target.value ? Number(e.target.value) : "")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select role</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.role_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Password</Label>
                            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
                        </div>

                        <div className="md:col-span-3 flex items-end">
                            <Button onClick={create} disabled={saving}>{saving ? "Creating..." : "Create User"}</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
