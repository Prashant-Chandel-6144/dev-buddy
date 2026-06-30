"use client";

import { motion } from "motion/react";
import {
  MessageSquarePlus,
  BrainCircuit,
  FileText,
  LayoutList,
  Bot,
  GitPullRequest,
  ShieldCheck,
  UserCheck,
  Rocket,
} from "lucide-react";

const STEPS = [
  {
    icon: MessageSquarePlus,
    title: "Feature Request",
    description: "Drop a feature idea. Natural language is all you need.",
    status: "Input",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: BrainCircuit,
    title: "AI Product Analysis",
    description: "AI clarifies scope, edge cases, and success criteria through interactive chat.",
    status: "AI Powered",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: FileText,
    title: "PRD Generation",
    description: "A complete PRD with user stories, acceptance criteria, and technical specs — generated in seconds.",
    status: "AI Powered",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: LayoutList,
    title: "Task Breakdown",
    description: "Engineering tasks are decomposed, ordered, and mapped to the PRD. Your Kanban populates instantly.",
    status: "AI Powered",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Bot,
    title: "AI Coding Agent",
    description: "Your preferred coding agent writes the implementation. ShipFlow manages the handoff.",
    status: "Integration",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    icon: GitPullRequest,
    title: "Pull Request",
    description: "Code is committed and a PR is opened automatically with full context and linked tasks.",
    status: "Automated",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "AI Verification",
    description: "Every code change is audited against the original PRD acceptance criteria and scored.",
    status: "AI Powered",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: UserCheck,
    title: "Human Approval",
    description: "You remain in control. Review the AI's work and approve with confidence.",
    status: "Human",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Rocket,
    title: "Production",
    description: "One click squash-merges verified code to main. Feature shipped.",
    status: "Ship It",
    gradient: "from-violet-500 to-purple-600",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="relative py-32 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="text-center mb-20"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">
            The Pipeline
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            From Idea to{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Production
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Every stage of software delivery — automated, verified, and orchestrated by AI.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <div className="relative max-w-3xl mx-auto">
          {/* Center connector line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-indigo-500/20 to-cyan-500/30 lg:-translate-x-px" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isLeft = i % 2 === 0;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30, x: isLeft ? -20 : 20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  delay: i * 0.06,
                  type: "spring",
                  stiffness: 250,
                  damping: 22,
                }}
                className="relative mb-6 last:mb-0"
              >
                {/* Desktop layout */}
                <div
                  className={`hidden lg:flex items-center gap-8 ${
                    isLeft ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Content card */}
                  <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="glass-card p-6 inline-block max-w-sm hover:glow-violet transition-shadow duration-500"
                    >
                      <div className={`flex items-center gap-2 mb-2 ${isLeft ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] font-mono text-primary/80 uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                          {step.status}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center icon node */}
                  <div className="relative shrink-0 z-10">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className={`size-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="size-5 text-white" />
                    </motion.div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />
                </div>

                {/* Mobile layout */}
                <div className="lg:hidden flex items-start gap-4 pl-2">
                  {/* Icon */}
                  <div className="relative shrink-0 z-10">
                    <div
                      className={`size-10 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="size-4 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 glass-card p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-primary/80 uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                        {step.status}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
