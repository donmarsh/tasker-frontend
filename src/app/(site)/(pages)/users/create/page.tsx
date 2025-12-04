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
        } catch (err: unknown) {
            console.error("Create user failed", err);

            let message = "Failed to create user";

            if (err instanceof Error) {
                // Prefer structured body attached by `apiFetch` when available
                const eWithBody = err as Error & { body?: unknown };
                if (eWithBody.body && typeof eWithBody.body === "object") {
                    const body = eWithBody.body as Record<string, unknown>;
                    if (body.error) message = String(body.error);
                    else if (body.message) message = String(body.message);
                    else {
                        const vals = Object.values(body);
                        if (vals.length > 0) {
                            const first = vals[0];
                            if (Array.isArray(first)) message = String(first.join(", "));
                            else if (typeof first === "string") message = first;
                            else message = JSON.stringify(body);
                        }
                    }
                } else {
                    message = err.message || message;

                    // Sometimes the thrown message may contain a JSON string — try to parse it.
                    try {
                        const parsed = JSON.parse(message);
                        if (parsed && typeof parsed === "object") {
                            const p = parsed as Record<string, unknown>;
                            if (p.error) message = String(p.error);
                            else if (p.message) message = String(p.message);
                            else {
                                const vals = Object.values(p);
                                if (vals.length > 0) {
                                    const first = vals[0];
                                    if (Array.isArray(first)) message = String(first.join(", "));
                                    else message = String(first);
                                }
                            }
                        }
                    } catch {
                        // not JSON — keep original message
                    }
                }
            } else if (typeof err === "object" && err !== null) {
                try {
                    const asObj = err as Record<string, unknown>;
                    if (asObj.error) message = String(asObj.error);
                    else if (asObj.message) message = String(asObj.message);
                } catch {
                    // ignore
                }
            } else if (typeof err === "string") {
                message = err;
            }

            setError(message);
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
