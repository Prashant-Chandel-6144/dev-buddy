"use client";

import React, { useEffect, useState } from "react";
import { GitPullRequest, Search, CheckCircle2, AlertCircle, Clock, Eye, Loader2, GitBranch, MessageSquare, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PullRequest {
  id: string;
  repoFullName: string;
  prNumber: number;
  title: string;
  authorLogin: string | null;
  status: string;
  reviewComment: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export default function PullRequestsOverviewPage() {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPRs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/pull-requests");
      if (!res.ok) throw new Error("Failed to fetch pull requests");
      const data = await res.json();
      setPullRequests(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load pull requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPRs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "reviewed":
        return (
          <Badge variant="default" className="bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/10 gap-1 border-emerald-500/20 text-[10px] font-bold">
            <CheckCircle2 className="size-3" /> Reviewed
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10 gap-1 border-blue-500/20 text-[10px] font-bold">
            <Loader2 className="size-3 animate-spin" /> Reviewing...
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-500 bg-amber-500/5 gap-1 border-amber-500/20 text-[10px] font-bold">
            <Clock className="size-3" /> Pending Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px] font-bold">
            <AlertCircle className="size-3" /> {status}
          </Badge>
        );
    }
  };

  const filteredPRs = pullRequests.filter((pr) => {
    const matchesSearch = pr.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pr.repoFullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background">
        <Loader2 className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  // Count helper stats
  const totalPRsCount = pullRequests.length;
  const reviewedPRsCount = pullRequests.filter(pr => pr.status === "reviewed").length;
  const pendingPRsCount = pullRequests.filter(pr => pr.status === "pending" || pr.status === "processing").length;

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">GitHub Integration</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
          <GitPullRequest className="size-8 text-primary" />
          Pull Requests AI Reviews
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review automated AI comments, suggestions, and security analysis for incoming pull requests.
        </p>
      </div>

      {/* PR Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-accent/10 bg-card/25 backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-primary/10 rounded-lg text-primary">
            <GitPullRequest className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Synced PRs</CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">{totalPRsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Total webhook pull request events logged</p>
          </CardContent>
        </Card>

        <Card className="border-accent/10 bg-card/25 backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <ShieldCheck className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">AI Reviewed</CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">{reviewedPRsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Successfully processed and review completed</p>
          </CardContent>
        </Card>

        <Card className="border-accent/10 bg-card/25 backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <Clock className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Pending Analysis</CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">{pendingPRsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Awaiting review triggers or currently parsing</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PRs by title or repository..."
            className="pl-9 bg-card/30 border-accent/15 h-11 text-sm shadow-xs"
          />
        </div>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {["all", "pending", "processing", "reviewed"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="text-xs h-11 capitalize bg-card border-accent/15 px-4"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Pull Requests List */}
      {filteredPRs.length === 0 ? (
        <Card className="border-dashed border-accent/30 bg-card/10 text-center py-20 px-6">
          <CardHeader className="flex flex-col items-center">
            <div className="p-4 bg-primary/5 rounded-full text-primary/70 mb-3 animate-pulse">
              <GitPullRequest className="size-8" />
            </div>
            <CardTitle>No Pull Requests Synced</CardTitle>
            <CardDescription className="max-w-md mt-1 text-xs">
              Connect your repositories via the GitHub App integration to trigger automatic AI reviews on new Pull Requests.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPRs.map((pr) => (
            <Card key={pr.id} className="border-accent/15 bg-card/30 backdrop-blur-md hover:border-primary/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono bg-accent/10 px-2 py-0.5 rounded-sm border border-accent/5">
                      <GitBranch className="size-3 text-primary" />
                      {pr.repoFullName}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground/80">
                      PR #{pr.prNumber}
                    </span>
                    {getStatusBadge(pr.status)}
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {pr.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Author: <span className="font-semibold text-foreground/80">{pr.authorLogin || "Unknown"}</span> • Synced on {new Date(pr.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {pr.reviewComment ? (
                    <Dialog>
                      <DialogTrigger render={
                        <Button variant="outline" size="sm" className="gap-1.5 bg-card text-xs border-accent/20 hover:border-primary/40 hover:text-primary">
                          <Eye className="size-4" /> View AI Feedback
                        </Button>
                      } />
                      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-md font-bold">
                            <MessageSquare className="size-5 text-primary" />
                            AI Review Report (PR #{pr.prNumber})
                          </DialogTitle>
                          <DialogDescription>
                            Review generated feedback, architectural notes, and refactoring guidelines.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-5 border-t border-accent/10 mt-3 font-mono text-[11px] text-foreground/90 leading-relaxed bg-black/40 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap select-all border border-accent/5">
                          {pr.reviewComment}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button variant="ghost" size="sm" disabled className="text-xs text-muted-foreground">
                      No Review Report
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
