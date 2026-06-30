"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  GitBranch,
  ExternalLink,
  Plus,
  Loader2,
  Trash2,
  Edit,
  Folder,
  Sparkles,
  Settings,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BackgroundGrid } from "@/components/ui/background-grid";

interface Project {
  id: string;
  name: string;
  description: string | null;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  workspaceId: string;
  createdAt: string;
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  createdAt: string;
}

const STATUS_CONFIGS: Record<string, { label: string; variant: "outline" | "secondary" | "default" | "destructive"; icon: any }> = {
  SUBMITTED: { label: "Submitted", variant: "secondary", icon: Clock },
  PENDING: { label: "Pending", variant: "secondary", icon: Clock },
  ANALYZING: { label: "Analyzing", variant: "outline", icon: Loader2 },
  pending_analysis: { label: "Analyzing", variant: "outline", icon: Loader2 },
  PENDING_ANALYSIS: { label: "Analyzing", variant: "outline", icon: Loader2 },
  DRAFT: { label: "Draft", variant: "outline", icon: Loader2 },
  PLANNING: { label: "Planning", variant: "secondary", icon: Clock },
  PRD_GENERATED: { label: "PRD Generated", variant: "default", icon: Sparkles },
  TASKS_CREATED: { label: "Tasks Created", variant: "default", icon: Sparkles },
  IN_DEVELOPMENT: { label: "In Development", variant: "default", icon: Sparkles },
  IN_REVIEW: { label: "In Review", variant: "outline", icon: HelpCircle },
  CHANGES_REQUIRED: { label: "Changes Required", variant: "destructive", icon: AlertCircle },
  FEATURE_INCOMPLETE: { label: "Feature Incomplete", variant: "destructive", icon: AlertCircle },
  READY_FOR_MERGE: { label: "Ready For Merge", variant: "default", icon: CheckCircle },
  APPROVED: { label: "Approved", variant: "default", icon: CheckCircle },
  SHIPPED: { label: "Shipped", variant: "default", icon: CheckCircle },
  REJECTED: { label: "Rejected", variant: "destructive", icon: AlertCircle },
};

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  // Feature request form
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [isSubmittingFeature, setIsSubmittingFeature] = useState(false);

  // Project edit form
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editRepoName, setEditRepoName] = useState("");
  const [editRepoUrl, setEditRepoUrl] = useState("");
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      // Fetch project details
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (!projectRes.ok) throw new Error("Failed to fetch project");
      const projectData = await projectRes.json();
      setProject(projectData.data);

      // Populate edit fields
      if (projectData.data) {
        setEditName(projectData.data.name || "");
        setEditDesc(projectData.data.description || "");
        setEditRepoName(projectData.data.githubRepoName || "");
        setEditRepoUrl(projectData.data.githubRepoUrl || "");
      }

      // Fetch features
      const featuresRes = await fetch(`/api/projects/${projectId}/features-requests`);
      if (!featuresRes.ok) throw new Error("Failed to fetch feature requests");
      const featuresData = await featuresRes.json();
      setFeatures(featuresData.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load project details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  // Handle Feature Request Submit
  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureTitle.trim() || !featureDesc.trim() || !projectId) return;

    try {
      setIsSubmittingFeature(true);
      const res = await fetch(`/api/projects/${projectId}/features-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: featureTitle,
          description: featureDesc,
          projectId: projectId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create feature request");
      }

      const created = await res.json();
      setFeatures((prev) => [created.data, ...prev]);
      setFeatureTitle("");
      setFeatureDesc("");
      setIsFeatureModalOpen(false);
      toast.success("Feature request submitted!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error submitting feature request");
    } finally {
      setIsSubmittingFeature(false);
    }
  };

  // Handle Project Edit Submit
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      setIsUpdatingProject(true);
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          githubRepoName: editRepoName || null,
          githubRepoUrl: editRepoUrl || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update project");
      const updated = await res.json();

      setProject(updated.data);
      setIsEditProjectModalOpen(false);
      toast.success("Project updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error updating project");
    } finally {
      setIsUpdatingProject(false);
    }
  };

  // Handle Project Delete
  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? All features and PRDs will be lost.")) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete project");
      toast.success("Project deleted successfully");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting project");
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
      <div className="flex-1 p-10 space-y-6 text-center">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Button >
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex-1 p-6 md:p-10 space-y-8 bg-background min-h-screen">
      <BackgroundGrid className="fixed inset-0 pointer-events-none opacity-40" />

      {/* Back Button */}
      <Button variant="ghost"  className="gap-2 -ml-2 text-muted-foreground hover:text-foreground font-mono uppercase tracking-wider text-xs">
        <Link href="/dashboard">
          <ArrowLeft className="size-3.5" />
          Back to Projects
        </Link>
      </Button>

      {/* Project Banner Card */}
      <Card className="border-white/5 bg-card/25 backdrop-blur-md overflow-hidden relative rounded-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/2 rounded-full blur-2xl pointer-events-none" />
        <CardHeader className="md:flex-row justify-between items-start md:items-center gap-4 space-y-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 bg-primary/5 rounded-lg text-primary">
                <Folder className="size-5 animate-pulse" />
              </span>
              <CardTitle className="text-2xl font-light uppercase tracking-widest font-mono text-white text-glow">{project.name}</CardTitle>
            </div>
            <CardDescription className="mt-2 text-xs max-w-3xl leading-relaxed text-muted-foreground">
              {project.description || "No project description provided."}
            </CardDescription>
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-end font-mono text-xs">
            {/* Edit Project Trigger */}
            <Dialog open={isEditProjectModalOpen} onOpenChange={setIsEditProjectModalOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="sm" className="gap-2 bg-card border-white/10">
                <Edit className="size-3.5" />
                Edit Project
              </Button>
            } />
              <DialogContent className="sm:max-w-[500px] bg-card/95 border-white/5 backdrop-blur-md rounded-none font-mono text-xs">
                <DialogHeader>
                  <DialogTitle className="uppercase tracking-wider text-white">Edit Project</DialogTitle>
                  <DialogDescription className="text-[10px] uppercase tracking-wider text-muted-foreground">Update project details and settings.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProject} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-proj-name" className="uppercase tracking-wider">Project Name</Label>
                    <Input
                      id="edit-proj-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="bg-card/35 border-white/5 text-white rounded-full px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-proj-desc" className="uppercase tracking-wider">Description</Label>
                    <Textarea
                      id="edit-proj-desc"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      className="bg-card/35 border-white/5 text-white rounded-none p-3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-repo-name" className="uppercase tracking-wider">GitHub Repo Name</Label>
                      <Input
                        id="edit-repo-name"
                        value={editRepoName}
                        onChange={(e) => setEditRepoName(e.target.value)}
                        placeholder="e.g. shipmate"
                        className="bg-card/35 border-white/5 text-white rounded-full px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-repo-url" className="uppercase tracking-wider">GitHub Repo URL</Label>
                      <Input
                        id="edit-repo-url"
                        value={editRepoUrl}
                        onChange={(e) => setEditRepoUrl(e.target.value)}
                        placeholder="e.g. https://github.com/..."
                        className="bg-card/35 border-white/5 text-white rounded-full px-4"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isUpdatingProject} className="uppercase tracking-wider text-xs">
                      {isUpdatingProject ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Project Button */}
            <Button variant="destructive" size="sm" onClick={handleDeleteProject} className="gap-2 uppercase tracking-wider text-xs">
              <Trash2 className="size-3.5" />
              Delete Project
            </Button>
          </div>
        </CardHeader>

        <CardContent className="border-t border-white/5 py-3 px-6 flex flex-wrap gap-4 text-xs text-muted-foreground bg-white/[0.01] font-mono uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-primary" />
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline text-glow-amber"
            >
              <GitBranch className="size-3.5 text-primary animate-pulse" />
              <span>{project.githubRepoName || "GitHub Repository"}</span>
              <ExternalLink className="size-3" />
            </a>
          )}
        </CardContent>
      </Card>

      {/* Feature Requests Management */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-light uppercase tracking-widest font-mono text-white text-glow">Feature Requests</h2>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">List of incoming features that require PRD planning.</p>
          </div>

          {/* New Feature Trigger */}
          <Dialog open={isFeatureModalOpen} onOpenChange={setIsFeatureModalOpen}>
            <DialogTrigger render={
              <Button className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-mono uppercase tracking-wider text-xs glow-amber">
                <Plus className="size-4" />
                Add Feature Request
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px] bg-card/95 border-white/5 backdrop-blur-md rounded-none font-mono text-xs">
              <DialogHeader>
                <DialogTitle className="uppercase tracking-wider text-white">Submit Feature Request</DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Explain what functionality you want to add to this project. We will generate the PRD from this.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateFeature} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="feat-title" className="uppercase tracking-wider">Feature Title</Label>
                  <Input
                    id="feat-title"
                    value={featureTitle}
                    onChange={(e) => setFeatureTitle(e.target.value)}
                    placeholder="e.g. Integrate Slack notifications"
                    required
                    className="bg-card/35 border-white/5 text-white rounded-full px-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feat-desc" className="uppercase tracking-wider">Feature Description</Label>
                  <Textarea
                    id="feat-desc"
                    value={featureDesc}
                    onChange={(e) => setFeatureDesc(e.target.value)}
                    placeholder="Describe user needs, scope, API endpoints if any, and target user flow..."
                    rows={5}
                    required
                    className="bg-card/35 border-white/5 text-white rounded-none p-3"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmittingFeature} className="uppercase tracking-wider text-xs">
                    {isSubmittingFeature ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Feature"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {features.length === 0 ? (
          /* Empty Features State */
          <Card className="border-dashed border-white/10 bg-card/20 py-16 text-center max-w-xl mx-auto rounded-none">
            <CardHeader className="flex flex-col items-center">
              <Sparkles className="size-8 text-primary mb-2 animate-bounce" />
              <CardTitle className="text-base font-mono uppercase tracking-wider">No Feature Requests Yet</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider">
                Add your first feature request to start building PRDs and tasks using ShipMate AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsFeatureModalOpen(true)} className="font-mono text-xs uppercase tracking-wider">Create Feature Request</Button>
            </CardContent>
          </Card>
        ) : (
          /* Feature Requests List */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const statusCfg = STATUS_CONFIGS[feature.status] || {
                label: feature.status,
                variant: "outline" as const,
                icon: HelpCircle,
              };
              const StatusIcon = statusCfg.icon;

              return (
                <Link
                  key={feature.id}
                  href={`/dashboard/projects/${projectId}/features/${feature.id}`}
                  className="group block"
                >
                  <Card className="h-full border-white/5 bg-card/25 backdrop-blur-md hover:bg-card/45 hover:border-primary/20 hover:shadow-[0_0_15px_rgba(251,191,36,0.04)] transition-all duration-200 flex flex-col justify-between overflow-hidden relative rounded-none">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors truncate font-mono uppercase tracking-wider text-white">
                          {feature.title}
                        </CardTitle>
                        <Badge variant={statusCfg.variant} className="gap-1 capitalize shrink-0 font-mono text-[9px] uppercase tracking-wider rounded-full px-2.5 py-0.5">
                          <StatusIcon className="size-2.5 animate-pulse text-primary" />
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-3 mt-2 min-h-12 leading-relaxed text-xs text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>

                    <CardFooter className="border-t border-white/5 py-2.5 px-6 flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-white/[0.01]">
                      <span>Submitted {new Date(feature.createdAt).toLocaleDateString()}</span>
                      <span className="text-primary group-hover:underline group-hover:text-glow-amber">Plan PRD →</span>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
