"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Zap, Heart } from "lucide-react";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "AI Lab", href: "#ailab" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

const socials = [
  { icon: Github, href: "https://github.com/HRCodeCraft", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/harshita-rajput-61282326a/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:200312.hr@gmail.com", label: "Email" },
];

export default function Footer() {
  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/5 py-16">
      {/* Top line */}
      <div className="tech-line mb-16" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          {/* Brand */}
          <div className="text-center md:text-left">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 group mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff4d6d] to-[#fbbf24] flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-sm tracking-wider text-white/90">
                HARSHITA<span className="text-[#ff4d6d]">.</span>
              </span>
            </button>
            <p className="text-xs text-white/35 max-w-xs leading-relaxed">
              AI Engineer & Full Stack Developer building intelligent systems that learn, adapt, and scale.
            </p>
            <p className="text-xs text-white/25 mt-3 font-mono">200312.hr@gmail.com</p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="text-xs text-white/40 hover:text-white/80 transition-colors font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.label !== "Email" ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:border-[#ff4d6d]/30 hover:bg-[#ff4d6d]/10 transition-all duration-200"
              >
                <s.icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} Harshita Rajput. All rights reserved.
          </p>
          <p className="text-xs text-white/20 flex items-center gap-1">
            Built with Next.js, Tailwind CSS &amp; Framer Motion
            <Heart size={10} className="text-[#ff6b35]/50" />
          </p>
        </div>
      </div>
    </footer>
  );
}
