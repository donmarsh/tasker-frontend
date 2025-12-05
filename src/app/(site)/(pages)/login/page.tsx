"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { api } from "@/lib/api";
import { setStoredToken, clearStoredToken, setStoredRefreshToken } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const data = await api.post<Record<string, unknown>>("/auth/login/", { email, password });
            console.log("Login successful:", data);

            const result = (data && typeof data === "object") ? (data as Record<string, unknown>) : null;
            const tokens = result?.tokens && typeof result.tokens === "object" && result.tokens !== null
                ? (result.tokens as Record<string, unknown>)
                : null;

            const accessTokenCandidates = [
                result?.access_token,
                result?.access,
                tokens?.access,
                tokens?.access_token,
                result?.token,
                tokens?.token,
            ];

            const accessToken = accessTokenCandidates.find((candidate): candidate is string => typeof candidate === "string") ?? null;

            if (!accessToken) {
                throw new Error("Login response did not include an access token");
            }

            setStoredToken(accessToken);

            const refreshTokenCandidates = [
                result?.refresh_token,
                result?.refresh,
                tokens?.refresh,
                tokens?.refresh_token,
            ];

            const refreshToken = refreshTokenCandidates.find((candidate): candidate is string => typeof candidate === "string") ?? null;

            if (refreshToken) {
                setStoredRefreshToken(refreshToken);
            }
            router.push("/dashboard");
            router.refresh(); // Refresh to update middleware state
        } catch (err: unknown) {
            clearStoredToken();
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to login. Please check your credentials.";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to login. Please check your credentials.";
            })();
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">Sign in to Tasker</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <form ref={formRef} onSubmit={handleLogin}>
                    <CardContent className="grid gap-4">
                        {error && (
                            <div className="text-sm text-red-500 font-medium">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        formRef.current?.requestSubmit();
                                    }
                                }}
                            />
                        </div>
                        
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </CardContent>
                </form>
              
            </Card>
        </div>
    );
}
