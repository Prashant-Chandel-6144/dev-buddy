"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  Check,
  X,
  FileText,
  Target,
  AlertTriangle,
  ListChecks,
  Code,
  Layers,
  ArrowRight,
  ClipboardList,
  MessageSquare,
  Send,
  GitPullRequest,
  Clock
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const clientPRDValidationSchema = z.object({
  problemStatement: z.string().min(10, "Problem statement must be at least 10 characters"),
  edgeCases: z.string().min(1, "Edge cases explanation is required"),
  goals: z.array(z.string().min(1, "Goal cannot be empty")).min(1, "At least one goal is required"),
  nonGoals: z.array(z.string().min(1, "Non-goal cannot be empty")).default([]),
  userStories: z.array(z.string().min(1, "User story cannot be empty")).default([]),
  successMetrics: z.array(z.string().min(1, "Success metric cannot be empty")).default([]),
  acceptanceCriteria: z.array(z.string().min(1, "Acceptance criterion cannot be empty")).default([]),
  implementationApproach: z.array(z.string().min(1, "Implementation approach item cannot be empty")).default([]),
  content: z.string().min(1, "Detailed specifications content is required"),
});

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  createdAt: string;
  prd?: any;
  tasks?: any[];
  pullRequests?: any[];
}

interface PRD {
  id?: string;
  problemStatement: string;
  edgeCases: string;
  goals: string[];
  nonGoals: string[];
  userStories: string[];
  successMetrics: string[];
  acceptanceCriteria: string[];
  implementationApproach: string[];
  content: string;
  status: string;
}

// Custom Markdown-like parser for simple rendering
const SimpleMarkdown = ({ content }: { content: string }) => {
  if (!content) return null;
  
  const lines = content.split("\n");
  
  return (
    <div className="space-y-4 text-sm md:text-base leading-relaxed text-foreground/90">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith("### ")) {
          return <h4 key={idx} className="text-md font-bold mt-4 text-primary">{line.substring(4)}</h4>;
        }
        if (line.startsWith("## ")) {
          return <h3 key={idx} className="text-lg font-bold mt-5 border-b border-accent/20 pb-1 text-primary">{line.substring(3)}</h3>;
        }
        if (line.startsWith("# ")) {
          return <h2 key={idx} className="text-xl font-extrabold mt-6 text-foreground">{line.substring(2)}</h2>;
        }
        
        // Bullet list
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-4">
              <span className="text-primary mt-1.5">•</span>
              <span>{line.substring(2)}</span>
            </div>
          );
        }
        
        // Numbered list
        const numMatch = line.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-4">
              <span className="text-primary font-bold">{numMatch[1]}.</span>
              <span>{numMatch[2]}</span>
            </div>
          );
        }
        
        // Blockquote
        if (line.startsWith("> ")) {
          return (
            <blockquote key={idx} className="border-l-4 border-primary/40 bg-accent/5 p-3 rounded-r-md italic my-2">
              {line.substring(2)}
            </blockquote>
          );
        }

        // Empty line
        if (line.trim() === "") {
          return <div key={idx} className="h-2" />;
        }
        
        // Plain text
        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
};

