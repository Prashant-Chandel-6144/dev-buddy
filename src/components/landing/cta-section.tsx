"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-cyan-500/10 animate-gradient-shift" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/8 blur-[80px] animate-orbit" />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-cyan-500/8 blur-[80px] animate-orbit" style={{ animationDelay: "-10s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 20 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Ready to transform your workflow?</span>
        </motion.div>

        {/* Headline */}
        <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          Start Shipping the{" "}
          <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Future
          </span>
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
          Join hundreds of engineering teams who&apos;ve replaced context-switching with
          an intelligent delivery pipeline. From idea to production — automated.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:brightness-110 transition-all"
            >
              Start Building — Free <ArrowRight className="size-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card/40 backdrop-blur-md px-8 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
            >
              Book a Demo
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
