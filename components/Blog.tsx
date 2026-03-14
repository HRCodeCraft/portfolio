"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BookOpen, Clock, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const allPosts = [
  {
    slug: "nlp-pipelines",
    title: "Building Production-Ready NLP Pipelines with Flask",
    excerpt: "A deep dive into architecting scalable NLP systems — from model selection and preprocessing to REST API design and deployment considerations for real-world usage.",
    category: "NLP Engineering",
    readTime: "8 min read",
    color: "#ff4d6d",
    tags: ["Flask", "NLP", "Python", "Production"],
    date: "Jan 2025",
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering Patterns That Actually Work",
    excerpt: "Practical patterns for getting reliable, structured outputs from LLMs — covering chain-of-thought, few-shot learning, role prompting, and output format constraints.",
    category: "Generative AI",
    readTime: "6 min read",
    color: "#fbbf24",
    tags: ["LLMs", "Prompt Engineering", "Claude", "GPT"],
    date: "Feb 2025",
  },
  {
    slug: "emotion-recognition",
    title: "Emotion Recognition in Text: Beyond Binary Sentiment",
    excerpt: "Exploring multi-class emotion recognition models — comparing rule-based VADER, fine-tuned BERT, and zero-shot classification approaches for affective computing.",
    category: "AI Research",
    readTime: "10 min read",
    color: "#ff6b35",
    tags: ["Sentiment Analysis", "BERT", "Emotion AI", "Research"],
    date: "Mar 2025",
  },
  {
    slug: "computer-vision-web",
    title: "Computer Vision in Web Apps: A Practical Guide",
    excerpt: "How to integrate real-time computer vision into web applications using Flask and OpenCV — covering webcam streaming, model inference, and performance optimization.",
    category: "Computer Vision",
    readTime: "7 min read",
    color: "#34d399",
    tags: ["OpenCV", "Flask", "Computer Vision", "Python"],
    date: "Mar 2025",
  },
  {
    slug: "llm-agents-production",
    title: "Building LLM Agents That Actually Work in Production",
    excerpt: "Moving beyond demos — how to design reliable agentic systems with proper tool use, error recovery, memory, and observability for real product environments.",
    category: "Generative AI",
    readTime: "9 min read",
    color: "#fbbf24",
    tags: ["LLM Agents", "Tool Use", "Claude", "Production"],
    date: "Apr 2025",
  },
  {
    slug: "mysql-optimization-flask",
    title: "MySQL Query Optimization for Flask Applications",
    excerpt: "Practical techniques for speeding up MySQL queries in Flask backends — indexing strategies, query profiling, N+1 problem patterns, and connection pool tuning.",
    category: "Backend Engineering",
    readTime: "7 min read",
    color: "#f59e0b",
    tags: ["MySQL", "Flask", "Performance", "SQL"],
    date: "Dec 2024",
  },
  {
    slug: "rag-systems-beginners",
    title: "RAG Systems: From Theory to Working Implementation",
    excerpt: "A practical guide to building Retrieval-Augmented Generation systems — vector stores, embedding models, chunking strategies, and integrating with LLM APIs.",
    category: "Generative AI",
    readTime: "11 min read",
    color: "#ff4d6d",
    tags: ["RAG", "Vector DB", "Embeddings", "LLMs"],
    date: "Apr 2025",
  },
  {
    slug: "flask-api-design",
    title: "Designing Clean REST APIs with Flask: Lessons from the Field",
    excerpt: "Patterns for building maintainable Flask APIs — blueprints, error handling, versioning, request validation, and structuring projects that survive team growth.",
    category: "Backend Engineering",
    readTime: "8 min read",
    color: "#34d399",
    tags: ["Flask", "REST API", "Python", "Architecture"],
    date: "Nov 2024",
  },
  {
    slug: "opencv-face-recognition",
    title: "Face Recognition with OpenCV and LBPH: A Complete Walkthrough",
    excerpt: "Step-by-step implementation of a face detection and recognition system — Haar Cascades, LBPH algorithm, training pipeline, and deploying as a web service.",
    category: "Computer Vision",
    readTime: "9 min read",
    color: "#34d399",
    tags: ["OpenCV", "LBPH", "Face Recognition", "Python"],
    date: "Jun 2024",
  },
  {
    slug: "ai-workflow-automation",
    title: "AI Workflow Automation: Building Smart Pipelines with LLMs",
    excerpt: "How to replace brittle rule-based workflows with LLM-powered pipelines — document processing, intelligent routing, structured extraction, and human-in-the-loop design.",
    category: "Generative AI",
    readTime: "8 min read",
    color: "#fbbf24",
    tags: ["Automation", "LLMs", "Workflow", "AI"],
    date: "Mar 2025",
  },
  {
    slug: "sentiment-analysis-twitter",
    title: "Real-Time Twitter Sentiment Analysis: Architecture and Lessons",
    excerpt: "How I built VibeCheck — a live sentiment analysis platform for tweets using ML classifiers, TF-IDF pipelines, and Chart.js dashboards for trend visualization.",
    category: "NLP Engineering",
    readTime: "8 min read",
    color: "#ff4d6d",
    tags: ["Sentiment Analysis", "NLP", "Twitter", "Flask"],
    date: "Nov 2024",
  },
  {
    slug: "jekyll-static-sites",
    title: "Jekyll for Developers: Building Fast, Maintainable Static Sites",
    excerpt: "A practical guide to Jekyll — liquid templating, data files, SEO plugins, CI/CD deployment, and integrating with backend services for dynamic content.",
    category: "Web Development",
    readTime: "6 min read",
    color: "#f87171",
    tags: ["Jekyll", "Static Sites", "HTML/CSS", "Bootstrap"],
    date: "Jan 2025",
  },
  {
    slug: "generative-ai-products",
    title: "From Model to Product: Building Real Generative AI Features",
    excerpt: "The gap between an AI demo and a shippable product feature — prompt stability, latency budgets, fallback strategies, cost control, and user experience design.",
    category: "Generative AI",
    readTime: "10 min read",
    color: "#fbbf24",
    tags: ["Generative AI", "Product", "LLMs", "Engineering"],
    date: "Feb 2025",
  },
  {
    slug: "responsible-ai-engineering",
    title: "Responsible AI in Practice: What Engineers Actually Need to Know",
    excerpt: "Moving beyond buzzwords — practical techniques for fairness evaluation, bias detection, model transparency, and building AI systems that behave reliably across diverse users.",
    category: "AI Research",
    readTime: "9 min read",
    color: "#ff6b35",
    tags: ["Responsible AI", "Ethics", "Fairness", "ML"],
    date: "Mar 2025",
  },
  {
    slug: "erp-system-design",
    title: "Designing a Modular ERP System: Architecture Decisions and Tradeoffs",
    excerpt: "What I learned building a full-stack ERP — module boundaries, role-based access patterns, bulk data pipelines, and keeping Flask backends maintainable as features grow.",
    category: "Backend Engineering",
    readTime: "7 min read",
    color: "#f59e0b",
    tags: ["ERP", "Flask", "MySQL", "Architecture"],
    date: "Sep 2024",
  },
];

