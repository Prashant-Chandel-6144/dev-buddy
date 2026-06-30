"use client";

import { motion } from "motion/react";
import {
  MessageSquarePlus,
  FileText,
  LayoutList,
  Bot,
  GitPullRequest,
  ShieldCheck,
  Rocket,
} from "lucide-react";

const PIPELINE = [
  { icon: MessageSquarePlus, label: "Feature Request" },
  { icon: FileText, label: "PRD Generation" },
  { icon: LayoutList, label: "Task Breakdown" },
  { icon: Bot, label: "AI Coding" },
  { icon: GitPullRequest, label: "Pull Request" },
  { icon: ShieldCheck, label: "AI Verification" },
  { icon: Rocket, label: "Production" },
];

export function OrbSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-xs text-primary font-medium uppercase tracking-widest mb-3">
            [ Smart Technology that Works for You ]
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Intelligent Automation
            <br />
            at Every Stage
          </h2>
        </motion.div>

        {/* Orb + Pipeline Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative max-w-3xl mx-auto"
        >
          {/* The Orb */}
          <div className="flex justify-center mb-16">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.04, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="orb size-48 sm:size-56"
              />
              {/* Outer ring */}
              <div className="absolute inset-[-20px] rounded-full border border-primary/10 animate-spin-slow" />
              <div className="absolute inset-[-40px] rounded-full border border-primary/5 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "50s" }} />
            </div>
          </div>

          {/* Pipeline Glass Panel */}
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] text-primary font-medium uppercase tracking-wider">
                Delivery Pipeline — Automated
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {PIPELINE.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-background/30 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-default"
                  >
                    <div className="size-9 rounded-lg bg-border/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors">
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Connection arrows between items (desktop) */}
            <div className="hidden lg:flex items-center justify-between mt-3 px-8">
              {PIPELINE.slice(0, -1).map((_, i) => (
                <div key={i} className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-px bg-gradient-to-r from-border to-primary/20" />
                  <div className="size-1 rounded-full bg-primary/30" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
