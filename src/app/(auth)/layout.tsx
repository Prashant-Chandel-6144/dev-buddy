import { requireUnAuth } from "@/features/auth/actions";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUnAuth()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 grain grid-container">
      {/* Top warm spotlight */}
      <div className="gena-spotlight" />
      
      {/* Absolute blueprint lines */}
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] pointer-events-none border-x border-border/10">
        <div className="blueprint-line-v left-1/4" />
        <div className="blueprint-line-v right-1/4" />
      </div>

      <div className="z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}