"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Ease in — fast at first, slow near end
        const step = p < 70 ? 8 : p < 90 ? 3 : 1;
        return Math.min(p + step, 100);
      });
    }, 40);

    // Hide after animation completes
    const hide = setTimeout(() => setVisible(false), 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(hide);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(255,77,109,0.09) 0%, transparent 55%), #0a0a0f",
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,77,109,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,77,109,0.04) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Ambient glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#ff4d6d]/6 rounded-full blur-[120px] pointer-events-none" />

          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative mb-10"
          >
            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 rounded-full border border-dashed border-[#ff4d6d]/20"
            />
            {/* Inner glow ring */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-1 rounded-2xl opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,77,109,0.25) 0%, transparent 70%)",
              }}
            />

            {/* Icon box */}
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #ff4d6d 0%, #ff8c42 50%, #fbbf24 100%)",
                boxShadow: "0 0 40px rgba(255,77,109,0.4), 0 0 80px rgba(255,77,109,0.15)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z"
                  fill="white"
                />
              </svg>
            </div>
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-1 text-center"
          >
            <span className="text-lg font-black tracking-[0.25em] text-white uppercase font-mono">
              HARSHITA<span className="text-[#ff4d6d]">.</span>
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-[11px] text-white/30 tracking-[0.18em] uppercase mb-10 font-mono"
          >
            AI Engineer · R&amp;D
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="w-48 sm:w-64"
          >
            <div className="h-[2px] w-full bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #ff4d6d, #fbbf24)",
                  boxShadow: "0 0 8px rgba(255,77,109,0.6)",
                  transition: "width 0.04s linear",
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-white/20 font-mono">initializing</span>
              <span className="text-[10px] font-mono" style={{ color: "#ff4d6d" }}>
                {progress}%
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
