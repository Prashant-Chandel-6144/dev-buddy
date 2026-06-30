import { prisma } from "@/lib/db";
import { createTaskSchema, aiGeneratedTaskSchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/agent";
import { z } from "zod";
import { getServerSession } from "@/features/auth/actions";

export async function GET(request: Request, { params }: { params: { prdId: string } }) {
    try {
      const session = await getServerSession()
          if(!session){
            return NextResponse.json(
              { error: "Unauthorized" },
              { status: 401 },
            );
          }
        const { prdId } = await params;
        console.log("Fetching tasks for PRD ID:", prdId);
        
        // Find the PRD with project ownership check
        const prd = await prisma.pRD.findFirst({
            where: {
                id: prdId,
                featureRequest: {
                    project: {
                        workspace: {
                            userId: session.user.id
                        }
                    }
                }
            }
        });

        if (!prd) {
            return NextResponse.json({
                message: "PRD not found"
            }, {
                status: 404
            });
        }

        const tasks = await prisma.task.findMany({
            where: {
                featureRequestId: prd.featureRequestId
            },
            orderBy: {
                order: "asc"
            }
        });

        return NextResponse.json({
            message: "Tasks fetched successfully",
            tasks
        }, {
            status: 200
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "ERROR in fetching tasks",
            error: error instanceof Error ? error.message : error
        }, {
            status: 500
        });
    }
}

export async function POST(request: Request, { params }: { params: { prdId: string } }) {
    try {
      const session = await getServerSession()
    if(!session){
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
        const { prdId } = await params;
        console.log("Creating task for PRD ID:", prdId);

        // Find the PRD with project ownership check
        const prd = await prisma.pRD.findFirst({
            where: {
                id: prdId,
                featureRequest: {
                    project: {
                        workspace: {
                            userId: session.user.id
                        }
                    }
                }
            }
        });

        if (!prd) {
            return NextResponse.json({
                message: "PRD not found"
            }, {
                status: 404
            });
        }

        let body: any = {};
        try {
            const bodyText = await request.text();
            if (bodyText) {
                body = JSON.parse(bodyText);
            }
        } catch (err) {
            console.error("Failed to parse request body:", err);
        }

        if (body && body.title) {
            const { title, description, status = "TODO" } = body;
            const lastTask = await prisma.task.findFirst({
                where: { featureRequestId: prd.featureRequestId },
                orderBy: { order: "desc" },
            });
            const nextOrder = lastTask ? lastTask.order + 1 : 0;

            const manualTask = await prisma.task.create({
                data: {
                    title,
                    description,
                    status: status.toUpperCase(),
                    order: nextOrder,
                    featureRequestId: prd.featureRequestId,
                }
            });

            return NextResponse.json({
                message: "Task created successfully",
                task: manualTask
            }, { status: 201 });
        }

        // AI Generation Route: Check AI Credits
        const user = await prisma.user.findUnique({
          where: { id: session.user.id }
        });
        
        const credits = (user as any)?.aiCredits ?? 10;
        if (credits <= 0) {
          return NextResponse.json({ error: "Insufficient AI Credits. Please upgrade your plan." }, { status: 403 });
        }

        const prompt = `
You are a principal software engineer and systems architect.
Analyze the following Product Requirements Document (PRD) and generate the absolute best possible set of implementation tasks required to build this feature from scratch.

Break down the development workflow into highly actionable, modular, and logical tasks.
Include:
- Database schema changes or migrations (if any)
- API endpoint development and validations
- Frontend UI components, state management, and page layouts
- Third-party integrations or background jobs (if any)
- Unit tests, security controls, and verification steps

Each task must:
1. Have a concise, clear title.
2. Have a detailed description explaining exactly what needs to be implemented and any technical details/corner cases to watch out for.
3. Be sorted in logical execution order (prerequisites first).

PRD details:
- Problem Statement: "${prd.problemStatement}"
- Detailed specs:
${prd.content}

- Goals:
${prd.goals.map(g => `- ${g}`).join("\n")}

- Acceptance Criteria:
${prd.acceptanceCriteria.map(a => `- ${a}`).join("\n")}

- Implementation Approach:
${prd.implementationApproach.map(step => `- ${step}`).join("\n")}

Return ONLY valid JSON in this exact format:
{
  "data": [
    {
      "title": "Task title (e.g., 'Setup Prisma migrations for user table')",
      "description": "Detailed description of the action items and implementation guidelines."
    }
  ]
}
`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a senior software architect. Return ONLY valid JSON matching the exact schema requested.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const content = response.choices[0].message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate tasks" },
        { status: 500 },
      );
    }

    const aiGeneratedTasksSchema = z.object({
      data: z.array(aiGeneratedTaskSchema),
    });

    const parsed = aiGeneratedTasksSchema.safeParse(
      JSON.parse(content),
    );

    if (!parsed.success) {
      console.error("Failed to parse AI response:", parsed.error);
      return NextResponse.json(
        { error: "Failed to validate generated tasks" },
        { status: 500 },
      );
    }

    const generatedTasks = parsed.data.data;

    await prisma.task.createMany({
      data: generatedTasks.map((task, index) => ({
        title: task.title,
        description: task.description,
        status: "TODO", // matches Kanban board category
        order: index,
        featureRequestId: prd.featureRequestId,
      })),
    });

    await prisma.featureRequest.update({
      where: { id: prd.featureRequestId },
      data: { status: "TASKS_CREATED" },
    });

    // Deduct 1 AI Credit for AI Task Generation
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        aiCredits: {
          decrement: 1
        }
      } as any
    });

    return NextResponse.json(
      {
        message: "Tasks generated and created successfully",
        data: generatedTasks,
      },
      {
        status: 201,
      },
    );
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "ERROR in creating task",
            error: error instanceof Error ? error.message : error
        }, {
            status: 500
        });
    }
}
