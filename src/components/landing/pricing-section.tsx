"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Perfect for indie hackers and small side projects.",
    features: [
      "10 AI Credits per month",
      "AI Product Manager Chat",
      "Automated PRD Generation",
      "Basic Code Review (GPT-4o-mini)",
    ],
    cta: "Start Free Trial",
    href: "/dashboard",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$89",
    period: "/month",
    description: "For professional teams that need to ship fast.",
    features: [
      "250 AI Credits per month",
      "Automated Task Breakdown & Kanban",
      "Deep Verification Loop (O1-mini)",
      "Automated Squash Merging",
      "Priority Email Support",
    ],
    cta: "Upgrade to Pro",
    href: "/dashboard",
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-28 px-6 overflow-hidden blueprint-line-h">
      {/* Blueprint grid lines */}
      <div className="blueprint-line-v left-1/4" />
      <div className="blueprint-line-v right-1/4" />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="bracket-title text-xs text-primary font-medium uppercase tracking-wider">
            Simple Plans for Every Scale
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-[760px] mx-auto items-start">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -3 }}
              className={`relative rounded-xl border p-7 flex flex-col transition-all duration-500 ${
                plan.highlighted
                  ? "border-primary/40 bg-gradient-to-b from-primary/10 to-card/60 shadow-xl shadow-primary/5 glow-amber"
                  : "border-border bg-card/45 hover:border-primary/20"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-6 -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              <h3 className="text-sm font-semibold text-foreground mb-1">{plan.name}</h3>
              <p className="text-[11px] text-muted-foreground mb-6 h-8">{plan.description}</p>

              <div className="mb-6 flex items-end gap-1">
                <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-xs text-muted-foreground mb-1">{plan.period}</span>
              </div>

              {/* Action Button */}
              <Link
                href={plan.href}
                className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold mb-6 transition-all ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-foreground/10 text-foreground hover:bg-foreground/15"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
