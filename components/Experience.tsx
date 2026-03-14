"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Briefcase, Calendar, MapPin, ExternalLink } from "lucide-react";

const experiences = [
  {
    company: "CertifyMe — Tech99 Innovations",
    role: "Junior Associate — R&D",
    type: "Full-time",
    location: "Remote",
    period: "Oct 2025 — Present",
    current: true,
    color: "#ff6b35",
    highlights: [
      "Building Generative AI workflows and LLM-powered automation tools for internal product teams",
      "Developing scalable Flask backend services deployed in production environments",
      "Researching AI-driven product improvements to enhance platform capabilities",
      "Collaborating with cross-functional teams to integrate AI features into the core product",
    ],
    tech: ["Python", "Flask", "Generative AI", "LLMs", "REST APIs", "Jekyll"],
  },
  {
    company: "CertifyMe — Tech99 Innovations",
    role: "Junior Associate R&D Intern",
    type: "Internship",
    location: "Remote",
    period: "Nov 2024 — Oct 2025",
    current: false,
    color: "#ff4d6d",
    highlights: [
      "Developed and maintained Flask backend services powering digital credentialing features",
      "Built and optimized static websites using Jekyll with SEO best practices",
      "Researched AI/ML solutions to improve platform features and user workflows",
      "Integrated third-party APIs and automation pipelines into the product stack",
    ],
    tech: ["Python", "Flask", "Jekyll", "HTML/CSS", "SQL", "API Integration"],
  },
  {
    company: "Rajdeep & Company Infra",
    role: "Software Developer Intern",
    type: "Internship",
    location: "On-site",
    period: "Jul 2024 — Oct 2024",
    current: false,
    color: "#fbbf24",
    highlights: [
      "Built backend services with Python and SQL to support business operations",
      "Optimized SQL database queries, reducing query execution time by 35%",
      "Delivered production-ready features within tight sprint timelines",
      "Collaborated with the engineering team to maintain and improve existing systems",
    ],
    tech: ["Python", "SQL", "MySQL", "Backend Development", "Database Optimization"],
  },
];

export default function Experience() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section id="experience" className="relative py-24">
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#ff6b35]/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="tech-badge mb-4 inline-block">Experience</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Where I've <span className="gradient-text">Built Things</span>
          </h2>
          <p className="text-white/50 max-w-xl">
            Real-world engineering experience across AI research, backend development, and product-focused roles.
          </p>
        </motion.div>

        <div className="space-y-6">
          {experiences.map((exp, i) => (
            <motion.div
              key={`${exp.company}-${exp.role}`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group glass-card p-5 sm:p-8 glow-border relative overflow-hidden"
            >
              {/* Left color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ background: `linear-gradient(to bottom, ${exp.color}, ${exp.color}40)` }}
              />

              {/* Current badge glow */}
              {exp.current && (
                <div
                  className="absolute inset-0 opacity-5 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at top left, ${exp.color}, transparent 60%)` }}
                />
              )}

              <div className="relative">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                      {exp.current && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: exp.color }}>
                      <Briefcase size={13} />
                      <span>{exp.company}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {exp.period}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {exp.location} · {exp.type}
                    </span>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-2 mb-6">
                  {exp.highlights.map((h, hi) => (
                    <li key={hi} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: exp.color }} />
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2">
                  {exp.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium"
                      style={{
                        background: `${exp.color}12`,
                        border: `1px solid ${exp.color}25`,
                        color: exp.color,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
