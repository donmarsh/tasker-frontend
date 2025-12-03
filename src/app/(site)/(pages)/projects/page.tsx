"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { api } from "@/lib/api";

interface Project {
    id: number;
    name: string;
    description: string;
    project_status: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            const data = await api.get<Project[]>("/projects/");
            setProjects(data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch projects");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = () => {
        router.push("/projects/create");
    };

    const handleEditProject = (id: number) => {
        router.push(`/projects/${id}/edit`);
    };

    const handleDeleteProject = async (id: number) => {
        if (!confirm("Are you sure you want to delete this project?")) {
            return;
        }

        try {
            await api.delete(`/projects/${id}/`);
            setProjects(projects.filter(p => p.id !== id));
        } catch (err: any) {
            alert(err.message || "Failed to delete project");
        }
    };

    const getStatusLabel = (statusId: number) => {
        const statuses: Record<number, string> = {
            1: "Planning",
            2: "In Progress",
            3: "On Hold",
            4: "Completed",
            5: "Cancelled",
        };
        return statuses[statusId] || "Unknown";
    };

    const getStatusColor = (statusId: number) => {
        const colors: Record<number, string> = {
            1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            2: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            3: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            4: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            5: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
        return colors[statusId] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">
                        Manage all your projects in one place
                    </p>
                </div>
                <Button onClick={handleCreateProject} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                </Button>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading projects...
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">No projects yet</p>
                            <Button onClick={handleCreateProject} variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Create your first project
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                                            Name
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                                            Description
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                                            Created
                                        </th>
                                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="border-b border-border hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-medium">
                                                {project.name}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {project.description || "No description"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.project_status.id)}`}>
                                                    {getStatusLabel(project.project_status.id)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditProject(project.id)}
                                                        className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                        title="Edit project"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(project.id)}
                                                        className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                        title="Delete project"
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
