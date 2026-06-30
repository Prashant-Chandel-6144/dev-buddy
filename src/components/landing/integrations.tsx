"use client";

import { motion } from "motion/react";
import { Database, Terminal, GitBranch, Cpu, Network } from "lucide-react";

const NODES_LEFT = [
  { name: "GitHub", icon: GitBranch },
  { name: "Pinecone", icon: Database },
  { name: "Vercel", icon: Network },
];

const NODES_RIGHT = [
  { name: "Git Workflow", icon: GitBranch },
  { name: "AI Orchestrator", icon: Cpu },
  { name: "CLI Terminal", icon: Terminal },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="relative py-28 px-6 overflow-hidden blueprint-line-h">
      {/* Blueprint grid lines */}
      <div className="blueprint-line-v left-1/4" />
      <div className="blueprint-line-v right-1/4" />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <span className="bracket-title text-xs text-primary font-medium uppercase tracking-wider mb-3">
            Work with any tech stack
          </span>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Native integrations across your repository, project trackers, database triggers, and cloud providers.
          </p>
        </div>

        {/* Node diagram web */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px_1fr] gap-8 md:gap-0 items-center max-w-[800px] mx-auto relative">
          
          {/* Left Nodes */}
          <div className="flex flex-col gap-6 md:pr-8 items-center md:items-end">
            {NODES_LEFT.map((node, i) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.name}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card/40 w-44 hover:border-primary/25 transition-all"
                >
                  <Icon className="size-4 text-primary" />
                  <span className="text-[11.5px] font-semibold text-foreground">{node.name}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Center Hub */}
          <div className="flex items-center justify-center relative py-6 md:py-0">
            {/* SVG connections (desktop only) */}
            <div className="absolute inset-0 hidden md:block pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 240 240" fill="none">
                {/* Connections to left nodes */}
                <path d="M 0 45 Q 120 45 120 120" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
                <path d="M 0 120 Q 120 120 120 120" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
                <path d="M 0 195 Q 120 195 120 120" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
                {/* Connections to right nodes */}
                <path d="M 240 45 Q 120 45 120 120" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
                <path d="M 240 120 Q 120 120 120 120" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
                <path d="M 240 195 Q 120 195 120 120" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
              </svg>
            </div>

            <div className="relative">
              {/* Hub Outer Ring */}
              <div className="absolute inset-[-10px] rounded-full border border-primary/20 animate-spin-slow" />
              <div className="gena-orb size-28">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-10 rounded-lg bg-black/60 border border-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary tracking-widest font-display">SF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Nodes */}
          <div className="flex flex-col gap-6 md:pl-8 items-center md:items-start">
            {NODES_RIGHT.map((node, i) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.name}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card/40 w-44 hover:border-primary/25 transition-all"
                >
                  <Icon className="size-4 text-primary" />
                  <span className="text-[11.5px] font-semibold text-foreground">{node.name}</span>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
