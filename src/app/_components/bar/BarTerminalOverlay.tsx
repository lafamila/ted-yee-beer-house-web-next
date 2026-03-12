"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { Terminal } from "@/components/ui/Terminal";
import { TerminalHandler } from "@/lib/types";
import { useTheme } from "./theme";

interface BarTerminalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  elapsedSeconds: number;
  onDrunkEffect?: (drinkCount: number) => void;
  onDeleteEffect?: (sections: string[], onComplete: () => void) => void;
}

export const BAR_SECTIONS = [
  "neon-sign",
  "menu-board",
  "bartender-intro",
  "beer-glass",
  "bar-tab",
  "grid-cards",
] as const;

export type BarSectionId = (typeof BAR_SECTIONS)[number];

// ─── State machines for special modes ───
type TerminalMode = "normal" | "vim" | "python" | "drunk";

function formatTabTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} seconds`;
  return `${m}m ${s}s`;
}

const SL_FRAMES = [
  [
    "      ====        ________                ___________",
    "  _D _|  |_______/        \\__I_I_____===__|_________|",
    "   |(_)---  |   H\\________/ |   |        =|___ ___|",
    "   /     |  |   H  |  |     |   |         ||_| |_||",
    "  |      |  |   H  |__--------------------| [___] |",
    "  | ________|___H__/__|_____/[][]~\\_______|       |",
    "  |/ |   |-----------I_____I [][] []  D   |=======|__",
    "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__",
    " |/-=|___|=    ||    ||    ||    |_____/~\\___/",
    "  \\_/      \\O=====O=====O=====O_/      \\_/",
  ],
];

const MATRIX_CHARS = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEF";

function isRootDeleteCommand(args: string[]): boolean {
  const normalized = args.join(" ").replace(/\s+/g, " ").trim();
  const patterns = [
    "rm -rf /",
    "rm -rf /*",
    "rm -rf ./",
    "rm -rf .",
    "rm -rf / --no-preserve-root",
    "rm -rf --no-preserve-root /",
    "rm -rf --no-preserve-root /*",
    "rm -rf /* --no-preserve-root",
  ];

  return patterns.includes(normalized);
}

export default function BarTerminalOverlay({
  isOpen,
  onClose,
  elapsedSeconds,
  onDrunkEffect,
  onDeleteEffect,
}: BarTerminalOverlayProps) {
  const theme = useTheme();
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = useRef<TerminalHandler>(null);
  const orderCountRef = useRef<Record<string, number>>({});
  const modeRef = useRef<TerminalMode>("normal");
  const [, forceUpdate] = useState(0);

  const printDelayed = useCallback(
    (lines: string[], delayMs = 100) => {
      lines.forEach((line, i) => {
        setTimeout(() => {
          terminalRef.current?.print(line);
        }, i * delayMs);
      });
    },
    []
  );

  const runMatrixEffect = useCallback(() => {
    const lines: string[] = [];
    for (let i = 0; i < 12; i++) {
      let line = "";
      for (let j = 0; j < 40; j++) {
        line += MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      }
      lines.push(line);
    }
    printDelayed(lines, 80);

    setTimeout(() => {
      terminalRef.current?.print("");
      terminalRef.current?.print("Wake up, developer...");
    }, 12 * 80 + 300);
    setTimeout(() => {
      terminalRef.current?.print("The Matrix has you...");
    }, 12 * 80 + 1200);
    setTimeout(() => {
      terminalRef.current?.print("Follow the white cursor...");
      terminalRef.current?.print("");
      terminalRef.current?.print("(Knock knock, Teddy.)");
    }, 12 * 80 + 2200);
  }, [printDelayed]);

  const runSlTrain = useCallback(() => {
    SL_FRAMES[0].forEach((line, i) => {
      setTimeout(() => {
        terminalRef.current?.print(line);
      }, i * 100);
    });
  }, []);

  const handleCommand = useCallback(
    async (cmd: string, args: string[]): Promise<string | string[] | void> => {
      const fullCmd = [cmd, ...args].join(" ");

      // ─── VIM mode ───
      if (modeRef.current === "vim") {
        if (fullCmd === ":q!" || fullCmd === ":wq" || fullCmd === ":q") {
          modeRef.current = "normal";
          forceUpdate((n) => n + 1);
          return [
            "",
            "Congratulations. You are one of the 3% who escape vim on the first try.",
          ];
        }
        // In vim, typed text is buffer content — don't echo (Terminal handles display)
        return [];
      }

      // ─── Python REPL mode ───
      if (modeRef.current === "python") {
        if (fullCmd === "exit()" || fullCmd === "quit()") {
          modeRef.current = "normal";
          forceUpdate((n) => n + 1);
          return "";
        }
        if (fullCmd === "import antigravity") {
          return "Redirecting to xkcd.com... just kidding. Gravity is what keeps the beer in the glass.";
        }
        if (fullCmd === "import this") {
          return theme.terminal.zenOutput;
        }
        if (fullCmd.startsWith("print(")) {
          const content = fullCmd.slice(6, -1).replace(/['"]/g, "");
          return content || '""';
        }
        return `NameError: name '${cmd}' is not defined. This is a ${theme.type === "bar" ? "bar" : "café"}, not a Jupyter notebook.`;
      }

      // ─── Drunk mode (temporary) ───
      if (modeRef.current === "drunk") {
        // Garble the output slightly
        const garbled = fullCmd
          .split("")
          .map((c) => (Math.random() > 0.7 ? String.fromCharCode(c.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1)) : c))
          .join("");
        modeRef.current = "normal";
        forceUpdate((n) => n + 1);
        return `${garbled}${theme.drinks.cutoffMessage}`;
      }

      // ─── Normal mode commands ───

      // Bar commands
      if (cmd === "order") {
        const item = args[0] || "";
        if (!item) return theme.drinks.orderPrompt;
        const key = item.toLowerCase();
        orderCountRef.current[key] = (orderCountRef.current[key] || 0) + 1;
        const count = orderCountRef.current[key];

        const effectDrink = theme.drinks.effectDrinks.find((d) => d.name === key);
        if (effectDrink && count >= effectDrink.threshold) {
          onDrunkEffect?.(count);
        }

        const heavyDrink = theme.drinks.effectDrinks[0];
        if (
          heavyDrink &&
          key === heavyDrink.name &&
          count >= heavyDrink.threshold + 1 &&
          count % 3 === 0
        ) {
          modeRef.current = "drunk";
          forceUpdate((n) => n + 1);
          setTimeout(() => {
            modeRef.current = "normal";
            forceUpdate((n) => n + 1);
          }, 5000);
          return theme.drinks.heavyEffectMessages;
        }

        const msgs = theme.drinks.orderResponses[key];
        if (!msgs) {
          return `We don't serve '${item}' here. Try: ${theme.drinks.orderItems.join(", ")}.`;
        }
        const idx = Math.min(count - 1, msgs.length - 1);
        return msgs[idx];
      }

      if (cmd === "tab") {
        const m = Math.floor(elapsedSeconds / 60);
        const beers = Math.floor(m / 2);
        return [
          `Session: ${formatTabTime(elapsedSeconds)}`,
          `Estimated drinks: ${beers || "still sober"}`,
          `Total tab: $${(beers * 8.5).toFixed(2)} (just kidding, it's free)`,
        ];
      }

      if (cmd === "menu") return theme.menu.techMenu;

      if (cmd === "tip") {
        return theme.terminal.devTips[Math.floor(Math.random() * theme.terminal.devTips.length)];
      }

      if (cmd === "jukebox") {
        return theme.terminal.jukeboxResponses[
          Math.floor(Math.random() * theme.terminal.jukeboxResponses.length)
        ];
      }

      // ─── Dev easter eggs Tier 1 ───
      if (cmd === "sudo" && isRootDeleteCommand(args)) {
        terminalRef.current?.print(
          `Deleting ted-yee-${theme.type === "bar" ? "beer" : "coffee"}-house...`
        );
        const sections = [...BAR_SECTIONS];
        sections.sort(() => Math.random() - 0.5); // Shuffle the sections for dramatic effect
        const files = sections.map(
          (sectionId) =>
            `Removing ${theme.terminal.sectionLabels[sectionId] || sectionId} .......... done`
        );
        printDelayed(files, 400);

        const printJkAndRestore = () => {
          setTimeout(() => {
            onDeleteEffect?.([], () => undefined);
            terminalRef.current?.print("");
            terminalRef.current?.print(
              `Just kidding. This is a ${theme.type === "bar" ? "bar" : "café"}, not your production server.`
            );
            terminalRef.current?.print(
              `But your tab just doubled for trying. ${theme.barTab.drinkEmoji}${theme.barTab.drinkEmoji}`
            );
          }, 500);
        };

        if (onDeleteEffect) {
          onDeleteEffect(sections as string[], printJkAndRestore);
        } else {
          setTimeout(printJkAndRestore, files.length * 400);
        }
        return;
      }

      if (cmd === "sudo") {
        return `Nice try. The ${theme.type === "bar" ? "bartender" : "barista"} doesn't grant sudo access.`;
      }

      if (cmd === "vim" || cmd === "vi" || cmd === "nvim") {
        modeRef.current = "vim";
        forceUpdate((n) => n + 1);
        return [
          "You're now trapped in vim.",
          "...",
          "...",
          "Just like real life.",
          "(Try :q!, :wq, or just accept your fate)",
        ];
      }

      if (cmd === "git" && args[0] === "blame") {
        return theme.terminal.gitBlameOutput;
      }

      if (cmd === "git" && args[0] === "push" && args[1] === "--force") {
        return [
          "⚠️  FORCE PUSH DETECTED",
          "",
          "You just overwrote 3 months of your team's work.",
          "Your Slack is blowing up.",
          "Your tech lead is typing...",
          "",
          "Just kidding. But don't do that. 😤",
        ];
      }

      if (cmd === "git" && args[0] === "commit" && args.includes("-m")) {
        const msgIdx = args.indexOf("-m");
        const msg = args.slice(msgIdx + 1).join(" ").replace(/['"]/g, "");
        if (msg === "fix" || msg === "update" || msg === "changes" || msg === "wip") {
          return [
            `[main abc1234] ${msg}`,
            " 1 file changed, 1 insertion(+), 0 deletions(-)",
            "",
            "⚠️  Your commit message is a crime against humanity.",
            "   Future you will not appreciate this.",
          ];
        }
        return [
          `[main ${Math.random().toString(36).slice(2, 9)}] ${msg || "no message"}`,
          ` ${1 + Math.floor(Math.random() * 10)} files changed`,
        ];
      }

      if (cmd === "git") {
        return `git: '${args[0] || ""}' — not in a git repository (this is a bar)`;
      }

      if (cmd === "neofetch" || cmd === "fastfetch") {
        return theme.terminal.neofetchOutput;
      }

      if (cmd === "cat") {
        if (args.length === 0) return theme.terminal.catAscii;
        const path = args[0];
        if (path === "/menu") return theme.menu.techMenu;
        if (path === "/rules") return theme.terminal.catRules;
        if (path === "/wifi") return theme.terminal.catWifi;
        return `cat: ${path}: No such file or directory (this is a bar, not a filesystem)`;
      }

      // ─── Dev easter eggs Tier 2 ───
      if (cmd === "npm" && args[0] === "install") {
        return theme.terminal.npmInstallOutput;
      }

      if (cmd === "npm" && args[0] === "audit" && args[1] === "fix") {
        return [
          "fixed 0 of 3 vulnerabilities",
          "",
          "3 vulnerabilities required manual review and could not be updated,",
          "try running `npm audit fix --force` to break even more things",
          "",
          "Just like real life. 😌",
        ];
      }

      if (cmd === "npm") {
        return `npm: '${args[0]}' — not supported in bars`;
      }

      if (cmd === "brew" && args[0] === "install") {
        const pkg = args[1] || "beer";
        if (pkg === "beer" || pkg === "ipa" || pkg === "lager") {
          return theme.terminal.brewInstallOutput;
        }
        return `==> Error: ${pkg} is not a valid beverage. Try: brew install beer`;
      }

      if (cmd === "docker" && args[0] === "run") {
        return theme.terminal.dockerRunOutput;
      }

      if (cmd === "docker") {
        return `Cannot connect to the Docker daemon. Is the bartender running?`;
      }

      if (cmd === "python" || cmd === "python3") {
        modeRef.current = "python";
        forceUpdate((n) => n + 1);
        return [
          "Python 3.12.0 (ted-yee-beer-house edition)",
          'Type "help", "copyright", "credits" or "license" for more information.',
        ];
      }

      if (cmd === "ssh") {
        return theme.terminal.sshOutput;
      }

      if (cmd === "curl") {
        const url = args[0] || "";
        if (url.includes("localhost")) {
          return '{"status":"open","beer":"cold","bugs":"0","lies":"1"}';
        }
        return `curl: (7) Failed to connect to ${url || "nowhere"}: Connection refused (try the beer instead)`;
      }

      // ─── Dev easter eggs Tier 3 ───
      if (cmd === "sl") {
        runSlTrain();
        return;
      }

      if (cmd === "traceroute") {
        return theme.terminal.tracerouteOutput;
      }

      if (cmd === "man") {
        const page = args[0] || "";
        if (page === "teddy" || page === "lafamila") return theme.terminal.manOutput;
        return `No manual entry for ${page}. Try: man teddy`;
      }

      if (cmd === "matrix") {
        runMatrixEffect();
        return;
      }

      if (cmd === "ls") {
        return [
          "bar/    fridge/    jukebox/    terminal/    memories/",
          "",
          "(You're in a bar. What did you expect to find?)",
        ];
      }

      if (cmd === "pwd") {
        return "/home/teddy/ted-yee-beer-house";
      }

      if (cmd === "rm") {
        return "rm: permission denied (the bartender protects all files)";
      }

      if (cmd === "exit") {
        onClose();
        return;
      }

      if (cmd === "top" || cmd === "htop") {
        return [
          "PID   USER     CPU%   MEM%   COMMAND",
          "1     teddy    99.9   87.3   next-dev",
          "42    teddy    45.2   12.1   node --max-old-space=4096",
          "69    teddy    0.1    0.0    sleep (nice try)",
          "404   system   0.0    0.0    not-found",
          "1337  teddy    13.37  1337   being-cool",
        ];
      }

      if (cmd === "ping") {
        if (args[0] === "google.com") {
          return [
            "PING google.com: 56 data bytes",
            "64 bytes from google.com: time=0.42ms",
            "64 bytes from google.com: time=0.69ms (nice)",
            "--- google.com ping statistics ---",
            "2 packets transmitted, 2 packets received, 0.0% packet loss",
          ];
        }
        return "pong 🏓";
      }

      if (cmd === "uptime") {
        return `up ${formatTabTime(elapsedSeconds)}, 1 user, load average: ☕☕☕`;
      }

      if (cmd === "whoami") return;  // fall through to built-in

      // Navigation commands
      if (cmd === "game") {
        window.location.href = "/game";
        return "Navigating to /game...";
      }
      if (cmd === "todo") {
        window.location.href = "/todo";
        return "Navigating to /todo...";
      }
      if (cmd === "portfolio") {
        window.location.href = "/portfolio";
        return "Navigating to /portfolio...";
      }
      if (cmd === "articles") {
        window.location.href = "/articles";
        return "Navigating to /articles...";
      }
      if (cmd === "prank") {
        window.location.href = "/prank";
        return "Navigating to /prank... (don't say I didn't warn you)";
      }

      if (cmd === "help") {
        return theme.terminal.helpText;
      }

      // Don't handle — let Terminal built-ins try
      return undefined;
    },
    [elapsedSeconds, onClose, onDeleteEffect, onDrunkEffect, printDelayed, runMatrixEffect, runSlTrain, theme]
  );

  const isVimMode = modeRef.current === "vim";
  const isPythonMode = modeRef.current === "python";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            height: isMaximized ? "100vh" : "340px",
          }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl flex flex-col"
          onClick={() => terminalRef.current?.focus()}
        >
          <Terminal
            ref={terminalRef}
            prompt={theme.brand.terminalPrompt}
            promptPrefix={isPythonMode ? ">>>" : undefined}
            hidePrompt={isVimMode}
            inputClassName={isPythonMode || isVimMode ? "text-green-400" : undefined}
            statusLine={isVimMode ? "-- INSERT -- (type :q! or :wq to escape)" : undefined}
            height="100%"
            className="h-full"
            welcomeMessages={theme.brand.welcomeMessages}
            onExit={onClose}
            headerControls={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMaximized(!isMaximized);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                >
                  {isMaximized ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors text-gray-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            }
            onCommand={handleCommand}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
