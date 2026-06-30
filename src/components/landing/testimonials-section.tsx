"use client";

import { motion } from "motion/react";

const TESTIMONIALS = [
  {
    quote: "ShipFlow AI cut our delivery cycle from 2 weeks to 2 days. The PRD generator alone saves our product team 10+ hours per sprint.",
    name: "Sarah Chen",
    role: "VP of Engineering",
    company: "Arclight Systems",
    initials: "SC",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    quote: "The AI code review is shockingly good. It catches architectural issues our senior engineers miss because it has full repo context via Pinecone.",
    name: "Marcus Rivera",
    role: "Staff Engineer",
    company: "Meridian Labs",
    initials: "MR",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    quote: "We went from 'maybe we should write a PRD' to having comprehensive specs auto-generated for every feature. Game changer for documentation.",
    name: "Aisha Patel",
    role: "CTO",
    company: "Velox.io",
    initials: "AP",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    quote: "The verification loop is what sold us. Knowing every PR is checked against acceptance criteria before merge gives us real confidence.",
    name: "James Kowalski",
    role: "Engineering Manager",
    company: "Stratum Cloud",
    initials: "JK",
    gradient: "from-cyan-500 to-teal-600",
  },
  {
    quote: "ShipFlow AI is the closest thing to having an AI product manager and an AI QA team working 24/7. Our velocity metrics are through the roof.",
    name: "Elena Torres",
    role: "Head of Product",
    company: "NovaBridge",
    initials: "ET",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    quote: "What I love is that the human stays in the loop. AI handles the grunt work, but I make the final call. That's the right balance.",
    name: "David Kim",
    role: "Lead Developer",
    company: "Apex Engineering",
    initials: "DK",
    gradient: "from-purple-500 to-violet-600",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">
            Testimonials
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Engineering Teams
            </span>
          </h2>
        </motion.div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.06,
                type: "spring",
                stiffness: 250,
                damping: 22,
              }}
              whileHover={{ y: -4 }}
              className={`glass-card p-6 transition-shadow duration-500 hover:shadow-xl hover:shadow-primary/5 ${
                i === 1 || i === 4 ? "lg:translate-y-6" : ""
              }`}
            >
              {/* Quote */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`size-9 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-[11px] font-semibold text-white`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
