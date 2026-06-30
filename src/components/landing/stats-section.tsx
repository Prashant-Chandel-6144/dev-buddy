"use client";

import { motion } from "motion/react";
import { TrendingUp, Clock, Zap, ShieldCheck } from "lucide-react";

export function StatsSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Two-column hero text */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Ship 10×
              <br />
              <span className="text-primary">faster.</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex items-end"
          >
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              ShipFlow AI automates the repetitive overhead that slows engineering teams down.
              From PRD drafting to code review to deployment — every step is orchestrated.
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Clock,
              value: "< 2 min",
              label: "PRD generation time",
              detail: "From feature request to complete spec",
            },
            {
              icon: ShieldCheck,
              value: "100%",
              label: "Acceptance criteria traced",
              detail: "Every PR verified against requirements",
            },
            {
              icon: Zap,
              value: "80%",
              label: "Less manual overhead",
              detail: "Automate reviews, docs, and deployments",
            },
            {
              icon: TrendingUp,
              value: "10×",
              label: "Faster delivery cycle",
              detail: "From weeks to hours, consistently",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group rounded-xl border border-border bg-card/50 p-6 hover:border-primary/20 hover:bg-primary/[0.03] transition-all duration-500"
              >
                <Icon className="size-5 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <p className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-foreground/80 mb-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
