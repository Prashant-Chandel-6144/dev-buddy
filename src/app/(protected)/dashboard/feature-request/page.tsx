"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb, Search, Calendar, Folder, ArrowRight, Loader2, ClipboardList, CheckCircle2, LayoutList, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  createdAt: string;
  project: {
    name: string;
  };
}

export default function FeatureRequestsOverviewPage() {
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/feature-requests");
      if (!res.ok) throw new Error("Failed to fetch features");
      const data = await res.json();
      setFeatures(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load feature requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "SHIPPED":
        return "bg-teal-500/10 text-teal-500 border-teal-500/20";
      case "ANALYZING":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PRD_GENERATED":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const filteredFeatures = features.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.project.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || f.status.toUpperCase() === statusFilter.toUpperCase();
    
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
  const totalFeatures = features.length;
  const approvedFeatures = features.filter(f => f.status.toUpperCase() === "APPROVED").length;
  const inPlanning = features.filter(f => f.status.toUpperCase() === "ANALYZING" || f.status.toUpperCase() === "PRD_GENERATED").length;

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Product Backlog</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
          <Lightbulb className="size-8 text-primary" />
          Feature Requests Backlog
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review features requests across your projects, and use ShipMate AI to instantly generate PRD specs and backlog tasks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-accent/10 bg-card/25 backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-primary/10 rounded-lg text-primary">
            <LayoutList className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Total Backlog</CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">{totalFeatures}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Requests logged across all project spaces</p>
          </CardContent>
        </Card>

        <Card className="border-accent/10 bg-card/25 backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-purple-500/10 rounded-lg text-purple-500">
            <ClipboardList className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">In AI Planning</CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">{inPlanning}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Under active AI analysis and PRD scoping</p>
          </CardContent>
        </Card>

        <Card className="border-accent/10 bg-card/25 backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <CheckCircle className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Approved PRDs</CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">{approvedFeatures}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Approved specifications pushed to development</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features by title, details, or project..."
            className="pl-9 bg-card/30 border-accent/15 h-11 text-sm shadow-xs"
          />
        </div>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {["all", "submitted", "analyzing", "prd_generated", "approved", "shipped", "rejected"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="text-xs h-11 uppercase bg-card border-accent/15 px-3"
            >
              {status.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Features List */}
      {filteredFeatures.length === 0 ? (
        <Card className="border-dashed border-accent/30 bg-card/10 text-center py-20 px-6">
          <CardHeader className="flex flex-col items-center">
            <div className="p-4 bg-primary/5 rounded-full text-primary/70 mb-3 animate-pulse">
              <Lightbulb className="size-8" />
            </div>
            <CardTitle>No Feature Requests Found</CardTitle>
            <CardDescription className="max-w-md mt-1 text-xs">
              No features match your current search queries or filters. Try adjusting filters or select another category.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredFeatures.map((f) => (
            <Card key={f.id} className="border-accent/15 bg-card/35 backdrop-blur-md hover:border-primary/25 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                    <Folder className="size-3 text-primary shrink-0" />
                    {f.project.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(f.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-base font-bold mt-3 group-hover:text-primary transition-colors truncate">
                  {f.title}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-xs leading-relaxed mt-1.5 whitespace-pre-wrap">
                  {f.description}
                </CardDescription>
              </CardHeader>

              <CardFooter className="pt-4 border-t border-accent/5 mt-4 flex items-center justify-between gap-4">
                <Badge variant="outline" className={`capitalize px-2.5 py-0.5 text-[9px] font-bold tracking-wide ${getStatusBadgeColor(f.status)}`}>
                  {f.status.replace("_", " ")}
                </Badge>
                
                <Button size="sm" asChild className="gap-1.5 text-xs shadow-xs">
                  <Link href={`/dashboard/projects/${f.projectId}/features/${f.id}`}>
                    Process Feature <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
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
