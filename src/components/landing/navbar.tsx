"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#performance", label: "Performance" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-0 left-0 right-0 z-50 py-6"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-6 rounded-md bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-display font-bold text-[9px] text-primary-foreground">SF</span>
          </div>
          <span className="font-display text-sm font-semibold text-foreground tracking-tight">
            ShipFlow
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-4 text-[12px] font-medium text-background hover:opacity-90 transition-opacity"
          >
            Launch Console <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mx-4 mt-2 rounded-xl bg-card border border-border p-4 shadow-2xl"
        >
          <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2.5 flex items-center justify-between gap-3">
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="flex-1 flex h-9 items-center justify-center rounded-lg bg-foreground text-xs font-medium text-background"
              >
                Launch Console
              </Link>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
