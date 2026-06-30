import { prisma } from "@/lib/db";
import { getGithubApp } from "@/features/github/utils/github-app";
import { getPullRequestFiles, formatPrFilesForReview } from "@/features/reviews/server/pr-files";
import { generateText } from "ai";
import { openrouter } from "@/features/ai";

const AUDIT_MODEL = "openrouter/free";

const VERIFY_AGENT_SYSTEM_PROMPT = `You are the ShipFlow Implementation Verification Agent.
Your responsibility is to compare the Original Feature Request, the generated PRD, the generated Kanban Tasks, the Pull Request details (diff changes, commits), and the Code Review Findings to determine if the requested feature was actually implemented.

You are NOT a code reviewer. Code analysis has already been performed. Focus strictly on auditing completion and determining task states.

Evaluate each task's completion status. Supported states are:
- COMPLETED: The implementation exists in the code change diff, acceptance criteria are satisfied, and there are no blocking code reviewer comments.
- PARTIAL: Implementation exists but is missing required behaviour/specifications.
- PENDING: No implementation is detected for this task in the code diff.
- BLOCKED: Critical code review issues or faults prevent acceptance of this task.

Calculate Feature Completion:
- completedTasks: count of COMPLETED tasks.
- totalTasks: total count of tasks.
- completionPercentage: Math.round((completedTasks / totalTasks) * 100).

Calculate Ready for Merge Decision:
- READY_FOR_MERGE: Every required task is COMPLETED, no blocking review issues, and review is approved.
- CHANGES_REQUIRED: Implementation exists, but reviewer requested changes/fixes.
- FEATURE_INCOMPLETE: Required tasks are still pending or missing.

Format your output as a clean, structured JSON object containing:
{
  "featureStatus": "READY_FOR_MERGE" | "CHANGES_REQUIRED" | "FEATURE_INCOMPLETE",
  "completionPercentage": number,
  "completedTasks": number,
  "totalTasks": number,
  "tasks": [
    {
      "taskId": "string",
      "status": "COMPLETED" | "PARTIAL" | "PENDING" | "BLOCKED",
      "confidence": number,
      "evidence": ["string"],
      "missing": ["string"]
    }
  ],
  "missingWork": ["string"],
  "summary": "string"
}

Output ONLY the raw JSON block inside a \`\`\`json code block. Do not write any other conversational text.`;

