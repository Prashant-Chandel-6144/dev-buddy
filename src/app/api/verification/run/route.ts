import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { runImplementationVerification } from "@/features/verification/server/verification-agent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { featureId, pullRequestId } = body;

    let targetPrId = pullRequestId;

    if (!targetPrId && featureId) {
      // Find associated PullRequest for the given feature request ID
      const prs = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "pull_request" WHERE "featureRequestId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
        featureId
      );
      const pr = prs[0] || null;

      if (!pr) {
        return NextResponse.json(
          { error: "No pull request associated with the specified feature request ID" },
          { status: 404 }
        );
      }
      targetPrId = pr.id;
    }

    if (!targetPrId) {
      return NextResponse.json(
        { error: "Specify either featureId or pullRequestId in request payload" },
        { status: 400 }
      );
    }

    const verificationResult = await runImplementationVerification(targetPrId);

    return NextResponse.json(
      { message: "Verification completed successfully", result: verificationResult },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error running implementation verification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run implementation verification" },
      { status: 500 }
    );
  }
}
