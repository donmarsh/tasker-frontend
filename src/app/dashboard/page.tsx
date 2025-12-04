"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle2, Clock, FolderKanban, MoreVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface Project {
    id: number;
    name: string;
    description?: string;
    project_status: { id: number; name: string };
    created_at: string;
    modified_at?: string;
    deleted_at?: string | null;
}

interface Task {
    id: number;
    title: string;
    description?: string;
    status: { id: number; name: string };
    assignee?: { id: number | null; username?: string } | null;
    deadline?: string | null;
    project?: { id: number; name: string } | null;
    created_at: string;
    modified_at?: string;
    deleted_at?: string | null;
}

interface ProjectsSummary {
    total: number;
    active: number;
}

interface TasksSummary {
    total: number;
    todo: number;
    in_progress: number;
    completed: number;
}

export default function Dashboard() {
    const { isAdmin, isManager, userId, isLoading: authLoading } = useAuth();
    const [projectsSummary, setProjectsSummary] = useState<ProjectsSummary | null>(null);
    const [tasksSummary, setTasksSummary] = useState<TasksSummary | null>(null);
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (isAdmin) {
                // Fetch projects and tasks for admin
                const projects = await api.get<Project[]>('/projects');
                const tasks = await api.get<Task[]>('/tasks');
                console.log(tasks);
                // Compute summaries
                const activeProjects = projects.filter(p => !p.deleted_at && p.project_status.name.toLowerCase() !== 'completed').length;
                setProjectsSummary({ total: projects.length, active: activeProjects });

                const taskCounts = {
                    total: tasks.length,
                    todo: tasks.filter(t => t.status.name.toLowerCase() === 'todo').length,
                    in_progress: tasks.filter(t => t.status.name.toLowerCase() === 'in_progress' || t.status.name.toLowerCase() === 'in progress').length,
                    completed: tasks.filter(t => t.status.name.toLowerCase() === 'completed').length,
                };
                setTasksSummary(taskCounts);

                // Get recent tasks (last 4)
                const sortedTasks = tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setRecentTasks(sortedTasks.slice(0, 4));
            } else if (isManager) {
                // Fetch tasks for manager
                const tasks = await api.get<Task[]>('/tasks');

                const taskCounts = {
                    total: tasks.length,
                    todo: tasks.filter(t => t.status.name.toLowerCase() === 'todo').length,
                    in_progress: tasks.filter(t => t.status.name.toLowerCase() === 'in_progress' || t.status.name.toLowerCase() === 'in progress').length,
                    completed: tasks.filter(t => t.status.name.toLowerCase() === 'completed').length,
                };
                setTasksSummary(taskCounts);

                // Get recent tasks (last 4)
                const sortedTasks = tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setRecentTasks(sortedTasks.slice(0, 4));
            } else {
                // Fetch my tasks for user
                if (userId) {
                    const tasks = await api.get<Task[]>(`/tasks?assignee_id=${userId}`);
                    // Sort by created_at desc and take latest 5
                    const sortedTasks = tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setMyTasks(sortedTasks.slice(0, 5));
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message || "Failed to fetch data");
            console.error("Error fetching dashboard data:", err);
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, isManager, userId]);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    const getStatusColor = (statusName: string) => {
        switch (statusName.toLowerCase()) {
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


    if (authLoading || isLoading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                        <p className="text-muted-foreground">
                            Loading dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                        <p className="text-red-500 mb-4">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back! Here&apos;s an overview of your workspace.
                    </p>
                </div>
                {isAdmin && (
                    <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover shadow-sm">
                        <Plus className="h-4 w-4" />
                        New Project
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isAdmin && projectsSummary && (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{projectsSummary.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    {projectsSummary.active} active
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{projectsSummary.active}</div>
                                <p className="text-xs text-muted-foreground">
                                    In progress
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}
                {(isAdmin || isManager) && tasksSummary && (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tasksSummary.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    All tasks
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tasksSummary.todo + tasksSummary.in_progress}</div>
                                <p className="text-xs text-muted-foreground">
                                    Todo & In Progress
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tasksSummary.completed}</div>
                                <p className="text-xs text-muted-foreground">
                                    Finished
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Tasks Section */}
            {isAdmin || isManager ? (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentTasks.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        No recent tasks found.
                                    </div>
                                ) : (
                                    recentTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 w-full"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium leading-none">{task.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {task.project?.name || 'No project'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                        getStatusColor(task.status.name)
                                                    )}
                                                >
                                                    {task.status.name}
                                                </span>
                                                <button className="text-muted-foreground hover:text-foreground">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                   
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>My Latest Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {myTasks.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No tasks assigned to you yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium leading-none">{task.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {task.project?.name || 'No project'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    getStatusColor(task.status.name)
                                                )}
                                            >
                                                {task.status.name}
                                            </span>
                                            <button className="text-muted-foreground hover:text-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
