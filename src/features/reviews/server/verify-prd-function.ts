import { inngest } from "@/features/inngest/client";
import { prisma } from "@/lib/db";
import { getGithubApp } from "@/features/github/utils/github-app";
import { getPullRequestFiles, formatPrFilesForReview } from "./pr-files";
import { postPrComment } from "./post-pr-comment";
import { generateText } from "ai";
import { openrouter } from "@/features/ai";

const AUDIT_MODEL = "openrouter/free";

const VERIFY_SYSTEM_PROMPT = `You are a senior technical QA auditor. Your task is to check whether the provided code changes (unified diffs) satisfy the product requirements specified in the PRD (Product Requirements Document) and match the list of Kanban tasks.

For each task in the checklist, determine if the code change has implemented it:
- If fully implemented in the code change, mark it as [IMPLEMENTED].
- If partially implemented, mark it as [PARTIAL] with a brief explanation.
- If not implemented, mark it as [MISSING].

Also check the PRD Acceptance Criteria and evaluate if they are satisfied.

Provide your response in markdown format. Your audit report should contain:
1. A brief summary of the audit.
2. A checklist of tasks showing their implementation status.
3. Details about any missing elements or instructions on what to fix.

At the very end of your response, you MUST output a JSON block inside a \`\`\`json code block containing the task completion statuses so the system can synchronize the Kanban board database.
Format of the JSON block:
\`\`\`json
{
  "tasks": [
    { "id": "task_id_1", "status": "DONE" | "IN_PROGRESS" | "TODO" },
    { "id": "task_id_2", "status": "DONE" | "IN_PROGRESS" | "TODO" }
  ]
}
\`\`\`
Make sure the JSON block contains ONLY valid JSON and precisely maps task IDs from the input.`;

