"use client";

import { motion } from "motion/react";
import {
  BrainCircuit,
  FileText,
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  MessageSquarePlus,
  LayoutList,
} from "lucide-react";

export function DashboardShowcase() {
  return (
    <section id="showcase" className="relative py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <p className="text-xs text-primary font-medium uppercase tracking-widest mb-3">
            [ ShipFlow will be your AI co-pilot ]
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            One Platform. Full Visibility.
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Track every feature from idea to production. AI agents work alongside your team in a unified command center.
          </p>
        </motion.div>

        {/* Large Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative mt-16 max-w-5xl mx-auto"
        >
          {/* Warm glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full bg-primary/6 blur-[80px] pointer-events-none" />

          {/* Main panel */}
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/30">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-card/30">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-[#ff5f57]" />
                <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="size-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[11px] text-muted-foreground font-mono ml-3 opacity-60">
                shipflow.ai/dashboard/project/acme-saas
              </span>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 sm:p-8">
              {/* Project Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-1">Acme SaaS Platform</h3>
                  <p className="text-xs text-muted-foreground">3 features in pipeline · 12 tasks active</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-6 px-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <div className="size-1.5 rounded-full bg-emerald-400" /> On Track
                  </span>
                </div>
              </div>

              {/* Pipeline Columns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    title: "Feature Requests",
                    icon: MessageSquarePlus,
                    items: [
                      { label: "User authentication flow", status: "prd-ready", color: "border-primary/30" },
                      { label: "Team collaboration", status: "analyzing", color: "border-blue-500/30" },
                    ],
                  },
                  {
                    title: "In Development",
                    icon: LayoutList,
                    items: [
                      { label: "Payment webhooks", status: "coding", color: "border-amber-500/30" },
                      { label: "Analytics dashboard", status: "coding", color: "border-amber-500/30" },
                    ],
                  },
                  {
                    title: "In Review",
                    icon: GitPullRequest,
                    items: [
                      { label: "Auth flow — PR #42", status: "reviewing", color: "border-violet-500/30" },
                    ],
                  },
                  {
                    title: "Verified & Shipped",
                    icon: CheckCircle2,
                    items: [
                      { label: "Onboarding wizard", status: "shipped", color: "border-emerald-500/30" },
                      { label: "Email notifications", status: "shipped", color: "border-emerald-500/30" },
                    ],
                  },
                ].map((col) => {
                  const Icon = col.icon;
                  return (
                    <div key={col.title}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="size-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{col.title}</span>
                      </div>
                      <div className="space-y-2">
                        {col.items.map((item) => (
                          <div
                            key={item.label}
                            className={`rounded-lg border ${item.color} bg-background/30 p-3`}
                          >
                            <p className="text-[11px] text-foreground/80 font-medium mb-1">{item.label}</p>
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
