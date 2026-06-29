"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutGrid,
  Plus,
  Loader2,
  Trash2,
  MoveRight,
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
import { BackgroundGrid } from "@/components/ui/background-grid";

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
  { id: "TODO", label: "To Do", bg: "bg-white/[0.02]", border: "border-white/5", text: "text-muted-foreground", icon: Circle },
  { id: "IN_PROGRESS", label: "In Progress", bg: "bg-primary/5", border: "border-primary/20", text: "text-primary", icon: Loader2 },
  { id: "IN_REVIEW", label: "In Review", bg: "bg-orange-500/5", border: "border-orange-500/20", text: "text-orange-500", icon: HelpCircle },
  { id: "DONE", label: "Done", bg: "bg-green-500/5", border: "border-green-500/20", text: "text-green-500", icon: CheckCircle2 },
] as const;

export default function KanbanPage() {
  const { projectId } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState("");

  // Drag and Drop state
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch project
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (!projectRes.ok) throw new Error("Failed to fetch project");
      const projectData = await projectRes.json();
      setProject(projectData.data);

      // Fetch features with their tasks
      const featuresRes = await fetch(`/api/projects/${projectId}/features-requests`);
      if (!featuresRes.ok) throw new Error("Failed to fetch features and tasks");
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
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load Kanban board data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  // Handle Move Task (update status in DB)
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
      // Revert state on error
      fetchData();
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (task: Task) => {
    const prdId = task.featureRequest.prd?.id;
    if (!prdId) return;

    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== task.id));

      const res = await fetch(`/api/prds/${prdId}/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");
      toast.success("Task deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting task");
      fetchData();
    }
  };

  // Handle Create Task
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
      
      const created = await res.json();
      
      toast.success("Task added to Kanban Board!");
      setTaskTitle("");
      setTaskDesc("");
      setIsTaskModalOpen(false);
      
      // Refresh board
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Error creating task");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background">
        <Loader2 className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 p-10 text-center space-y-6">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Button >
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Filter features that have PRD (only they can have tasks created)
  const featuresWithPrds = features.filter(f => f.prd);

  return (
    <div className="relative flex-1 p-6 md:p-10 space-y-8 bg-background min-h-screen">
      <BackgroundGrid className="fixed inset-0 pointer-events-none opacity-40" />

      {/* Back Button */}
      <Button variant="ghost"  className="gap-2 -ml-2 text-muted-foreground hover:text-foreground font-mono uppercase tracking-wider text-xs">
        <Link href={`/dashboard/projects/${projectId}`}>
          <ArrowLeft className="size-3.5" />
          Back to Project details
        </Link>
      </Button>

      {/* Kanban Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider font-mono">Project Workspace</span>
          <h1 className="text-2xl font-light uppercase tracking-widest font-mono text-white flex items-center gap-2 mt-1 text-glow">
            <LayoutGrid className="size-5 text-primary animate-pulse" />
            {project.name} Kanban
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-1">
            Track and manage technical tasks generated under each feature's PRD specifications.
          </p>
        </div>

        {/* Create Task Button */}
        {featuresWithPrds.length > 0 && (
          <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
            <DialogTrigger render={
              <Button className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-mono uppercase tracking-wider text-xs glow-amber">
                <Plus className="size-4" />
                Add Task
              </Button>
            } />
            <DialogContent className="sm:max-w-[450px] bg-card/95 border-white/5 backdrop-blur-md rounded-none font-mono text-xs">
              <DialogHeader>
                <DialogTitle className="uppercase tracking-wider text-white">Create Project Task</DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Add a new actionable item under a feature's requirements.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task-feature" className="uppercase tracking-wider">Target Feature Request</Label>
                  <Select value={selectedFeatureId} onValueChange={(val) => setSelectedFeatureId(val ?? "")} required>
                    <SelectTrigger id="task-feature" className="bg-card/35 border-white/5 rounded-full px-4 text-xs uppercase tracking-wider text-muted-foreground">
                      <SelectValue placeholder="Select Feature Request" />
                    </SelectTrigger>
                    <SelectContent className="bg-card/90 border-white/5 backdrop-blur-md">
                      {featuresWithPrds.map(f => (
                        <SelectItem key={f.id} value={f.id} className="text-xs uppercase tracking-wider font-mono">
                          {f.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-title" className="uppercase tracking-wider">Task Title</Label>
                  <Input
                    id="task-title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Set up API endpoints"
                    required
                    className="bg-card/35 border-white/5 text-white rounded-full px-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-desc" className="uppercase tracking-wider">Description</Label>
                  <Textarea
                    id="task-desc"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Provide details or constraints for this task..."
                    rows={3}
                    className="bg-card/35 border-white/5 text-white rounded-none p-3"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmittingTask} className="uppercase tracking-wider text-xs">
                    {isSubmittingTask ? "Adding..." : "Add Task"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {featuresWithPrds.length === 0 ? (
        /* Empty State (No approved PRDs yet) */
        <Card className="border-dashed border-white/10 bg-card/20 py-16 text-center max-w-xl mx-auto rounded-none">
          <CardHeader className="flex flex-col items-center">
            <ClipboardList className="size-8 text-muted-foreground mb-2" />
            <CardTitle className="text-base font-mono uppercase tracking-wider">No Approved PRDs Found</CardTitle>
            <CardDescription className="text-xs uppercase tracking-wider max-w-md mt-1">
              Tasks can only be tracked for feature requests that have an approved and saved PRD. Please create and approve a PRD first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button  className="font-mono text-xs uppercase tracking-wider">
              <Link href={`/dashboard/projects/${projectId}`}>
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
                className={`rounded-none border transition-all duration-200 ${
                  draggedOverCol === col.id
                    ? "border-dashed border-primary bg-primary/5 scale-[1.01]"
                    : `${col.border} ${col.bg}`
                } p-4 flex flex-col min-h-[500px] max-h-[800px] overflow-y-auto space-y-4`}
              >
                {/* Column Title Header */}
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-xs">
                    <ColumnIcon className={`size-3.5 ${col.text} ${col.id === "IN_PROGRESS" ? "animate-spin" : "animate-pulse"}`} />
                    <span className="text-white font-bold">{col.label}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] bg-white/5 border border-white/5 text-muted-foreground uppercase px-2 rounded-full">
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 text-center py-10 italic">
                      Empty registry
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        className="border-white/5 bg-card/30 backdrop-blur-md hover:border-primary/20 hover:shadow-[0_0_10px_rgba(251,191,36,0.03)] relative group/card transition-all duration-200 cursor-grab active:cursor-grabbing rounded-none"
                      >
                        <CardHeader className="p-3 pb-1 space-y-1">
                          <Badge variant="outline" className="text-[9px] uppercase font-mono text-muted-foreground/80 w-fit truncate max-w-full rounded-full border-white/5 bg-white/[0.01]">
                            {task.featureRequest.title}
                          </Badge>
                          <CardTitle className="text-xs font-bold leading-snug font-mono uppercase tracking-wider text-white group-hover/card:text-primary transition-colors">
                            {task.title}
                          </CardTitle>
                        </CardHeader>
                        {task.description && (
                          <CardContent className="p-3 pt-0 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {task.description}
                          </CardContent>
                        )}
                        <CardFooter className="p-2 pt-0 border-t border-white/5 mt-2 flex justify-between items-center text-[10px] font-mono">
                          {/* Task Action Buttons */}
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
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
                                  className="size-6 hover:bg-white/5 rounded-full"
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
