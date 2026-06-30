
import { requireAuth } from "@/features/auth/actions";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  
  const aiCredits = (user as any)?.aiCredits ?? 10;

  return (
    <DashboardShell user={session.user} plan="Pro" aiCredits={aiCredits}>
      {children}
    </DashboardShell>
  );
}