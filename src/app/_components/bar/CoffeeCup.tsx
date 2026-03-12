"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

type CoffeePhase =
  | "idle"
  | "wobble"
  | "pouring"
  | "steam"
  | "caffeinated"
  | "spill";

export default function CoffeeCup() {
  const [clickCount, setClickCount] = useState(0);
  const [phase, setPhase] = useState<CoffeePhase>("idle");
  const [fillLevel, setFillLevel] = useState(20); // percentage
  const [isCaffeinatedEffect, setIsCaffeinatedEffect] = useState(false);
  const [isSpilling, setIsSpilling] = useState(false);

  const handleClick = useCallback(() => {
    const next = clickCount + 1;
    setClickCount(next);

    if (next <= 2) {
      setPhase("wobble");
      setTimeout(() => setPhase("idle"), 600);
    } else if (next <= 4) {
      setPhase("pouring");
      setFillLevel(Math.min(20 + next * 20, 90));
      setTimeout(() => setPhase("idle"), 800);
    } else if (next === 5) {
      setPhase("steam");
      setFillLevel(105);
      setTimeout(() => setPhase("idle"), 1200);
    } else if (next === 6) {
      setPhase("caffeinated");
      setIsCaffeinatedEffect(true);
      // Apply caffeinated jitter effect to the whole page temporarily
      let jitterFrame: number;
      const startTime = Date.now();
      const jitter = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 3000) {
          document.body.style.transform = "";
          setIsCaffeinatedEffect(false);
          setPhase("idle");
          return;
        }
        const intensity = Math.max(0.5, 2 - elapsed / 1500);
        const x = (Math.random() - 0.5) * intensity * 2;
        const y = (Math.random() - 0.5) * intensity * 2;
        document.body.style.transform = `translate(${x}px, ${y}px)`;
        jitterFrame = requestAnimationFrame(jitter);
      };
      jitterFrame = requestAnimationFrame(jitter);
      setTimeout(() => {
        cancelAnimationFrame(jitterFrame);
        document.body.style.transform = "";
        setIsCaffeinatedEffect(false);
        setPhase("idle");
      }, 3000);
    } else if (next >= 7) {
      setPhase("spill");
      setIsSpilling(true);
      setTimeout(() => {
        setIsSpilling(false);
        setPhase("idle");
        setClickCount(0);
        setFillLevel(20);
      }, 4000);
    }
  }, [clickCount]);

  const wobbleAnimation =
    phase === "wobble"
      ? { rotate: [0, -3, 3, -2, 2, -1, 0], transition: { duration: 0.6 } }
      : {};

  return (
    <div className="relative flex flex-col items-center">
      {/* Coffee cup container */}
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={handleClick}
        animate={wobbleAnimation}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Cup SVG */}
        <div className="relative w-24 h-36 sm:w-32 sm:h-48">
          {/* Steam wisps (visible when fill > 90%) */}
          {fillLevel > 90 && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.6, 0.3, 0],
                    y: [0, -12, -22, -32],
                    x: [0, (i - 1) * 3, (i - 1) * -2, (i - 1) * 4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut",
                  }}
                  className="w-0.5 h-6 rounded-full bg-stone-400/50"
                  style={{
                    filter: "blur(1px)",
                  }}
                />
              ))}
            </div>
          )}

          {/* Extra steam burst during steam phase */}
          {phase === "steam" && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0, scaleY: 1 }}
                  animate={{
                    opacity: [0, 0.7, 0.4, 0],
                    y: [0, -16, -30, -44],
                    x: [0, (i - 2) * 4, (i - 2) * -3, (i - 2) * 5],
                    scaleY: [1, 1.3, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: 1,
                    repeatType: "loop",
                    delay: i * 0.2,
                    ease: "easeOut",
                  }}
                  className="w-0.5 h-8 rounded-full bg-stone-300/60"
                  style={{
                    filter: "blur(1.5px)",
                  }}
                />
              ))}
            </div>
          )}

          {/* Cup body */}
          <svg viewBox="0 0 120 140" className="w-full h-full">
            {/* Saucer */}
            <ellipse
              cx="50"
              cy="132"
              rx="45"
              ry="6"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2"
            />
            <ellipse
              cx="50"
              cy="132"
              rx="45"
              ry="6"
              fill="rgba(168,142,118,0.15)"
            />

            {/* Cup outline */}
            <path
              d="M15 30 L20 120 Q20 130 35 130 L65 130 Q80 130 80 120 L85 30 Z"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />

            {/* Cup fill (coffee) */}
            <clipPath id="cupClip">
              <path d="M15 30 L20 120 Q20 130 35 130 L65 130 Q80 130 80 120 L85 30 Z" />
            </clipPath>
            <rect
              x="10"
              y={140 - (fillLevel / 100) * 110}
              width="90"
              height={(fillLevel / 100) * 110}
              fill="url(#coffeeGradient)"
              clipPath="url(#cupClip)"
              className="transition-all duration-700"
            />

            {/* Coffee gradient */}
            <defs>
              <linearGradient
                id="coffeeGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#6b4226" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3e2723" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* Cup highlight */}
            <path
              d="M22 35 L25 115 Q25 126 37 126"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />

            {/* Handle */}
            <path
              d="M85 50 Q105 50 105 75 Q105 100 85 100"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2.5"
            />
            <path
              d="M85 55 Q100 55 100 75 Q100 95 85 95"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
            />
          </svg>
        </div>
      </motion.div>

      {/* Caffeinated indicator */}
      {isCaffeinatedEffect && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-stone-400/60 font-mono"
        >
          *buzz* ☕
        </motion.p>
      )}

      {/* Spill overlay */}
      {isSpilling && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "100vh" }}
          transition={{ duration: 2, ease: "easeIn" }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(62, 39, 35, 0.3) 0%, rgba(107, 66, 38, 0.1) 60%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
