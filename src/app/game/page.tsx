"use client";
import { GameAPIInterface, TerminalHandler } from "@/lib/types";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@/components/ui/Terminal";
import { GAME_TILE } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, X } from "lucide-react";

const GamePlaySection = dynamic(() => import("./_components/GamePlaySection"), { ssr: false });
export default function GamePage() {
  const terminalRef = useRef<TerminalHandler>(null);
  const gameRef = useRef<GameAPIInterface | null>(null);
  const wrongPasswordCountRef = useRef(0);
  const [permission, setPermission] = useState("anonymous");
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const handleReady = useCallback((api: GameAPIInterface) => {
    gameRef.current = api;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setWindowWidth(window.innerWidth);
    }, 0);

    const onResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (permission === "admin") {
      void terminalRef.current?.print(["Welcome, Admin! ... but who are you, really?", "Try 'help' ... if you're recognized."]);
    }
    else if (permission === "idiot") {
      void terminalRef.current?.print(["Welcome, Idiot! Such impressive confidence.", "Try 'help'. You'll need it more than most."]);
    }
  }, [permission]);

  const handleTerminalButtonClick = useCallback(() => {
    if (permission === "anonymous") {
      gameRef.current?.showBubble("?");
    } else {
      setIsTerminalOpen((prev) => !prev);
    }
  }, [permission]);

  if (!mounted) return null;

  const resolution = {
    width: Math.floor(windowWidth / GAME_TILE) * GAME_TILE,
    height: GAME_TILE * 16
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Game takes full screen */}
      <GamePlaySection
        style={{ width: resolution.width, height: resolution.height, margin: "0 auto" }}
        resolution={resolution}
        onReady={handleReady}
        permission={permission}
        setPermission={setPermission}
      />

      {/* Floating terminal button (bottom-right) */}
      <button
        onClick={handleTerminalButtonClick}
        className="fixed bottom-8 right-8 p-4 bg-[#3994ef] text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40 group"
      >
        <TerminalIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Terminal overlay (only when not anonymous) */}
      <AnimatePresence>
        {isTerminalOpen && permission !== "anonymous" && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl flex flex-col"
            style={{ height: "300px" }}
            onClick={() => terminalRef.current?.focus()}
          >
            <Terminal
              ref={terminalRef}
              prompt={`${permission}@ted-yee-beer-house`}
              height="100%"
              className="h-full"
              welcomeMessages={[
                "Welcome to the Terminal!",
                "Type 'help' to see available commands.",
              ]}
              onExit={() => setIsTerminalOpen(false)}
              headerControls={
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsTerminalOpen(false); }}
                    className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors text-gray-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              }
              onCommand={async (cmd, args) => {
                if (permission === "admin" || permission === "idiot") {
                  if (cmd === "help") {
                    return [
                      "help                    Show this help",
                      "clear                   Clear the screen",
                      "echo [text]             Print text",
                      "date                    Print current date",
                      "whoami                  Who am I?",
                      "",
                      "-- Game Commands --",
                      "tp <gx> <gy>             Teleport player",
                      "speed [value]            Get/set player speed",
                      "jump [force]             Make player jump",
                      "gravity <value>          Set gravity",
                      "spawn <type> [gx] [gy]   Spawn box or mushroom",
                      "reset                    Reset the game scene",
                    ];
                  }
                  return await gameRef.current?.exec(cmd, args);
                } else if (permission === "guest") {
                  switch (cmd) {
                    case "help":
                      return [
                        "help                    Show this help",
                        "ping                    pong",
                        "sum [num1] [num2] ...   Sum numbers",
                        "date                    Print current date",
                        "sudo                    Gain admin permission",
                      ];
                    case "ping": return "pong";
                    case "sum": return String(args.map(Number).reduce((a, b) => a + b, 0));
                    case "date": return new Date().toLocaleString();
                    case "sudo":
                      if (permission === "guest") {
                        try {
                          const pwd = await terminalRef.current?.read({
                            label: wrongPasswordCountRef.current < 3 ? `Enter password: ` : `Enter 'password', you idiot: `,
                            isSecret: true,
                          });
                          if (pwd === "password") {
                            setPermission(wrongPasswordCountRef.current < 3 ? "admin" : "idiot");
                            wrongPasswordCountRef.current = 0;
                            return "";
                          }
                          wrongPasswordCountRef.current += 1;
                          return "Incorrect password.";
                        } catch {
                          return "Canceled.";
                        }
                      }
                      return "";
                    default:
                      return "Permission denied";
                  }
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
