"use client";

import { motion } from "motion/react";
import { MessageSquarePlus, FileText, Shield, Terminal } from "lucide-react";

const CARDS_LEFT = [
  {
    icon: MessageSquarePlus,
    title: "AI Product Analysis",
    description: "Clarify scope, edge cases, and success metrics interactively.",
  },
  {
    icon: FileText,
    title: "PRD Generation",
    description: "Produce comprehensive specifications with linked Kanban tasks.",
  },
];

const CARDS_RIGHT = [
  {
    icon: Terminal,
    title: "Local Coding Subagents",
    description: "Automatically implement code updates within your repository.",
  },
  {
    icon: Shield,
    title: "Automated QA review",
    description: "Verify pull requests against your exact acceptance criteria.",
  },
];

export function SmartTechSection() {
  return (
    <section className="relative py-28 px-6 overflow-hidden blueprint-line-h">
      {/* Blueprint grid lines */}
      <div className="blueprint-line-v left-1/4" />
      <div className="blueprint-line-v right-1/4" />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Section title */}
        <div className="text-center mb-16">
          <span className="bracket-title text-xs text-primary font-medium uppercase tracking-wider mb-3">
            Smart Technology That Works for You
          </span>
        </div>

        {/* Dynamic Diagram grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px_1fr] gap-8 lg:gap-0 items-center max-w-[960px] mx-auto relative">
          
          {/* Left Cards Column */}
          <div className="flex flex-col gap-6 lg:pr-8">
            {CARDS_LEFT.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="gena-card p-5 text-right relative flex flex-col items-end group"
                >
                  <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Icon className="size-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">{card.title}</h3>
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed max-w-[280px]">{card.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Center Orb Column */}
          <div className="flex items-center justify-center relative py-8 lg:py-0">
            {/* SVG connections (desktop only) */}
            <div className="absolute inset-0 hidden lg:block pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 240 300" fill="none">
                {/* Top left to orb */}
                <path d="M 0 75 Q 120 75 120 150" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
                {/* Bottom left to orb */}
                <path d="M 0 225 Q 120 225 120 150" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
                {/* Top right to orb */}
                <path d="M 240 75 Q 120 75 120 150" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
                {/* Bottom right to orb */}
                <path d="M 240 225 Q 120 225 120 150" stroke="oklch(0.72 0.18 48 / 15%)" strokeWidth="1" />
              </svg>
            </div>

            <div className="relative">
              {/* Spinning outer outline */}
              <div className="absolute inset-[-12px] rounded-full border border-primary/15 animate-spin-slow" />
              <div className="absolute inset-[-24px] rounded-full border border-primary/5 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "50s" }} />

              {/* Glowing Orb */}
              <motion.div
                animate={{
                  scale: [1, 1.04, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="gena-orb size-36"
              >
                {/* Center logo badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-11 rounded-lg bg-black/60 border border-primary/20 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-primary font-display tracking-widest">SF</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Cards Column */}
          <div className="flex flex-col gap-6 lg:pl-8">
            {CARDS_RIGHT.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="gena-card p-5 relative flex flex-col items-start group"
                >
                  <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Icon className="size-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">{card.title}</h3>
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed max-w-[280px]">{card.description}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
