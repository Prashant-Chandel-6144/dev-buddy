import { generateText } from "ai";
import { openrouter } from "@/features/ai"

const REVIEW_MODEL = "openrouter/free"

const SYSTEM_PROMPT = `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.

Review the provided unified diff chunks and write a concise, actionable pull request review in markdown.

## Review Checklist

Analyze the changes across these dimensions (only mention what's relevant):

- **PRD Alignment** — Does the code actually implement the Acceptance Criteria and User Stories?
- **Task Verification** — Does this complete the stated Engineering Tasks?
- **Correctness** — Bugs, logic errors, off-by-one errors, incorrect assumptions
- **Security** — Injection risks, auth issues, exposed secrets, unsafe deserialization, unvalidated input
- **Performance** — Unnecessary loops, missing indexes, N+1 queries, memory leaks
- **Reliability** — Unhandled errors/edge cases, missing null checks, race conditions
- **Readability** — Naming clarity, overly complex logic, missing comments on non-obvious code
- **Maintainability** — Tight coupling, duplication, violations of SOLID/DRY principles


## Output Format

Start with a **one-line summary** of the overall change quality.

Then use this structure if there are findings:

### ✅ What looks good
(skip if nothing notable)

### ⚠️ Suggestions
(non-blocking improvements)

### 🚨 Issues
(bugs, security problems, or breaking changes that should be fixed)

## Guidelines

- Be specific: reference the relevant code, function names, or line context
- Be constructive: explain *why* something is a problem and suggest a fix
- Be proportional: don't nitpick minor style issues if there are real bugs
- If the diff looks clean with no concerns, say so clearly in 1–2 sentences — do not invent problems
- Tailor feedback to the repository language and conventions visible in the diff

## Structured Output Requirements

At the very end of your response, you MUST output a JSON block inside a \`\`\`json code block containing the structured review data so the system can parse it programmatically.
Format of the JSON block:
\`\`\`json
{
  "blockingIssues": ["issue 1", "issue 2"],
  "nonBlockingIssues": ["suggestion 1", "suggestion 2"],
  "detectedImplementations": ["feature 1 implemented", "feature 2 updated"],
  "filesAnalyzed": ["file1.ts", "file2.tsx"]
}
\`\`\`
Ensure the JSON block contains ONLY valid JSON. If there are no issues, provide empty arrays.`;


type ReviewInput = {
    repoFullName: string;
    title: string;
    /** Chunks retrieved from the PR's Pinecone namespace */
    contextSnippets: string[];
    /** Optional chunks from repo-sync namespace (full codebase context) */
    repoContextSnippets: string[];
    /** Optional PRD and Task details for context-aware review */
    prdContext?: {
      problemStatement?: string;
      goals?: string[];
      userStories?: string[];
      acceptanceCriteria?: string[];
    };
    tasksContext?: { title: string; status: string; description?: string | null }[];
};


function buildRepoContextSection(repoContextSnippets: string[]) {
    if (repoContextSnippets.length === 0) {
        return "";
    }

    const repoContext = repoContextSnippets.join("\n\n---\n\n");

    return `
  
  Related code from the repository (for context only, not part of the change):
  
  ${repoContext}`;
}

export async function generateReview(input: ReviewInput) {
    const context = input.contextSnippets.join("\n\n---\n\n");
    const repoContextSection = buildRepoContextSection(input.repoContextSnippets);

    // Build the dynamic Product Context section
    let productContextStr = "";
    if (input.prdContext || (input.tasksContext && input.tasksContext.length > 0)) {
        productContextStr += "\n\n### Product & Task Context\n\n";
        if (input.prdContext) {
            if (input.prdContext.problemStatement) productContextStr += `**Problem Statement:** ${input.prdContext.problemStatement}\n`;
            if (input.prdContext.acceptanceCriteria?.length) productContextStr += `**Acceptance Criteria:**\n- ${input.prdContext.acceptanceCriteria.join("\n- ")}\n`;
            if (input.prdContext.userStories?.length) productContextStr += `**User Stories:**\n- ${input.prdContext.userStories.join("\n- ")}\n`;
        }
        if (input.tasksContext?.length) {
            productContextStr += `**Engineering Tasks:**\n`;
            input.tasksContext.forEach(t => {
                productContextStr += `- [${t.status}] ${t.title}\n`;
            });
        }
    }

    const { text } = await generateText({
        model: openrouter(REVIEW_MODEL),
        system: SYSTEM_PROMPT,
        prompt: `Repository: ${input.repoFullName}
  Pull request title: ${input.title}
  ${productContextStr}
  
  Code changes:
  
  ${context}${repoContextSection}`,
    });

    return text;
}