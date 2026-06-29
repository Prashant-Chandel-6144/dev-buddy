import Link from "next/link";
import Image from "next/image";
import { BackgroundGrid } from "@/components/ui/background-grid";
import { ArrowRight, AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-between bg-background text-foreground overflow-hidden">
      <BackgroundGrid className="fixed inset-0 -z-10" />

      {/* Top Capsule Menu */}
      <header className="z-10 w-full flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="border border-white/10 rounded-full px-4 py-1 bg-card/20 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          System: Active
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <span className="border border-primary rounded-full px-3 py-1 bg-primary/10 text-primary uppercase tracking-wider glow-amber">
            Overview
          </span>
          <span className="border border-white/5 rounded-full px-3 py-1 bg-card/25 text-muted-foreground uppercase tracking-wider hover:border-white/20 transition-colors cursor-pointer">
            Features
          </span>
          <span className="border border-white/5 rounded-full px-3 py-1 bg-card/25 text-muted-foreground uppercase tracking-wider hover:border-white/20 transition-colors cursor-pointer">
            Status
          </span>
        </div>
        <Link
          href="/dashboard"
          className="border border-white/10 rounded-full px-4 py-1 bg-card/25 text-xs font-mono text-muted-foreground uppercase tracking-wider hover:border-white/20 transition-colors"
        >
          My Profile
        </Link>
      </header>

      {/* Main content */}
      <main className="z-10 flex flex-col items-center gap-8 px-4 py-12 text-center max-w-3xl mx-auto my-auto">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-wider glow-amber">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            AI Development Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-light tracking-widest text-white uppercase font-mono text-glow">
            INSPECT SHIPMATE
          </h1>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
            A premium cockpit instrumentation dashboard to track features, analyze codebases, and generate product requirements documents instantly with AI guidance.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-6 text-xs font-mono uppercase tracking-wider text-primary-foreground font-semibold transition-all hover:bg-primary/90 glow-amber"
          >
            Get Started <ArrowRight className="size-3.5 ml-1" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-card/25 px-6 text-xs font-mono uppercase tracking-wider text-white transition-colors hover:bg-white/5 hover:border-white/20"
          >
            Learn More
          </Link>
        </div>
      </main>

      {/* Signature Alert Banner at the bottom */}
      <div className="z-10 w-full bg-primary text-primary-foreground py-2.5 px-4 font-mono text-xs text-center flex items-center justify-center gap-2 font-bold shadow-[0_-4px_20px_rgba(251,191,36,0.15)]">
        <AlertTriangle className="size-4 animate-bounce shrink-0" />
        <span className="uppercase tracking-wider">
          System online &rarr; READY FOR MISSION TRANSITION. SIMILAR PATTERN DETECTED ACROSS ALL PROJECTS.
        </span>
      </div>
    </div>
  );
}
