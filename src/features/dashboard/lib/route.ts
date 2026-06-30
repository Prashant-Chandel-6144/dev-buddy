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