import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const features = await prisma.featureRequest.findMany({
      where: {
        project: {
          workspace: {
            userId: session.user.id
          }
        }
      },
      include: {
        project: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ data: features }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching global feature requests:", error);
    return NextResponse.json({ error: "Failed to fetch feature requests" }, { status: 500 });
  }
}
