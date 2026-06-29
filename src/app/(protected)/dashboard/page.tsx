"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Folder, GitBranch, Briefcase, PlusCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BackgroundGrid } from "@/components/ui/background-grid";

interface Workspace {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  workspaceId: string;
  createdAt: string;
}

export default function DashboardOverviewPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Modals state
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Forms state
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isSubmittingWorkspace, setIsSubmittingWorkspace] = useState(false);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectRepoUrl, setNewProjectRepoUrl] = useState("");
  const [newProjectRepoName, setNewProjectRepoName] = useState("");
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  // Fetch workspaces
  const fetchWorkspaces = async () => {
    try {
      setIsLoadingWorkspaces(true);
      const res = await fetch("/api/workspace");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      const data = await res.json();
      setWorkspaces(data);
      if (data.length > 0) {
        setSelectedWorkspaceId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load workspaces");
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    if (!selectedWorkspaceId) return;
    try {
      setIsLoadingProjects(true);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      // Filter projects by workspace
      const filtered = data.filter((p: Project) => p.workspaceId === selectedWorkspaceId);
      setProjects(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Could not load projects");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [selectedWorkspaceId]);

  // Handle Workspace Create
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    try {
      setIsSubmittingWorkspace(true);
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWorkspaceName }),
      });

      if (!res.ok) throw new Error("Failed to create workspace");
      const created = await res.json();

      setWorkspaces((prev) => [...prev, created]);
      setSelectedWorkspaceId(created.id);
      setNewWorkspaceName("");
      setIsWorkspaceModalOpen(false);
      toast.success("Workspace created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error creating workspace");
    } finally {
      setIsSubmittingWorkspace(false);
    }
  };

  // Handle Project Create
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !selectedWorkspaceId) return;

    try {
      setIsSubmittingProject(true);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc,
          githubRepoUrl: newProjectRepoUrl || undefined,
          githubRepoName: newProjectRepoName || undefined,
          workspaceId: selectedWorkspaceId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const created = await res.json();
      setProjects((prev) => [...prev, created]);
      setNewProjectName("");
      setNewProjectDesc("");
      setNewProjectRepoUrl("");
      setNewProjectRepoName("");
      setIsProjectModalOpen(false);
      toast.success("Project created successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error creating project");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  return (
    <div className="relative flex-1 p-6 md:p-10 space-y-8 bg-background min-h-screen">
      <BackgroundGrid className="fixed inset-0 pointer-events-none opacity-40" />
      {/* Header Section */}
      <div className="z-10 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light uppercase tracking-widest font-mono text-white flex items-center gap-2 text-glow">
            <Sparkles className="size-5 text-primary animate-pulse" />
            DevBuddy Panel
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-wider">
            Manage your workspaces, track projects, and generate product requirements documents instantly.
          </p>
        </div>

        <div className="flex gap-3 items-center w-full md:w-auto">
          {/* Workspace Selector */}
          {!isLoadingWorkspaces && workspaces.length > 0 && (
            <div className="flex items-center gap-2 w-full md:w-64">
              <Briefcase className="size-4 text-muted-foreground shrink-0" />
              <Select value={selectedWorkspaceId} onValueChange={(val) => setSelectedWorkspaceId(val ?? "")}>
                <SelectTrigger className="w-full bg-card/25 backdrop-blur-sm border-white/5 rounded-full px-4 font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  <SelectValue placeholder="Select Workspace" />
                </SelectTrigger>
                <SelectContent className="bg-card/90 border-white/5 backdrop-blur-md">
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id} className="font-mono text-xs uppercase tracking-wider">
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* New Workspace Trigger */}
          <Dialog open={isWorkspaceModalOpen} onOpenChange={setIsWorkspaceModalOpen}>
            <DialogTrigger >
              <Button variant="outline" size="icon" className="shrink-0 bg-card/20 border-white/10 hover:bg-white/5 rounded-full" title="New Workspace">
                <Plus className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Workspace</DialogTitle>
                <DialogDescription>
                  Workspaces group projects together for a team or client context.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateWorkspace} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="ws-name">Workspace Name</Label>
                  <Input
                    id="ws-name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g. ShipMate Team"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmittingWorkspace}>
                    {isSubmittingWorkspace ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                      </>
                    ) : (
                      "Create Workspace"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoadingWorkspaces ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-10 text-primary animate-spin" />
        </div>
      ) : workspaces.length === 0 ? (
        /* Empty Workspace State */
        <Card className="border-dashed border-accent/40 bg-card/30 backdrop-blur-sm max-w-2xl mx-auto text-center py-16 px-6">
          <CardHeader className="flex flex-col items-center">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
              <Briefcase className="size-10" />
            </div>
            <CardTitle className="text-2xl font-bold">No Workspaces Found</CardTitle>
            <CardDescription className="max-w-md mt-2">
              You need a workspace before you can start managing projects. Create your first workspace below to begin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isWorkspaceModalOpen} onOpenChange={setIsWorkspaceModalOpen}>
              <DialogTrigger >
                <Button className="gap-2">
                  <PlusCircle className="size-4" />
                  Create First Workspace
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        /* Workspace Projects List */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-light uppercase tracking-widest font-mono text-white flex items-center gap-2 text-glow">
              <Folder className="size-4 text-primary animate-pulse" />
              Projects Registry
            </h2>

            {/* New Project Trigger */}
            <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
              <DialogTrigger >
                <Button className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-mono uppercase tracking-wider text-xs glow-amber">
                  <Plus className="size-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-card/95 border-white/5 backdrop-blur-md rounded-none">
                <DialogHeader>
                  <DialogTitle className="font-mono uppercase tracking-wider text-white">Create New Project</DialogTitle>
                  <DialogDescription className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Add a new project inside the selected workspace context.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4 py-4 font-mono text-xs">
                  <div className="space-y-2">
                    <Label htmlFor="proj-name" className="uppercase tracking-wider">Project Name</Label>
                    <Input
                      id="proj-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Developer Buddy"
                      required
                      className="bg-card/30 border-white/5 text-white placeholder-muted-foreground/60 rounded-full px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proj-desc" className="uppercase tracking-wider">Description</Label>
                    <Textarea
                      id="proj-desc"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Short summary of what this project represents..."
                      rows={3}
                      className="bg-card/30 border-white/5 text-white placeholder-muted-foreground/60 rounded-none p-3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proj-repo-name" className="uppercase tracking-wider">GitHub Repo Name</Label>
                      <Input
                        id="proj-repo-name"
                        value={newProjectRepoName}
                        onChange={(e) => setNewProjectRepoName(e.target.value)}
                        placeholder="e.g. shipmate"
                        className="bg-card/30 border-white/5 text-white placeholder-muted-foreground/60 rounded-full px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proj-repo-url" className="uppercase tracking-wider">GitHub Repo URL</Label>
                      <Input
                        id="proj-repo-url"
                        value={newProjectRepoUrl}
                        onChange={(e) => setNewProjectRepoUrl(e.target.value)}
                        placeholder="e.g. https://github.com/..."
                        className="bg-card/30 border-white/5 text-white placeholder-muted-foreground/60 rounded-full px-4"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmittingProject} className="w-full sm:w-auto font-mono uppercase tracking-wider text-xs">
                      {isSubmittingProject ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                        </>
                      ) : (
                        "Create Project"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse bg-card/25 border-white/5 rounded-none">
                  <CardHeader className="h-32" />
                  <CardFooter className="h-10 bg-white/[0.01]" />
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            /* Empty Projects State */
            <Card className="border-dashed border-white/10 bg-card/20 py-16 text-center max-w-xl mx-auto rounded-none">
              <CardHeader className="flex flex-col items-center">
                <Folder className="size-8 text-muted-foreground mb-2" />
                <CardTitle className="text-base font-mono uppercase tracking-wider">No Projects Registered</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wider">
                  Start by adding your first project inside this workspace registry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => setIsProjectModalOpen(true)} className="font-mono text-xs uppercase tracking-wider">
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Projects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group block"
                >
                  <Card className="h-full border-white/5 bg-card/25 backdrop-blur-md hover:border-primary/25 hover:bg-card/45 hover:shadow-[0_0_15px_rgba(251,191,36,0.05)] transition-all duration-300 flex flex-col justify-between overflow-hidden relative rounded-none">
                    {/* Glowing highlight in corner on hover */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/2 rounded-full blur-xl group-hover:bg-primary/5 transition-all pointer-events-none" />

                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary/10 transition-colors">
                          <Folder className="size-4 animate-pulse" />
                        </span>
                        {project.githubRepoName && (
                          <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                            <GitBranch className="size-3 text-primary" />
                            {project.githubRepoName}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold group-hover:text-primary transition-colors truncate font-mono uppercase tracking-wide">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 min-h-10 mt-1 text-xs/relaxed text-muted-foreground">
                        {project.description || "No project description provided."}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="border-t border-white/5 bg-white/[0.02] py-2 px-6 flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-all duration-300">
                      <span>View details</span>
                      <ArrowRight className="size-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
