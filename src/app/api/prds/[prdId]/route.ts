import { getServerSession } from "@/features/auth/actions";
import { prisma } from "@/lib/db";
import { updatePRDSchema } from "@/lib/validations";
import { getOpenAIClient } from "@/lib/agent";

export async function GET(request: Request, { params }: { params: { prdId: string } }) {
    try {
        const session = await getServerSession()
        if (!session) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }
        const { prdId } = await params;
        console.log("Fetching PRD for PRD ID:", prdId);
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
            return Response.json({
                message: "PRD not found or unauthorized",
                prd: null
            }, {
                status: 404
            })
        }
        return Response.json({
            message: "PRD fetched successfully",
            prd
        }, {
            status: 200
        });
    } catch (error) {
        console.log(error)
        return Response.json({
            message: "ERROR in fetching PRD",
            error: error instanceof Error ? error.message : error
        }, {
            status: 500
        })
    }
}



export async function PATCH(request: Request, { params }: { params: { prdId: string } }) {
    try {
        const session = await getServerSession()
        if (!session) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }
        const body = await request.json()
        const { prdId } = await params

        const parsed = updatePRDSchema.safeParse(body);
        if (!parsed.success) {
            return Response.json({
                message: "Invalid PRD update data",
                errors: parsed.error.flatten()
            }, { status: 400 });
        }

        const existingPRD = await prisma.pRD.findFirst({
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
        if (!existingPRD) {
            return Response.json({
                message: "PRD not found or unauthorized"
            }, { status: 404 })
        }

        const updatedData: any = {};
        if (parsed.data.problemStatement !== undefined) updatedData.problemStatement = parsed.data.problemStatement;
        if (parsed.data.edgeCases !== undefined) updatedData.edgeCases = parsed.data.edgeCases;
        if (parsed.data.goals !== undefined) updatedData.goals = parsed.data.goals;
        if (parsed.data.nonGoals !== undefined) updatedData.nonGoals = parsed.data.nonGoals;
        if (parsed.data.acceptanceCriteria !== undefined) updatedData.acceptanceCriteria = parsed.data.acceptanceCriteria;
        if (parsed.data.implementationApproach !== undefined) updatedData.implementationApproach = parsed.data.implementationApproach;
        if (parsed.data.content !== undefined) updatedData.content = parsed.data.content;
        if (parsed.data.status !== undefined) updatedData.status = parsed.data.status;

        const prd = await prisma.pRD.update({
            where: {
                id: prdId
            },
            data: updatedData
        })

        // Synchronize Kanban tasks dynamically with the updated PRD
        const currentTasks = await prisma.task.findMany({
            where: { featureRequestId: prd.featureRequestId },
            orderBy: { order: "asc" }
        });

        if (currentTasks.length > 0) {
            try {
                const client = getOpenAIClient();
                const taskPrompt = `
You are a senior software architect.
We have updated the Product Requirements Document (PRD) for a feature. Below are the current implementation tasks on the Kanban board.
Analyze the updated PRD and the current tasks. Determine if any new tasks need to be added, if existing tasks need to be modified, or if obsolete tasks need to be removed to align with the updated PRD.

Instructions:
1. Preserve the task IDs and status of existing tasks if they are still relevant. Do not change their status.
2. If it is an existing task that is still relevant, keep its 'id' and 'status' exactly as is. You may refine its 'title' or 'description' if the updated PRD alters its requirements.
3. If it is a new task, set 'id' to null (or omit it) and set 'status' to 'TODO'.
4. If an existing task is no longer relevant, do NOT include it in the returned array.

Current Tasks:
${JSON.stringify(currentTasks.map(t => ({ id: t.id, title: t.title, description: t.description, status: t.status })))}

Updated PRD specs:
- Problem Statement: "${prd.problemStatement}"
- Detailed specs:
${prd.content}

- Goals:
${prd.goals.map(g => `- ${g}`).join("\n")}

- Acceptance Criteria:
${prd.acceptanceCriteria.map(a => `- ${a}`).join("\n")}

Return ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "id": "existing-task-id-or-null",
      "title": "Task title",
      "description": "Task description",
      "status": "TODO"
    }
  ]
}
`;

                const aiResponse = await client.chat.completions.create({
                    model: "gpt-4o-mini",
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: "system",
                            content: "You are a senior software architect. Return ONLY valid JSON matching the exact schema requested.",
                        },
                        {
                            role: "user",
                            content: taskPrompt,
                        },
                    ],
                });

                const content = aiResponse.choices[0].message?.content;
                if (content) {
                    const parsedData = JSON.parse(content);
                    const updatedTasksList = parsedData.tasks || [];

                    const returnedIds = new Set(updatedTasksList.map((t: any) => t.id).filter(Boolean));
                    const tasksToDelete = currentTasks.filter(t => !returnedIds.has(t.id));

                    // Execute database changes in transaction
                    await prisma.$transaction([
                        // 1. Delete removed tasks
                        ...(tasksToDelete.length > 0 ? [
                            prisma.task.deleteMany({
                                where: { id: { in: tasksToDelete.map(t => t.id) } }
                            })
                        ] : []),
                        // 2. Update existing tasks
                        ...updatedTasksList.filter((t: any) => t.id).map((t: any) => 
                            prisma.task.update({
                                where: { id: t.id },
                                data: {
                                    title: t.title,
                                    description: t.description,
                                }
                            })
                        ),
                        // 3. Create new tasks
                        ...(updatedTasksList.filter((t: any) => !t.id).length > 0 ? [
                            prisma.task.createMany({
                                data: updatedTasksList.filter((t: any) => !t.id).map((t: any, idx: number) => ({
                                    title: t.title,
                                    description: t.description,
                                    status: "TODO",
                                    order: currentTasks.length + idx,
                                    featureRequestId: prd.featureRequestId
                                }))
                            })
                        ] : [])
                    ]);
                }
            } catch (err) {
                console.error("Failed to dynamically update tasks with PRD changes:", err);
            }
        }

        return Response.json({
            message: "PRD updated successfully",
            data: prd
        }, {
            status: 200
        })
    } catch (error) {
        console.log(error)
        return Response.json({
            message: "ERROR in updating PRD",
            error: error instanceof Error ? error.message : error
        }, {
            status: 500
        })
    }

}


export async function DELETE(request: Request, { params }: { params: { prdId: string } }) {
    try {
        const session = await getServerSession()
        if (!session) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }
        const { prdId } = await params;
        console.log("Deleting PRD for PRD ID:", prdId);

        const existingPRD = await prisma.pRD.findFirst({
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
        if (!existingPRD) {
            return Response.json({
                message: "PRD not found or unauthorized",
                prd: null
            }, {
                status: 404
            })
        }

        const prd = await prisma.pRD.delete({
            where: {
                id: prdId
            }
        });
        return Response.json({
            message: "PRD deleted successfully",
            prd
        }, {
            status: 200
        });

    } catch (error) {
        console.log(error)
        return Response.json({
            message: "ERROR in deleting PRD",
            error: error instanceof Error ? error.message : error
        }, {
            status: 500
        })
    }

}
