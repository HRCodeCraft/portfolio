"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Award, CheckCircle, BookOpen } from "lucide-react";

const certifications = [
  {
    title: "OCI 2025 Generative AI Professional",
    issuer: "Oracle",
    year: "2025",
    color: "#ff4d6d",
    topics: ["Large Language Models", "OCI Gen AI Services", "Enterprise AI"],
    verified: true,
  },
  {
    title: "OCI 2025 Data Science Professional",
    issuer: "Oracle",
    year: "2025",
    color: "#fbbf24",
    topics: ["ML Solutions", "OCI Data Science", "Data-driven Systems"],
    verified: true,
  },
  {
    title: "OCI 2025 AI Foundations Associate",
    issuer: "Oracle",
    year: "2025",
    color: "#fde68a",
    topics: ["AI Fundamentals", "ML Pipelines", "Cloud AI Services"],
    verified: true,
  },
  {
    title: "Oracle AI Vector Search Professional",
    issuer: "Oracle",
    year: "2025",
    color: "#ff4d6d",
    topics: ["Vector Databases", "Embeddings", "Similarity Search", "AI Retrieval"],
    verified: true,
  },
  {
    title: "Introduction to Generative AI",
    issuer: "Google",
    year: "2024",
    color: "#34d399",
    topics: ["Generative AI Models", "Enterprise Applications", "Fundamentals"],
    verified: true,
  },
  {
    title: "Introduction to Responsible AI",
    issuer: "Google",
    year: "2024",
    color: "#f59e0b",
    topics: ["Ethical AI", "Fairness", "Transparency", "Responsible Deployment"],
    verified: true,
  },
  {
    title: "Introduction to Google Gemini",
    issuer: "Simplilearn",
    year: "2024",
    color: "#ff6b35",
    topics: ["Gemini LLM", "AI-assisted Development", "Generative AI Tools"],
    verified: true,
  },
  {
    title: "Introduction to Data Science",
    issuer: "Infosys",
    year: "2024",
    color: "#f87171",
    topics: ["Data Analysis", "Statistics", "Machine Learning"],
    verified: true,
  },
];

const publication = {
  title: "Research Publication — IJRASET",
  description:
    "\"Emotion-Based Music and Video Recommendation System\" — Published in the International Journal for Research in Applied Science and Engineering Technology.",
  color: "#fbbf24",
};

export default function Certifications() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section id="certifications" className="relative py-24">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#f59e0b]/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="tech-badge mb-4 inline-block">Credentials</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Verified <span className="gradient-text">Expertise</span>
          </h2>
          <p className="text-white/50 max-w-xl">
            Oracle, Google, and industry certifications validating expertise across AI, cloud services, and data science.
          </p>
        </motion.div>

        {/* Research publication highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-8 glass-card p-6 relative overflow-hidden"
          style={{ borderColor: `${publication.color}30` }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${publication.color}60, transparent)` }}
          />
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${publication.color}15`, border: `1px solid ${publication.color}25` }}
            >
              <BookOpen size={18} style={{ color: publication.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-white">{publication.title}</h3>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: `${publication.color}20`, color: publication.color, border: `1px solid ${publication.color}30` }}
                >
                  Peer-Reviewed
                </span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed">{publication.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Certification grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
              className="group glass-card p-5 glow-border relative overflow-hidden cursor-default"
            >
              {/* Top border */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${cert.color}60, ${cert.color}20)` }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at top left, ${cert.color}08 0%, transparent 60%)` }}
              />

              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cert.color}15`, border: `1px solid ${cert.color}25` }}
                >
                  <Award size={15} style={{ color: cert.color }} />
                </div>
                {cert.verified && (
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-white leading-snug mb-1.5">{cert.title}</h3>

              {/* Issuer + Year */}
              <p className="text-xs font-semibold mb-0.5" style={{ color: cert.color }}>
                {cert.issuer}
              </p>
              <p className="text-xs text-white/35 mb-4">{cert.year}</p>

              {/* Topics */}
              <div className="flex flex-wrap gap-1.5">
                {cert.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-[10px] px-1.5 py-0.5 rounded-md"
                    style={{
                      background: `${cert.color}10`,
                      border: `1px solid ${cert.color}20`,
                      color: `${cert.color}99`,
                    }}
                  >
                    {topic}
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
