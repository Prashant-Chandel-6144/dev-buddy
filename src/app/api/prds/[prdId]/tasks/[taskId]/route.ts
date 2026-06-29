import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { prdId: string, taskId: string } }) {
    try {
        const { prdId, taskId } = await params;
        console.log("Fetching task for PRD ID:", prdId, "and task ID:", taskId);
        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            }
        });
        if (!task) {
            return NextResponse.json({
                message: "Task not found"
            }, {
                status: 404
            });
        }
        return NextResponse.json({
            message: "Task fetched successfully",
            task
        }, {
            status: 200
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "ERROR in fetching task",
            error: error instanceof Error ? error.message : error
        }, {
            status: 500
        });
    }
}

export async function PATCH(request: Request, { params }: { params: { prdId: string, taskId: string } }) {
    try {
        const { prdId, taskId } = await params;
        console.log("Updating task for PRD ID:", prdId, "and task ID:", taskId);
        
        const body = await request.json();
        const { status, title, description } = body;

        const task = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: {
                ...(status !== undefined ? { status } : {}),
                ...(title !== undefined ? { title } : {}),
                ...(description !== undefined ? { description } : {}),
            }
        });

        if (!task) {
            return NextResponse.json({
                message: "Task not found"
            }, {
                status: 404
            });
        }
        return NextResponse.json({
            message: "Task updated successfully",
            task
        }, {
            status: 200
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "ERROR in updating task",
            error: error instanceof Error ? error.message : error
        }, {
            status: 500
        });
    }
}


export async function DELETE(request: Request, { params }: { params: { prdId: string, taskId: string } }) {
    try {
        const { prdId, taskId } = await params;
        console.log("Deleting task for PRD ID:", prdId, "and task ID:", taskId);
        
        const existingTask = await prisma.task.findUnique({
            where: { id: taskId }
        });
        if (!existingTask) {
            return NextResponse.json({
                message: "Task not found"
            }, {
                status: 404
            });
        }

        const task = await prisma.task.delete({
            where: {
                id: taskId,
            }
        });
        return NextResponse.json({
            message: "Task deleted successfully",
            task
        }, {
            status: 200
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "ERROR in deleting task",
            error: error instanceof Error ? error.message : error
        }, {
            status: 500
        });
    }
}