"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  Folder,
  FolderOpen,
  Loader2,
  GitPullRequest,
  Lightbulb
} from "lucide-react";
import { RiGithubFill } from "@remixicon/react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { DASHBOARD_NAV_ITEMS, DashboardRoute } from "../lib/route";

const NAV_ICONS = {
  "layout-dashboard": LayoutDashboard,
  "git-branch": GitBranch,
  "git-pull-request": GitPullRequest,
  "lightbulb": Lightbulb,
  "folder": Folder,
  github: RiGithubFill,
  settings: Settings,
} as const;

function isNavActive(pathname: string, href: DashboardRoute) {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface Project {
  id: string;
  name: string;
}

export function DashboardNav() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json();
      })
      .then((data) => {
        setProjects(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading sidebar projects:", err);
        setLoading(false);
      });
  }, [pathname]); // Refresh list when navigating (e.g. creating a new project)

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {DASHBOARD_NAV_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.icon];
              const active = isNavActive(pathname, item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <Icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Projects Sidebar Section */}
      <SidebarGroup className="mt-2">
        <SidebarGroupLabel className="flex justify-between items-center">
          <span>Projects</span>
          {loading && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {projects.length === 0 ? (
              !loading && (
                <div className="px-3 py-2 text-xs text-muted-foreground italic">
                  No projects created yet.
                </div>
              )
            ) : (
              projects.map((project) => {
                const projectHref = `/dashboard/projects/${project.id}`;
                const active = pathname === projectHref || pathname.startsWith(`${projectHref}/`);
                const Icon = active ? FolderOpen : Folder;

                return (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      isActive={active && pathname !== `${projectHref}/kanban`}
                      tooltip={project.name}
                      render={<Link href={projectHref} />}
                    >
                      <Icon className="text-primary/75" />
                      <span className="truncate">{project.name}</span>
                    </SidebarMenuButton>
                    
                    {active && (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={pathname === projectHref}
                            render={<Link href={projectHref} />}
                          >
                            <span>Feature Requests</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={pathname === `${projectHref}/kanban`}
                            render={<Link href={`${projectHref}/kanban`} />}
                          >
                            <span>Kanban Board</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}