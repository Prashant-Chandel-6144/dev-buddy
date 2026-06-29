import { getOpenAIClient } from "@/lib/agent";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { aiPRDResponseSchema, createPRDSchema, updatePRDSchema } from "@/lib/validations";
import { getServerSession } from "@/features/auth/actions";

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if(!session){
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    // Parse featureId from URL query parameters (e.g. /api/prds?featureId=xyz)
    const { searchParams } = new URL(request.url);
    const featureId = searchParams.get("featureId");

    if (!featureId) {
      return NextResponse.json(
        { message: "featureId query parameter is required" },
        { status: 400 }
      );
    }

    console.log("Fetching PRD for feature ID:", featureId);

    // Query using the unique field 'featureRequestId'
    const prd = await prisma.pRD.findUnique({
      where: {
        featureRequestId: featureId,
      },
    });

    if (!prd) {
      return NextResponse.json(
        { message: "PRD not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "PRD fetched successfully",
        prd,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "ERROR in fetching PRD",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if(!session){
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    const body = await request.json();
    const { featureId, action = "save", prdData } = body;

    if (!featureId) {
      return NextResponse.json(
        { error: "featureId is required" },
        { status: 400 }
      );
    }

    // 2. Get the feature request
    const feature = await prisma.featureRequest.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      return NextResponse.json(
        { error: "Feature not found" },
        { status: 404 }
      );
    }

    if (action === "generate") {
      let client;
      try {
        client = getOpenAIClient();
      } catch (err) {
        return NextResponse.json(
          { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to your .env file." },
          { status: 503 }
        );
      }

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a senior product manager. Generate a comprehensive PRD (Product Requirements Document) from the given feature request. Return ONLY valid JSON matching the exact schema provided.",
          },
          {
            role: "user",
            content: `Generate a PRD from the following feature request.

Title: ${feature.title}

Description: ${feature.description}

Return ONLY JSON in this exact format:
{
  "problemStatement": "A detailed problem statement (at least 10 characters) explaining why we need this feature and what pain points it addresses",
  "edgeCases": "Detailed description in markdown of edge cases, error states, constraints, and how they should be handled",
  "goals": ["goal 1", "goal 2", "goal 3"],
  "nonGoals": ["non-goal 1", "non-goal 2"],
  "acceptanceCriteria": ["criterion 1", "criterion 2", "criterion 3"],
  "implementationApproach": ["approach item 1", "approach item 2"],
  "content": "Detailed PRD content in markdown including user stories, feature specifications, metrics, and timeline"
}`,
          },
        ],
      });

      const aiResponse = response.choices[0].message?.content;
      if (!aiResponse) {
        return NextResponse.json(
          { error: "No response from AI" },
          { status: 500 }
        );
      }

      // Parse and validate the AI response
      let parsedAIResponse;
      try {
        parsedAIResponse = JSON.parse(aiResponse);
      } catch {
        return NextResponse.json(
          { error: "AI returned invalid JSON" },
          { status: 500 }
        );
      }

      const validated = aiPRDResponseSchema.safeParse(parsedAIResponse);
      if (!validated.success) {
        return NextResponse.json(
          { error: "AI returned invalid PRD format", details: validated.error.flatten() },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: "PRD generated successfully (not saved)",
          prd: validated.data,
        },
        { status: 200 }
      );
    } else if (action === "save") {
      // Validate the data to be saved
      const parsed = createPRDSchema.safeParse({
        ...prdData,
        featureRequestId: featureId,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid PRD data", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      // Check if PRD already exists for this feature
      const existingPRD = await prisma.pRD.findUnique({
        where: { featureRequestId: featureId },
      });

      let savedPRD;
      if (existingPRD) {
        savedPRD = await prisma.pRD.update({
          where: { featureRequestId: featureId },
          data: {
            problemStatement: parsed.data.problemStatement,
            edgeCases: parsed.data.edgeCases,
            goals: parsed.data.goals,
            nonGoals: parsed.data.nonGoals,
            acceptanceCriteria: parsed.data.acceptanceCriteria,
            implementationApproach: parsed.data.implementationApproach,
            content: parsed.data.content,
            status: parsed.data.status || "approved",
          },
        });
      } else {
        savedPRD = await prisma.pRD.create({
          data: {
            featureRequestId: featureId,
            problemStatement: parsed.data.problemStatement,
            edgeCases: parsed.data.edgeCases,
            goals: parsed.data.goals,
            nonGoals: parsed.data.nonGoals,
            acceptanceCriteria: parsed.data.acceptanceCriteria,
            implementationApproach: parsed.data.implementationApproach,
            content: parsed.data.content,
            status: parsed.data.status || "approved",
          },
        });
      }

      // Update the feature request status
      await prisma.featureRequest.update({
        where: { id: featureId },
        data: { status: "APPROVED" },
      });

      return NextResponse.json(
        {
          message: "PRD saved and approved successfully",
          prd: savedPRD,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid action. Supported actions: generate, save." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "ERROR in processing PRD",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()
    if(!session){
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    const body = await request.json();
    const { featureId, prdData } = body;

    if (!featureId) {
      return NextResponse.json(
        { error: "featureId is required" },
        { status: 400 }
      );
    }

    const existingPRD = await prisma.pRD.findUnique({
      where: { featureRequestId: featureId },
    });

    if (!existingPRD) {
      return NextResponse.json(
        { error: "PRD not found. Save/Create it first." },
        { status: 404 }
      );
    }

    const parsed = updatePRDSchema.safeParse(prdData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updatedPRD = await prisma.pRD.update({
      where: { featureRequestId: featureId },
      data: {
        ...(parsed.data.problemStatement !== undefined ? { problemStatement: parsed.data.problemStatement } : {}),
        ...(parsed.data.edgeCases !== undefined ? { edgeCases: parsed.data.edgeCases } : {}),
        ...(parsed.data.goals !== undefined ? { goals: parsed.data.goals } : {}),
        ...(parsed.data.nonGoals !== undefined ? { nonGoals: parsed.data.nonGoals } : {}),
        ...(parsed.data.acceptanceCriteria !== undefined ? { acceptanceCriteria: parsed.data.acceptanceCriteria } : {}),
        ...(parsed.data.implementationApproach !== undefined ? { implementationApproach: parsed.data.implementationApproach } : {}),
        ...(parsed.data.content !== undefined ? { content: parsed.data.content } : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      },
    });

    return NextResponse.json(
      {
        message: "PRD updated successfully",
        prd: updatedPRD,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "ERROR in updating PRD",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

