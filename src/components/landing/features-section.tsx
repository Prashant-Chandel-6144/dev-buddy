"use client";

import { motion } from "motion/react";
import {
  MessageSquarePlus,
  LayoutList,
  Bot,
  Rocket,
  FileText,
  GitPullRequest,
  ShieldCheck,
  UserCheck,
  Gauge,
} from "lucide-react";

const CAPABILITIES = [
  {
    icon: MessageSquarePlus,
    title: "Capture",
    description: "Drop a feature request. AI clarifies requirements, edge cases, and success criteria through interactive chat.",
    gradient: "from-primary/15 to-orange-500/5",
  },
  {
    icon: LayoutList,
    title: "Plan",
    description: "PRDs and engineering tasks are generated automatically. Your backlog populates instantly with ordered, spec-linked tickets.",
    gradient: "from-amber-500/15 to-primary/5",
  },
  {
    icon: Bot,
    title: "Code",
    description: "Connect your AI coding agent. ShipFlow manages the handoff between planning and implementation seamlessly.",
    gradient: "from-orange-500/15 to-amber-500/5",
  },
  {
    icon: Rocket,
    title: "Ship",
    description: "AI reviews, verifies against acceptance criteria, and merges verified branches. One click to production.",
    gradient: "from-primary/15 to-amber-500/5",
  },
];

const FEATURES_DETAIL = [
  { icon: FileText, title: "PRD Generator", desc: "Complete product specs with user stories, acceptance criteria, and architecture." },
  { icon: GitPullRequest, title: "PR Review", desc: "Diff chunks indexed in Pinecone for deep semantic review with full repo context." },
  { icon: ShieldCheck, title: "AI Verification", desc: "Every code change audited against original requirements. Nothing ships unchecked." },
  { icon: UserCheck, title: "Human Approval", desc: "AI proposes, you decide. Every critical step requires your sign-off." },
  { icon: Gauge, title: "Release Tracking", desc: "Track delivery pipeline health, velocity, and bottlenecks in real-time." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs text-primary font-medium uppercase tracking-widest mb-3">
            [ Can resolve the most complex delivery pipeline ]
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Four Steps. Fully Automated.
          </h2>
        </motion.div>

        {/* Primary 4 Capability Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className={`group rounded-xl border border-border bg-gradient-to-b ${cap.gradient} p-6 transition-all duration-500 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5`}
              >
                <div className="size-10 rounded-lg bg-card/60 border border-border flex items-center justify-center mb-5 group-hover:border-primary/20 transition-colors">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight">
                  {cap.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cap.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Secondary features list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              + More capabilities
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FEATURES_DETAIL.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-default"
                >
                  <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">{feat.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
