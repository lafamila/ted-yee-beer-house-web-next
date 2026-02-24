"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { Terminal } from "@/components/ui/Terminal";
import { TerminalHandler } from "@/lib/types";

interface TerminalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const TerminalOverlay = ({ isOpen, onClose }: TerminalOverlayProps) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = useRef<TerminalHandler>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            height: isMaximized ? "100vh" : "300px",
          }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl flex flex-col"
          onClick={() => terminalRef.current?.focus()}
        >
          <Terminal
            ref={terminalRef}
            prompt="guest@portfolio:~"
            height="100%"
            className="h-full"
            welcomeMessages={[
              "Welcome to AlexDev Portfolio v2.4.0",
              "Type 'help' for a list of commands.",
            ]}
            onExit={onClose}
            headerControls={
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors text-gray-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            }
            onCommand={(cmd, args) => {
              switch (cmd) {
                case "help":
                  return [
                    "help                    Show this help",
                    "clear                   Clear the screen",
                    "echo [text]             Print text",
                    "date                    Print current date",
                    "whoami                  Print prompt name",
                    "ping                    pong",
                    "sum [num1] [num2] ...   Sum numbers",
                    "game                    Go to game page",
                    "todo                    Go to todo page",
                  ];
                case "ping":
                  return "pong";
                case "sum":
                  return String(args.map(Number).reduce((a, b) => a + b, 0));
                case "game":
                  window.location.href = "/game";
                  return "Navigating to /game...";
                case "todo":
                  window.location.href = "/todo";
                  return "Navigating to /todo...";
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TerminalOverlay;
