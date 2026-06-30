"use client";


import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { UserMenu, UserMenuUser } from "@/features/auth/components/user-menu";

type SidebarUserButtonProps = {
  user: UserMenuUser;
  plan?: string;
  aiCredits?: number;
};

export function SidebarUserButton({ user, plan, aiCredits }: SidebarUserButtonProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenu
          user={user}
          plan={plan}
          aiCredits={aiCredits}
          variant="profile"
          className="w-full [&_button]:h-12 [&_button]:w-full [&_button]:justify-start [&_button]:gap-2 [&_button]:px-2"
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}