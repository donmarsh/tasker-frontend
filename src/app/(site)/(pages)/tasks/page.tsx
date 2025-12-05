"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface Task {
    id: number;
    title: string;
    description?: string;
    status: {
        id: number;
        name: string;
    }
    deadline?: string;
    assignee?: { id: number | null ,
        username?: string,
    };
    project?:{
        id: number; 
        name: string;
    } ;
    created_at?: string;
    updated_at?: string;
}

interface User {
    id: number;
    email?: string;
    name?: string;
}

interface Project {
    id: number;
    name: string;
}

export default function TasksPage() {
    const { isAdmin, isManager, isLoading: authLoading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // new task form
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newProject, setNewProject] = useState<number | null>(null);
    const [newAssignee, setNewAssignee] = useState<number | null>(null);
    const [newDue, setNewDue] = useState<string>("");

    // filters for the tasks table
    const [filterAssignee, setFilterAssignee] = useState<number | "all">("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    

    useEffect(() => {
        if (!authLoading) {
            fetchAllData();
        }
    }, [authLoading]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [tasksData, usersData, projectsData] = await Promise.all([
                api.get<Task[]>("/tasks/"),
                api.get<User[]>("/auth/users/"),
                api.get<Project[]>("/projects"),
            ]);

            setTasks(tasksData || []);
            setUsers(usersData || []);
            setProjects(projectsData || []);
        } catch (err: unknown) {
            console.error("Failed to fetch admin data", err);
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to load data";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to load data";
            })();
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (taskId: number, patch: Partial<Task>) => {
        try {
            const updated = await api.patch<Task>(`/tasks/${taskId}/`, {status_id:patch.status?.id});
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        } catch (err: unknown) {
            console.error("Update failed", err);
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to update task";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to update task";
            })();
            alert(message);
        }
    };

    const router = useRouter();

    const handleEdit = (id: number) => {
        router.push(`/tasks/${id}/edit`);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (err: unknown) {
            console.error("Delete failed", err);
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to delete task";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to delete task";
            })();
            alert(message);
        }
    };

    const getStatusLabel = (value?: number | string) => {
        if (typeof value === "number") {
            const statuses: Record<number, string> = {
                1: "Todo",
                2: "In Progress",
                3: "Completed",
            };
            return statuses[value] || "Unknown";
        }

        if (typeof value === "string") {
            const n = value.replace(/_/g, " ").toLowerCase();
            if (n === "todo") return "Todo";
            if (n === "in progress") return "In Progress";
            if (n === "completed") return "Completed";
            return value;
        }

        return "Unknown";
    };

    const getStatusColor = (value?: number | string) => {
        const normalize = (v?: number | string) => {
            if (typeof v === "number") {
                if (v === 1) return "todo";
                if (v === 2) return "in progress";
                if (v === 3) return "completed";
                return "unknown";
            }
            if (typeof v === "string") return v.replace(/ /g, "_").toLowerCase();
            return "unknown";
        };

        const n = normalize(value);
        switch (n) {
            case "completed":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "in progress":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "todo":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const createTask = async () => {
        if (!newTitle || !newProject) {
            alert("Title and project are required");
            return;
        }

        try {
                const payload = {
                title: newTitle,
                description: newDesc,
                project_id: newProject,
                assignee_id: newAssignee,
                deadline: newDue || null,
                    status_id: 1, // default to 'todo' id
            };

            const created = await api.post<Task>(`/tasks/`, payload);
            setTasks((prev) => [created, ...prev]);
            // reset form
            setNewTitle("");
            setNewDesc("");
            setNewProject(null);
            setNewAssignee(null);
            setNewDue("");
        } catch (err: unknown) {
            console.error("Create failed", err);
            const message = ((): string => {
                if (err instanceof Error) {
                    const e = err as Error & { body?: unknown };
                    if (e.body && typeof e.body === "object" && "error" in (e.body as Record<string, unknown>)) {
                        return String((e.body as Record<string, unknown>).error);
                    }
                    return err.message || "Failed to create task";
                }
                if (typeof err === "object" && err !== null) {
                    const o = err as Record<string, unknown>;
                    if (o.error) return String(o.error);
                    if (o.message) return String(o.message);
                }
                if (typeof err === "string") return err;
                return "Failed to create task";
            })();
            alert(message);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Admin: All Tasks</h2>
                <div className="p-8 text-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin && !isManager) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Admin: All Tasks</h2>
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
                <h2 className="text-3xl font-bold tracking-tight">Admin: All Tasks</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAllData}>Refresh</Button>
                </div>
            </div>

            {error && (
                <Card>
                    <CardContent className="p-4">
                        <p className="text-red-500">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Create Task Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Task</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Title</Label>
                            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                        </div>
                        <div>
                            <Label>Project</Label>
                            <select
                                value={newProject ?? ""}
                                onChange={(e) => setNewProject(e.target.value ? Number(e.target.value) : null)}
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
                                value={newAssignee ?? ""}
                                onChange={(e) => setNewAssignee(e.target.value ? Number(e.target.value) : null)}
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
                            <input
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <Label>Due date</Label>
                            <Input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={createTask}>Create Task</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters for Tasks Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <Label>Assignee</Label>
                            <select
                                value={filterAssignee}
                                onChange={(e) => setFilterAssignee(e.target.value === "all" ? "all" : Number(e.target.value))}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">All</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">All</option>
                                <option value="todo">Todo</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div className="flex gap-2 md:justify-start">
                            <Button variant="outline" onClick={() => { setFilterAssignee("all"); setFilterStatus("all"); }}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    {(() => {
                        // apply filters
                        const filtered = tasks.filter((task) => {
                            // assignee filter
                            if (filterAssignee !== "all") {
                                if (!task.assignee || task.assignee.id !== Number(filterAssignee)) return false;
                            }

                            // status filter
                            if (filterStatus !== "all") {
                                const statusKey = ((): string => {
                                    if (typeof task.status.name === "string") return task.status.name.replace(/ /g, "_").toLowerCase();
                                    if (typeof task.status.id === "number") {
                                        if (task.status.id === 1) return "todo";
                                        if (task.status.id === 2) return "in_progress";
                                        if (task.status.id === 3) return "completed";
                                    }
                                    return String(task.status.name || task.status.id).toLowerCase();
                                })();
                                if (statusKey !== filterStatus) return false;
                            }

                            return true;
                        });

                        if (filtered.length === 0) {
                            return <div className="text-center py-8 text-muted-foreground">No tasks found</div>;
                        }

                        return (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Title</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Project</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Assignee</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Deadline</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Created</th>
                                            <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((task) => (
                                            <tr key={task.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{task.title}</td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">{task.project?.name ?? "—"}</td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {task.assignee?.username ?? "Unassigned"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(task.status.id)}`}>
                                                        {getStatusLabel(task.status.name ?? task.status.id)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}</td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">{task.created_at ? new Date(task.created_at).toLocaleDateString() : "—"}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => updateTask(task.id, { status: { id: 3, name: "Completed" } })}
                                                            className="px-2 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm"
                                                            title="Mark complete"
                                                        >
                                                            Complete
                                                        </button>
                                                        <button
                                                            onClick={() => updateTask(task.id, { status: { id: 1, name: "Todo" } })}
                                                            className="px-2 py-1 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                                                            title="Reset status"
                                                        >
                                                            Reset
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(task.id)}
                                                            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                            title="Edit task"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(task.id)}
                                                            className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                                                            title="Delete task"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </CardContent>
            </Card>
        </div>
    );
}
