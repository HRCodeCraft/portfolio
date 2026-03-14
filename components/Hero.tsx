"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail, Sparkles, Download } from "lucide-react";
import NeuralCanvas from "./NeuralCanvas";

const roles = [
  "AI Engineer",
  "Generative AI Developer",
  "Full Stack Engineer",
  "NLP Specialist",
];

/* Terminal output lines shown in the floating card */
const terminalLines = [
  { text: "$ emotion_detect(webcam=True)", type: "cmd" },
  { text: '→ detected: "Joy"  conf: 0.91', type: "out" },
  { text: "$ recommend(emotion='joy', limit=5)", type: "cmd" },
  { text: "→ loading model weights...", type: "muted" },
  { text: "→ [song_1, song_2, song_3 ...]", type: "out" },
  { text: "$ analyze_sentiment(tweet_stream)", type: "cmd" },
  { text: "→ positive: 62%  negative: 21%", type: "out" },
  { text: "$ generate_tags(blog_content)", type: "cmd" },
  { text: '→ ["NLP", "Flask", "AI", "Python"]', type: "out" },
];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [termLine, setTermLine] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* Typewriter for roles */
  useEffect(() => {
    const current = roles[roleIndex];
    const speed = isDeleting ? 40 : 80;

    if (!isDeleting && displayText === current) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200);
      return;
    }
    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setRoleIndex((i) => (i + 1) % roles.length);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setDisplayText((prev) =>
        isDeleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
      );
    }, speed);

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayText, isDeleting, roleIndex]);

  /* Cycle terminal lines */
  useEffect(() => {
    const id = setInterval(() => {
      setTermLine((l) => (l + 1) % terminalLines.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      id="hero"
    >
      {/* Neural network background */}
      <NeuralCanvas />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />

      {/* Gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/70 via-transparent to-[#0a0a0f] pointer-events-none" />

      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#ff4d6d]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#fbbf24]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Scan line effect */}
      <div className="scan-line" />

      {/* ── Main content ─────────────────────────────── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-0 pb-20 lg:pb-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-8">

          {/* Left column — text */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2.5 mb-5 sm:mb-8"
            >
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-semibold tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                Available for AI Engineering Roles
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[2rem] sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-black text-white leading-[1.1] tracking-tight mb-4 sm:mb-6"
            >
              Building{" "}
              <span className="gradient-text">Intelligent</span>
              <br />
              Systems That{" "}
              <span className="text-white/35">Learn.</span>
            </motion.h1>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-2 sm:mb-3"
            >
              <span className="text-sm sm:text-xl font-semibold text-white/60 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-mono">
                Harshita Rajput
              </span>
            </motion.div>

            {/* Typewriter role */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="h-8 mb-4 sm:mb-6"
            >
              <span className="text-lg sm:text-2xl font-semibold text-[#ff4d6d]">
                {displayText}
                <span className="cursor-blink text-[#fbbf24]">_</span>
              </span>
            </motion.div>

            {/* Credibility */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-sm sm:text-base text-white/45 mb-6 sm:mb-10 max-w-lg lg:max-w-none leading-relaxed"
            >
              Currently in{" "}
              <span className="text-white/80 font-medium">Research & Development at CertifyMe</span>
              {" "}— building AI-powered products with Generative AI, NLP, and Computer Vision.
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-6 sm:mb-10"
            >
              <button
                onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
                className="group relative px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm overflow-hidden"
                style={{ background: "#ff4d6d", color: "#0a0a0f" }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  View Projects
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12" />
              </button>

              <a
                href="/resume.pdf"
                download="Harshita_Rajput_Resume.pdf"
                className="group flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/4 text-white font-semibold text-sm rounded-xl border border-[#fbbf24]/25 hover:bg-[#fbbf24]/10 hover:border-[#fbbf24]/50 transition-all duration-200"
              >
                <Download size={14} className="text-[#fbbf24] group-hover:translate-y-0.5 transition-transform duration-200" />
                Get Resume
              </a>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex items-center justify-center lg:justify-start gap-3"
            >
              {[
                { icon: Github, href: "https://github.com/HRCodeCraft", label: "GitHub" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/harshita-rajput-61282326a/", label: "LinkedIn" },
                { icon: Mail, href: "mailto:200312.hr@gmail.com", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={label !== "Email" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:border-[#ff4d6d]/40 hover:bg-[#ff4d6d]/10 transition-all duration-200 hover:scale-110"
                >
                  <Icon size={16} />
                </a>
              ))}
            </motion.div>

            {/* Mobile-only quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="lg:hidden mt-8 grid grid-cols-3 gap-2 border border-white/5 rounded-2xl p-4 bg-white/2"
            >
              {[
                { value: "5+", label: "Projects" },
                { value: "8+", label: "Certifications" },
                { value: "1", label: "Publication" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-black gradient-text">{s.value}</div>
                  <div className="text-[11px] text-white/35 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column — floating terminal */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
            className="hidden lg:block flex-shrink-0 w-[360px] xl:w-[400px] float-slow"
          >
            <div className="relative">
              {/* Glow behind terminal */}
              <div className="absolute -inset-4 bg-gradient-to-br from-[#ff4d6d]/10 to-[#fbbf24]/8 rounded-3xl blur-xl" />

              {/* Terminal window */}
              <div className="relative glass-card overflow-hidden border-[#ff4d6d]/15">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="ml-2 text-[11px] text-white/30 font-mono">
                    ai_inference.py
                  </span>
                </div>

                {/* Terminal body */}
                <div className="p-5 font-mono text-xs space-y-2 min-h-[240px]">
                  {terminalLines.slice(0, termLine + 1).map((line, i) => (
                    <motion.div
                      key={`${i}-${line.text}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className={
                        line.type === "cmd"
                          ? "text-[#ff4d6d]"
                          : line.type === "out"
                          ? "text-[#fbbf24] pl-2"
                          : "text-white/30 pl-2"
                      }
                    >
                      {line.text}
                      {i === termLine && (
                        <span className="cursor-blink text-white/60 ml-0.5">▌</span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Bottom status bar */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/2">
                  <span className="text-[10px] text-white/25 font-mono">Python 3.11 · Flask · OpenCV</span>
                  <span className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400/70">running</span>
                  </span>
                </div>
              </div>

              {/* Floating mini badges */}
              <div
                className="absolute -top-3 -right-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                style={{
                  background: "rgba(255, 77, 109, 0.12)",
                  borderColor: "rgba(255, 77, 109, 0.3)",
                  color: "#ff4d6d",
                  backdropFilter: "blur(12px)",
                }}
              >
                1 research paper
              </div>
              <div
                className="absolute -bottom-3 -left-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                style={{
                  background: "rgba(251, 191, 36, 0.12)",
                  borderColor: "rgba(251, 191, 36, 0.3)",
                  color: "#fbbf24",
                  backdropFilter: "blur(12px)",
                }}
              >
                8 certifications
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex"
      >
        <motion.button
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
          onClick={() => document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono">Scroll</span>
          <ArrowDown size={14} />
        </motion.button>
      </motion.div>
    </section>
  );
}
