"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FlaskConical, Cpu, Layers, Zap, ArrowRight } from "lucide-react";

const experiments = [
  {
    title: "Prompt Engineering Patterns",
    category: "Generative AI",
    description:
      "Exploring advanced prompt engineering techniques — chain-of-thought, few-shot, system prompting, and structured output generation with Claude and GPT models. Documenting patterns that reliably improve output quality.",
    status: "Active Research",
    statusColor: "#ff4d6d",
    icon: Zap,
    color: "#ff4d6d",
    progress: 78,
    tags: ["Claude AI", "GPT-4", "Prompt Design", "Chain-of-Thought"],
  },
  {
    title: "LLM-Powered Automation Workflows",
    category: "Workflow Automation",
    description:
      "Building production-grade automation pipelines using LLMs for document processing, content generation, and intelligent data extraction. Exploring agentic patterns with tool use and multi-step reasoning.",
    status: "In Progress",
    statusColor: "#fde68a",
    icon: Cpu,
    color: "#fbbf24",
    progress: 60,
    tags: ["LLM Agents", "Tool Use", "Document AI", "Automation"],
  },
  {
    title: "Multi-Modal AI Integration",
    category: "Computer Vision + NLP",
    description:
      "Investigating the intersection of vision and language models — building systems that can understand images and generate contextual text descriptions, enabling richer AI product experiences.",
    status: "Exploring",
    statusColor: "#ff6b35",
    icon: Layers,
    color: "#ff6b35",
    progress: 35,
    tags: ["Vision Models", "CLIP", "Image Captioning", "Multi-Modal"],
  },
  {
    title: "Emotion-Contextual AI Systems",
    category: "Affective Computing",
    description:
      "Researching how to build AI systems that understand emotional context from text and adapt their responses accordingly — moving beyond sentiment classification toward true emotional intelligence.",
    status: "Research Phase",
    statusColor: "#34d399",
    icon: FlaskConical,
    color: "#34d399",
    progress: 45,
    tags: ["Emotion AI", "Affective Computing", "NLP", "Personalization"],
  },
];

export default function AILab() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section id="ailab" className="relative py-24">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#fbbf24]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#ff4d6d]/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="tech-badge-purple tech-badge mb-4 inline-block">AI Lab</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Active <span className="gradient-text">Research</span> &amp; Experiments
          </h2>
          <p className="text-white/50 max-w-xl">
            What I'm currently exploring, building, and learning at the frontier of AI engineering.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {experiments.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group glass-card p-7 glow-border relative overflow-hidden cursor-default"
            >
              {/* Corner glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle, ${exp.color}15 0%, transparent 70%)`,
                }}
              />

              {/* Category + Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
                  {exp.category}
                </span>
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    color: exp.statusColor,
                    background: `${exp.statusColor}15`,
                    border: `1px solid ${exp.statusColor}25`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: exp.statusColor }} />
                  {exp.status}
                </span>
              </div>

              {/* Icon + Title */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${exp.color}15`, border: `1px solid ${exp.color}25` }}
                >
                  <exp.icon size={18} style={{ color: exp.color }} />
                </div>
                <h3 className="font-bold text-white text-base leading-snug">{exp.title}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-white/55 leading-relaxed mb-5">{exp.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{
                      background: `${exp.color}10`,
                      border: `1px solid ${exp.color}20`,
                      color: `${exp.color}cc`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Research progress bar */}
              <div className="mt-auto">
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="text-white/25 font-mono">research progress</span>
                  <span className="font-mono" style={{ color: exp.color }}>{exp.progress}%</span>
                </div>
                <div className="h-[3px] w-full rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${exp.progress}%` } : {}}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${exp.color}99, ${exp.color})` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-white/40 text-sm mb-4">
            Interested in collaborating on AI research or experiments?
          </p>
          <a
            href="mailto:200312.hr@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#ff4d6d] border border-[#ff4d6d]/30 hover:bg-[#ff4d6d]/10 transition-all duration-200"
          >
            Let's Collaborate
            <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
