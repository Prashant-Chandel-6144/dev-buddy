"use client";

import { motion } from "motion/react";

export function PerformanceSection() {
  return (
    <section id="performance" className="relative py-28 px-6 overflow-hidden blueprint-line-h">
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
            className="flex flex-col justify-end"
          >
            <span className="text-xs text-primary font-medium tracking-wider mb-2 font-mono">[ Everytime. ]</span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              ShipFlow outperforms
              <br />
              every competitor
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end"
          >
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Comparing traditional manual delivery pipeline orchestration and generic code generation tools against ShipFlow AI&apos;s continuous loop execution.
            </p>
          </motion.div>
        </div>

        {/* Charts Showcase */}
        <div className="grid md:grid-cols-2 gap-6 max-w-[960px] mx-auto">
          {/* Line Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="gena-card p-6 flex flex-col justify-between h-[300px]"
          >
            <div>
              <p className="text-xs font-semibold text-foreground/80 mb-1">Weekly Delivery Velocity Index</p>
              <p className="text-[11px] text-muted-foreground">Measured in completed features per sprint</p>
            </div>
            
            {/* SVG Line Chart */}
            <div className="w-full h-36 mt-4 relative">
              <svg className="w-full h-full" viewBox="0 0 400 120">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 48)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 48)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="400" y2="30" stroke="oklch(1 0 0 / 3%)" strokeWidth="1" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="oklch(1 0 0 / 3%)" strokeWidth="1" />
                <line x1="0" y1="90" x2="400" y2="90" stroke="oklch(1 0 0 / 3%)" strokeWidth="1" />

                {/* Gradient area */}
                <path d="M 0 110 L 80 95 L 160 85 L 240 60 L 320 30 L 400 10 L 400 120 L 0 120 Z" fill="url(#lineGrad)" />
                {/* The curve */}
                <path d="M 0 110 L 80 95 L 160 85 L 240 60 L 320 30 L 400 10" fill="none" stroke="oklch(0.72 0.18 48)" strokeWidth="2" />
                
                {/* Data point dot */}
                <circle cx="400" cy="10" r="4" fill="oklch(0.72 0.18 48)" />
              </svg>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mt-2">
              <span>Week 01</span>
              <span>Week 02</span>
              <span>Week 03</span>
              <span>Week 04</span>
            </div>
          </motion.div>

          {/* Bar Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="gena-card p-6 flex flex-col justify-between h-[300px]"
          >
            <div>
              <p className="text-xs font-semibold text-foreground/80 mb-1">Time to Production (Days)</p>
              <p className="text-[11px] text-muted-foreground">Standardized across 10 key features</p>
            </div>

            {/* SVG Bar Chart */}
            <div className="w-full h-36 mt-4 flex items-end justify-around">
              {[
                { label: "Manual Pipeline", val: 100, color: "bg-muted-foreground/15" },
                { label: "Other Dev Tools", val: 75, color: "bg-muted-foreground/30" },
                { label: "ShipFlow AI", val: 24, color: "bg-gradient-to-t from-orange-600 to-primary shadow-lg shadow-primary/20" },
              ].map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-2 w-1/4">
                  <div className="w-full bg-card/60 border border-border/40 rounded-t-md overflow-hidden relative flex items-end" style={{ height: "100px" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${bar.val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`w-full ${bar.color} rounded-t`}
                    />
                  </div>
                  <span className="text-[9px] text-center text-muted-foreground/80 leading-tight font-mono">{bar.label}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-muted-foreground/60 text-center font-mono">
              Lower is better
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
