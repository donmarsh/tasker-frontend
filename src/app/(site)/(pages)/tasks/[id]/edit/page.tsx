"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface Task {
    id: number;
    title: string;
    description?: string;
    status?: { id: number; name: string };
    deadline?: string;
    assignee?:{id: number; username: string } | null;
    project?: { id: number; name: string } | null;
    created_at?: string;
    modified_at?: string;
    deleted_at?: string | null;
}

interface User {
    id: number;
    name?: string;
    email?: string;
}

interface Project {
    id: number;
    name: string;
}

export default function EditTaskPage() {
    const router = useRouter();
    const params = useParams() as { id?: string };
    const id = params?.id ? Number(params.id) : null;

    const [task, setTask] = useState<Task | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [projectId, setProjectId] = useState<number | "">("");
    const [assigneeId, setAssigneeId] = useState<number | "">("");
    const [deadline, setDeadline] = useState<string>("");
    const [statusId, setStatusId] = useState<number>(1);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [taskData, usersData, projectsData] = await Promise.all([
                api.get<Task>(`/tasks/${id}/`),
                api.get<User[]>("/auth/users/"),
                api.get<Project[]>("/projects"),
            ]);

            setTask(taskData);
            setUsers(usersData || []);
            setProjects(projectsData || []);

            setTitle(taskData.title || "");
            setDescription(taskData.description || "");
            setProjectId(taskData.project?.id ?? "");
            setAssigneeId(taskData.assignee?.id ?? "");
            setDeadline(taskData.deadline ? taskData.deadline.split("T")[0] : "");
            setStatusId(taskData.status?.id ?? 1);
        } catch (err: unknown) {
            console.error("Failed to load task", err);
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to load task";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to load task";
            })();
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!id) return;
        fetchData();
    }, [id, fetchData]);

    const save = async () => {
        if (!id) return;
        try {
            setSaving(true);
            const payload: Record<string, unknown> = {
                title,
                description,
                project_id: projectId || null,
                assignee_id: assigneeId || null,
                deadline: deadline || null,
                status_id: statusId,
            };
            console.log("Saving task with payload:", payload);
            await api.patch(`/tasks/${id}/`, payload);
            router.push("/tasks");
        } catch (err: unknown) {
            console.error("Save failed", err);
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to save task";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to save task";
            })();
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Edit Task</h2>
                <div className="p-8 text-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Edit Task</h2>
                <div className="p-8 text-center">
                    <p className="text-muted-foreground">Task not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Edit Task</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Back</Button>
                </div>
            </div>

            {/* metadata */}
            <div className="flex gap-4 text-sm text-muted-foreground">
                <div>Project: <span className="text-foreground font-medium">{task.project?.name ?? "—"}</span></div>
                <div>Status: <span className="text-foreground font-medium">{task.status?.name ?? "-"}</span></div>
                {task.created_at && <div>Created: <span className="text-muted-foreground">{new Date(task.created_at).toLocaleString()}</span></div>}
                {task.modified_at && <div>Modified: <span className="text-muted-foreground">{new Date(task.modified_at).toLocaleString()}</span></div>}
            </div>

            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Task Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Title</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div>
                            <Label>Project</Label>
                            <select
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : "")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select project</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Assignee</Label>
                            <select
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : "")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Unassigned</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <Label>Description</Label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        </div>

                        <div>
                            <Label>Deadline</Label>
                            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                        </div>

                        <div>
                            <Label>Status</Label>
                            <select value={statusId} onChange={(e) => setStatusId(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value={1}>Todo</option>
                                <option value={2}>In Progress</option>
                                <option value={3}>Completed</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
