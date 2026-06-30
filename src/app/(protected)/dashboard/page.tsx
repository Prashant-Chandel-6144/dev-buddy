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
    <div className="relative flex-1 p-6 md:p-10 space-y-8 bg-background min-h-screen grain grid-container">
      {/* Spotlight and guides */}
      <div className="gena-spotlight" />
      <div className="blueprint-line-v left-1/4" />
      <div className="blueprint-line-v right-1/4" />

      {/* Header Section */}
      <div className="z-10 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4.5 text-primary" />
            ShipFlow Console
          </h1>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Manage your workspaces, track projects, and orchestrate delivery pipelines.
          </p>
        </div>

        <div className="flex gap-3 items-center w-full md:w-auto z-20">
          {/* Workspace Selector */}
          {!isLoadingWorkspaces && workspaces.length > 0 && (
            <div className="flex items-center gap-2 w-full md:w-60">
              <Briefcase className="size-4 text-muted-foreground shrink-0" />
              <Select value={selectedWorkspaceId} onValueChange={(val) => setSelectedWorkspaceId(val ?? "")}>
                <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-medium">
                  <SelectValue placeholder="Select Workspace" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id} className="text-xs">
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* New Workspace Trigger */}
          <Dialog open={isWorkspaceModalOpen} onOpenChange={setIsWorkspaceModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 bg-card border border-border hover:bg-muted rounded-lg" title="New Workspace">
                <Plus className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-card border border-border">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold">Create Workspace</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Workspaces group projects together for team or client contexts.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateWorkspace} className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ws-name" className="text-xs font-medium">Workspace Name</Label>
                  <Input
                    id="ws-name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g. ShipFlow Core Team"
                    required
                    className="text-xs h-9 bg-background"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmittingWorkspace} className="text-xs h-9">
                    {isSubmittingWorkspace ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Creating...
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
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
      ) : workspaces.length === 0 ? (
        /* Empty Workspace State */
        <Card className="gena-card border-dashed max-w-2xl mx-auto text-center py-16 px-6">
          <CardHeader className="flex flex-col items-center">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
              <Briefcase className="size-8" />
            </div>
            <CardTitle className="text-xl font-bold">No Workspaces Found</CardTitle>
            <CardDescription className="max-w-md mt-2 text-xs text-muted-foreground">
              You need a workspace before you can start managing projects. Create your first workspace below to begin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isWorkspaceModalOpen} onOpenChange={setIsWorkspaceModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 text-xs">
                  <PlusCircle className="size-4" />
                  Create First Workspace
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        /* Workspace Projects List */
        <div className="space-y-6 z-10 relative">
          <div className="flex justify-between items-center">
            <span className="bracket-title text-xs font-semibold uppercase tracking-wider text-primary">
              Projects Registry
            </span>

            {/* New Project Trigger */}
            <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5 bg-primary hover:opacity-90 text-primary-foreground text-xs font-medium rounded-lg h-8">
                  <Plus className="size-3.5" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] bg-card border border-border">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold">Create New Project</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Add a new project inside this workspace.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4 py-2 text-xs">
                  <div className="space-y-1.5">
                    <Label htmlFor="proj-name" className="text-xs font-medium">Project Name</Label>
                    <Input
                      id="proj-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Acme SaaS Website"
                      required
                      className="bg-background border-border text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="proj-desc" className="text-xs font-medium">Description</Label>
                    <Textarea
                      id="proj-desc"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Short summary of what this project represents..."
                      rows={3}
                      className="bg-background border-border text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="proj-repo-name" className="text-xs font-medium">GitHub Repo Name</Label>
                      <Input
                        id="proj-repo-name"
                        value={newProjectRepoName}
                        onChange={(e) => setNewProjectRepoName(e.target.value)}
                        placeholder="e.g. acme-saas"
                        className="bg-background border-border text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="proj-repo-url" className="text-xs font-medium">GitHub Repo URL</Label>
                      <Input
                        id="proj-repo-url"
                        value={newProjectRepoUrl}
                        onChange={(e) => setNewProjectRepoUrl(e.target.value)}
                        placeholder="e.g. https://github.com/..."
                        className="bg-background border-border text-xs h-9"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmittingProject} className="w-full sm:w-auto text-xs h-9">
                      {isSubmittingProject ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Creating...
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
                <div key={i} className="gena-card p-6 h-36 animate-pulse bg-card/10 border-border/30" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            /* Empty Projects State */
            <div className="gena-card border-dashed py-16 text-center max-w-xl mx-auto flex flex-col items-center">
              <Folder className="size-8 text-muted-foreground mb-4" />
              <h3 className="text-sm font-semibold mb-1">No Projects Registered</h3>
              <p className="text-xs text-muted-foreground mb-6">
                Start by adding your first project inside this workspace registry.
              </p>
              <Button variant="outline" onClick={() => setIsProjectModalOpen(true)} className="text-xs h-8">
                Create Project
              </Button>
            </div>
          ) : (
            /* Projects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group block"
                >
                  <div className="gena-card h-full flex flex-col justify-between overflow-hidden relative p-5 hover:glow-amber">
                    {/* Glowing corner highlights on hover */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/2 rounded-full blur-xl group-hover:bg-primary/5 transition-all pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2 bg-primary/10 rounded-lg text-primary">
                          <Folder className="size-4" />
                        </span>
                        {project.githubRepoName && (
                          <span className="text-[10px] font-mono bg-border/50 px-2 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                            <GitBranch className="size-3 text-primary" />
                            {project.githubRepoName}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="line-clamp-2 min-h-8 mt-1 text-[11px] text-muted-foreground leading-relaxed">
                        {project.description || "No project description provided."}
                      </p>
                    </div>

                    <div className="border-t border-border/60 pt-3 mt-4 flex justify-between items-center text-[10px] text-muted-foreground group-hover:text-foreground transition-all duration-300">
                      <span>View details</span>
                      <ArrowRight className="size-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
