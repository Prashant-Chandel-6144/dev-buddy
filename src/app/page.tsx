"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { SmartTechSection } from "@/components/landing/smart-tech";
import { PerformanceSection } from "@/components/landing/performance";
import { CapabilitiesSection } from "@/components/landing/capabilities";
import { IntegrationsSection } from "@/components/landing/integrations";
import { PricingSection } from "@/components/landing/pricing-section";
import { ModelSection } from "@/components/landing/model-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-dvh bg-background text-foreground overflow-x-hidden grain grid-container">
      {/* Absolute blueprint lines and grid background */}
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] pointer-events-none border-x border-border/10">
        <div className="blueprint-line-v left-1/4" />
        <div className="blueprint-line-v right-1/4" />
      </div>

      {/* Sticky navigation */}
      <Navbar />

      {/* Page Content */}
      <main className="relative">
        {/* Hero Section */}
        <HeroSection />

        {/* Smart Technology connected diagram */}
        <SmartTechSection />

        {/* Performance charts section */}
        <PerformanceSection />

        {/* Capabilities split row cards */}
        <CapabilitiesSection />

        {/* Technical stack integration nodes */}
        <IntegrationsSection />

        {/* Plans and scaling */}
        <PricingSection />

        {/* Fine tuned models specs */}
        <ModelSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
