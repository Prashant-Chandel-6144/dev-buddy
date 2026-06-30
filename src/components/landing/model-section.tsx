"use client";

import { motion } from "motion/react";
import { Sparkles, ArrowRight, MessageSquare } from "lucide-react";

export function ModelSection() {
  return (
    <section className="relative py-28 px-6 overflow-hidden blueprint-line-h">
      {/* Blueprint grid lines */}
      <div className="blueprint-line-v left-1/4" />
      <div className="blueprint-line-v right-1/4" />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Split Header */}
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-end mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="bracket-title text-xs text-primary font-medium uppercase tracking-wider mb-3">
              Powered by the Latest AI Models
            </span>
            <h2 className="font-display text-4xl sm:text-[52px] font-bold tracking-tight text-foreground leading-[1.1] mt-2">
              Fine-tuned for
              <br />
              software delivery
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              We leverage specialized model configurations fine-tuned for codebase graph traversal, PRD schemas, task dependency graphs, and code review context retrieval.
            </p>
          </motion.div>
        </div>

        {/* Model Spec Layout */}
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 max-w-[960px] mx-auto items-center">
          {/* Left Large Text */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-3"
          >
            <span className="text-xs font-mono text-muted-foreground/60 uppercase">Custom fine-tuned engine</span>
            <h3 className="font-display text-5xl sm:text-7xl font-bold text-foreground tracking-tighter">
              ShipFlow-2
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mt-2">
              Our custom model trained on millions of high-quality pull requests, PRD frameworks, and automated test specifications.
            </p>
            <div className="flex items-center gap-1.5 text-primary text-xs font-medium cursor-pointer mt-4 group">
              <span>Explore Model Spec</span>
              <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>

          {/* Right Agent Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border border-border bg-card/45 p-5 relative backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-primary/[0.02] rounded-xl pointer-events-none" />
            
            {/* Header info bar */}
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-3.5 text-primary" />
                <span className="text-[10px] font-mono text-muted-foreground/80">Interactive Analyst Logs</span>
              </div>
              <span className="text-[9px] font-mono text-primary uppercase">active</span>
            </div>

            {/* Conversation/Verification logs */}
            <div className="space-y-3">
              <div className="text-[11.5px] leading-relaxed">
                <span className="text-primary font-mono font-medium">user_request:</span> Add google authentication provider to sign-in page.
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-[11px] leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <Sparkles className="size-3" />
                  <span className="font-semibold">ShipFlow Analyst:</span>
                </div>
                <p className="text-muted-foreground">
                  Analyzing requirements. Detected database schema additions in Prisma schema. Updating PRD acceptance criteria:
                </p>
                <ul className="list-disc pl-4 text-muted-foreground/80 mt-1 space-y-1">
                  <li>Verify callback endpoint configuration.</li>
                  <li>Track redirect URL environment variable triggers.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
