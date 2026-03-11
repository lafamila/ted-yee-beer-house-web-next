"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

interface NeonSignProps {
  onBackronymReveal?: () => void;
}

const FULL_TEXT = "Ted-yee Beer House";
const SUBTITLE_REVEAL = "Est. 2026 — Powered by Caffeine & Soju";
const BACKRONYM_LINES = [
  { letter: "T", rest: "ech" },
  { letter: "E", rest: "nthusiast" },
  { letter: "D", rest: "eveloper" },
  { letter: "-", rest: "" },
  { letter: "Y", rest: "our" },
  { letter: "E", rest: "veryday" },
  { letter: "E", rest: "ngineer" },
];

type SignPhase =
  | "idle"
  | "flicker1"
  | "flicker2"
  | "letters_off"
  | "spark_recovery"
  | "subtitle_reveal"
  | "cooldown";

export default function NeonSign({ onBackronymReveal }: NeonSignProps) {
  const [clickCount, setClickCount] = useState(0);
  const [phase, setPhase] = useState<SignPhase>("idle");
  const [offLetters, setOffLetters] = useState<Set<number>>(new Set());
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showBackronym, setShowBackronym] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [backronymProgress, setBackronymProgress] = useState(0);

  const resetSign = useCallback(() => {
    setClickCount(0);
    setPhase("idle");
    setOffLetters(new Set());
    setShowSubtitle(false);
  }, []);

  const handleClick = useCallback(() => {
    const next = clickCount + 1;
    setClickCount(next);

    if (next <= 2) {
      setPhase("flicker1");
      setTimeout(() => setPhase("idle"), 300);
    } else if (next <= 4) {
      setPhase("flicker2");
      // Turn off random letters
      const indices = new Set<number>();
      const textLen = FULL_TEXT.length;
      const count = 2 + Math.floor(Math.random() * 3);
      while (indices.size < count) {
        const idx = Math.floor(Math.random() * textLen);
        if (FULL_TEXT[idx] !== " " && FULL_TEXT[idx] !== "-") indices.add(idx);
      }
      setOffLetters(indices);
      setTimeout(() => {
        setPhase("idle");
        setOffLetters(new Set());
      }, 800);
    } else if (next === 5) {
      setPhase("letters_off");
      // Gradually turn off letters until only "Ted Beer" remains
      const keepIndices = new Set<number>();
      "Ted".split("").forEach((_, i) => keepIndices.add(i)); // T=0, e=1, d=2
      // Find "Beer" position
      const beerStart = FULL_TEXT.indexOf("Beer");
      "Beer".split("").forEach((_, i) => keepIndices.add(beerStart + i));

      const turnOffIndices: number[] = [];
      for (let i = 0; i < FULL_TEXT.length; i++) {
        if (!keepIndices.has(i) && FULL_TEXT[i] !== " ") turnOffIndices.push(i);
      }

      // Animate turning off one by one
      turnOffIndices.forEach((idx, i) => {
        setTimeout(() => {
          setOffLetters((prev) => new Set([...prev, idx]));
        }, i * 120);
      });
    } else if (next === 6) {
      // Spark recovery
      setPhase("spark_recovery");
      setTimeout(() => {
        setOffLetters(new Set());
        setShowSubtitle(true);
        setPhase("subtitle_reveal");
      }, 600);
      setTimeout(() => {
        setPhase("cooldown");
      }, 4000);
      setTimeout(() => {
        resetSign();
      }, 5000);
    }
  }, [clickCount, resetSign]);

  // Ted-yee hover for backronym
  const handleTedYeeMouseEnter = useCallback(() => {
    const timer = setTimeout(() => {
      setShowBackronym(true);
      setBackronymProgress(0);
      onBackronymReveal?.();
      // Animate each line appearing
      BACKRONYM_LINES.forEach((_, i) => {
        setTimeout(() => setBackronymProgress(i + 1), (i + 1) * 300);
      });
    }, 3000);
    setHoverTimer(timer);
  }, [onBackronymReveal]);

  const handleTedYeeMouseLeave = useCallback(() => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setHoverTimer(null);
    setShowBackronym(false);
    setBackronymProgress(0);
  }, [hoverTimer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hoverTimer) clearTimeout(hoverTimer);
    };
  }, [hoverTimer]);

  const getFlickerClass = () => {
    if (phase === "flicker1") return "animate-neon-flicker-subtle";
    if (phase === "flicker2") return "animate-neon-flicker-heavy";
    if (phase === "spark_recovery") return "animate-neon-spark";
    return "";
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Main neon sign */}
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={handleClick}
        whileTap={{ scale: 0.98 }}
      >
        <h1
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight ${getFlickerClass()}`}
          style={{
            textShadow:
              phase === "spark_recovery"
                ? "0 0 40px #3994ef, 0 0 80px #3994ef, 0 0 120px #6366f1"
                : "0 0 10px #3994ef80, 0 0 40px #3994ef40, 0 0 80px #3994ef20",
            transition: "text-shadow 0.3s",
          }}
        >
          {FULL_TEXT.split("").map((char, i) => {
            const isTedYee = i < 7; // "Ted-yee"
            return (
              <span
                key={i}
                className={`inline-block transition-opacity duration-300 ${
                  offLetters.has(i) ? "opacity-0" : ""
                } ${
                  isTedYee ? "" : ""
                }`}
                style={{
                  color: offLetters.has(i)
                    ? "transparent"
                    : "white",
                  textShadow: offLetters.has(i)
                    ? "none"
                    : undefined,
                }}
                onMouseEnter={
                  i === 0 ? handleTedYeeMouseEnter : undefined
                }
                onMouseLeave={
                  i === 0 ? handleTedYeeMouseLeave : undefined
                }
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </h1>

        {/* Ted-yee hover zone (invisible, covers "Ted-yee") */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{ width: "40%" }}
          onMouseEnter={handleTedYeeMouseEnter}
          onMouseLeave={handleTedYeeMouseLeave}
        />
      </motion.div>

      {/* Subtitle reveal after spark */}
      {showSubtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-4 text-sm text-gray-400 font-mono"
          style={{
            textShadow: "0 0 10px #3994ef40",
          }}
        >
          {SUBTITLE_REVEAL}
        </motion.p>
      )}

      {/* Backronym tooltip */}
      {showBackronym && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-48 left-0 sm:left-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 font-mono text-sm z-50"
        >
          {BACKRONYM_LINES.map((line, i) => (
            <div
              key={i}
              className={`transition-opacity duration-300 ${
                i < backronymProgress ? "opacity-100" : "opacity-0"
              }`}
            >
              {line.letter === "-" ? (
                <span className="text-gray-600">—</span>
              ) : (
                <>
                  <span className="text-[#3994ef] font-bold">
                    {line.letter}
                  </span>
                  <span className="text-gray-400">{line.rest}</span>
                </>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
