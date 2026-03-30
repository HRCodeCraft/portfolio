"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { GraduationCap, Briefcase, Code2, Brain } from "lucide-react";
import Image from "next/image";
import profileImg from "../public/profile.jpg";

const timeline = [
  {
    year: "2021",
    title: "B.Tech Computer Science",
    org: "SRM University, Delhi-NCR",
    desc: "Focused on AI, ML, and software engineering fundamentals. Graduated with 8.45 CGPA.",
    icon: GraduationCap,
    color: "#ff4d6d",
  },
  {
    year: "Jul 2024",
    title: "Software Developer Intern",
    org: "Rajdeep & Company Infra",
    desc: "Built backend services with Python & SQL. Optimized database performance and delivered production features.",
    icon: Code2,
    color: "#fbbf24",
  },
  {
    year: "Nov 2024",
    title: "Junior Associate R&D Intern",
    org: "CertifyMe — Tech99 Innovations",
    desc: "Developed Flask backends, static sites with Jekyll, and researched AI-driven product improvements.",
    icon: Briefcase,
    color: "#ff4d6d",
  },
  {
    year: "Oct 2025",
    title: "Junior Associate — R&D",
    org: "CertifyMe — Tech99 Innovations",
    desc: "Building Generative AI workflows, intelligent automation tools, and scalable backend services.",
    icon: Brain,
    color: "#ff6b35",
    current: true,
  },
];

export default function About() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="about" className="relative py-24 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#fbbf24]/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="tech-badge mb-4 inline-block">About Me</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            The Engineer Behind the{" "}
            <span className="gradient-text">Intelligence</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {/* Profile photo */}
            <div className="flex items-center gap-5 mb-8">
              <div className="relative flex-shrink-0">
                <div
                  className="absolute -inset-1 rounded-2xl opacity-60"
                  style={{ background: "linear-gradient(135deg, #ff4d6d, #fbbf24)", filter: "blur(5px)" }}
                />
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10">
                  <Image
                    src={profileImg}
                    alt="Harshita Rajput"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Harshita Rajput</h3>
                <p className="text-[#ff4d6d] text-sm font-medium">Junior Associate R&D · CertifyMe</p>
                <p className="text-white/35 text-xs mt-0.5 font-mono">New Delhi, India</p>
              </div>
            </div>

            <div className="space-y-5 text-white/65 text-base leading-relaxed">
              <p>
                I'm an AI-focused Software Engineer who builds real intelligent systems — not just experiments. My work sits at the intersection of machine learning, backend engineering, and product thinking.
              </p>
              <p>
                Currently in <span className="text-white font-medium">Research & Development at CertifyMe</span>, I work on Generative AI workflows, LLM-powered automation, and scalable Flask backends that power digital products used in production.
              </p>
              <p>
                My project work spans NLP-powered blogging platforms, emotion-aware recommendation systems, real-time sentiment analysis, and computer vision applications — each built end-to-end with a focus on solving real problems.
              </p>
              <p>
                I believe great AI engineering is 20% models and 80% systems thinking. I care deeply about building AI that works reliably, scales gracefully, and delivers measurable user value.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { label: "Projects", value: "5+" },
                { label: "Certifications", value: "8+" },
                { label: "Research Papers", value: "1" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 text-center glow-border">
                  <div className="text-2xl font-black gradient-text-blue">{stat.value}</div>
                  <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#ff4d6d]/40 via-[#fbbf24]/40 to-transparent" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="flex gap-6 relative"
                >
                  {/* Icon */}
                  <div
                    className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <item.icon size={20} style={{ color: item.color }} />
                    {item.current && (
                      <span
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                        style={{ background: item.color }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-[#ff4d6d]/70">{item.year}</span>
                      {item.current && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{item.title}</h3>
                    <p className="text-xs text-[#ff4d6d]/70 font-medium mb-2">{item.org}</p>
                    <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
