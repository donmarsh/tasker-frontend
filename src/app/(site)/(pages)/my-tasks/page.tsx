"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    due_date?: string;
    assigned_to?: number;
    project_id?: number;
    project_name?: string;
    created_at: string;
    updated_at: string;
}

export default function MyTasksPage() {
    const { userId, isLoading: authLoading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        if (!authLoading && userId) {
            fetchMyTasks();
        } else if (!authLoading && !userId) {
            setIsLoading(false);
        }
    }, [userId, authLoading]);

    const fetchMyTasks = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await api.get<Task[]>(`/tasks?assigned_to=${userId}`);
            setTasks(data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch tasks");
            console.error("Error fetching tasks:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateTaskStatus = async (taskId: number, newStatus: string) => {
        try {
            await api.patch(`/tasks/${taskId}`, { status: newStatus });
            // Update local state
            setTasks(tasks.map(task => 
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
        } catch (err: any) {
            console.error("Error updating task status:", err);
            alert("Failed to update task status");
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === "all") return true;
        return task.status.toLowerCase() === filter.toLowerCase();
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "in_progress":
            case "in progress":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    const getPriorityColor = (priority?: string) => {
        if (!priority) return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        switch (priority.toLowerCase()) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "medium":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "No due date";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (authLoading || isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
                <div className="flex items-center justify-center p-8">
                    <p className="text-muted-foreground">Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">Please log in to view your tasks.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={fetchMyTasks}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const taskCounts = {
        all: tasks.length,
        pending: tasks.filter(t => t.status.toLowerCase() === "pending").length,
        in_progress: tasks.filter(t => t.status.toLowerCase() === "in_progress" || t.status.toLowerCase() === "in progress").length,
        completed: tasks.filter(t => t.status.toLowerCase() === "completed").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
                <Button onClick={fetchMyTasks} variant="outline">
                    Refresh
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-border">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 font-medium transition-colors ${
                        filter === "all"
                            ? "border-b-2 border-primary text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    All ({taskCounts.all})
                </button>
                <button
                    onClick={() => setFilter("pending")}
                    className={`px-4 py-2 font-medium transition-colors ${
                        filter === "pending"
                            ? "border-b-2 border-primary text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Pending ({taskCounts.pending})
                </button>
                <button
                    onClick={() => setFilter("in_progress")}
                    className={`px-4 py-2 font-medium transition-colors ${
                        filter === "in_progress"
                            ? "border-b-2 border-primary text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    In Progress ({taskCounts.in_progress})
                </button>
                <button
                    onClick={() => setFilter("completed")}
                    className={`px-4 py-2 font-medium transition-colors ${
                        filter === "completed"
                            ? "border-b-2 border-primary text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Completed ({taskCounts.completed})
                </button>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                            {filter === "all"
                                ? "No tasks assigned to you yet."
                                : `No ${filter.replace("_", " ")} tasks.`}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredTasks.map((task) => (
                        <Card key={task.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="mb-2">{task.title}</CardTitle>
                                        <div className="flex gap-2 flex-wrap">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    task.status
                                                )}`}
                                            >
                                                {task.status.replace("_", " ")}
                                            </span>
                                            {task.priority && (
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            )}
                                            {task.project_name && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                    {task.project_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Due: {formatDate(task.due_date)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {task.description && (
                                    <CardDescription className="mb-4">
                                        {task.description}
                                    </CardDescription>
                                )}
                                <div className="flex gap-2 flex-wrap">
                                    {task.status.toLowerCase() !== "completed" && (
                                        <>
                                            {task.status.toLowerCase() === "pending" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateTaskStatus(task.id, "in_progress")}
                                                >
                                                    Start Task
                                                </Button>
                                            )}
                                            {(task.status.toLowerCase() === "in_progress" || task.status.toLowerCase() === "in progress") && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateTaskStatus(task.id, "completed")}
                                                >
                                                    Mark Complete
                                                </Button>
                                            )}
                                        </>
                                    )}
                                    {task.status.toLowerCase() === "completed" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateTaskStatus(task.id, "in_progress")}
                                        >
                                            Reopen Task
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
