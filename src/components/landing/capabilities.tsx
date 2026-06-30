"use client";

import { motion } from "motion/react";
import { Sparkles, GitBranch, Shield, Zap } from "lucide-react";

const CAPABILITIES = [
  {
    icon: Sparkles,
    badge: "1",
    title: "Capture",
    description: "Submit a natural language feature request. AI analyzes target requirements, outlines details, and drafts complete PRDs.",
    highlighted: false,
  },
  {
    icon: Zap,
    badge: "2",
    title: "Map",
    description: "Approve generated PRDs and watch tasks decompose into structured tickets mapped directly onto your Kanban workflow board.",
    highlighted: true,
  },
  {
    icon: Shield,
    badge: "3",
    title: "Verify",
    description: "Every pull request is reviewed by automated subagents that check quality and audit changes against acceptance criteria.",
    highlighted: false,
  },
  {
    icon: GitBranch,
    badge: "4",
    title: "Ship",
    description: "Once verification matches criteria, one-click merges code branches to main and tracks the deployment.",
    highlighted: false,
  },
];

export function CapabilitiesSection() {
  return (
    <section className="relative py-28 px-6 overflow-hidden blueprint-line-h">
      {/* Blueprint grid lines */}
      <div className="blueprint-line-v left-1/4" />
      <div className="blueprint-line-v right-1/4" />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Header split */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Integrated across
              <br />
              your development stack
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end"
          >
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Replacing multiple disconnected tools (PRD generators, review dashboards, task managers) with a single continuous delivery system.
            </p>
          </motion.div>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-xl p-6 transition-all duration-500 cursor-default ${
                  cap.highlighted
                    ? "bg-gradient-to-b from-primary/10 to-card/60 border border-primary/30 shadow-lg shadow-primary/5 glow-amber"
                    : "border border-border bg-card/45 hover:border-primary/25"
                }`}
              >
                {/* Badge Number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">STAGE 0{cap.badge}</span>
                  <div className={`size-8 rounded flex items-center justify-center ${cap.highlighted ? "bg-primary text-primary-foreground" : "bg-border/60 text-muted-foreground"}`}>
                    <Icon className="size-4" />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">{cap.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
