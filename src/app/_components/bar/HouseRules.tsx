"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion";

type SignPhase = "idle" | "tilting" | "loose" | "fallen" | "revealed";

const FRONT_RULES = [
  'Rule #1: No console.log() debugging in production',
  "Rule #2: Tabs vs Spaces? We don't talk about that here",
  'Rule #3: No deploying on Fridays',
  'Rule #4: All bugs are "features" until proven otherwise',
  'Rule #5: The bartender is always right',
];

const BACK_RULES = [
  "Real Rule #1: The password is always 'password'",
  "Real Rule #2: The best code is no code",
  "Real Rule #3: If it works, don't refactor it",
  "Real Rule #4: undefined is not a function (but it is a lifestyle)",
  "Real Rule #5: There is no Rule #5",
];

export default function HouseRules() {
  const [clickCount, setClickCount] = useState(0);
  const [phase, setPhase] = useState<SignPhase>("idle");
  const [showBack, setShowBack] = useState(false);

  const handleClick = useCallback(() => {
    const next = clickCount + 1;
    setClickCount(next);

    if (next <= 2) {
      setPhase("tilting");
      setTimeout(() => setPhase("idle"), 600);
    } else if (next <= 4) {
      setPhase("loose");
      setTimeout(() => setPhase("idle"), 800);
    } else if (next === 5) {
      setPhase("fallen");
      setTimeout(() => {
        setShowBack(true);
        setPhase("revealed");
      }, 1200);
      setTimeout(() => {
        setShowBack(false);
        setPhase("idle");
        setClickCount(0);
      }, 7000);
    }
  }, [clickCount]);

  const getAnimationProps = (): TargetAndTransition => {
    switch (phase) {
      case "tilting":
        return {
          rotate: [0, -2, 2, -1, 0],
          transition: { duration: 0.5 },
        };
      case "loose":
        return {
          rotate: [0, -5, 3, -8, 5, -3, 0],
          y: [0, 2, -1, 3, -1, 1, 0],
          transition: { duration: 0.8 },
        };
      case "fallen":
        return {
          rotate: [0, -15, 5, 85, 95, 88, 90],
          y: [0, -10, 5, 100, 120, 115, 110],
          x: [0, -5, 3, 20, 15, 18, 16],
          transition: { duration: 1.2, ease: "easeIn" as const },
        };
      default:
        return {};
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!showBack ? (
          <motion.div
            key="front"
            className="relative cursor-pointer select-none"
            onClick={handleClick}
            animate={getAnimationProps()}
            style={{ transformOrigin: "top center" }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Nail */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-500 border border-gray-400 z-10 shadow-sm">
              <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-gray-300" />
            </div>
            {phase === "loose" && (
              <div className="absolute -top-2 right-1/4 w-2 h-2 rounded-full bg-gray-600 border border-gray-500 z-10 opacity-50" />
            )}

            {/* Sign board */}
            <div className="bg-amber-950/60 backdrop-blur-sm border border-amber-800/30 rounded-lg p-4 sm:p-5 shadow-xl min-w-[240px] sm:min-w-[280px]">
              <h3 className="text-amber-400 font-bold text-sm sm:text-base mb-3 text-center border-b border-amber-800/30 pb-2">
                🍺 House Rules
              </h3>
              <ul className="space-y-1.5">
                {FRONT_RULES.map((rule, i) => (
                  <li
                    key={i}
                    className="text-[10px] sm:text-xs text-gray-400 font-mono leading-relaxed"
                  >
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="select-none"
          >
            <div className="bg-amber-950/80 backdrop-blur-sm border border-amber-600/30 rounded-lg p-4 sm:p-5 shadow-xl min-w-[240px] sm:min-w-[280px]">
              <h3 className="text-amber-300 font-bold text-sm sm:text-base mb-3 text-center border-b border-amber-600/30 pb-2">
                🤫 The Real Rules
              </h3>
              <ul className="space-y-1.5">
                {BACK_RULES.map((rule, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="text-[10px] sm:text-xs text-amber-200/70 font-mono leading-relaxed"
                  >
                    {rule}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
