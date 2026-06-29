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
    const pullRequests = await prisma.pullRequest.findMany({
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
