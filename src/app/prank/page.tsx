"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SPINNER_FRAMES = ["◐", "◓", "◑", "◒"];
const ORIGINAL_TITLE = "TeddyNote - Developer Memo App";

// SVG path for a default arrow cursor
const CURSOR_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 20 28"><path d="M0 0 L0 24 L5.4 18.6 L9.8 27.4 L13.2 25.8 L8.8 17 L16 17 Z" fill="white" stroke="black" stroke-width="1.2"/></svg>`)}`;

export default function PrankPage() {
  const [isLagging, setIsLagging] = useState(false);
  const fakeCursorRef = useRef<HTMLDivElement>(null);
  const realMousePos = useRef({ x: 0, y: 0 });
  const displayedPos = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const spinnerIntervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const startLag = useCallback(() => {
    // Start tab title spinner
    let frame = 0;
    spinnerIntervalRef.current = setInterval(() => {
      document.title = `${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]} Loading...`;
      frame++;
    }, 200);

    // Laggy cursor: update fake cursor position at ~6fps with choppy jumps
    updateIntervalRef.current = setInterval(() => {
      displayedPos.current = {
        x: realMousePos.current.x,
        y: realMousePos.current.y,
      };
      if (fakeCursorRef.current) {
        fakeCursorRef.current.style.transform = `translate(${displayedPos.current.x}px, ${displayedPos.current.y}px)`;
      }
    }, 160); // ~6fps — noticeable choppiness
  }, []);

  const stopLag = useCallback(() => {
    if (spinnerIntervalRef.current) {
      clearInterval(spinnerIntervalRef.current);
      spinnerIntervalRef.current = null;
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    document.title = ORIGINAL_TITLE;
  }, []);

  const handleClick = useCallback(() => {
    setIsLagging((prev) => {
      const next = !prev;
      if (next) {
        startLag();
      } else {
        stopLag();
      }
      return next;
    });
  }, [startLag, stopLag]);

  // Track real mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      realMousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLag();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [stopLag]);

  return (
    <div
      className="relative flex items-center justify-center min-h-screen"
      style={isLagging ? { cursor: "none" } : undefined}
    >
      <button
        onClick={handleClick}
        className={
          isLagging
            ? "px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 text-white/60 border border-white/10 select-none"
            : "px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer select-none"
        }
        style={isLagging ? { cursor: "none", pointerEvents: "auto" } : undefined}
      >
        {isLagging ? "Click Me" : "Don't Click"}
      </button>

      {/* Fake laggy cursor */}
      {isLagging && (
        <div
          ref={fakeCursorRef}
          className="fixed top-0 left-0 pointer-events-none z-[9999]"
          style={{
            width: 20,
            height: 28,
            backgroundImage: `url("${CURSOR_SVG}")`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            willChange: "transform",
          }}
        />
      )}
    </div>
  );
}