export async function runImplementationVerification(pullRequestId: string) {
  // Fetch PullRequest without include (avoids stale generated client issues)
  const pullRequest = await prisma.pullRequest.findUnique({
    where: { id: pullRequestId },
  });

  if (!pullRequest) {
    throw new Error(`Pull Request not found in database: ${pullRequestId}`);
  }

  const { installationId, repoFullName, prNumber } = pullRequest;
  const featureRequestId = (pullRequest as any).featureRequestId as string | null;

  if (!featureRequestId) {
    console.log(`PR #${prNumber} is not associated with a Feature Request. Skipping verification agent run.`);
    return { status: "skipped", reason: "no associated feature request" };
  }

  // Fetch the linked FeatureRequest with PRD and tasks separately
  const featureRequest = await prisma.featureRequest.findUnique({
    where: { id: featureRequestId },
    include: {
      prd: true,
      tasks: true,
    },
  });

  if (!featureRequest) {
    console.log(`Feature Request not found for ID ${featureRequestId}. Skipping verification agent run.`);
    return { status: "skipped", reason: "no associated feature request" };
  }

  if (!featureRequest.prd) {
    console.log(`Feature Request "${featureRequest.title}" has no PRD. Skipping verification agent run.`);
    return { status: "skipped", reason: "missing prd" };
  }

  // 1. Fetch Pull Request Diff Files
  const files = await getPullRequestFiles(installationId, repoFullName, prNumber);
  const formattedDiff = formatPrFilesForReview(files);

  // 2. Fetch Pull Request Commits and Reviews via GitHub API
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const [owner, repo] = repoFullName.split("/");

  const { data: prData } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number: prNumber,
  });
  const commitSummary = commits.map(c => `- ${c.commit.message} (by ${c.commit.author?.name})`).join("\n");

  const { data: reviews } = await octokit.rest.pulls.listReviews({
    owner,
    repo,
    pull_number: prNumber,
  });
  const reviewSummary = reviews.map(r => `- Review by ${r.user?.login}: ${r.state} - ${r.body || ""}`).join("\n");

  // 3. Assemble Prompt
  const prdGoals = featureRequest.prd.goals.join("\n- ");
  const prdCriteria = featureRequest.prd.acceptanceCriteria.join("\n- ");
  const tasksFormatted = featureRequest.tasks.map((t: any) => {
    // Map existing db statuses to model expectation if needed
    return `- Task ID: "${t.id}" | Title: "${t.title}" | Description: "${t.description || ""}" | Current DB Status: "${t.status}"`;
  }).join("\n");

  const prompt = `--- FEATURE REQUEST ---
Title: ${featureRequest.title}
Description: ${featureRequest.description}

--- PRD SPECIFICATIONS ---
Problem Statement: ${featureRequest.prd.problemStatement}
Goals:
- ${prdGoals}
Acceptance Criteria:
- ${prdCriteria}

--- KANBAN TASKS ---
${tasksFormatted}

--- PULL REQUEST METADATA ---
Title: ${pullRequest.title}
Commits:
${commitSummary}

--- CODE REVIEW AGENT FINDINGS ---
AI Review Findings:
${pullRequest.reviewComment || "No AI review comments generated yet."}

Other GitHub Reviews:
${reviewSummary || "No other reviews submitted yet."}

--- PULL REQUEST DIFFS ---
${formattedDiff}`;

  // 4. Generate AI Verification Audit
  const { text } = await generateText({
    model: openrouter(AUDIT_MODEL),
    system: VERIFY_AGENT_SYSTEM_PROMPT,
    prompt,
  });

  // 5. Parse Output with Robust JSON Sanitization
  let reportData;
  try {
    reportData = extractJson(text);
  } catch (err: any) {
    throw new Error(`Verification Agent failed to parse LLM JSON: ${err.message}`);
  }

  // 6. Update Task Statuses in Database
  if (reportData.tasks && Array.isArray(reportData.tasks)) {
    for (const t of reportData.tasks) {
      const taskExists = featureRequest.tasks.some((existing: any) => existing.id === t.taskId);
      if (taskExists) {
        // Map agent statuses (COMPLETED, PARTIAL, PENDING, BLOCKED) to standard Kanban columns (DONE, IN_PROGRESS, TODO)
        let dbStatus: "TODO" | "IN_PROGRESS" | "DONE" = "TODO";
        if (t.status === "COMPLETED") {
          dbStatus = "DONE";
        } else if (t.status === "PARTIAL" || t.status === "BLOCKED") {
          dbStatus = "IN_PROGRESS";
        }

        await prisma.task.update({
          where: { id: t.taskId },
          data: { status: dbStatus },
        });
      }
    }
  }

  // 6b. Verification History Persistence
  const previousComment = pullRequest.reviewComment || "";
  let historySection = "";
  
  const historyStart = previousComment.indexOf("### Verification History");
  if (historyStart !== -1) {
    historySection = previousComment.substring(historyStart).trim();
    // Strip trailing footer signature
    const footerIndex = historySection.indexOf("---");
    if (footerIndex !== -1) {
      historySection = historySection.substring(0, footerIndex).trim();
    }
  } else {
    historySection = "### Verification History\n*(No previous runs recorded)*";
  }

  const headSha = prData.head?.sha?.substring(0, 7) || "unknown";
  const timestamp = new Date().toLocaleString();
  let statusEmoji = "❌";
  if (reportData.featureStatus === "READY_FOR_MERGE") statusEmoji = "✅";
  else if (reportData.featureStatus === "CHANGES_REQUIRED") statusEmoji = "🟡";

  const newHistoryEntry = `- **Commit ${headSha}** (${timestamp}): ${statusEmoji} ${reportData.featureStatus} — ${reportData.completedTasks}/${reportData.totalTasks} tasks (${reportData.completionPercentage}%)`;
  
  if (historySection.includes("*(No previous runs recorded)*")) {
    historySection = `### Verification History\n${newHistoryEntry}`;
  } else {
    historySection = historySection.replace("### Verification History", `### Verification History\n${newHistoryEntry}`);
  }

  // 7. Update Pull Request Status and Review Comment Summary
  const visualCommentBody = generateVisualReport(reportData, featureRequest.title, historySection);

  await prisma.pullRequest.update({
    where: { id: pullRequestId },
    data: {
      status: reportData.featureStatus, // "READY_FOR_MERGE" | "CHANGES_REQUIRED" | "FEATURE_INCOMPLETE"
      reviewComment: visualCommentBody, // save summary markdown
      reviewedAt: new Date(),
    },
  });

  // 7b. Sync the Feature Request status automatically to match verification output
  await prisma.featureRequest.update({
    where: { id: featureRequest.id },
    data: { status: reportData.featureStatus },
  });

  // 8. Post or update the summary comment on the Pull Request
  await upsertPrSummaryComment(installationId, repoFullName, prNumber, visualCommentBody);

  return reportData;
}

