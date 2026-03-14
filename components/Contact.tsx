"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Mail, Github, Linkedin, ArrowUpRight, Cpu } from "lucide-react";

const channels = [
  {
    icon: Mail,
    label: "Email",
    handle: "200312.hr@gmail.com",
    cta: "Send an Email",
    href: "mailto:200312.hr@gmail.com",
    accent: "#ff4d6d",
    desc: "Fastest way to reach me. I read every message.",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    handle: "harshita-rajput-61282326a",
    cta: "View Profile",
    href: "https://www.linkedin.com/in/harshita-rajput-61282326a/",
    accent: "#fbbf24",
    desc: "Connect for opportunities and professional networking.",
  },
  {
    icon: Github,
    label: "GitHub",
    handle: "HRCodeCraft",
    cta: "See My Work",
    href: "https://github.com/HRCodeCraft",
    accent: "#34d399",
    desc: "Explore my open-source projects and code.",
  },
];

const lookingFor = [
  "AI Engineer",
  "ML Engineer",
  "Generative AI Developer",
  "Full Stack Engineer",
  "R&D Collaborations",
];

export default function Contact() {
  const { ref, inView } = useInView({ threshold: 0.08, triggerOnce: true });

  return (
    <section id="contact" className="relative py-16 sm:py-28 overflow-hidden">
      {/* Ambient bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-[#ff4d6d]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ff4d6d]/4 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#fbbf24]/4 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="tech-badge mb-5 inline-block">Let's Connect</span>

          <h2 className="text-[2rem] sm:text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Open to AI Engineering{" "}
            <span className="gradient-text">Opportunities</span>
          </h2>

          <p className="text-white/45 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Whether you're building an AI product, looking for an engineer who ships
            from model to production, or just want to talk tech — reach out.
          </p>
        </motion.div>

        {/* Contact channel cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 mb-16">
          {channels.map((ch, i) => (
            <motion.a
              key={ch.label}
              href={ch.href}
              target={ch.label !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
              className="group relative flex flex-col p-6 sm:p-8 rounded-2xl border overflow-hidden transition-all duration-400 hover:-translate-y-1 cursor-pointer"
              style={{
                background: `${ch.accent}06`,
                borderColor: `${ch.accent}20`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${ch.accent}12, transparent 70%)`,
                }}
              />

              {/* Top line on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${ch.accent}, transparent)` }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `${ch.accent}15`,
                  border: `1px solid ${ch.accent}30`,
                }}
              >
                <ch.icon size={22} style={{ color: ch.accent }} />
              </div>

              {/* Label */}
              <p className="text-xs text-white/35 font-semibold tracking-widest uppercase mb-1">
                {ch.label}
              </p>

              {/* Handle */}
              <p className="text-white font-bold text-base mb-2 truncate">
                {ch.handle}
              </p>

              {/* Desc */}
              <p className="text-white/45 text-xs leading-relaxed mb-6 flex-1">
                {ch.desc}
              </p>

              {/* CTA */}
              <div
                className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 group-hover:gap-2.5"
                style={{ color: ch.accent }}
              >
                {ch.cta}
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom row: availability + looking for */}
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Availability badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-6 sm:p-7 border border-emerald-500/15 bg-emerald-500/4 flex items-start gap-4"
          >
            <div className="mt-0.5 flex-shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400 mb-1">
                Currently Available
              </p>
              <p className="text-xs text-white/45 leading-relaxed">
                Actively looking for full-time AI engineering roles. Based in New Delhi — open to remote and hybrid opportunities globally.
              </p>
              <p className="text-xs text-white/30 mt-2 font-mono">
                Response time: within 24 hours
              </p>
            </div>
          </motion.div>

          {/* What I'm looking for */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-card p-6 sm:p-7 glow-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={15} className="text-[#ff4d6d]" />
              <p className="text-sm font-bold text-white/80">Open to Roles in</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {lookingFor.map((role) => (
                <span
                  key={role}
                  className="text-xs px-3 py-1.5 rounded-full font-medium bg-[#ff4d6d]/8 border border-[#ff4d6d]/20 text-[#ff4d6d]/90 whitespace-nowrap"
                >
                  {role}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
