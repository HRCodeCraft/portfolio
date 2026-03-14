"use client";

const items = [
  "Python", "Flask", "NLP", "Computer Vision", "LLMs", "Prompt Engineering",
  "OpenCV", "MySQL", "REST APIs", "Generative AI", "Sentiment Analysis",
  "Emotion Recognition", "Claude AI", "Flask", "Jekyll", "Bootstrap",
  "Machine Learning", "Vector Search", "RAG Systems", "AI Automation",
];

export default function TechMarquee() {
  const doubled = [...items, ...items];

  return (
    <div className="relative py-5 overflow-hidden border-y border-white/[0.04]">
      {/* Edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #0a0a0f, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #0a0a0f, transparent)" }} />

      <div
        className="flex gap-6 w-max"
        style={{ animation: "marquee 30s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-xs font-mono text-white/30 whitespace-nowrap select-none"
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{
                background: i % 3 === 0 ? "#ff4d6d" : i % 3 === 1 ? "#fbbf24" : "#34d399",
              }}
            />
            {item}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