export const verifyPrdFunction = inngest.createFunction(
  { id: "verify-prd-implementation", triggers: { event: "github/comment.received" } },
  async ({ event, step }) => {
    const { installationId, repoFullName, prNumber, commentBody, commenter, command } = event.data;

    // We only process 'verify' command in this function
    if (command !== "verify") {
      return { status: "skipped", reason: "command is not verify" };
    }

    // Step 0: Verify commenter permission levels
    const isAuthorized = await step.run("verify-commenter-permission", async () => {
      const app = getGithubApp();
      const octokit = await app.getInstallationOctokit(installationId);
      const [owner, repo] = repoFullName.split("/");

      try {
        const { data: collab } = await octokit.rest.repos.getCollaboratorPermissionLevel({
          owner,
          repo,
          username: commenter,
        });
        return ["admin", "write"].includes(collab.permission);
      } catch (err) {
        console.error("Error checking collaborator permission:", err);
        return false;
      }
    });

    if (!isAuthorized) {
      await step.run("comment-unauthorized", async () => {
        await postPrComment(
          installationId,
          repoFullName,
          prNumber,
          `🔒 **Security System: Permission Denied**\nUser @${commenter} does not have sufficient write access permissions to trigger verification audits on this repository.`
        );
      });
      return { status: "unauthorized", reason: "user lacks collaborator write permissions" };
    }

    // Step 1: Ensure PullRequest record exists in database
    const pullRequest = await step.run("get-or-create-pull-request", async () => {
      let pr = await prisma.pullRequest.findUnique({
        where: {
          repoFullName_prNumber: {
            repoFullName,
            prNumber,
          },
        },
      });

      if (!pr) {
        pr = await prisma.pullRequest.create({
          data: {
            installationId,
            repoFullName,
            prNumber,
            title: `PR #${prNumber}`,
            headSha: "",
            baseBranch: "",
            status: "pending",
          },
        });
      }
      return pr;
    }) as any;

    // Step 2: Determine Feature Request Linkage
    const parts = commentBody.split(/\s+/);
    const argId = parts[1]?.trim();

    let featureRequestId = pullRequest.featureRequestId;

    if (!featureRequestId) {
      if (argId) {
        // Link explicitly provided ID
        const matchedFr = await step.run("check-explicit-id", async () => {
          return prisma.featureRequest.findUnique({
            where: { id: argId },
          });
        });

        if (matchedFr) {
          await step.run("update-pr-linkage", async () => {
            await prisma.pullRequest.update({
              where: { id: pullRequest.id },
              data: { featureRequestId: argId } as any,
            });
          });
          featureRequestId = argId;
        } else {
          await step.run("comment-invalid-id", async () => {
            await postPrComment(
              installationId,
              repoFullName,
              prNumber,
              `⚠️ **System Audit: Invalid Feature ID**\nCould not find a Feature Request in DevBuddy matching ID: \`${argId}\`. Please check the ID and try again.`
            );
          });
          return { status: "error", reason: "invalid explicit ID" };
        }
      } else {
        // Attempt Auto-Linking using GitHub PR metadata
        const autoMatchedId = await step.run("auto-match-feature", async () => {
          const app = getGithubApp();
          const octokit = await app.getInstallationOctokit(installationId);
          const [owner, repo] = repoFullName.split("/");

          const { data: prData } = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
          });

          // Fetch project based on repository name
          const project = await prisma.project.findFirst({
            where: {
              githubRepoName: repo,
            },
            include: {
              featureRequests: true,
            },
          });

          if (!project) return null;

          // Scan branch name, title, or body for matching feature ID or name
          for (const fr of project.featureRequests) {
            const cleanTitle = fr.title.toLowerCase();
            const cleanPrTitle = prData.title.toLowerCase();
            const cleanPrBody = (prData.body || "").toLowerCase();
            const cleanBranch = (prData.head?.ref || "").toLowerCase();

            if (
              cleanBranch.includes(fr.id.toLowerCase()) ||
              cleanPrBody.includes(fr.id.toLowerCase()) ||
              (cleanPrTitle.includes(cleanTitle) && cleanTitle.length > 5)
            ) {
              return fr.id;
            }
          }
          return null;
        });

        if (autoMatchedId) {
          await step.run("update-pr-linkage-auto", async () => {
            await prisma.pullRequest.update({
              where: { id: pullRequest.id },
              data: { featureRequestId: autoMatchedId } as any,
            });
          });
          featureRequestId = autoMatchedId;
        } else {
          // Instruct user how to link since auto-match failed
          await step.run("comment-link-instructions", async () => {
            const [_, repo] = repoFullName.split("/");
            const project = await prisma.project.findFirst({
              where: { githubRepoName: repo },
              include: { featureRequests: { where: { status: { not: "completed" } } } },
            });

            const featuresList = project?.featureRequests && project.featureRequests.length > 0
              ? project.featureRequests.map(fr => `- \`${fr.id}\`: **${fr.title}** (Status: *${fr.status}*)`).join("\n")
              : "*(No open feature requests found in this project. Create one on the dashboard first!)*";

            const instructions = `⚠️ **System Audit: Pull Request not associated**\nCould not automatically match this Pull Request to a Feature Request in DevBuddy.\n\nTo link and run verification against a specific Feature PRD, please reply on this PR with:\n\`/verify <feature_request_id>\`\n\n**Available Features in this Project:**\n${featuresList}`;
            
            await postPrComment(installationId, repoFullName, prNumber, instructions);
          });
          return { status: "warning", reason: "linkage required" };
        }
      }
    }

    // Step 3: Fetch Feature Request Details
    const featureRequest = await step.run("fetch-feature-details", async () => {
      return prisma.featureRequest.findUnique({
        where: { id: featureRequestId! },
        include: {
          prd: true,
          tasks: true,
        },
      });
    });

    if (!featureRequest) {
      return { status: "error", reason: "linked feature request deleted" };
    }

    if (!featureRequest.prd) {
      await step.run("comment-missing-prd", async () => {
        await postPrComment(
          installationId,
          repoFullName,
          prNumber,
          `⚠️ **System Audit: Missing PRD**\nLinked Feature Request **"${featureRequest.title}"** does not have a generated PRD yet. Please create and approve the PRD in DevBuddy before running verification.`
        );
      });
      return { status: "warning", reason: "missing prd" };
    }

    // Step 4: Fetch PR Code Diff
    const files = await step.run("fetch-pr-diff-files", async () => {
      return getPullRequestFiles(installationId, repoFullName, prNumber);
    });

    if (files.length === 0) {
      await step.run("comment-empty-diff", async () => {
        await postPrComment(
          installationId,
          repoFullName,
          prNumber,
          `⚠️ **System Audit: Empty Diff**\nNo code changes found in this Pull Request to audit.`
        );
      });
      return { status: "warning", reason: "empty diff" };
    }

    const formattedDiff = formatPrFilesForReview(files);

    // Step 5: Run AI Audit against PRD
    const auditReport = await step.run("generate-ai-audit", async () => {
      const prdGoals = featureRequest.prd!.goals.join("\n- ");
      const prdCriteria = featureRequest.prd!.acceptanceCriteria.join("\n- ");
      const tasksFormatted = featureRequest.tasks.map(t => `- Task ID: \`${t.id}\` | Title: "${t.title}" | Status: ${t.status}`).join("\n");

      const prompt = `PRD Problem Statement: ${featureRequest.prd!.problemStatement}
PRD Goals:
- ${prdGoals}

PRD Acceptance Criteria:
- ${prdCriteria}

Kanban Tasks to Evaluate:
${tasksFormatted}

Pull Request Code Changes:
${formattedDiff}`;

      const { text } = await generateText({
        model: openrouter(AUDIT_MODEL),
        system: VERIFY_SYSTEM_PROMPT,
        prompt,
      });

      return text;
    });

    // Step 6: Post Audit Report and Sync Kanban Tasks in Database
    await step.run("sync-db-tasks-and-post-comment", async () => {
      // Parse task status updates from LLM JSON block
      const jsonMatch = auditReport.match(/```json\s*([\s\S]*?)\s*```/);
      let updatedTaskCount = 0;

      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[1]);
          if (result.tasks && Array.isArray(result.tasks)) {
            for (const t of result.tasks) {
              if (["TODO", "IN_PROGRESS", "DONE"].includes(t.status)) {
                // Ensure task belongs to this feature request
                const taskExists = featureRequest.tasks.some(existing => existing.id === t.id);
                if (taskExists) {
                  await prisma.task.update({
                    where: { id: t.id },
                    data: { status: t.status },
                  });
                  updatedTaskCount++;
                }
              }
            }
          }
        } catch (e) {
          console.error("Error parsing LLM tasks JSON:", e);
        }
      }

      // Add a header/footer wrapper to the comment
      const commentHeader = `🤖 **System Audit Report & Verification Run**\nEvaluated by DevBuddy AI against PRD for feature: **${featureRequest.title}**\n\n`;
      const commentFooter = updatedTaskCount > 0 
        ? `\n\n*🔄 Synchronized ${updatedTaskCount} Kanban tasks on your dashboard board registry.*`
        : "";

      // Remove the raw JSON block from user comment to keep it clean, or keep it formatted nicely
      const cleanReport = auditReport.replace(/```json[\s\S]*?```/g, "").trim();

      await postPrComment(
        installationId,
        repoFullName,
        prNumber,
        commentHeader + cleanReport + commentFooter
      );
    });

    return { status: "success" };
  }
);

