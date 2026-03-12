"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "./theme";

interface NeonSignProps {
  onBackronymReveal?: () => void;
}

const BACKRONYM_LINES = [
  { letter: "T", rest: "ired" },
  { letter: "E", rest: "veryday" },
  { letter: "D", rest: "eveloper" },
  { letter: "-", rest: "" },
  { letter: "Y", rest: "et" },
  { letter: "E", rest: "asily" },
  { letter: "E", rest: "xcited" },
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
  const theme = useTheme();
  const fullText = theme.brand.fullText;
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
      const textLen = fullText.length;
      const count = 2 + Math.floor(Math.random() * 3);
      while (indices.size < count) {
        const idx = Math.floor(Math.random() * textLen);
        if (fullText[idx] !== " " && fullText[idx] !== "-") indices.add(idx);
      }
      setOffLetters(indices);
      setTimeout(() => {
        setPhase("idle");
        setOffLetters(new Set());
      }, 800);
    } else if (next === 5) {
      setPhase("letters_off");
      const keepIndices = new Set<number>();
      "Ted".split("").forEach((_, i) => {
        keepIndices.add(i);
      });
      const lastWord = fullText.split(" ").pop() || "";
      const lastWordStart = fullText.lastIndexOf(lastWord);
      if (lastWordStart >= 0) {
        lastWord.split("").forEach((_, i) => {
          keepIndices.add(lastWordStart + i);
        });
      }

      const turnOffIndices: number[] = [];
      for (let i = 0; i < fullText.length; i++) {
        if (!keepIndices.has(i) && fullText[i] !== " ") turnOffIndices.push(i);
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
  }, [clickCount, fullText, resetSign]);

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
    if (phase === "idle") return "animate-neon-breathe";
    return "";
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Backronym tooltip — above the title, horizontal */}
      {showBackronym && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-5 py-2.5 font-mono text-sm z-50 whitespace-nowrap"
        >
          <div className="flex items-center gap-1">
            {BACKRONYM_LINES.map((line, i) => (
              <span
                key={i}
                className={`transition-opacity duration-300 ${
                  i < backronymProgress ? "opacity-100" : "opacity-0"
                }`}
              >
                {line.letter === "-" ? (
                  <span className="text-gray-600 mx-1">—</span>
                ) : (
                  <>
                    <span className="text-[#3994ef] font-bold">
                      {line.letter}
                    </span>
                    <span className="text-gray-400">{line.rest}</span>
                  </>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      )}

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
                : "0 0 7px #3994ef80, 0 0 14px #3994ef60, 0 0 28px #3994ef40, 0 0 56px #3994ef20",
            transition: "text-shadow 0.3s",
          }}
        >
          {fullText.split("").map((char, i) => {
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
          {theme.brand.subtitleReveal}
        </motion.p>
      )}
    </div>
  );
}