export default function FeatureDetailPage() {
  const { projectId, featureId } = useParams();
  const router = useRouter();

  const [feature, setFeature] = useState<FeatureRequest | null>(null);
  const [prd, setPrd] = useState<PRD | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Draft vs Database state
  const [isDraft, setIsDraft] = useState(false); // True if it is generated in memory but not saved
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editProblemStatement, setEditProblemStatement] = useState("");
  const [editEdgeCases, setEditEdgeCases] = useState("");
  const [editGoals, setEditGoals] = useState<string[]>([]);
  const [editNonGoals, setEditNonGoals] = useState<string[]>([]);
  const [editUserStories, setEditUserStories] = useState<string[]>([]);
  const [editSuccessMetrics, setEditSuccessMetrics] = useState<string[]>([]);
  const [editAcceptanceCriteria, setEditAcceptanceCriteria] = useState<string[]>([]);
  const [editImplementationApproach, setEditImplementationApproach] = useState<string[]>([]);
  const [editContent, setEditContent] = useState("");
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  // Chat memory state
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      setIsSendingChat(true);
      const tempUserMsg = {
        id: "temp-" + Date.now(),
        role: "USER",
        content: chatInput,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);
      const content = chatInput;
      setChatInput("");

      const res = await fetch(`/api/projects/${projectId}/features-requests/${featureId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "USER",
          content,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send message");
      }

      toast.success("PRD refined based on your feedback!");
      await fetchFeatureAndPRD();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error refining PRD");
    } finally {
      setIsSendingChat(false);
    }
  };

  const steps = [
    "Analyzing feature request context and project alignment...",
    "Defining target problem statement and product vision...",
    "Brainstorming goals & scoping non-goals...",
    "Mapping user scenarios and critical edge cases...",
    "Drafting detailed technical acceptance criteria...",
    "Formulating recommended implementation approach...",
    "Finalizing document structures and styling specifications..."
  ];

  const fetchFeatureAndPRD = async (isPolling = false) => {
    try {
      if (!feature && !isPolling) {
        setIsLoading(true);
      }
      // Fetch feature request
      const featureRes = await fetch(`/api/projects/${projectId}/features-requests/${featureId}`);
      if (!featureRes.ok) throw new Error("Failed to fetch feature request");
      const featureData = await featureRes.json();
      setFeature(featureData);

      // Extract PRD from feature relation if loaded
      if (featureData.prd) {
        setPrd(featureData.prd);
        setIsDraft(false);
        if (!isEditing) {
          populateEditFields(featureData.prd);
        }
      } else if (!isPolling && !prd) {
        // Only try the fallback PRD fetch on initial load when we have no local PRD state
        try {
          const prdRes = await fetch(`/api/prds?featureId=${featureId}`);
          if (prdRes.ok) {
            const prdData = await prdRes.json();
            setPrd(prdData.prd);
            setIsDraft(false);
            if (!isEditing) {
              populateEditFields(prdData.prd);
            }
          }
        } catch {
          // Silently ignore fallback PRD fetch failures
        }
      }

      // Fetch messages history
      if (!isPolling) {
        const messagesRes = await fetch(`/api/projects/${projectId}/features-requests/${featureId}/messages`);
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData);
        }
      }
    } catch (err) {
      console.error(err);
      if (!isPolling) {
        toast.error("Could not load feature request details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const populateEditFields = (prdObj: PRD) => {
    setEditProblemStatement(prdObj.problemStatement || "");
    setEditEdgeCases(prdObj.edgeCases || "");
    setEditGoals(prdObj.goals || []);
    setEditNonGoals(prdObj.nonGoals || []);
    setEditUserStories(prdObj.userStories || []);
    setEditSuccessMetrics(prdObj.successMetrics || []);
    setEditAcceptanceCriteria(prdObj.acceptanceCriteria || []);
    setEditImplementationApproach(prdObj.implementationApproach || []);
    setEditContent(prdObj.content || "");
  };

  useEffect(() => {
    if (projectId && featureId) {
      fetchFeatureAndPRD();
    }
  }, [projectId, featureId]);

  // Real-time polling to sync background task updates automatically
  useEffect(() => {
    if (!projectId || !featureId || isEditing || isDraft || isGenerating || isGeneratingTasks) return;

    const interval = setInterval(() => {
      // Background refetch (lightweight — skips fallback PRD fetch and messages)
      fetchFeatureAndPRD(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [projectId, featureId, isEditing, isDraft, isGenerating, isGeneratingTasks]);

  // Simulate AI progress steps during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationStep(0);
      interval = setInterval(() => {
        setGenerationStep((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          return prev;
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle tasks generation by AI
  const handleGenerateTasks = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!prd || !prd.id) {
      toast.error("Please generate and approve the PRD first!");
      return;
    }
    try {
      setIsGeneratingTasks(true);
      const res = await fetch(`/api/prds/${prd.id}/tasks`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate tasks");
      }

      toast.success("Tasks generated by AI and mapped directly to your Kanban board!");
      // Re-fetch feature details to reload tasks list
      await fetchFeatureAndPRD();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error generating tasks");
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // Handle PRD Generation (AI)
  const handleGeneratePRD = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      setIsGenerating(true);
      const res = await fetch("/api/prds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureId: featureId,
          action: "generate",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate PRD");
      }

      const data = await res.json();
      setPrd(data.prd);
      setIsDraft(true); // Generated in-memory draft
      populateEditFields(data.prd);
      toast.success("PRD generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error generating PRD");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Approve & Save to DB
  const handleApproveAndSave = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!prd) return;
    
    // Assemble the current data (from edit inputs or raw state)
    const assembledData = {
      problemStatement: editProblemStatement,
      edgeCases: editEdgeCases,
      goals: editGoals.filter(g => g.trim() !== ""),
      nonGoals: editNonGoals.filter(ng => ng.trim() !== ""),
      userStories: editUserStories.filter(us => us.trim() !== ""),
      successMetrics: editSuccessMetrics.filter(sm => sm.trim() !== ""),
      acceptanceCriteria: editAcceptanceCriteria.filter(c => c.trim() !== ""),
      implementationApproach: editImplementationApproach.filter(a => a.trim() !== ""),
      content: editContent,
    };

    const validation = clientPRDValidationSchema.safeParse(assembledData);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      const firstErrorKey = Object.keys(errors)[0] as keyof typeof errors;
      const firstErrorMsg = errors[firstErrorKey]?.[0] || "Invalid field value";
      toast.error(`Validation Error: ${firstErrorMsg}`);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/prds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureId: featureId,
          action: "save",
          prdData: {
            ...assembledData,
            status: "approved"
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.error || "Failed to save PRD");
        throw new Error(errData.error || "Failed to save PRD");
      }

      const data = await res.json();
      setPrd(data.prd);
      setIsDraft(false); // No longer a draft, it is saved in DB!
      setIsEditing(false);
      
      // Update local feature status
      if (feature) {
        setFeature({ ...feature, status: "APPROVED" });
      }
      
      toast.success("PRD approved and saved to database!");
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reject / Discard Draft
  const handleRejectDraft = () => {
    if (confirm("Are you sure you want to reject and discard this generated PRD draft? It will not be saved to the database.")) {
      setPrd(null);
      setIsDraft(false);
      setIsEditing(false);
      toast.info("PRD draft discarded.");
    }
  };

  // Handle Edit DB PRD Submit (PATCH)
  const handleUpdatePersistedPRD = async () => {
    if (!prd || !prd.id) return;

    const assembledData = {
      problemStatement: editProblemStatement,
      edgeCases: editEdgeCases,
      goals: editGoals.filter(g => g.trim() !== ""),
      nonGoals: editNonGoals.filter(ng => ng.trim() !== ""),
      acceptanceCriteria: editAcceptanceCriteria.filter(c => c.trim() !== ""),
      implementationApproach: editImplementationApproach.filter(a => a.trim() !== ""),
      content: editContent,
    };

    const validation = clientPRDValidationSchema.safeParse(assembledData);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      const firstErrorKey = Object.keys(errors)[0] as keyof typeof errors;
      const firstErrorMsg = errors[firstErrorKey]?.[0] || "Invalid field value";
      toast.error(`Validation Error: ${firstErrorMsg}`);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/prds/${prd.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...assembledData,
          status: prd.status || "approved"
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.message || "Failed to update PRD");
        throw new Error(errData.message || "Failed to update PRD");
      }

      const data = await res.json();
      setPrd(data.data);
      setIsEditing(false);
      toast.success("PRD updated in database successfully!");
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper arrays update functions
  const handleArrayChange = (idx: number, val: string, arrayType: "goals" | "nonGoals" | "userStories" | "successMetrics" | "criteria" | "approach") => {
    if (arrayType === "goals") {
      const copy = [...editGoals];
      copy[idx] = val;
      setEditGoals(copy);
    } else if (arrayType === "nonGoals") {
      const copy = [...editNonGoals];
      copy[idx] = val;
      setEditNonGoals(copy);
    } else if (arrayType === "userStories") {
      const copy = [...editUserStories];
      copy[idx] = val;
      setEditUserStories(copy);
    } else if (arrayType === "successMetrics") {
      const copy = [...editSuccessMetrics];
      copy[idx] = val;
      setEditSuccessMetrics(copy);
    } else if (arrayType === "criteria") {
      const copy = [...editAcceptanceCriteria];
      copy[idx] = val;
      setEditAcceptanceCriteria(copy);
    } else if (arrayType === "approach") {
      const copy = [...editImplementationApproach];
      copy[idx] = val;
      setEditImplementationApproach(copy);
    }
  };

  const addArrayItem = (arrayType: "goals" | "nonGoals" | "userStories" | "successMetrics" | "criteria" | "approach") => {
    if (arrayType === "goals") setEditGoals([...editGoals, ""]);
    else if (arrayType === "nonGoals") setEditNonGoals([...editNonGoals, ""]);
    else if (arrayType === "userStories") setEditUserStories([...editUserStories, ""]);
    else if (arrayType === "successMetrics") setEditSuccessMetrics([...editSuccessMetrics, ""]);
    else if (arrayType === "criteria") setEditAcceptanceCriteria([...editAcceptanceCriteria, ""]);
    else if (arrayType === "approach") setEditImplementationApproach([...editImplementationApproach, ""]);
  };

  const removeArrayItem = (idx: number, arrayType: "goals" | "nonGoals" | "userStories" | "successMetrics" | "criteria" | "approach") => {
    if (arrayType === "goals") setEditGoals(editGoals.filter((_, i) => i !== idx));
    else if (arrayType === "nonGoals") setEditNonGoals(editNonGoals.filter((_, i) => i !== idx));
    else if (arrayType === "userStories") setEditUserStories(editUserStories.filter((_, i) => i !== idx));
    else if (arrayType === "successMetrics") setEditSuccessMetrics(editSuccessMetrics.filter((_, i) => i !== idx));
    else if (arrayType === "criteria") setEditAcceptanceCriteria(editAcceptanceCriteria.filter((_, i) => i !== idx));
    else if (arrayType === "approach") setEditImplementationApproach(editImplementationApproach.filter((_, i) => i !== idx));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background">
        <Loader2 className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!feature) {
    return (
      <div className="flex-1 p-10 text-center space-y-6">
        <h2 className="text-2xl font-bold">Feature request not found</h2>
        <Link 
          href={`/dashboard/projects/${projectId}`} 
          className={buttonVariants({ variant: "default" })}
        >
          Back to Project
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
      {/* Back to Project Link */}
      <Link 
        href={`/dashboard/projects/${projectId}`} 
        className={buttonVariants({ variant: "ghost", className: "gap-2 -ml-2 text-muted-foreground hover:text-foreground" })}
      >
        <ArrowLeft className="size-4" />
        Back to Project details
      </Link>

      {/* Pull Request Verification Warning Alert Banner */}
      {(() => {
        const latestPr = feature.pullRequests && feature.pullRequests.length > 0 ? feature.pullRequests[0] : null;
        if (latestPr && latestPr.status === "needs_revision") {
          return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 flex items-start gap-3 shadow-md mb-6 animate-pulse">
              <AlertTriangle className="size-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">Verification Feedback Needed</h4>
                <p className="text-xs text-foreground/80 leading-normal">
                  Your last code review has outstanding feedback. Check the **Pull Requests** tab below for details on what is missing or incorrect.
                </p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Feature Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-accent/10 pb-6">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Feature Planning Detail</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">{feature.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted on {new Date(feature.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 text-sm bg-card">
            Status: {feature.status}
          </Badge>
          {prd && !isDraft && (
            <Badge variant="default" className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-600 text-white gap-1">
              <CheckCircle className="size-3" />
              PRD Approved
            </Badge>
          )}
        </div>
      </div>      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Main Content (Left Column) - 3/4 width on desktop */}
        <div className="lg:col-span-3 space-y-8">
          {/* Feature description */}
          <Card className="border-accent/15 bg-card/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-muted-foreground">Original Feature Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-foreground/95 whitespace-pre-wrap leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>

          {/* AI PRD Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="size-5 text-primary" />
              Product Requirements Document (PRD)
            </h2>

            {/* 1. PRD Generation Screen */}
            {!prd && !isGenerating && (
              <Card className="border-dashed border-primary/30 bg-primary/5 py-12 px-6 text-center max-w-2xl mx-auto rounded-xl">
                <CardHeader className="flex flex-col items-center">
                  <div className="p-4 bg-primary/10 rounded-full text-primary mb-4 animate-pulse">
                    <Sparkles className="size-10" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Generate PRD using ShipMate AI</CardTitle>
                  <CardDescription className="max-w-md mt-2">
                    We will analyze the feature request description and write a fully-featured PRD matching our database requirements including Goals, Edge Cases, Acceptance Criteria, and Implementation approach.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-4">
                  <Button type="button" size="lg" className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-95 text-white shadow-lg" onClick={(e) => handleGeneratePRD(e)}>
                    <Sparkles className="size-4 animate-spin" style={{ animationDuration: "3s" }} />
                    Generate PRD Draft
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 2. Generating Screen */}
            {isGenerating && (
              <Card className="border-accent/20 bg-card/40 backdrop-blur-md max-w-2xl mx-auto py-16 px-6 text-center rounded-xl relative overflow-hidden">
                {/* Spinning background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 animate-pulse" />
                <CardHeader className="flex flex-col items-center relative z-10">
                  <Loader2 className="size-14 text-primary animate-spin mb-6" />
                  <CardTitle className="text-2xl font-bold text-foreground">AI Product Manager Drafting...</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Generating comprehensive technical product parameters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-8 max-w-md mx-auto relative z-10">
                  <div className="space-y-4">
                    <div className="w-full bg-accent/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-1000"
                        style={{ width: `${((generationStep + 1) / steps.length) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-primary animate-pulse min-h-6">
                      {steps[generationStep]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. Reviewing Generated/Saved PRD */}
            {prd && (
              <div className="space-y-6">
                {/* Top notification banners */}
                {isDraft && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg gap-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="size-5 text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-yellow-600 dark:text-yellow-500">Unsaved PRD Draft</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          This PRD has been generated. Review or edit then click Approve to save to the database. Rejecting clears it.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="border-yellow-500/20 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/10" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? "View Draft" : "Edit Draft"}
                      </Button>
                      <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={(e) => handleApproveAndSave(e)}>
                        <Check className="size-4" />
                        Approve & Save
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleRejectDraft}>
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {!isDraft && !isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-card border-accent/20" onClick={() => setIsEditing(true)}>
                      <Edit className="size-4" />
                      Edit PRD
                    </Button>
                  </div>
                )}

                {/* Editing mode banner */}
                {isEditing && !isDraft && (
                  <div className="flex justify-between items-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <Edit className="size-4" />
                      <span>You are editing the PRD</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); populateEditFields(prd); }}>
                        Cancel
                      </Button>
                      <Button size="sm" className="gap-1" onClick={handleUpdatePersistedPRD}>
                        <Save className="size-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* PRD Main Tab UI */}
                {isEditing ? (
                  /* Editable Forms Layout */
                  <Card className="border-accent/15 bg-card/40 p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-problem">Problem Statement</Label>
                        <Textarea
                          id="edit-problem"
                          value={editProblemStatement}
                          onChange={(e) => setEditProblemStatement(e.target.value)}
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Goals List */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label>Goals</Label>
                            <Button type="button" variant="outline" size="xs" onClick={() => addArrayItem("goals")} className="text-xs">
                              + Add Goal
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {editGoals.map((goal, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={goal}
                                  onChange={(e) => handleArrayChange(idx, e.target.value, "goals")}
                                  placeholder="Describe a goal..."
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem(idx, "goals")} className="shrink-0 text-destructive">
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Non Goals List */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label>Non-Goals</Label>
                            <Button type="button" variant="outline" size="xs" onClick={() => addArrayItem("nonGoals")} className="text-xs">
                              + Add Non-Goal
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {editNonGoals.map((nonGoal, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={nonGoal}
                                  onChange={(e) => handleArrayChange(idx, e.target.value, "nonGoals")}
                                  placeholder="Describe what is out of scope..."
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem(idx, "nonGoals")} className="shrink-0 text-destructive">
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Stories List */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label>User Stories</Label>
                            <Button type="button" variant="outline" size="xs" onClick={() => addArrayItem("userStories")} className="text-xs">
                              + Add Story
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {editUserStories.map((story, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={story}
                                  onChange={(e) => handleArrayChange(idx, e.target.value, "userStories")}
                                  placeholder="As a [role], I want [action] so that [benefit]..."
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem(idx, "userStories")} className="shrink-0 text-destructive">
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Success Metrics List */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label>Success Metrics</Label>
                            <Button type="button" variant="outline" size="xs" onClick={() => addArrayItem("successMetrics")} className="text-xs">
                              + Add Metric
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {editSuccessMetrics.map((metric, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={metric}
                                  onChange={(e) => handleArrayChange(idx, e.target.value, "successMetrics")}
                                  placeholder="Describe how success is measured..."
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem(idx, "successMetrics")} className="shrink-0 text-destructive">
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-edgecases">Edge Cases</Label>
                        <Textarea
                          id="edit-edgecases"
                          value={editEdgeCases}
                          onChange={(e) => setEditEdgeCases(e.target.value)}
                          rows={4}
                          placeholder="List error handling, constraints, limits..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Acceptance Criteria */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label>Acceptance Criteria</Label>
                            <Button type="button" variant="outline" size="xs" onClick={() => addArrayItem("criteria")} className="text-xs">
                              + Add Criteria
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {editAcceptanceCriteria.map((criterion, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={criterion}
                                  onChange={(e) => handleArrayChange(idx, e.target.value, "criteria")}
                                  placeholder="e.g. User receives slack notification when feature request changes status"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem(idx, "criteria")} className="shrink-0 text-destructive">
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Implementation Approach */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label>Implementation Approach</Label>
                            <Button type="button" variant="outline" size="xs" onClick={() => addArrayItem("approach")} className="text-xs">
                              + Add Step
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {editImplementationApproach.map((step, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={step}
                                  onChange={(e) => handleArrayChange(idx, e.target.value, "approach")}
                                  placeholder="e.g. Set up a Webhook handler route in api/"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem(idx, "approach")} className="shrink-0 text-destructive">
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-content">Full Specifications Content (Markdown)</Label>
                        <Textarea
                          id="edit-content"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={12}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-accent/10">
                      {isDraft ? (
                        <Button type="button" onClick={(e) => handleApproveAndSave(e)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Approve & Save to DB
                        </Button>
                      ) : (
                        <Button onClick={handleUpdatePersistedPRD}>
                          Save Changes
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  /* High Fidelity View Tabs Layout */
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-5 bg-muted/50 border border-accent/10 rounded-lg p-1">
                      <TabsTrigger value="overview" className="gap-2"><Target className="size-4 shrink-0" />Overview</TabsTrigger>
                      <TabsTrigger value="requirements" className="gap-2"><ListChecks className="size-4 shrink-0" />Criteria</TabsTrigger>
                      <TabsTrigger value="implementation" className="gap-2"><Code className="size-4 shrink-0" />Approach</TabsTrigger>
                      <TabsTrigger value="specifications" className="gap-2"><FileText className="size-4 shrink-0" />Specifications</TabsTrigger>
                      <TabsTrigger value="pull-requests" className="gap-2"><GitPullRequest className="size-4 shrink-0" />Pull Requests</TabsTrigger>
                    </TabsList>

                    {/* Overview & Goals */}
                    <TabsContent value="overview" className="mt-6 space-y-6">
                      {/* Problem statement */}
                      <Card className="border-accent/15 bg-card/25 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-md font-semibold text-muted-foreground flex items-center gap-2">
                            <FileText className="size-4 text-primary" /> Problem Statement
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-base text-foreground/90 font-medium italic border-l-2 border-primary/50 pl-4">
                            "{prd.problemStatement}"
                          </p>
                        </CardContent>
                      </Card>

                      {/* Goals & Non Goals cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-accent/15 bg-card/25">
                          <CardHeader className="bg-emerald-500/5 py-3 px-6">
                            <CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                              <CheckCircle className="size-4" /> Goals
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 space-y-2">
                            {prd.goals && prd.goals.length > 0 ? (
                              prd.goals.map((g, i) => (
                                <div key={i} className="flex gap-2 items-start text-sm">
                                  <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{g}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No goals specified.</p>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="border-accent/15 bg-card/25">
                          <CardHeader className="bg-red-500/5 py-3 px-6">
                            <CardTitle className="text-sm font-bold text-red-500 dark:text-red-400 flex items-center gap-2">
                              <XCircle className="size-4" /> Non-Goals
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 space-y-2">
                            {prd.nonGoals && prd.nonGoals.length > 0 ? (
                              prd.nonGoals.map((ng, i) => (
                                <div key={i} className="flex gap-2 items-start text-sm">
                                  <X className="size-4 text-red-500 shrink-0 mt-0.5" />
                                  <span>{ng}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No non-goals specified.</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Requirements & Edge cases */}
                    <TabsContent value="requirements" className="mt-6 space-y-6">
                      {/* Acceptance criteria */}
                      <Card className="border-accent/15 bg-card/25">
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <ListChecks className="size-4 text-primary" /> Acceptance Criteria
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {prd.acceptanceCriteria && prd.acceptanceCriteria.length > 0 ? (
                            prd.acceptanceCriteria.map((c, i) => (
                              <div key={i} className="flex gap-3 items-start border-b border-accent/5 pb-2 last:border-0 last:pb-0">
                                <span className="p-1 bg-primary/10 text-primary rounded-full shrink-0 mt-0.5 text-xs font-mono w-5 h-5 flex items-center justify-center font-bold">
                                  {i + 1}
                                </span>
                                <span className="text-sm text-foreground/90">{c}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No criteria specified.</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Edge cases */}
                      <Card className="border-accent/15 bg-card/25">
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="size-4 text-yellow-500" /> Edge Cases & Constraints
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed pl-4 border-l-2 border-yellow-500/40">
                          {prd.edgeCases || "No edge cases mapped."}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Implementation approach */}
                    <TabsContent value="implementation" className="mt-6 space-y-6">
                      <Card className="border-accent/15 bg-card/25">
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Code className="size-4 text-primary" /> Recommended Implementation Steps
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {prd.implementationApproach && prd.implementationApproach.length > 0 ? (
                            prd.implementationApproach.map((step, i) => (
                              <div key={i} className="flex gap-3 items-start border-b border-accent/5 pb-2 last:border-0 last:pb-0">
                                <span className="p-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg shrink-0 mt-0.5 text-xs font-mono font-bold w-5 h-5 flex items-center justify-center">
                                  {i + 1}
                                </span>
                                <span className="text-sm text-foreground/90">{step}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No approach detailed.</p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Detailed Spec markdown view */}
                    <TabsContent value="specifications" className="mt-6">
                      <Card className="border-accent/15 bg-card/25 max-w-4xl mx-auto">
                        <CardHeader className="border-b border-accent/10 py-4 px-6 bg-accent/5">
                          <CardTitle className="text-md font-bold flex items-center gap-2">
                            <Layers className="size-4 text-primary" /> Product Specifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 bg-card/50">
                          <SimpleMarkdown content={prd.content} />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="pull-requests" className="mt-6 space-y-6">
                      {feature.pullRequests && feature.pullRequests.length > 0 ? (
                        feature.pullRequests.map((pr: any, i: number) => {
                          const isReviewed = pr.status === "reviewed" || pr.status === "merged";
                          const isFailed = pr.status === "needs_revision";
                          
                          return (
                            <Card key={pr.id || i} className="border-accent/15 bg-card/25 overflow-hidden shadow-sm">
                              <CardHeader className="bg-accent/5 py-4 px-6 border-b border-accent/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <GitPullRequest className="size-4 text-primary shrink-0" />
                                    <span className="font-bold text-sm text-foreground">PR #{pr.prNumber}: {pr.title}</span>
                                    <Badge className={
                                      pr.status === "merged" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                      isReviewed ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                      isFailed ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    }>
                                      {pr.status.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground">
                                    Repo: <span className="font-mono">{pr.repoFullName}</span> • Branch: <span className="font-mono">{pr.baseBranch}</span>
                                  </p>
                                </div>
                                <div className="text-right text-[11px] text-muted-foreground">
                                  {pr.reviewedAt ? `Reviewed: ${new Date(pr.reviewedAt).toLocaleString()}` : `Opened: ${new Date(pr.createdAt).toLocaleString()}`}
                                </div>
                              </CardHeader>
                              
                              <CardContent className="p-6 space-y-4">
                                {pr.reviewComment ? (
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                      <Sparkles className="size-3.5 text-primary" />
                                      AI Verification & Reviews Details
                                    </h4>
                                    <div className="bg-accent/5 border border-accent/10 rounded-lg p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed text-foreground/90 max-h-[350px] overflow-y-auto">
                                      {pr.reviewComment}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                                    <Clock className="size-8 mx-auto text-muted-foreground/40 animate-pulse" />
                                    <p className="font-semibold text-foreground">Pending verification scan...</p>
                                    <p className="text-[10px]">The AI code reviewer will scan code modifications when synced via webhook notifications.</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })
                      ) : (
                        <Card className="border-accent/15 bg-card/25 py-12 text-center space-y-3">
                          <GitPullRequest className="size-12 mx-auto text-muted-foreground/30 animate-pulse" />
                          <h3 className="text-sm font-semibold text-foreground">No Pull Requests Synced Yet</h3>
                          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Raise a Pull Request on GitHub matching this feature's codebase modifications to trigger automated verification and progress reporting.
                          </p>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}
          </div>

          {/* Implementation Tasks Card */}
          {!isDraft && prd && (
            <Card className="border-accent/15 bg-card/30 backdrop-blur-md">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Layers className="size-5 text-primary" />
                    Implementation Tasks
                  </CardTitle>
                  <CardDescription>
                    Actionable backlog generated from this PRD
                  </CardDescription>
                </div>
                {feature.tasks && feature.tasks.length > 0 && (
                  <Link 
                    href={`/dashboard/projects/${projectId}/kanban`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2 bg-card" })}
                  >
                    Go to Kanban Board <ArrowRight className="size-4" />
                  </Link>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isGeneratingTasks ? (
                  <div className="py-12 text-center space-y-3">
                    <Loader2 className="size-10 text-primary animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                      AI Architect is analyzing requirements and generating tasks...
                    </p>
                  </div>
                ) : feature.tasks && feature.tasks.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {feature.tasks.map((task: any, idx: number) => (
                      <div key={task.id || idx} className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/10 hover:border-accent/25 transition-all">
                        <span className="p-1 bg-primary/10 text-primary rounded-full shrink-0 text-xs font-bold w-5 h-5 flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-foreground">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-accent/20 rounded-lg bg-accent/5 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      No tasks have been generated for this PRD yet.
                    </p>
                    <Button type="button" onClick={(e) => handleGenerateTasks(e)} className="gap-2 bg-primary hover:bg-primary/95 text-white">
                      <Sparkles className="size-4" />
                      Generate Tasks with AI
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Status Progress Tracker (Right Column) - 1/4 width on desktop */}
        <div className="space-y-6 lg:sticky lg:top-8">
          {/* AI PRD Assistant Chat Box */}
          <Card className="border-accent/15 bg-card/35 backdrop-blur-md overflow-hidden shadow-md flex flex-col h-[400px]">
            <CardHeader className="bg-accent/5 py-3 px-4 border-b border-accent/10 flex flex-row items-center gap-2">
              <Sparkles className="size-4 text-primary animate-pulse" />
              <CardTitle className="text-sm font-bold text-foreground">AI PRD Assistant</CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-1 overflow-y-auto flex flex-col space-y-3 min-h-0">
              {!prd ? (
                <div className="flex-1 flex items-center justify-center text-center p-4 text-xs text-muted-foreground">
                  Chat will be enabled once the PRD is generated and approved.
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <Sparkles className="size-8 text-primary/40 animate-pulse" />
                  <p className="text-xs font-medium text-foreground">Ask follow-up questions to refine your specs</p>
                  <p className="text-[10px] text-muted-foreground">e.g., "Add PostgreSQL setup instructions" or "Add slack notification criteria"</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.role.toUpperCase() === "USER";
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col max-w-[85%] ${isUser ? "self-end items-end" : "self-start items-start"}`}
                    >
                      <div
                        className={`rounded-2xl px-3 py-2 text-xs leading-normal ${
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-accent/15 text-foreground rounded-tl-none border border-accent/10"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
                        {isUser ? "You" : "Assistant"}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
            {prd && (
              <CardFooter className="p-2 border-t border-accent/10 bg-accent/5">
                <form onSubmit={handleSendChatMessage} className="flex gap-2 w-full items-center">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AI to refine specs..."
                    className="h-8 text-xs bg-card border-accent/20 focus-visible:ring-primary flex-1"
                    disabled={isSendingChat}
                  />
                  <Button
                    type="submit"
                    size="xs"
                    disabled={isSendingChat || !chatInput.trim()}
                    className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center"
                  >
                    {isSendingChat ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                  </Button>
                </form>
              </CardFooter>
            )}
          </Card>

          <Card className="border-accent/15 bg-card/35 backdrop-blur-md overflow-hidden shadow-md">
            <CardHeader className="bg-accent/5 py-4 px-6 border-b border-accent/10">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="size-3.5 text-primary" />
                Feature Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Stepper Graphic */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-accent/20">
                {[
                  { label: "Submitted", desc: "Feature logged", val: 1 },
                  { label: "Analyzing", desc: "Context parsed by AI", val: 2 },
                  { label: "PRD Drafted", desc: "Specifications defined", val: 3 },
                  { label: "Approved", desc: "Tasks locked in DB", val: 4 },
                  { label: "Shipped", desc: "Feature live in prod", val: 5 }
                ].map((step, idx) => {
                  // Determine status order progress mapping
                  const getProgressLevel = (stat: string) => {
                    if (stat === "REJECTED") return -1;
                    if (stat === "SUBMITTED" || stat === "PENDING") return 1;
                    if (stat === "ANALYZING") return 2;
                    if (stat === "PRD_GENERATED" || stat === "TASKS_CREATED" || stat === "IN_REVIEW" || stat === "FIX_NEEDED") {
                      return 3;
                    }
                    if (stat === "APPROVED") return 4;
                    if (stat === "SHIPPED") return 5;
                    return 1;
                  };

                  const currentProgress = getProgressLevel(feature.status);
                  const isCompleted = currentProgress >= step.val;
                  const isCurrent = currentProgress === step.val;
                  
                  // Color tokens
                  let dotColor = "bg-accent/25 border-accent/40 text-muted-foreground";
                  let labelColor = "text-muted-foreground";
                  if (feature.status === "REJECTED") {
                    dotColor = "bg-red-500/20 border-red-500/40 text-red-500";
                    labelColor = "text-red-500 line-through";
                  } else if (isCompleted) {
                    dotColor = "bg-emerald-500 text-white border-emerald-600";
                    labelColor = "text-foreground font-semibold";
                  } else if (isCurrent) {
                    dotColor = "bg-primary text-primary-foreground border-primary animate-pulse";
                    labelColor = "text-primary font-bold";
                  }

                  return (
                    <div key={idx} className="relative flex gap-3 items-start text-xs group">
                      {/* Step Dot */}
                      <span className={`absolute left-[-21px] top-0.5 size-4 rounded-full border flex items-center justify-center font-mono text-[9px] font-bold z-10 transition-all duration-300 ${dotColor}`}>
                        {isCompleted && !isCurrent ? "✓" : step.val}
                      </span>
                      {/* Step Labels */}
                      <div className="flex flex-col">
                        <span className={`text-sm transition-colors duration-300 ${labelColor}`}>
                          {step.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Updater Select Action Control */}
              <div className="mt-8 pt-6 border-t border-accent/10 space-y-3">
                <Label htmlFor="status-select" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Update Status manually
                </Label>
                <Select
                  value={feature.status}
                  onValueChange={async (newStatus) => {
                    try {
                      setIsLoading(true);
                      const res = await fetch(`/api/projects/${projectId}/features-requests/${featureId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus }),
                      });

                      if (!res.ok) throw new Error("Failed to update status");
                      const updated = await res.json();
                      setFeature(updated);
                      toast.success(`Feature status changed to ${newStatus}`);
                    } catch (err) {
                      console.error(err);
                      toast.error("Could not update feature status");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <SelectTrigger id="status-select" className="bg-card/50 border-accent/20 h-9 text-xs">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="IN_DEVELOPMENT">In Development</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="CHANGES_REQUIRED">Changes Required</SelectItem>
                    <SelectItem value="READY_FOR_MERGE">Ready for Merge</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(() => {
                const latestPr = feature.pullRequests && feature.pullRequests.length > 0 ? feature.pullRequests[0] : null;
                if (latestPr) {
                  const match = latestPr.reviewComment ? latestPr.reviewComment.match(/(\d+)%/) : null;
                  const progressScore = match ? parseInt(match[1]) : 0;
                  return (
                    <div className="mt-6 pt-6 border-t border-accent/10 space-y-3">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
                        Linked PR Build Status
                      </span>
                      <div className="bg-accent/5 border border-accent/10 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-muted-foreground">PR #{latestPr.prNumber}</span>
                          <Badge className={
                            latestPr.status === "merged" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                            latestPr.status === "READY_FOR_MERGE" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            latestPr.status === "CHANGES_REQUIRED" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            latestPr.status === "FEATURE_INCOMPLETE" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            latestPr.status === "reviewed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }>
                            {latestPr.status.toUpperCase()}
                          </Badge>
                        </div>
                        {latestPr.reviewComment && latestPr.reviewComment.includes("%") && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-[11px] font-medium text-foreground/95">
                              <span>Verification Score</span>
                              <span>{progressScore}%</span>
                            </div>
                            <div className="w-full bg-accent/20 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${progressScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {feature.pullRequests && feature.pullRequests.length > 0 && feature.pullRequests[0].status !== "merged" && feature.pullRequests[0].status !== "closed" && (
                <div className="mt-4 pt-4 border-t border-accent/15 flex flex-col gap-2">
                  {(feature.pullRequests[0].status === "READY_FOR_MERGE" || feature.status === "READY_FOR_MERGE") && (
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 gap-1.5 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      disabled={isLoading}
                      onClick={async () => {
                        if (!confirm("Are you sure all tasks are complete and you want to merge this branch and ship it to production?")) return;
                        try {
                          setIsLoading(true);
                          const res = await fetch("/api/verification/ship", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ featureId }),
                          });
                          
                          const data = await res.json();
                          if (!res.ok) {
                            throw new Error(data.error || "Failed to ship feature");
                          }
                          
                          toast.success("Feature successfully merged and shipped to production!");
                          window.location.reload();
                        } catch (err: any) {
                          console.error(err);
                          toast.error(err.message || "Could not ship feature. Verify tasks are complete.");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      <CheckCircle className="size-4 animate-bounce" />
                      Ship Feature (Merge PR)
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive"
                    className="w-full font-semibold text-xs h-9 gap-1.5 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-[1.02]"
                    disabled={isLoading}
                    onClick={async () => {
                      if (!confirm("Are you sure you want to reject this feature? This will close the associated Pull Request.")) return;
                      try {
                        setIsLoading(true);
                        const res = await fetch("/api/verification/reject", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ featureId }),
                        });
                        
                        const data = await res.json();
                        if (!res.ok) {
                          throw new Error(data.error || "Failed to reject feature");
                        }
                        
                        toast.success("Feature rejected and PR closed.");
                        window.location.reload();
                      } catch (err: any) {
                        console.error(err);
                        toast.error(err.message || "Could not reject feature.");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    <XCircle className="size-4" />
                    Reject PR & Feature
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
