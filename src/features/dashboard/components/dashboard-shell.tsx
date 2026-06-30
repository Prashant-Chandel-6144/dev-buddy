
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { UserMenuUser } from "@/features/auth/components/user-menu";

type DashboardShellProps = {
  children: React.ReactNode;
  user: UserMenuUser;
  plan?: string;
  aiCredits?: number;
};

export function DashboardShell({
  children,
  user,
  plan,
  aiCredits,
}: DashboardShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar user={user} plan={plan} aiCredits={aiCredits} />
        <SidebarInset className="min-h-svh">{children}</SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}