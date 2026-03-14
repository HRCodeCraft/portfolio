"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Brain, Sparkles, Server, Globe, Database, Wrench } from "lucide-react";

const skillGroups = [
  {
    title: "AI & Machine Learning",
    icon: Brain,
    color: "#ff4d6d",
    bgColor: "rgba(255, 77, 109, 0.05)",
    borderColor: "rgba(255, 77, 109, 0.15)",
    skills: [
      "Natural Language Processing",
      "Computer Vision",
      "Sentiment Analysis",
      "Emotion Recognition",
      "Model Training & Evaluation",
      "AI Model Integration",
    ],
  },
  {
    title: "Generative AI & LLMs",
    icon: Sparkles,
    color: "#fde68a",
    bgColor: "rgba(251, 191, 36, 0.05)",
    borderColor: "rgba(251, 191, 36, 0.15)",
    skills: [
      "Large Language Models",
      "Prompt Engineering",
      "AI Workflow Automation",
      "LLM Application Development",
      "Claude AI",
      "AI-assisted Development",
    ],
  },
  {
    title: "Backend Engineering",
    icon: Server,
    color: "#34d399",
    bgColor: "rgba(52, 211, 153, 0.05)",
    borderColor: "rgba(52, 211, 153, 0.15)",
    skills: [
      "Python",
      "Flask",
      "REST APIs",
      "SQL",
      "Jinja Templates",
      "API Integration",
    ],
  },
  {
    title: "Web Development",
    icon: Globe,
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.05)",
    borderColor: "rgba(245, 158, 11, 0.15)",
    skills: [
      "HTML5 & CSS3",
      "Bootstrap",
      "Responsive Design",
      "Jekyll",
      "Frontend Integration",
      "SEO Optimization",
    ],
  },
  {
    title: "Databases",
    icon: Database,
    color: "#f87171",
    bgColor: "rgba(248, 113, 113, 0.05)",
    borderColor: "rgba(248, 113, 113, 0.15)",
    skills: [
      "MySQL",
      "Relational Database Design",
      "SQL Query Optimization",
      "Data Modeling",
    ],
  },
  {
    title: "Developer Tools",
    icon: Wrench,
    color: "#ff4d6d",
    bgColor: "rgba(56, 189, 248, 0.05)",
    borderColor: "rgba(56, 189, 248, 0.15)",
    skills: [
      "Git & GitHub",
      "Linux",
      "VS Code",
      "Version Control",
      "Java",
      "C/C++",
    ],
  },
];

export default function Skills() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section id="skills" className="relative py-24">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ff4d6d]/4 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="tech-badge mb-4 inline-block">Skills</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Technical <span className="gradient-text">Arsenal</span>
          </h2>
          <p className="text-white/50 max-w-xl">
            A curated collection of tools, frameworks, and disciplines I've used to build real AI systems.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillGroups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: gi * 0.08 }}
              className="group relative glass-card p-6 overflow-hidden cursor-default"
              style={{
                background: group.bgColor,
                borderColor: group.borderColor,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${group.color}10 0%, transparent 60%)`,
                }}
              />

              {/* Animated top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${group.color}, transparent)` }}
              />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `${group.color}15`,
                      border: `1px solid ${group.color}25`,
                    }}
                  >
                    <group.icon size={18} style={{ color: group.color }} />
                  </div>
                  <h3 className="font-bold text-sm text-white">{group.title}</h3>
                </div>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ color: group.color, background: `${group.color}10` }}
                >
                  {group.skills.length}
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill, si) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: gi * 0.08 + si * 0.04 }}
                    className="text-xs px-2.5 py-1 rounded-lg text-white/70 font-medium transition-all duration-200 hover:text-white"
                    style={{
                      background: `${group.color}10`,
                      border: `1px solid ${group.color}20`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${group.color}25`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${group.color}50`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${group.color}10`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${group.color}20`;
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
