import { getServerSession } from "@/features/auth/actions";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/route";
import { saveInstallation } from "@/features/github/server/installation";
import { redirect } from "next/navigation";

function buildSignInCallbackUrl(installationId: string | null): string {
  if (installationId) {
    return `/api/github/callback?installation_id=${installationId}`;
  }

  return DASHBOARD_ROUTES.github;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const installationId = searchParams.get("installation_id");
  const session = await getServerSession();

  if (!session) {
    const callbackUrl = buildSignInCallbackUrl(installationId);
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (installationId) {
    await saveInstallation(session.user.id, Number(installationId));
  }

  redirect(DASHBOARD_ROUTES.github);
}
