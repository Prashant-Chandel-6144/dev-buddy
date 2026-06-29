import { prisma } from "@/lib/db";
import { updatePRDSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: { prdId: string } }) {
    try {
        const { prdId } = await params;
        console.log("Fetching PRD for PRD ID:", prdId);
        const prd = await prisma.pRD.findUnique({
            where: {
                id: prdId
            }
        });
        if (!prd) {
            return Response.json({
                message: "PRD not found",
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
        const body = await request.json()
        const { prdId } = await params

        const parsed = updatePRDSchema.safeParse(body);
        if (!parsed.success) {
            return Response.json({
                message: "Invalid PRD update data",
                errors: parsed.error.flatten()
            }, { status: 400 });
        }

        const existingPRD = await prisma.pRD.findUnique({
            where: { id: prdId }
        });
        if (!existingPRD) {
            return Response.json({
                message: "PRD not found"
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
        const { prdId } = await params;
        console.log("Deleting PRD for PRD ID:", prdId);

        const existingPRD = await prisma.pRD.findUnique({
            where: { id: prdId }
        });
        if (!existingPRD) {
            return Response.json({
                message: "PRD not found",
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