"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CoasterPhase = "idle" | "spinning" | "flying" | "gone" | "returning";

const HIDDEN_MESSAGES = [
  "WiFi Password: undefined",
  "404: Coaster Not Found",
  "// TODO: add coaster",
  "git stash pop coaster",
  "NullCoasterException",
];

export default function Coaster() {
  const [clickCount, setClickCount] = useState(0);
  const [phase, setPhase] = useState<CoasterPhase>("idle");
  const [spinSpeed, setSpinSpeed] = useState(0);
  const [hiddenMessage, setHiddenMessage] = useState("");

  const handleClick = useCallback(() => {
    const next = clickCount + 1;
    setClickCount(next);

    if (next <= 3) {
      setPhase("spinning");
      setSpinSpeed(next * 360);
      setTimeout(() => setPhase("idle"), 800);
    } else if (next === 4) {
      setPhase("flying");
      setHiddenMessage(
        HIDDEN_MESSAGES[Math.floor(Math.random() * HIDDEN_MESSAGES.length)]
      );
      setTimeout(() => setPhase("gone"), 600);
      setTimeout(() => {
        setPhase("returning");
      }, 3000);
      setTimeout(() => {
        setPhase("idle");
        setClickCount(0);
        setSpinSpeed(0);
      }, 3800);
    }
  }, [clickCount]);

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence mode="wait">
        {phase !== "gone" && (
          <motion.div
            key="coaster"
            className="cursor-pointer select-none"
            onClick={handleClick}
            animate={
              phase === "spinning"
                ? { rotate: spinSpeed, transition: { duration: 0.5 } }
                : phase === "flying"
                  ? {
                      x: [0, 200, 500],
                      y: [0, -100, -200],
                      rotate: [0, 720, 1440],
                      opacity: [1, 1, 0],
                      scale: [1, 0.8, 0.3],
                      transition: { duration: 0.6 },
                    }
                  : phase === "returning"
                    ? {
                        x: [-500, -50, 0],
                        y: [-200, -30, 0],
                        rotate: [-720, -90, 0],
                        opacity: [0, 0.5, 1],
                        scale: [0.3, 0.9, 1],
                        transition: { duration: 0.8, ease: "easeOut" },
                      }
                    : {}
            }
            whileHover={{ scale: 1.05 }}
          >
            {/* Coaster visual */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-amber-900/60 to-amber-800/40 border-2 border-amber-700/30 flex items-center justify-center shadow-lg relative overflow-hidden">
              {/* Cork texture pattern */}
              <div className="absolute inset-2 rounded-full border border-amber-600/20" />
              <div className="absolute inset-4 rounded-full border border-amber-600/10" />
              {/* Center text */}
              <div className="text-center z-10">
                <span className="text-amber-400/80 text-xs font-mono block">
                  TED-YEE
                </span>
                <span className="text-amber-500/60 text-[10px] font-mono block">
                  BEER HOUSE
                </span>
              </div>
              {/* Wet ring stain */}
              <div className="absolute inset-3 rounded-full border border-amber-400/10 opacity-50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden message under coaster */}
      <AnimatePresence>
        {phase === "gone" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-dashed border-white/10 flex items-center justify-center"
          >
            <p className="text-xs text-gray-500 font-mono text-center px-2">
              {hiddenMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
