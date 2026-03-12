"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon, Github, Mail, Linkedin } from "lucide-react";
import NeonSign from "./bar/NeonSign";
import BeerGlass from "./bar/BeerGlass";
import CoffeeCup from "./bar/CoffeeCup";
import Coaster from "./bar/Coaster";
import HouseRules from "./bar/HouseRules";
import BarTab from "./bar/BarTab";
import WeatherWindow from "./bar/WeatherWindow";
import WeatherBackground from "./bar/WeatherBackground";
import BarTerminalOverlay, { BAR_SECTIONS, type BarSectionId } from "./bar/BarTerminalOverlay";
import VIPMenu from "./bar/VIPMenu";
import { useWeather } from "./bar/useWeather";
import { useKonamiCode } from "./bar/useKonamiCode";
import { ThemeProvider, useTheme } from "./bar/theme";

export default function BarLanding() {
  return (
    <ThemeProvider>
      <BarLandingContent />
    </ThemeProvider>
  );
}

function BarLandingContent() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hiddenSections, setHiddenSections] = useState<Set<BarSectionId>>(new Set());
  const [drunkAngles, setDrunkAngles] = useState<Partial<Record<BarSectionId, number>>>({});
  const drunkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const drunkStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drunkIntensityRef = useRef(0);
  const deleteTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const weather = useWeather();
  const { isVIP, reset: resetVIP } = useKonamiCode();

  const clearDeleteTimers = useCallback(() => {
    deleteTimersRef.current.forEach(clearTimeout);
    deleteTimersRef.current = [];
  }, []);

  const sectionStyle = useCallback(
    (sectionId: BarSectionId) => {
      const isHidden = hiddenSections.has(sectionId);
      const angle = drunkAngles[sectionId] ?? 0;

      return {
        opacity: isHidden ? 0 : 1,
        transform: `rotate(${angle}deg) scale(${isHidden ? 0.98 : 1})`,
        transition: "opacity 0.5s ease, transform 0.5s ease",
        transformOrigin: "center center",
      };
    },
    [hiddenSections, drunkAngles]
  );

  const stopDrunkEffect = useCallback(() => {
    if (drunkIntervalRef.current) {
      clearInterval(drunkIntervalRef.current);
      drunkIntervalRef.current = null;
    }
    if (drunkStopTimerRef.current) {
      clearTimeout(drunkStopTimerRef.current);
      drunkStopTimerRef.current = null;
    }
    drunkIntensityRef.current = 0;
    setDrunkAngles({});
  }, []);

  const handleDrunkEffect = useCallback((drinkCount: number) => {
    // Scale max angle with drink count: 2→1.5°, 3→2.5°, 4→3.5°, 5+→4.5°
    const maxAngle = Math.min(1 + drinkCount * 0.75, 5);
    drunkIntensityRef.current = maxAngle;

    // Start interval if not already running
    if (!drunkIntervalRef.current) {
      // Set initial angles immediately
      const initial = BAR_SECTIONS.reduce<Partial<Record<BarSectionId, number>>>((acc, sectionId) => {
        acc[sectionId] = Number((Math.random() * maxAngle * 2 - maxAngle).toFixed(2));
        return acc;
      }, {});
      setDrunkAngles(initial);

      drunkIntervalRef.current = setInterval(() => {
        const intensity = drunkIntensityRef.current;
        const nextAngles = BAR_SECTIONS.reduce<Partial<Record<BarSectionId, number>>>((acc, sectionId) => {
          acc[sectionId] = Number((Math.random() * intensity * 2 - intensity).toFixed(2));
          return acc;
        }, {});
        setDrunkAngles(nextAngles);
      }, 1000);
    }

    // Reset the stop timer (extends drunk duration on more drinks)
    if (drunkStopTimerRef.current) {
      clearTimeout(drunkStopTimerRef.current);
    }
    drunkStopTimerRef.current = setTimeout(() => {
      stopDrunkEffect();
    }, 8000);
  }, [stopDrunkEffect]);

  const handleDeleteEffect = useCallback((sections: string[], onComplete: () => void) => {
    clearDeleteTimers();

    if (sections.length === 0) {
      setHiddenSections(new Set());
      onComplete();
      return;
    }

    setHiddenSections(new Set());

    sections.forEach((sectionId, index) => {
      const timeoutId = setTimeout(() => {
        setHiddenSections((prev) => {
          const next = new Set(prev);
          if (BAR_SECTIONS.includes(sectionId as BarSectionId)) {
            next.add(sectionId as BarSectionId);
          }
          return next;
        });

        if (index === sections.length - 1) {
          onComplete();
        }
      }, index * 400);

      deleteTimersRef.current.push(timeoutId);
    });
  }, [clearDeleteTimers]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      stopDrunkEffect();
      clearDeleteTimers();
    };
  }, [stopDrunkEffect, clearDeleteTimers]);

  // Elapsed timer for bar tab
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Console easter egg
  useEffect(() => {
    if (!mounted) return;
    const accentColor = theme.type === "bar" ? "#f59e0b" : "#6b4226";
    console.log(
      `%c${theme.brand.consoleTitle}`,
      `font-size: 24px; font-weight: bold; color: ${accentColor};`
    );
    console.log(
      "%cYou found the console! Here's your reward: 🎉",
      "font-size: 14px; color: #3994ef;"
    );
    console.log(
      "%c" + theme.brand.consoleAsciiLines.join("\n"),
      `font-family: monospace; font-size: 12px; color: ${accentColor};`
    );
  }, [mounted, theme]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen overflow-hidden relative font-sans ${isVIP ? "vip-mode" : ""}`}>
      {/* Weather-reactive background */}
      <WeatherBackground weather={weather} />

      {/* HTML hidden comment easter egg — rendered as a real comment via dangerouslySetInnerHTML */}
      <div
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: "<!-- 여기까지 찾아온 당신, 진정한 개발자군요. 커피 한잔 사드릴게요: ☕ -->\n<!-- P.S. 콘솔도 확인해보세요 -->\n<!-- P.P.S. 코나미 코드도 아시죠? ↑↑↓↓←→←→BA -->",
        }}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 md:pt-32 pb-20">
        {/* ═══ Top Section: Neon Sign ═══ */}
        <div style={sectionStyle("neon-sign")}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <NeonSign />
          </motion.div>
        </div>

        {/* ═══ Main Grid: Bar Layout ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          {/* ─── Left Column: Menu Board + House Rules ─── */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            {/* Menu Board (Navigation) */}
            <div style={sectionStyle("menu-board")}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">📋</span> Menu
                  </h2>
                  <nav className="space-y-2">
                    <MenuLink href="/todo" emoji="📝" label="Memo" desc="Developer notes" />
                    <MenuLink href="/game" emoji="🕹️" label="Game" desc="Pixel adventure" />
                    <MenuLink href="/articles" emoji="📰" label="Articles" desc="Blog posts" />
                    <MenuLink href="/portfolio" emoji="💼" label="Portfolio" desc="The serious page" />
                  </nav>
                </div>
              </motion.div>
            </div>

            {/* House Rules */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-center"
            >
              <HouseRules />
            </motion.div>
          </div>

          {/* ─── Center Column: Bartender + Beer ─── */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            {/* Bartender introduction */}
            <div style={sectionStyle("bartender-intro")}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6 text-center"
              >
                <div className="text-4xl mb-3">🧑‍💻</div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  Hi, I&apos;m{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3994ef] to-purple-500">
                    Teddy
                  </span>
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  Full-Stack Developer by day,
                  <br />
                  {theme.type === "bar" ? "bartender of this virtual bar" : "barista of this virtual café"} by night.
                  <br />
                  <span className="text-xs text-gray-500">
                    (a.k.a. Lee KyoungMin / lafamila)
                  </span>
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm cursor-default">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <span className="text-xs text-gray-400">Open for projects</span>
                </div>

                {/* Social links */}
                <div className="mt-4 flex justify-center gap-4 text-gray-500">
                  <SocialLink
                    href="https://github.com/lafamila"
                    icon={<Github className="w-5 h-5" />}
                    label="Github"
                  />
                  <SocialLink
                    href="https://linkedin.com"
                    icon={<Linkedin className="w-5 h-5" />}
                    label="LinkedIn"
                  />
                  <SocialLink
                    href="mailto:hello@example.com"
                    icon={<Mail className="w-5 h-5" />}
                    label="Email"
                  />
                </div>
              </motion.div>
            </div>

            {/* Beer Glass + Coaster */}
            <div style={sectionStyle("beer-glass")}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col items-center gap-2"
              >
                {theme.type === "bar" ? <BeerGlass /> : <CoffeeCup />}
                <Coaster />
              </motion.div>
            </div>
          </div>

          {/* ─── Right Column: Bar Tab + Weather ─── */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            {/* Bar Tab + Weather Bartender */}
            <div style={sectionStyle("bar-tab")}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <BarTab weather={weather} />
              </motion.div>
            </div>

            {/* Weather Window */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <WeatherWindow weather={weather} />
            </motion.div>
            {/* Tech Grid Cards */}
            <div style={sectionStyle("grid-cards")}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="grid grid-cols-2 gap-3"
              >
                <GridCard
                  title="7+ Years"
                  desc="Writing code & fixing bugs"
                  emoji="⚡"
                  delay={0.8}
                />
                <GridCard
                  title="Full Stack"
                  desc="Frontend to infrastructure"
                  emoji="🔧"
                  delay={0.9}
                />
                <GridCard
                  title="Open Source"
                  desc="Contributing & learning"
                  emoji="🌐"
                  delay={1.0}
                />
                <GridCard
                  title="Seoul, KR"
                  desc="Based in South Korea"
                  emoji="📍"
                  delay={1.1}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* ═══ Terminal Toggle (Fixed Bottom Right) ═══ */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={() => setIsTerminalOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 p-3 sm:p-4 bg-[#3994ef] text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40 group"
        style={{
          boxShadow: "0 0 20px rgba(57, 148, 239, 0.3)",
        }}
      >
        <TerminalIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* Terminal Overlay */}
      <BarTerminalOverlay
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        elapsedSeconds={elapsed}
        onDrunkEffect={handleDrunkEffect}
        onDeleteEffect={handleDeleteEffect}
      />

      {/* VIP Menu (Konami Code) */}
      <VIPMenu isVIP={isVIP} onClose={resetVIP} />
    </div>
  );
}

// ─── Sub-components ───

function MenuLink({
  href,
  emoji,
  label,
  desc,
}: {
  href: string;
  emoji: string;
  label: string;
  desc: string;
}) {
  return (
    <motion.a
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
      whileHover={{ x: 4 }}
    >
      <span className="text-lg group-hover:scale-110 transition-transform">
        {emoji}
      </span>
      <div>
        <span className="text-sm font-semibold text-white group-hover:text-[#3994ef] transition-colors">
          {label}
        </span>
        <span className="text-xs text-gray-500 block">{desc}</span>
      </div>
    </motion.a>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3, color: "#fff" }}
      className="hover:text-white transition-colors"
      aria-label={label}
    >
      {icon}
    </motion.a>
  );
}

function GridCard({
  title,
  desc,
  emoji,
  delay,
}: {
  title: string;
  desc: string;
  emoji: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3, borderColor: "rgba(255,255,255,0.2)" }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors"
    >
      <span className="text-xl block mb-2">{emoji}</span>
      <h3 className="text-sm font-bold mb-1">{title}</h3>
      <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
    </motion.div>
  );
}
