"use client";

import { useState } from "react";
import { Pnavbar } from "./_components/Pnavbar"; 
import Hero from "./_components/_layouts/Hero";
import PricingSection from "./_components/_layouts/PricingSection";
import Footer from "./_components/_layouts/Footer";
import SectionHeader from "./_components/_particles/SectionHeader";
import FAQ from "./_components/_layouts/FAQ";
import CallToAction from "./_components/_layouts/CTA";
import FeatureGrid from "./_components/_layouts/FeatureGrid";
import ServicesSection from "./_components/_layouts/ServiceSection";

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 scroll-smooth">
      {/* Navbar (sticky) */}
      <Pnavbar
        handleLinkClick={handleLinkClick}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main className="p-6 sm:py-10 sm:px-14 space-y-24">
        <Hero />

        {/* FEATURES */}
        <section id="features" className="scroll-mt-24 sm:px-12">
          <SectionHeader
            eyebrow="Features"
            title="All‑in‑One Business Management Suite"
            subtitle="One platform to manage inventory, sales, and insights—with speed and clarity."
          />

          <FeatureGrid />
        </section>

        {/* SERVICES */}
        <section id="services" className="scroll-mt-24 sm:px-12">
          <SectionHeader
            eyebrow="Services"
            title="Expert services that accelerate your rollout"
            subtitle="From data migration to custom integrations, we’ll help you ship faster and safer."
          />
          <ServicesSection />
        </section>

        {/* PRICING */}
        <section id="pricing" className="scroll-mt-24 sm:px-12">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple, predictable pricing"
            subtitle="Start free. Upgrade when your team is ready. No hidden fees."
          />
          <PricingSection />
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 sm:px-12">
          <SectionHeader
            eyebrow="FAQ"
            title="Answers for common questions"
            subtitle="If you need more help, reach out anytime."
          />
          <FAQ />
        </section>

        {/* CTA */}
        <section id="get-started" className="scroll-mt-24 sm:px-12">
          <CallToAction />
        </section>
      </main>

      <Footer />
    </div>
  );
}