const INITIAL_SHOW = 6;

export default function Blog() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? allPosts : allPosts.slice(0, INITIAL_SHOW);

  return (
    <section id="blog" className="relative py-24">
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#fbbf24]/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-[#ff4d6d]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="tech-badge mb-4 inline-block">Engineering Blog</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Engineering <span className="gradient-text">Insights</span>
          </h2>
          <p className="text-white/50 max-w-xl text-sm sm:text-base">
            Technical articles on AI engineering, NLP, generative AI, and building intelligent systems in production.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.4) }}
            >
              <Link href={`/blog/${post.slug}`} className="block group h-full">
                <article className="glass-card p-6 glow-border relative overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-300 group-hover:-translate-y-[2px]">
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: `linear-gradient(90deg, transparent, ${post.color}, transparent)` }}
                  />
                  {/* Corner glow */}
                  <div
                    className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, ${post.color}15, transparent 70%)` }}
                  />

                  {/* Category + Date */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ color: post.color, background: `${post.color}12`, border: `1px solid ${post.color}30` }}
                    >
                      {post.category}
                    </span>
                    <span className="text-[11px] text-white/30 font-mono">{post.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-sm leading-snug mb-3 group-hover:text-[#ff4d6d] transition-colors duration-300">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-white/50 leading-relaxed mb-5 flex-1 line-clamp-3">{post.excerpt}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1 text-[11px] text-white/30">
                      <Clock size={10} />
                      {post.readTime}
                    </div>
                    <div
                      className="flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5"
                      style={{ color: post.color }}
                    >
                      Read
                      <ArrowRight size={11} />
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Show more / less */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <button
            onClick={() => setShowAll((s) => !s)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#ff4d6d] border border-[#ff4d6d]/25 rounded-xl hover:bg-[#ff4d6d]/8 transition-all duration-200"
          >
            <BookOpen size={14} />
            {showAll ? "Show Less" : `Show All ${allPosts.length} Articles`}
          </button>
          <p className="text-white/20 text-xs font-mono">{allPosts.length} articles · AI Engineering · NLP · Generative AI</p>
        </motion.div>
      </div>
    </section>
  );
}
