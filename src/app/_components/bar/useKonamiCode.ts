"use client";

import { useState, useEffect, useCallback } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export function useKonamiCode() {
  const [isVIP, setIsVIP] = useState(false);
  const [progress, setProgress] = useState(0);

  const reset = useCallback(() => {
    setIsVIP(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    function handleKeyDown(e: KeyboardEvent) {
      if (resetTimer) clearTimeout(resetTimer);

      if (e.key === KONAMI_SEQUENCE[currentIndex]) {
        currentIndex++;
        setProgress(currentIndex);

        if (currentIndex === KONAMI_SEQUENCE.length) {
          setIsVIP(true);
          currentIndex = 0;
          setProgress(0);
        }
      } else {
        currentIndex = 0;
        setProgress(0);
      }

      // Reset after 3s of inactivity
      resetTimer = setTimeout(() => {
        currentIndex = 0;
        setProgress(0);
      }, 3000);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return { isVIP, progress, totalSteps: KONAMI_SEQUENCE.length, reset };
}
