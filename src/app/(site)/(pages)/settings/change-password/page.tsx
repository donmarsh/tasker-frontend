"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match");
            return;
        }

        try {
            setIsLoading(true);
            await api.post("/auth/user/change-password/", {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            // on success redirect to settings page with a refresh
            router.push("/dashboard");
            router.refresh();
        } catch (err: unknown) {
            console.error("Change password failed", err);
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to change password";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to change password";
            })();
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Change Password</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Change your password</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="old">Current password</Label>
                                <Input id="old" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="new">New password</Label>
                                <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="confirm">Confirm new password</Label>
                                <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <div>
                                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Changing..." : "Change Password"}</Button>
                            </div>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
