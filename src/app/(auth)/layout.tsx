import { requireUnAuth } from "@/features/auth/actions";
import { BackgroundGrid } from "@/components/ui/background-grid";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUnAuth()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <BackgroundGrid className="fixed inset-0 -z-10" />
      <div className="z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}