"use client";

import { motion } from "motion/react";
import { Clock, ShieldCheck, Zap, FileCheck, Brain, Users } from "lucide-react";

const BENEFITS = [
  {
    icon: Clock,
    number: "10×",
    title: "Faster Delivery",
    description: "Reduce product delivery time from weeks to hours. AI handles the busywork while your team focuses on what matters.",
  },
  {
    icon: ShieldCheck,
    number: "99%",
    title: "Ship With Confidence",
    description: "Every code change is verified against the original requirements. Nothing ships without passing AI verification.",
  },
  {
    icon: Zap,
    number: "80%",
    title: "Less Repetitive Work",
    description: "Automate PRD writing, task breakdown, code review, and PR management. Your engineers write code — not tickets.",
  },
  {
    icon: FileCheck,
    number: "Auto",
    title: "Documentation by Default",
    description: "PRDs, task specifications, and review summaries are generated automatically. Your project is always documented.",
  },
  {
    icon: Brain,
    number: "AI+",
    title: "Improved Code Quality",
    description: "AI reviews with full repository context, not just the diff. It catches patterns, anti-patterns, and architectural issues humans miss.",
  },
  {
    icon: Users,
    number: "100%",
    title: "Human in the Loop",
    description: "AI proposes, you decide. Every critical step requires human approval. Automation enhances your team — it doesn't replace it.",
  },
];

export function BenefitsSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent pointer-events-none" />

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
            Why ShipFlow AI
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            The Unfair{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Advantage
            </span>
          </h2>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: i * 0.08,
                  type: "spring",
                  stiffness: 250,
                  damping: 22,
                }}
                className="group"
              >
                {/* Large Number */}
                <div className="mb-4">
                  <span className="font-display text-4xl sm:text-5xl font-bold bg-gradient-to-br from-primary/60 via-indigo-400/40 to-cyan-400/30 bg-clip-text text-transparent">
                    {benefit.number}
                  </span>
                </div>

                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground tracking-tight">
                    {benefit.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed pl-12">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
