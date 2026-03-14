"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Github, ExternalLink, Brain, Music, BarChart2, Building2, Eye, BookOpen } from "lucide-react";

const projects = [
  {
    title: "Viblog — AI Powered Blogging Platform",
    period: "Apr 2025 – Jun 2025",
    description:
      "A scalable AI-enabled blogging platform with NLP-powered content intelligence. Automatically generates keyword suggestions, topic tags, and metadata to improve blog discoverability. Features secure auth, role-based access, and a responsive SEO-optimized frontend.",
    icon: Brain,
    color: "#ff4d6d",
    tech: ["Python", "Flask", "Jinja", "MySQL", "NLP", "HTML5", "CSS3", "Bootstrap", "JavaScript"],
    features: [
      "NLP-based auto-generation of keyword suggestions, topic tags & metadata",
      "Secure authentication, session handling & role-based access control",
      "RESTful routing with dynamic content management",
      "SEO-optimized responsive frontend for improved engagement",
    ],
    github: "https://github.com/HRCodeCraft",
    live: null,
    badge: null,
  },
  {
    title: "DJoz — Emotion-Based Music & Video Recommender",
    period: "Sep 2024 – Jun 2025",
    description:
      "An AI-driven recommendation system that detects user emotions via real-time facial recognition and maps them to personalized multimedia recommendations. Trained ML models classify emotional states across multiple genres. Research published in IJRASET.",
    icon: Music,
    color: "#ff6b35",
    tech: ["Python", "OpenCV", "Flask", "MySQL", "Machine Learning", "Computer Vision"],
    features: [
      "Real-time facial emotion detection using OpenCV",
      "ML models classifying emotional states for personalized recommendations",
      "End-to-end full-stack system with Flask backend & dynamic frontend",
      "Published in IJRASET international research journal",
    ],
    github: "https://github.com/HRCodeCraft",
    live: null,
    badge: "Research Published",
  },
  {
    title: "VibeCheck Twitter — Sentiment Analysis Platform",
    period: "Sep 2024 – Nov 2024",
    description:
      "A real-time sentiment analysis platform that processes social media data using ML pipelines. Implements Logistic Regression and Naive Bayes classifiers with full NLP preprocessing and dynamic Chart.js dashboards for live trend monitoring.",
    icon: BarChart2,
    color: "#fbbf24",
    tech: ["Python", "Flask", "MySQL", "Logistic Regression", "Naive Bayes", "TF-IDF", "Chart.js"],
    features: [
      "Multi-class sentiment classification with Logistic Regression & Naive Bayes",
      "Full NLP pipeline: tokenization, stop-word removal, stemming, TF-IDF",
      "Dynamic Chart.js dashboards for live hashtag & event sentiment trends",
      "Real-time data processing and visualization",
    ],
    github: "https://github.com/HRCodeCraft",
    live: null,
    badge: null,
  },
  {
    title: "Enterprise Resource Planning System",
    period: "Jul 2024 – Sep 2024",
    description:
      "A modular full-stack ERP platform enabling real-time account management and operational tracking. Supports role-based access for admin, manager, and staff. Features bulk data upload/download pipelines and responsive Bootstrap UI.",
    icon: Building2,
    color: "#34d399",
    tech: ["Python", "Flask", "MySQL", "Bootstrap", "HTML5", "CSS3", "REST APIs"],
    features: [
      "Role-based authentication for admin, manager & staff levels",
      "Bulk data upload, download & validation pipelines",
      "Real-time account management and operational tracking",
      "Responsive cross-device Bootstrap interface",
    ],
    github: "https://github.com/HRCodeCraft",
    live: null,
    badge: null,
  },
  {
    title: "Face Detection & Recognition System",
    period: "Feb 2024 – Jun 2024",
    description:
      "A computer vision system for real-time facial detection and identification using OpenCV and the LBPH algorithm. Includes model training, webcam inference, image preprocessing, and data augmentation for improved accuracy under varied lighting.",
    icon: Eye,
    color: "#f59e0b",
    tech: ["Python", "OpenCV", "LBPH Algorithm", "Computer Vision", "Image Processing"],
    features: [
      "Real-time face detection & identification via webcam using LBPH",
      "Model training pipeline with image preprocessing & data augmentation",
      "Optimized for resource-constrained devices",
      "Improved recognition accuracy under varied lighting conditions",
    ],
    github: "https://github.com/HRCodeCraft",
    live: null,
    badge: null,
  },
];

export default function Projects() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section id="projects" className="relative py-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[#ff4d6d]/30" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="tech-badge mb-4 inline-block">Projects</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Things I&apos;ve <span className="gradient-text">Built</span>
          </h2>
          <p className="text-white/50 max-w-xl">
            End-to-end AI applications — from NLP pipelines to computer vision systems — each solving a real problem with production-quality engineering.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group glass-card p-5 sm:p-7 glow-border relative overflow-hidden flex flex-col"
            >
              {/* Top gradient line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${project.color}60, transparent)` }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at top, ${project.color}08 0%, transparent 60%)` }}
              />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${project.color}15`, border: `1px solid ${project.color}25` }}
                  >
                    <project.icon size={18} style={{ color: project.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-snug">{project.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-white/35 font-mono">{project.period}</span>
                      {project.badge && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium">
                          <BookOpen size={9} />
                          {project.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all"
                    >
                      <Github size={14} />
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/55 leading-relaxed mb-5">{project.description}</p>

              {/* Features */}
              <ul className="space-y-1.5 mb-5">
                {project.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: project.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                    style={{
                      background: `${project.color}10`,
                      border: `1px solid ${project.color}20`,
                      color: `${project.color}cc`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
