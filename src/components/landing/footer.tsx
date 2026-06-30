"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background/90 py-20 px-6 overflow-hidden blueprint-line-h">
      {/* Blueprint grid lines */}
      <div className="blueprint-line-v left-1/4" />
      <div className="blueprint-line-v right-1/4" />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-16">
          
          {/* Left Column: Brand & Email */}
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-5xl sm:text-6xl font-bold tracking-tighter text-foreground">
              ShipFlow
            </h2>
            <div className="flex flex-col gap-1.5 mt-2">
              <a
                href="mailto:info@shipflow.ai"
                className="text-xs font-mono font-semibold tracking-wider text-foreground hover:text-primary transition-colors"
              >
                INFO@SHIPFLOW.AI
              </a>
              <span className="text-[11.5px] text-muted-foreground">
                San Francisco, California · Built for Developers
              </span>
            </div>
          </div>

          {/* Right Column: Newsletter signup */}
          <div className="flex flex-col gap-5 justify-end">
            <div>
              <p className="text-[13px] font-medium text-foreground mb-1">Don&apos;t miss what&apos;s next.</p>
              <p className="text-[11.5px] text-muted-foreground">Join our product announcements mailing list.</p>
            </div>
            
            {/* Input signup */}
            <div className="flex items-center border border-border bg-card/40 rounded-lg p-1.5 w-full max-w-sm relative">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 bg-transparent border-0 outline-none text-xs px-2.5 text-foreground placeholder:text-muted-foreground"
              />
              <button className="size-7 rounded bg-foreground flex items-center justify-center text-background hover:opacity-90 transition-opacity">
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright / policy row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-10 border-t border-border/60">
          <p className="text-[10px] font-mono text-muted-foreground/60">
            © {new Date().getFullYear()} SHIPFLOW AI. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6 text-[10.5px] text-muted-foreground/60 font-mono">
            <Link href="#" className="hover:text-foreground transition-colors">TERMS OF SERVICE</Link>
            <Link href="#" className="hover:text-foreground transition-colors">PRIVACY POLICY</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
