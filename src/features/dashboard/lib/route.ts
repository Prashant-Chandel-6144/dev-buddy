export const DASHBOARD_ROUTES = {
  overview: "/dashboard",
  repos: "/dashboard/repos",
  pullRequest: "/dashboard/pull-request",
  github: "/dashboard/github",
  settings: "/dashboard/settings",
  projects: "/dashboard/projects",
  featureRequest: "/dashboard/feature-request",
  kanban: "/dashboard/kanban",
} as const;

export type DashboardRoute =
  (typeof DASHBOARD_ROUTES)[keyof typeof DASHBOARD_ROUTES];

export const DASHBOARD_NAV_ITEMS = [
  {
    title: "Overview",
    href: DASHBOARD_ROUTES.overview,
    icon: "layout-dashboard" as const,
  },
  {
    title: "Projects",
    href: DASHBOARD_ROUTES.projects,
    icon: "folder" as const,
  },
  {
    title: "Repositories",
    href: DASHBOARD_ROUTES.repos,
    icon: "git-branch" as const,
  },
  {
    title: "Kanban",
    href: DASHBOARD_ROUTES.kanban,
    icon: "layout-dashboard" as const,
  },
  {
    title: "Pull Requests",
    href: DASHBOARD_ROUTES.pullRequest,
    icon: "git-pull-request" as const,
  },
  {
    title: "Feature Requests",
    href: DASHBOARD_ROUTES.featureRequest,
    icon: "lightbulb" as const,
  },
  {
    title: "GitHub App",
    href: DASHBOARD_ROUTES.github,
    icon: "github" as const,
  },
  {
    title: "Settings",
    href: DASHBOARD_ROUTES.settings,
    icon: "settings" as const,
  },
] as const;