import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession()
    if(!session){
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    const installation = await prisma.githubInstallation.findUnique({
      where: { userId: session.user.id }
    });

    if (!installation) {
      return NextResponse.json([], { status: 200 });
    }

    const pullRequests = await prisma.pullRequest.findMany({
      where: { installationId: installation.installationId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pullRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch pull requests" },
      { status: 500 },
    );
  }
}
