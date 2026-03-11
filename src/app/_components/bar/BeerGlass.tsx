"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

type BeerPhase = "idle" | "wobble" | "pouring" | "foam" | "drunk" | "spill";

export default function BeerGlass() {
  const [clickCount, setClickCount] = useState(0);
  const [phase, setPhase] = useState<BeerPhase>("idle");
  const [fillLevel, setFillLevel] = useState(20); // percentage
  const [isDrunkEffect, setIsDrunkEffect] = useState(false);
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
      setPhase("foam");
      setFillLevel(105);
      setTimeout(() => setPhase("idle"), 1200);
    } else if (next === 6) {
      setPhase("drunk");
      setIsDrunkEffect(true);
      // Apply drunk effect to the whole page temporarily
      document.body.style.transition = "transform 0.5s, filter 0.5s";
      document.body.style.transform = "rotate(0.5deg)";
      document.body.style.filter = "blur(0.5px)";
      setTimeout(() => {
        document.body.style.transform = "";
        document.body.style.filter = "";
        setIsDrunkEffect(false);
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
      {/* Beer glass container */}
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={handleClick}
        animate={wobbleAnimation}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glass SVG */}
        <div className="relative w-24 h-36 sm:w-32 sm:h-48">
          {/* Glass body */}
          <svg viewBox="0 0 100 140" className="w-full h-full">
            {/* Glass outline */}
            <path
              d="M20 10 L15 120 Q15 135 30 135 L70 135 Q85 135 85 120 L80 10 Z"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            {/* Glass fill (beer) */}
            <clipPath id="glassClip">
              <path d="M20 10 L15 120 Q15 135 30 135 L70 135 Q85 135 85 120 L80 10 Z" />
            </clipPath>
            <rect
              x="10"
              y={140 - (fillLevel / 100) * 130}
              width="90"
              height={(fillLevel / 100) * 130}
              fill="url(#beerGradient)"
              clipPath="url(#glassClip)"
              className="transition-all duration-700"
            />
            {/* Beer gradient */}
            <defs>
              <linearGradient
                id="beerGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            {/* Glass highlight */}
            <path
              d="M25 15 L22 115 Q22 128 33 128"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
          </svg>

          {/* Foam (visible when fill > 90%) */}
          {fillLevel > 90 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-[14%] right-[14%] overflow-hidden"
              style={{
                top: `${Math.max(5, 93 - (fillLevel / 100) * 93)}%`,
              }}
            >
              <div className="flex gap-0.5 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-100/80"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              {phase === "foam" && (
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: -8 }}
                  transition={{ duration: 1, repeat: 1, repeatType: "reverse" }}
                  className="flex gap-0.5 justify-center -mt-1"
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-50/70"
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Drunk indicator */}
      {isDrunkEffect && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-amber-400/60 font-mono"
        >
          *hic* 🍺
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
              "linear-gradient(to bottom, rgba(217, 119, 6, 0.3) 0%, rgba(245, 158, 11, 0.1) 60%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
