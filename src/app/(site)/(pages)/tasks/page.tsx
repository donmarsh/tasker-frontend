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
    const { isAdmin, isLoading: authLoading } = useAuth();
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
        } catch (err) {
            console.error("Failed to fetch admin data", err);
            const message = err instanceof Error ? err.message : String(err);
            setError(message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (taskId: number, patch: Partial<Task>) => {
        try {
            const updated = await api.patch<Task>(`/tasks/${taskId}/`, patch);
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update task");
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
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete task");
        }
    };

    const getStatusLabel = (statusId?: number) => {
        const statuses: Record<number, string> = {
            1: "Pending",
            2: "In Progress",
            3: "Completed",
        };
        return statusId ? statuses[statusId] || "Unknown" : "Unknown";
    };

    const getStatusColor = (statusId?: number) => {
        const colors: Record<number, string> = {
            1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            3: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        };
        return statusId ? colors[statusId] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800";
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
                status_id: 1, // default to 'pending' id
            };

            const created = await api.post<Task>(`/tasks`, payload);
            setTasks((prev) => [created, ...prev]);
            // reset form
            setNewTitle("");
            setNewDesc("");
            setNewProject(null);
            setNewAssignee(null);
            setNewDue("");
        } catch (err) {
            console.error("Create failed", err);
            alert("Failed to create task");
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

    if (!isAdmin) {
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

            {/* Tasks Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    {tasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No tasks found</div>
                    ) : (
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
                                    {tasks.map((task) => (
                                        <tr key={task.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 font-medium">{task.title}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{task.project?.name ?? "—"}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {task.assignee?.username ?? "Unassigned"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(task.status.id)}`}>
                                                    {getStatusLabel(task.status.id)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{task.created_at ? new Date(task.created_at).toLocaleDateString() : "—"}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => updateTask(task.id, { status_id: 3 })}
                                                        className="px-2 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm"
                                                        title="Mark complete"
                                                    >
                                                        Complete
                                                    </button>
                                                    <button
                                                        onClick={() => updateTask(task.id, { status_id: 1 })}
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
                                                        className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
