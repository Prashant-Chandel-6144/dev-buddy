import { getServerSession } from "@/features/auth/actions"
import { prisma } from "@/lib/db"
import { createMessageSchema } from "@/lib/validations/message"
import { getOpenAIClient } from "@/lib/agent"
import { aiPRDResponseSchema } from "@/lib/validations/prd"

export async function GET(request:Request,{params}:{params:{featureId:string,projectId:string}}){
  try{
    const session = await getServerSession()
    if(!session){
      return Response.json({error:"Unauthorized"},{status:401})
    }
    const {featureId,projectId} = await params
    if(!featureId){
      return Response.json({error:"Feature ID is required"},{status:400})
    }
    if(!projectId){
      return Response.json({error:"Project ID is required"},{status:400})
    }
    const userIdWithSession = session.user.id
    const existingProject = await prisma.project.findFirst({
      where:{
        id:projectId,
        workspace:{
          userId:userIdWithSession
        }
      }
    });
    if(!existingProject){
      return Response.json({error:"Project not found"},{status:404})
    }
    const existingFeature = await prisma.featureRequest.findFirst({
      where:{
        id:featureId,
        projectId:projectId,
        project:{
          workspace:{
            userId:userIdWithSession
          }
        }
      }
    });
    if(!existingFeature){
      return Response.json({error:"Feature not found"},{status:404})
    }
    const messages = await prisma.message.findMany({
      where:{
        featureRequestId:featureId,
      },
      orderBy: {
        createdAt: "asc"
      }
    });
    return Response.json(messages,{status:200})
  }catch(error){
    console.error(error)
    return Response.json({error:"Failed to fetch messages"},{status:500})
  }
}

export async function POST(request:Request,{params}:{params:{featureId:string,projectId:string}}) {
  try{
    const session = await getServerSession()
    if(!session){
      return Response.json({error:"Unauthorized"},{status:401})
    }
    const {featureId,projectId} = await params
    if(!featureId){
      return Response.json({error:"Feature ID is required"},{status:400})
    }
    if(!projectId){
      return Response.json({error:"Project ID is required"},{status:400})
    }
    const userIdWithSession = session.user.id
    const existingProject = await prisma.project.findFirst({
      where:{
        id:projectId,
        workspace:{
          userId:userIdWithSession
        }
      }
    });
    if(!existingProject){
      return Response.json({error:"Project not found"},{status:404})
    }
    const existingFeature = await prisma.featureRequest.findFirst({
      where:{
        id:featureId,
        projectId:projectId,
        project:{
          workspace:{
            userId:userIdWithSession
          }
        }
      }
    });
    if(!existingFeature){
      return Response.json({error:"Feature not found"},{status:404})
    }

    const existingPrd = await prisma.pRD.findUnique({
      where: { featureRequestId: featureId },
    });
    if (!existingPrd) {
      return Response.json({ error: "No PRD found to refine. Generate a PRD first." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createMessageSchema.safeParse(body);
    if(!parsed.success){
      return Response.json({error:parsed.error},{status:400})
    }

    // 1. Log the new user message to the database
    const userMessage = await prisma.message.create({
      data:{
        role: parsed.data.role,
        content: parsed.data.content,
        featureRequestId: featureId,
      }
    });

    // 2. Fetch all messages sorted chronologically to build conversation context
    const allMessages = await prisma.message.findMany({
      where: {
        featureRequestId: featureId,
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const openAiMessages = allMessages.map((m) => ({
      role: m.role.toLowerCase() === "user" ? "user" as const : "assistant" as const,
      content: m.content
    }));

    // 3. Initialize OpenAI and prompt it to update the PRD based on history
    const openai = getOpenAIClient();

    const systemPrompt = `You are a principal product manager. You are updating an existing PRD (Product Requirements Document) based on user follow-up questions/instructions.
Below is the current state of the PRD:
- Problem Statement: "${existingPrd.problemStatement}"
- Goals:
${existingPrd.goals.map(g => `- ${g}`).join("\n")}
- Non-Goals:
${existingPrd.nonGoals.map(ng => `- ${ng}`).join("\n")}
- Acceptance Criteria:
${existingPrd.acceptanceCriteria.map(ac => `- ${ac}`).join("\n")}
- Implementation Approach:
${existingPrd.implementationApproach.map(ia => `- ${ia}`).join("\n")}
- Detailed Specs:
${existingPrd.content}

Listen to the conversation history and refine the PRD accordingly. Return ONLY a valid JSON object matching the requested schema. Do not include markdown wraps around the JSON.
Required Schema:
{
  "problemStatement": "Refined problem statement text",
  "edgeCases": "Refined edge cases markdown",
  "goals": ["goal 1", "goal 2"],
  "nonGoals": ["non-goal 1"],
  "acceptanceCriteria": ["criterion 1"],
  "implementationApproach": ["approach 1"],
  "content": "Refined detailed PRD markdown content"
}
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        ...openAiMessages
      ],
      max_tokens:1000,
      
    });

    const aiText = aiResponse.choices[0].message?.content;
    if (!aiText) {
      throw new Error("No response from OpenAI");
    }

    const updatedPrdData = JSON.parse(aiText);
    const validated = aiPRDResponseSchema.safeParse(updatedPrdData);
    if (!validated.success) {
      return Response.json({ error: "AI returned invalid PRD schema structure", details: validated.error.flatten() }, { status: 500 });
    }

    // 4. Update the PRD in the database
    const updatedPrd = await prisma.pRD.update({
      where: { featureRequestId: featureId },
      data: {
        problemStatement: validated.data.problemStatement,
        edgeCases: validated.data.edgeCases,
        goals: validated.data.goals,
        nonGoals: validated.data.nonGoals,
        acceptanceCriteria: validated.data.acceptanceCriteria,
        implementationApproach: validated.data.implementationApproach,
        content: validated.data.content,
      }
    });

    // 5. Write the assistant confirmation message to DB
    const assistantMessage = await prisma.message.create({
      data: {
        role: "ASSISTANT",
        content: `I've successfully updated the PRD based on your instructions. Let me know if you need any other modifications!`,
        featureRequestId: featureId,
      }
    });

    return Response.json({
      message: userMessage,
      assistantMessage: assistantMessage,
      prd: updatedPrd
    }, { status: 200 });

  }catch(error){
    console.error(error)
    return Response.json({error: error instanceof Error ? error.message : "Failed to process message"},{status:500})
  }
}

