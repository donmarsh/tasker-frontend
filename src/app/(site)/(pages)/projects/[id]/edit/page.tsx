"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { api } from "@/lib/api";

interface Project {
    id: number;
    name: string;
    description: string;
    project_start_date?: string;
    project_end_date?: string;
    project_status: {
        id: number;
        name: string;
    };
}

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [projectStartDate, setProjectStartDate] = useState("");
    const [projectEndDate, setProjectEndDate] = useState("");
    const [projectStatusId, setProjectStatusId] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState("");

    const fetchProject = useCallback(async () => {
        try {
            setIsFetching(true);
            const project = await api.get<Project>(`/projects/${projectId}/`);
            setName(project.name);
            setDescription(project.description || "");

            // Convert ISO date to YYYY-MM-DD format for date input
            if (project.project_start_date) {
                setProjectStartDate(project.project_start_date.split('T')[0]);
            }
            if (project.project_end_date) {
                setProjectEndDate(project.project_end_date.split('T')[0]);
            }
            setProjectStatusId(project.project_status.id.toString());
        } catch (err: unknown) {
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to fetch project";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to fetch project";
            })();
            setError(message);
        } finally {
            setIsFetching(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProject();
    }, [projectId, fetchProject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Format dates to ISO format with time
            const startDate = projectStartDate ? new Date(projectStartDate).toISOString() : null;
            const endDate = projectEndDate ? new Date(projectEndDate).toISOString() : null;

            const projectData = {
                name,
                description,
                project_start_date: startDate,
                project_end_date: endDate,
                project_status_id: parseInt(projectStatusId),
            };

            await api.put(`/projects/${projectId}/`, projectData);
            router.push("/projects");
        } catch (err: unknown) {
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to update project";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to update project";
            })();
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Loading project...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-9 w-9"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Project</h2>
                    <p className="text-muted-foreground">
                        Update your project details
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>
                        Modify the information for this project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Project Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter project name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                placeholder="Enter project description (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={projectStartDate}
                                    onChange={(e) => setProjectStartDate(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={projectEndDate}
                                    onChange={(e) => setProjectEndDate(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">
                                Project Status <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="status"
                                value={projectStatusId}
                                onChange={(e) => setProjectStatusId(e.target.value)}
                                disabled={isLoading}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="1">Planning</option>
                                <option value="2">In Progress</option>
                                <option value="3">On Hold</option>
                                <option value="4">Completed</option>
                                <option value="5">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
