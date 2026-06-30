"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Terminal, Shield, Cpu, GitBranch, Sparkles } from "lucide-react";

/* ─── Integration Icons / Tags under Mockup ─────────────────────── */
const INTEGRATIONS = [
  { name: "GitHub Docs", icon: GitBranch },
  { name: "Git Workflow", icon: GitBranch },
  { name: "Verification Engine", icon: Shield },
  { name: "Local Dev Terminal", icon: Terminal },
  { name: "AI Agent Orchestrator", icon: Cpu },
];

export function HeroSection() {
  return (
    <section className="relative pt-36 pb-20 overflow-hidden">
      {/* Background blueprint lines */}
      <div className="blueprint-line-v left-1/4" />
      <div className="blueprint-line-v right-1/4" />

      {/* Gena Spotlight at top */}
      <div className="gena-spotlight" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl sm:text-[54px] font-bold tracking-tight leading-[1.1] mb-6 text-foreground"
          >
            Your Intelligent AI Agent
            <br />
            for <span className="text-primary bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">Software Delivery</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8"
          >
            ShipFlow AI manages the complete delivery lifecycle. Draft PRDs, map backlog tickets, coordinate coding subagents, and run automated QA in one event-driven cockpit.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center gap-3.5"
          >
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-6 text-xs font-semibold text-background hover:opacity-90 transition-opacity"
            >
              Start Trial
            </Link>
            <Link
              href="#pricing"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card/20 px-6 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
            >
              Book Demo
            </Link>
          </motion.div>
        </div>

        {/* Large Mockup Window */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[960px] mx-auto rounded-xl border border-border bg-card/30 p-2 backdrop-blur-md shadow-2xl"
        >
          {/* Internal Mockup Frame */}
          <div className="rounded-lg border border-border bg-background/80 overflow-hidden">
            {/* Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/10">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-[#ff5f57]" />
                <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="size-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[10px] text-muted-foreground/60 font-mono">shipflow.ai/console/workspace</span>
              <div className="size-4" />
            </div>

            {/* Mockup Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] h-[400px]">
              {/* Sidebar */}
              <div className="border-r border-border/80 bg-card/25 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded bg-primary flex items-center justify-center text-[9px] font-bold text-primary-foreground">SF</div>
                  <span className="text-xs font-semibold text-foreground">Console</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {["Dashboard", "PRD Studio", "Kanban Board", "Review Queue", "Settings"].map((item, i) => (
                    <div
                      key={item}
                      className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                        i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-card/40 hover:text-foreground"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content body */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Auto-Review: feat/oauth-providers</h4>
                      <p className="text-[11px] text-muted-foreground">Triggered via GitHub webhook by developer @prash</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="size-1 rounded-full bg-emerald-400" /> Active Verification
                      </div>
                    </div>
                  </div>

                  {/* Code Review Comments representation */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border border-border/40 bg-card/20">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="size-3 text-primary" />
                        <span className="text-[10px] font-medium text-primary">AI Product Analyst</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Verified PR scope matches the requirements outlined in the PRD (Acceptance Criteria #2, #4). Adding tags: <span className="font-mono text-foreground bg-card px-1 rounded">auth-service</span>.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/40 bg-card/20">
                      <div className="flex flex-row items-center gap-2 mb-1.5">
                        <Terminal className="size-3 text-amber-500" />
                        <span className="text-[10px] font-medium text-amber-500">Local Coding Subagent</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Linting completed successfully. Code quality index scored at 96/100.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirm merge button mockup */}
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">All checks passed. One-click ship enabled.</span>
                  <button className="h-7 px-3.5 rounded bg-primary text-[10px] font-semibold text-primary-foreground hover:opacity-90">
                    Ship Feature
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Integration list beneath mockup */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-60"
        >
          {INTEGRATIONS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="flex items-center gap-2">
                <Icon className="size-3.5 text-muted-foreground" />
                <span className="text-[11.5px] font-medium text-muted-foreground">{item.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