export const shipPrdFunction = inngest.createFunction(
  { id: "ship-prd-implementation", triggers: { event: "github/comment.received" } },
  async ({ event, step }) => {
    const { installationId, repoFullName, prNumber, commenter, command } = event.data;

    if (command !== "ship") {
      return { status: "skipped", reason: "command is not ship" };
    }

    // Step 0: Verify commenter permission levels
    const isAuthorized = await step.run("verify-commenter-permission", async () => {
      const app = getGithubApp();
      const octokit = await app.getInstallationOctokit(installationId);
      const [owner, repo] = repoFullName.split("/");

      try {
        const { data: collab } = await octokit.rest.repos.getCollaboratorPermissionLevel({
          owner,
          repo,
          username: commenter,
        });
        return ["admin", "write"].includes(collab.permission);
      } catch (err) {
        console.error("Error checking collaborator permission:", err);
        return false;
      }
    });

    if (!isAuthorized) {
      await step.run("comment-unauthorized", async () => {
        await postPrComment(
          installationId,
          repoFullName,
          prNumber,
          `🔒 **Security System: Permission Denied**\nUser @${commenter} does not have sufficient write access permissions to trigger merge operations on this repository.`
        );
      });
      return { status: "unauthorized", reason: "user lacks collaborator write permissions" };
    }

    // Step 1: Query pull request
    const pullRequest = await step.run("get-pull-request", async () => {
      return prisma.pullRequest.findUnique({
        where: {
          repoFullName_prNumber: {
            repoFullName,
            prNumber,
          },
        },
      });
    }) as any;

    if (!pullRequest || !pullRequest.featureRequestId) {
      await step.run("comment-unlinked-ship", async () => {
        await postPrComment(
          installationId,
          repoFullName,
          prNumber,
          `⚠️ **System Action: Cannot Ship**\nThis Pull Request is not linked to any Feature Request. Please link it first using \`/verify <feature_id>\`.`
        );
      });
      return { status: "warning", reason: "unlinked pull request" };
    }

    // Step 2: Fetch feature request details
    const featureRequest = await step.run("fetch-feature-request", async () => {
      return prisma.featureRequest.findUnique({
        where: { id: pullRequest.featureRequestId! },
        include: { tasks: true },
      });
    });

    if (!featureRequest) {
      return { status: "error", reason: "linked feature request deleted" };
    }

    // Step 3: Check Kanban Task completion status before merging
    const openTasks = featureRequest.tasks.filter(t => t.status !== "DONE");
    if (openTasks.length > 0) {
      await step.run("comment-unfinished-tasks", async () => {
        await postPrComment(
          installationId,
          repoFullName,
          prNumber,
          `⚠️ **System Action: Cannot Ship**\nKanban board contains ${openTasks.length} incomplete tasks. Please complete all tasks or verify changes before shipping.\n\n*Incomplete tasks:* ${openTasks.map(t => `\n- ${t.title}`).join("")}`
        );
      });
      return { status: "warning", reason: "incomplete tasks exist" };
    }

    // Step 4: Perform GitHub squash-merge
    await step.run("merge-github-pr", async () => {
      const app = getGithubApp();
      const octokit = await app.getInstallationOctokit(installationId);
      const [owner, repo] = repoFullName.split("/");

      await octokit.rest.pulls.merge({
        owner,
        repo,
        pull_number: prNumber,
        merge_method: "squash",
        commit_title: `🚢 Ship Feature: ${featureRequest.title} (PR #${prNumber})`,
        commit_message: `Verified and automatically merged via DevBuddy AI.`,
      });
    });

    // Step 5: Update database status to SHIPPED
    await step.run("complete-feature-status", async () => {
      await prisma.featureRequest.update({
        where: { id: featureRequest.id },
        data: { status: "SHIPPED" },
      });
    });

    // Step 6: Post merge notification
    await step.run("post-shipped-comment", async () => {
      await postPrComment(
        installationId,
        repoFullName,
        prNumber,
        `🚀 **System Action: Feature Shipped!**\nSquash-merged Pull Request successfully. Feature request **"${featureRequest.title}"** status updated to **completed**.`
      );
    });

    return { status: "success" };
  }
);
