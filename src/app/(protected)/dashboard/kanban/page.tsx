"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Plus,
  Loader2,
  Trash2,
  Folder,
  Sparkles,
  CheckCircle2,
  Circle,
  HelpCircle,
  AlertCircle,
  Layers,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  featureRequestId: string;
  featureRequest: {
    title: string;
    prd?: {
      id: string;
    } | null;
  };
}

interface FeatureRequest {
  id: string;
  title: string;
  prd?: {
    id: string;
  } | null;
  tasks?: Task[];
}

const COLUMNS = [
  { id: "TODO", label: "To Do", bg: "bg-slate-500/5", border: "border-slate-500/15", text: "text-slate-500", icon: Circle },
  { id: "IN_PROGRESS", label: "In Progress", bg: "bg-blue-500/5", border: "border-blue-500/15", text: "text-blue-500", icon: Loader2 },
  { id: "IN_REVIEW", label: "In Review", bg: "bg-amber-500/5", border: "border-amber-500/15", text: "text-amber-500", icon: HelpCircle },
  { id: "DONE", label: "Done", bg: "bg-emerald-500/5", border: "border-emerald-500/15", text: "text-emerald-500", icon: CheckCircle2 },
] as const;

export default function GlobalKanbanPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Drag and Drop state
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState("");

  // Load Projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data || []);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load projects");
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks when selected project changes
  const fetchTasksForProject = async () => {
    if (!selectedProjectId) return;
    try {
      setIsLoadingTasks(true);
      const featuresRes = await fetch(`/api/projects/${selectedProjectId}/features-requests`);
      if (!featuresRes.ok) throw new Error("Failed to fetch tasks");
      const featuresData = await featuresRes.json();
      const loadedFeatures: FeatureRequest[] = featuresData.data || [];
      setFeatures(loadedFeatures);

      // Extract all tasks
      const allTasks: Task[] = [];
      loadedFeatures.forEach((feature) => {
        if (feature.tasks) {
          feature.tasks.forEach((task) => {
            allTasks.push({
              ...task,
              featureRequest: {
                title: feature.title,
                prd: feature.prd
              }
            });
          });
        }
      });
      setTasks(allTasks);

      // Select first feature by default if available
      const featuresWithPrd = loadedFeatures.filter(f => f.prd);
      if (featuresWithPrd.length > 0) {
        setSelectedFeatureId(featuresWithPrd[0].id);
      } else {
        setSelectedFeatureId("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load Kanban board data");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasksForProject();
  }, [selectedProjectId]);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDraggedOverCol(colId);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === newStatus) return;

    await handleMoveTask(task, newStatus);
  };

  const handleMoveTask = async (task: Task, newStatus: Task["status"]) => {
    const prdId = task.featureRequest.prd?.id;
    if (!prdId) {
      toast.error("Associated PRD not found. Tasks can only be updated for approved PRDs.");
      return;
    }

    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

      const res = await fetch(`/api/prds/${prdId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update task status");
      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
    } catch (err) {
      console.error(err);
      toast.error("Error moving task");
      fetchTasksForProject();
    }
  };

  const handleDeleteTask = async (task: Task) => {
    const prdId = task.featureRequest.prd?.id;
    if (!prdId) return;

    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      setTasks(prev => prev.filter(t => t.id !== task.id));
      const res = await fetch(`/api/prds/${prdId}/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      toast.success("Task deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting task");
      fetchTasksForProject();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedFeatureId) return;

    const featureObj = features.find(f => f.id === selectedFeatureId);
    const prdId = featureObj?.prd?.id;
    
    if (!prdId) {
      toast.error("Please select a feature request that has an approved PRD.");
      return;
    }

    try {
      setIsSubmittingTask(true);
      const res = await fetch(`/api/prds/${prdId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc || undefined,
          status: "TODO",
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");
      toast.success("Task added to Kanban Board!");
      setTaskTitle("");
      setTaskDesc("");
      setIsTaskModalOpen(false);
      fetchTasksForProject();
    } catch (err) {
      console.error(err);
      toast.error("Error creating task");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const featuresWithPrds = features.filter(f => f.prd);

  if (isLoadingProjects) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background">
        <Loader2 className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
      {/* Header and Project Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-accent/10 pb-6">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Kanban Planning</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
            <LayoutGrid className="size-7 text-primary" />
            Global Tasks Kanban
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor and manage development tasks across all active features.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {projects.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label htmlFor="global-project-select" className="text-xs text-muted-foreground shrink-0 uppercase font-semibold">Project:</Label>
              <Select value={selectedProjectId} onValueChange={(val) => setSelectedProjectId(val ?? "")}>
                <SelectTrigger id="global-project-select" className="w-[200px] bg-card border-accent/20">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {featuresWithPrds.length > 0 && (
            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
              <DialogTrigger render={
                <Button className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20 w-full sm:w-auto">
                  <Plus className="size-4" />
                  Add Task
                </Button>
              } />
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Create Project Task</DialogTitle>
                  <DialogDescription>
                    Add a new actionable item under a feature's requirements.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-feature">Target Feature (Approved PRD)</Label>
                    <Select value={selectedFeatureId} onValueChange={(val) => setSelectedFeatureId(val ?? "")}>
                      <SelectTrigger id="task-feature">
                        <SelectValue placeholder="Select Feature Request" />
                      </SelectTrigger>
                      <SelectContent>
                        {featuresWithPrds.map(f => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Set up API endpoints"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-desc">Description</Label>
                    <Textarea
                      id="task-desc"
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      placeholder="Provide details or constraints for this task..."
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmittingTask}>
                      {isSubmittingTask ? "Adding..." : "Add Task"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Main Kanban Content */}
      {projects.length === 0 ? (
        <Card className="border-dashed border-accent/40 bg-card/10 text-center py-20 px-6 max-w-2xl mx-auto">
          <CardHeader className="flex flex-col items-center">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
              <Folder className="size-10" />
            </div>
            <CardTitle className="text-xl font-bold">No Projects Found</CardTitle>
            <CardDescription className="max-w-md mt-2">
              Create a project workspace first in order to generate requirements and tasks.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : isLoadingTasks ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="size-10 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading board tasks...</p>
        </div>
      ) : featuresWithPrds.length === 0 ? (
        <Card className="border-dashed border-accent/40 bg-card/10 max-w-2xl mx-auto text-center py-20 px-6">
          <CardHeader className="flex flex-col items-center">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
              <ClipboardList className="size-10" />
            </div>
            <CardTitle className="text-xl font-bold">No Approved PRDs</CardTitle>
            <CardDescription className="max-w-md mt-2">
              Tasks can only be generated or created for feature requests that have an approved PRD. Please create and save a PRD for this project.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <Button >
              <Link href={`/dashboard/projects/${selectedProjectId}`}>
                Go to Feature Requests
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Kanban Board Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter(t => t.status === col.id);
            const ColumnIcon = col.icon;

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`rounded-xl border transition-all duration-200 ${
                  draggedOverCol === col.id
                    ? "border-dashed border-primary bg-primary/10 scale-[1.01]"
                    : `${col.border} ${col.bg}`
                } p-4 flex flex-col min-h-[550px] max-h-[800px] overflow-y-auto space-y-4`}
              >
                {/* Column Title Header */}
                <div className="flex justify-between items-center pb-2 border-b border-accent/10">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ColumnIcon className={`size-4 ${col.text} ${col.id === "IN_PROGRESS" ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
                    <span>{col.label}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-12 italic">
                      No tasks in this column
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        className="border-accent/10 bg-card hover:border-primary/20 shadow-xs relative group/card transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md"
                      >
                        <CardHeader className="p-3 pb-1 space-y-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground w-fit truncate max-w-full">
                            {task.featureRequest.title}
                          </Badge>
                          <CardTitle className="text-sm font-bold leading-snug">
                            {task.title}
                          </CardTitle>
                        </CardHeader>
                        {task.description && (
                          <CardContent className="p-3 pt-0 text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </CardContent>
                        )}
                        <CardFooter className="p-2 pt-0 border-t border-accent/5 mt-2 flex justify-between items-center">
                          {/* Task Action Buttons */}
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteTask(task)}
                              title="Delete Task"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>

                          {/* Quick Shift Status Controls */}
                          <div className="flex items-center gap-1">
                            {COLUMNS.map((c) => {
                              if (c.id === task.status) return null;
                              const TargetIcon = c.icon;
                              return (
                                <Button
                                  key={c.id}
                                  variant="ghost"
                                  size="icon"
                                  className="size-6 hover:bg-accent"
                                  onClick={() => handleMoveTask(task, c.id)}
                                  title={`Move to ${c.label}`}
                                >
                                  <TargetIcon className={`size-3 ${c.text}`} />
                                </Button>
                              );
                            })}
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