async function upsertPrSummaryComment(
  installationId: number,
  repoFullName: string,
  prNumber: number,
  body: string
) {
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const [owner, repo] = repoFullName.split("/");

  // Fetch comments to locate previous ShipFlow summary report
  const { data: comments } = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
    { owner, repo, issue_number: prNumber }
  );

  const summaryComment = comments.find(
    (c) => c.body?.includes("<!-- shipflow-verification-report -->")
  );

  if (summaryComment) {
    await octokit.request(
      "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
      {
        owner,
        repo,
        comment_id: summaryComment.id,
        body,
      }
    );
  } else {
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner,
        repo,
        issue_number: prNumber,
        body,
      }
    );
  }
}

function generateVisualReport(data: any, featureTitle: string, historySection: string): string {
  const percent = data.completionPercentage ?? 0;
  const filledCount = Math.round(percent / 10);
  const progressBar = "█".repeat(filledCount) + "░".repeat(10 - filledCount);

  let statusBadge = "";
  if (data.featureStatus === "READY_FOR_MERGE") {
    statusBadge = "✅ **READY FOR MERGE** - Every required task completed, no blocking issues.";
  } else if (data.featureStatus === "CHANGES_REQUIRED") {
    statusBadge = "🟡 **CHANGES REQUIRED** - Implementation exists but reviewer requested fixes.";
  } else {
    statusBadge = "❌ **FEATURE INCOMPLETE** - Required tasks still missing.";
  }

  const completed = data.tasks.filter((t: any) => t.status === "COMPLETED");
  const partial = data.tasks.filter((t: any) => t.status === "PARTIAL");
  const pending = data.tasks.filter((t: any) => t.status === "PENDING");
  const blocked = data.tasks.filter((t: any) => t.status === "BLOCKED");

  let body = `<!-- shipflow-verification-report -->
## ShipFlow Verification Report

### Feature Progress
\`${progressBar}\`  **${percent}%**

### Tasks Status

`;

  if (completed.length > 0) {
    body += `#### Completed\n`;
    completed.forEach((t: any) => {
      const evidence = t.evidence && t.evidence.length > 0 ? ` (${t.evidence.join(", ")})` : "";
      body += `* ✅ **${t.taskId}**${evidence}\n`;
    });
    body += `\n`;
  }

  if (partial.length > 0) {
    body += `#### Partially Completed\n`;
    partial.forEach((t: any) => {
      const missingDetails = t.missing && t.missing.length > 0 ? ` (Missing: ${t.missing.join(", ")})` : "";
      body += `* 🟡 **${t.taskId}**${missingDetails}\n`;
    });
    body += `\n`;
  }

  if (blocked.length > 0) {
    body += `#### Blocked / Review Issues\n`;
    blocked.forEach((t: any) => {
      const missingDetails = t.missing && t.missing.length > 0 ? ` (Issues: ${t.missing.join(", ")})` : "";
      body += `* 🚨 **${t.taskId}**${missingDetails}\n`;
    });
    body += `\n`;
  }

  if (pending.length > 0) {
    body += `#### Missing\n`;
    pending.forEach((t: any) => {
      body += `* ❌ **${t.taskId}**\n`;
    });
    body += `\n`;
  }

  if (data.missingWork && data.missingWork.length > 0) {
    body += `### Missing Work\n`;
    data.missingWork.forEach((w: string) => {
      body += `- ${w}\n`;
    });
    body += `\n`;
  }

  body += `### Overall Status
${statusBadge}

${historySection}

---
*Generated by ShipFlow Implementation Verification Agent*`;

  return body;
}

function extractJson(text: string) {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      console.warn("Failed parsing markdown JSON block, trying fallback", e);
    }
  }

  const bracesMatch = text.match(/\{[\s\S]*\}/);
  if (bracesMatch) {
    try {
      return JSON.parse(bracesMatch[0].trim());
    } catch (e) {
      console.warn("Failed parsing direct braces block, trying fallback", e);
    }
  }

  throw new Error("No parseable JSON structure found in LLM output.");
}
