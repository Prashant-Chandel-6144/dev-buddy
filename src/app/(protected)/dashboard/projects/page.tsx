"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Folder, Plus, Search, Calendar, GitBranch, ArrowRight, Loader2, LayoutGrid, CheckCircle2, Kanban, Sparkles, Files } from "lucide-react";
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

export default function ProjectsOverviewPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Creation State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectRepoUrl, setNewProjectRepoUrl] = useState("");
  const [newProjectRepoName, setNewProjectRepoName] = useState("");
  const [targetWorkspaceId, setTargetWorkspaceId] = useState("");
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const wsRes = await fetch("/api/workspace");
      if (!wsRes.ok) throw new Error("Failed to fetch workspaces");
      const wsData = await wsRes.json();
      setWorkspaces(wsData);

      const projRes = await fetch("/api/projects");
      if (!projRes.ok) throw new Error("Failed to fetch projects");
      const projData = await projRes.json();
      setProjects(projData);

      if (wsData.length > 0) {
        setTargetWorkspaceId(wsData[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load projects data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !targetWorkspaceId) return;

    try {
      setIsSubmittingProject(true);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc || undefined,
          githubRepoUrl: newProjectRepoUrl || undefined,
          githubRepoName: newProjectRepoName || undefined,
          workspaceId: targetWorkspaceId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      toast.success("Project created successfully!");
      setNewProjectName("");
      setNewProjectDesc("");
      setNewProjectRepoUrl("");
      setNewProjectRepoName("");
      setIsProjectModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error creating project");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  // Filter projects by search and workspace
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesWorkspace = selectedWorkspaceFilter === "all" || p.workspaceId === selectedWorkspaceFilter;
    
    return matchesSearch && matchesWorkspace;
  });

  const getWorkspaceName = (wsId: string) => {
    return workspaces.find((w) => w.id === wsId)?.name || "Default Workspace";
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background">
        <Loader2 className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  // Stats calculation
  const totalProjects = projects.length;
  const connectedRepos = projects.filter(p => p.githubRepoName).length;
  const totalWorkspaces = workspaces.length;

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Workspace Management</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
            <Folder className="size-8 text-primary" />
            Your Projects
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your development pipelines, requirements, and repositories.
          </p>
        </div>

        {workspaces.length > 0 && (
          <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
            <DialogTrigger render={
              <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-95 text-white shadow-lg">
                <Plus className="size-4" />
                Add New Project
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>Initialize a new project environment linked to a workspace.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="proj-workspace">Target Workspace</Label>
                  <Select value={targetWorkspaceId} onValueChange={(val) => setTargetWorkspaceId(val ?? "")}>
                    <SelectTrigger id="proj-workspace">
                      <SelectValue placeholder="Select Workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-name">Project Name</Label>
                  <Input
                    id="proj-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. My SaaS Product"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-desc">Description (Optional)</Label>
                  <Textarea
                    id="proj-desc"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Provide overview details..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proj-repourl">GitHub Repo URL</Label>
                    <Input
                      id="proj-repourl"
                      value={newProjectRepoUrl}
                      onChange={(e) => setNewProjectRepoUrl(e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proj-reponame">Repo Full Name</Label>
                    <Input
                      id="proj-reponame"
                      value={newProjectRepoName}
                      onChange={(e) => setNewProjectRepoName(e.target.value)}
                      placeholder="owner/repo-name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmittingProject}>
                    {isSubmittingProject ? "Initializing..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Visual Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-accent/10 bg-card/20 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2 bg-primary/10 rounded-lg text-primary">
            <LayoutGrid className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Total Projects</CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">{totalProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Active in selected workspace settings</p>
          </CardContent>
        </Card>

        <Card className="border-accent/10 bg-card/20 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <GitBranch className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Connected Repos</CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">{connectedRepos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Linked with active GitHub webhooks</p>
          </CardContent>
        </Card>

        <Card className="border-accent/10 bg-card/20 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2 bg-purple-500/10 rounded-lg text-purple-500">
            <Folder className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Workspaces</CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">{totalWorkspaces}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Organizational project directories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name or description..."
            className="pl-9 bg-card/30 border-accent/15 h-11 text-sm shadow-xs"
          />
        </div>
        <div className="w-full sm:w-[220px]">
          <Select value={selectedWorkspaceFilter} onValueChange={(val) => setSelectedWorkspaceFilter(val ?? "")}>
            <SelectTrigger className="bg-card/30 border-accent/15 h-11 text-sm shadow-xs">
              <SelectValue placeholder="All Workspaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workspaces</SelectItem>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="border-dashed border-accent/30 bg-card/10 text-center py-20 px-6">
          <CardHeader className="flex flex-col items-center">
            <div className="p-4 bg-primary/5 rounded-full text-primary/70 mb-3 animate-pulse">
              <Folder className="size-8" />
            </div>
            <CardTitle>No projects found</CardTitle>
            <CardDescription className="max-w-md mt-1 text-xs">
              Create a new project workspace to start drafting AI PRDs and tracking tasks.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <Card key={p.id} className="border-accent/15 bg-card/35 backdrop-blur-md hover:border-primary/45 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                    {getWorkspaceName(p.workspaceId)}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold mt-2 group-hover:text-primary transition-colors truncate">
                  {p.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-8 text-xs leading-relaxed mt-1">
                  {p.description || "No project description specified."}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="py-2 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-lg bg-accent/5 border border-accent/5">
                  <GitBranch className="size-4 text-primary shrink-0" />
                  <span className="truncate font-mono text-[11px]">
                    {p.githubRepoName || "Repository Disconnected"}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-accent/5 mt-4 flex gap-2 justify-between">
                <Button variant="ghost" size="sm"  className="text-xs text-muted-foreground hover:text-foreground">
                  <Link href={`/dashboard/projects/${p.id}/kanban`}>
                    <Kanban className="size-3.5 mr-1" /> Kanban
                  </Link>
                </Button>
                
                <Button size="sm"  className="gap-1.5 text-xs shadow-xs">
                  <Link href={`/dashboard/projects/${p.id}`}>
                    Configure <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
