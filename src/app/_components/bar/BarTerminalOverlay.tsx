"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { Terminal } from "@/components/ui/Terminal";
import { TerminalHandler } from "@/lib/types";

interface BarTerminalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  elapsedSeconds: number;
}

// ─── State machines for special modes ───
type TerminalMode = "normal" | "vim" | "python" | "drunk";

// ─── Data ───
const DEV_TIPS = [
  "git stash is your friend. Unless you forget about it. Then it's your enemy.",
  "The best error message is the one you never see.",
  "If debugging is the process of removing bugs, then programming is the process of putting them in.",
  "It works on my machine. Ship my machine.",
  "There are only two hard things in CS: cache invalidation, naming things, and off-by-one errors.",
  "A SQL query walks into a bar, sees two tables, and asks: 'Can I JOIN you?'",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "To understand recursion, you must first understand recursion.",
  "The best code is no code at all. Every new line of code you willingly bring into the world is code that has to be debugged.",
  "rm -rf node_modules && npm install — the universal fix.",
];

const JUKEBOX_RESPONSES = [
  "🎵 Now playing: 'lo-fi hip hop beats to mass-produce bugs to'",
  "🎵 Now playing: 'Despacito (npm install remix)'",
  "🎵 Now playing: 'Never Gonna Give You Up' ... wait, you just got rick-rolled in a terminal.",
  "🎵 Sorry, the jukebox only plays lo-fi hip hop beats to code/relax to.",
  "🎵 Now playing: 'The Sound of Silence' (by your test suite)",
];

function formatTabTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} seconds`;
  return `${m}m ${s}s`;
}

function getOrderResponse(item: string, count: number): string | string[] {
  const responses: Record<string, string[]> = {
    beer: [
      "🍺 Pouring you a cold one... That'll be 0 ETH.",
      "🍺🍺 Another one? Bold choice for a weeknight.",
      "🍺🍺🍺 The bartender is starting to judge you.",
    ],
    soju: [
      "🥃 Here you go. Careful, it's strong.",
      "🥃🥃 Another one? Bold choice.",
      "🥃🥃🥃 Okay, last one.",
    ],
    coffee: [
      "☕ Here's your artisanal, single-origin, pour-over... just kidding, it's instant.",
      "☕☕ Double shot? You must have a deadline.",
      "☕☕☕ At this point, just inject the caffeine directly.",
    ],
    water: [
      "💧 Hydration is important. Good choice.",
      "💧💧 Still water? Or sparkling? Just kidding, we only have tap.",
      "💧💧💧 The healthiest order we've seen all day.",
    ],
  };

  const key = item.toLowerCase();
  const msgs = responses[key];
  if (!msgs) return `We don't serve '${item}' here. Try: beer, soju, coffee, water.`;

  const idx = Math.min(count - 1, msgs.length - 1);
  return msgs[idx];
}

const TECH_MENU = [
  "╔══════════════════════════════════════════╗",
  "║       🍺 TECH STACK MENU 🍺             ║",
  "╠══════════════════════════════════════════╣",
  "║                                          ║",
  "║  Frontend                                ║",
  "║  ├─ React 19 ................ Draft IPA   ║",
  "║  ├─ Next.js 16 ............. Stout        ║",
  "║  ├─ TypeScript ............. Pale Ale     ║",
  "║  └─ Tailwind v4 ........... Light Lager   ║",
  "║                                          ║",
  "║  Backend                                  ║",
  "║  ├─ NestJS ................. Porter       ║",
  "║  ├─ FastAPI ................ Wheat Beer   ║",
  "║  └─ Python ................. Pilsner      ║",
  "║                                          ║",
  "║  Infrastructure                           ║",
  "║  ├─ Docker ................. Bock         ║",
  "║  ├─ MySQL .................. Amber Ale    ║",
  "║  └─ GitHub Actions ........ Sour Beer     ║",
  "║                                          ║",
  "║  * All drinks are open-source             ║",
  "║  * No vendor lock-in (except npm)         ║",
  "╚══════════════════════════════════════════╝",
];

const GIT_BLAME_OUTPUT = [
  "git blame src/life/choices.ts",
  "",
  'a3f2c1d (Teddy  2026-01-15)  const career = "developer";     // seemed like a good idea',
  "b7e4a2f (Teddy  2026-01-15)  const sleep = null;              // TODO: implement someday",
  "c9d3b1a (Teddy  2026-01-16)  const coffee = Infinity;         // non-negotiable",
  'd2f5c3e (Past-Teddy  2019-03-20)  // "this will be easy and fun"',
  'e1a4d2b (Teddy  2026-02-01)  const narrator = "it was not";',
];

const NEOFETCH_OUTPUT = [
  "        🍺🍺🍺🍺           teddy@ted-yee-beer-house",
  "       🍺      🍺          ─────────────────────────",
  "      🍺        🍺         OS: macOS (deploys to Linux)",
  "      🍺        🍺         Host: Ted-yee Beer House, Seoul",
  "      🍺        🍺         Uptime: since 19XX",
  "       🍺      🍺          Shell: zsh (47 unused aliases)",
  "        🍺🍺🍺🍺           Stack: React, Next.js, NestJS, FastAPI",
  "                            Coffee: ██████████████████ 142%",
  "                            Beer:   █████████░░░░░░░░ 52%",
  "                            Bugs:   ░░░░░░░░░░░░░░░░░ 0%*",
  "",
  "                            * in production. we don't talk about staging.",
];

const MAN_TEDDY_OUTPUT = [
  "TEDDY(1)                    Beer House Manual                    TEDDY(1)",
  "",
  "NAME",
  "       teddy — a developer who codes, brews ideas, and occasionally sleeps",
  "",
  "SYNOPSIS",
  "       teddy [--coffee] [--beer] [--code] [--sleep (deprecated)]",
  "",
  "DESCRIPTION",
  "       Full-stack developer based in Seoul. Known for building things",
  "       nobody asked for, then convincing everyone they needed it.",
  "",
  "       Fluent in mass-producing side projects and mass-abandoning them.",
  "",
  "OPTIONS",
  "       --coffee     Required. Will not function without this flag.",
  "       --beer       +200% creativity. -400% git hygiene.",
  "       --code       Default behavior. Cannot be disabled.",
  "       --sleep      Deprecated since v2.0. Use --coffee instead.",
  "",
  "BUGS",
  '       Known issue: says "5 more minutes" but means 3 more hours.',
  "       Will not be fixed.",
  "",
  "SEE ALSO",
  "       lafamila(1), kyoungmin(1), ted-yee-beer-house(7)",
  "",
  "AUTHOR",
  "       Written by someone who should probably be sleeping right now.",
  "",
  "Ted-yee Beer House              March 2026                       TEDDY(1)",
];

const TRACEROUTE_OUTPUT = [
  "traceroute to teddy (127.0.0.1), 30 hops max",
  "",
  " 1  childhood (192.168.0.1)        ∞ ms    dreaming of being an astronaut",
  " 2  first-hello-world (10.0.1.1)   2005 ms  print(\"hello world\") in BASIC",
  " 3  cs-degree (172.16.0.1)         4 yrs   StackOverflow was the real professor",
  ' 4  first-job (10.10.0.1)          2 ms     "we use our own framework here"',
  " 5  startup-phase (10.20.0.1)      999 ms   sleep: connection timed out",
  " 6  * * *                                   (that year we don't talk about)",
  ' 7  freelance (10.30.0.1)          varies   "the deadline is flexible" (it wasn\'t)',
  " 8  ted-yee-beer-house (127.0.0.1) 1 ms     you are here. 🍺",
];

const NPM_INSTALL_OUTPUT = [
  "npm WARN deprecated sleep@1.0.0: who needs sleep anyway",
  "npm WARN deprecated weekend@2.0.0: not compatible with developer lifestyle",
  "",
  "added 847 packages in 3.2s",
  "127 packages are looking for funding",
  "  run `npm fund` to guilt-trip yourself",
  "",
  "3 high severity vulnerabilities",
  "  run `npm audit fix` to mass-produce new bugs",
];

const BREW_INSTALL_OUTPUT = [
  "==> Downloading https://ted-yee-beer-house/api/fridge/ipa",
  "######################################################################## 100.0%",
  "==> Pouring beer--fresh.arm64_sonoma.bottle.tar.gz",
  "🍺  /usr/local/Cellar/beer/fresh: 1 file, 500ml poured",
  "==> Caveats",
  "Best served cold. Do not operate kubectl after consumption.",
  "To restart at login:",
  "  brew services start beer --repeat",
];

const DOCKER_RUN_OUTPUT = [
  "Unable to find image 'productivity:latest' locally",
  "latest: Pulling from teddy/productivity",
  "e3b0c442: Pull complete",
  "Digest: sha256:deadbeef...",
  "Status: Downloaded newer image for productivity:latest",
  "",
  "CONTAINER ID   IMAGE                STATUS           NAMES",
  "a1b2c3d4e5f6   productivity:latest  Exited (137)     hopeless-attempt",
  "f6e5d4c3b2a1   procrastination:lts  Up 47 hours      comfortable-routine",
];

const SSH_OUTPUT = [
  "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
  "@    WARNING: DEPLOYING ON FRIDAY NIGHT   @",
  "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
  "Connection refused.",
  "The bartender has revoked your production access.",
  "Have another beer instead. 🍺",
];

const ZEN_OF_TEDDY = [
  "The Zen of Teddy, by lafamila",
  "",
  "Beer is better than wine (in this house).",
  "Explicit is better than implicit, except for easter eggs.",
  "Simple is better than complex, but complex is more fun.",
  "Errors should never pass silently, unless it's Friday.",
  "In the face of ambiguity, order another round.",
  "There should be one obvious way to do it — but hide 12 others.",
  "Now is better than never, but after this beer is often better than now.",
  "If the implementation is hard to explain, buy the reviewer a drink.",
];

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

const CAT_ASCII = [
  "  /\\_/\\  ",
  " ( o.o ) ",
  "  > ^ <",
  " /|   |\\",
  "(_|   |_)",
  "",
  "What did you expect? This is a bar, not a filesystem.",
  "Try: cat /menu, cat /rules, cat /wifi",
];

const CAT_WIFI = [
  "SSID: TedYeeBeerHouse_5G",
  "Password: undefined",
  "",
  "Note: If you can't connect, try turning it off and on again.",
  "      If that doesn't work, the password is probably null.",
];

const CAT_RULES = [
  "📋 House Rules:",
  "  1. No console.log() debugging in production",
  "  2. Tabs vs Spaces? We don't talk about that here",
  "  3. No deploying on Fridays",
  "  4. All bugs are 'features' until proven otherwise",
  "  5. The bartender is always right",
];

export default function BarTerminalOverlay({
  isOpen,
  onClose,
  elapsedSeconds,
}: BarTerminalOverlayProps) {
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
        return "-- INSERT -- (type :q! or :wq to escape)";
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
          return ZEN_OF_TEDDY;
        }
        if (fullCmd.startsWith("print(")) {
          const content = fullCmd.slice(6, -1).replace(/['"]/g, "");
          return content || '""';
        }
        return `NameError: name '${cmd}' is not defined. This is a bar, not a Jupyter notebook.`;
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
        return `${garbled}... *hic* The bartender cut you off. Switching to water. 💧 Stay hydrated, developer.`;
      }

      // ─── Normal mode commands ───

      // Bar commands
      if (cmd === "order") {
        const item = args[0] || "";
        if (!item) return "What would you like? Try: order beer, order soju, order coffee, order water";
        const key = item.toLowerCase();
        orderCountRef.current[key] = (orderCountRef.current[key] || 0) + 1;
        const count = orderCountRef.current[key];

        // Soju 3x easter egg
        if (key === "soju" && count >= 3) {
          orderCountRef.current[key] = 0;
          modeRef.current = "drunk";
          forceUpdate((n) => n + 1);
          setTimeout(() => {
            modeRef.current = "normal";
            forceUpdate((n) => n + 1);
          }, 5000);
          return [
            "🥃🥃🥃 Okay, last one.",
            "...",
            "Actually, you know what?",
            "",
            "[The room starts spinning...]",
          ];
        }

        return getOrderResponse(item, count);
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

      if (cmd === "menu") return TECH_MENU;

      if (cmd === "tip") {
        return DEV_TIPS[Math.floor(Math.random() * DEV_TIPS.length)];
      }

      if (cmd === "jukebox") {
        return JUKEBOX_RESPONSES[Math.floor(Math.random() * JUKEBOX_RESPONSES.length)];
      }

      // ─── Dev easter eggs Tier 1 ───
      if (cmd === "sudo" && args.join(" ") === "rm -rf /") {
        terminalRef.current?.print("Deleting ted-yee-beer-house...");
        const files = [
          "Removing /bar/fridge/beer_01.ipa .......... done",
          "Removing /bar/fridge/beer_02.lager ....... done",
          "Removing /bar/jukebox/lofi_playlist ..... done",
          "Removing /bar/memories/* ................ done",
        ];
        printDelayed(files, 400);
        setTimeout(() => {
          terminalRef.current?.print("");
          terminalRef.current?.print(
            "Just kidding. This is a bar, not your production server."
          );
          terminalRef.current?.print(
            "But your tab just doubled for trying. 🍺🍺"
          );
        }, files.length * 400 + 500);
        return;
      }

      if (cmd === "sudo") {
        return "Nice try. The bartender doesn't grant sudo access.";
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
        return GIT_BLAME_OUTPUT;
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
        return NEOFETCH_OUTPUT;
      }

      if (cmd === "cat") {
        if (args.length === 0) return CAT_ASCII;
        const path = args[0];
        if (path === "/menu") return TECH_MENU;
        if (path === "/rules") return CAT_RULES;
        if (path === "/wifi") return CAT_WIFI;
        return `cat: ${path}: No such file or directory (this is a bar, not a filesystem)`;
      }

      // ─── Dev easter eggs Tier 2 ───
      if (cmd === "npm" && args[0] === "install") {
        return NPM_INSTALL_OUTPUT;
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
          return BREW_INSTALL_OUTPUT;
        }
        return `==> Error: ${pkg} is not a valid beverage. Try: brew install beer`;
      }

      if (cmd === "docker" && args[0] === "run") {
        return DOCKER_RUN_OUTPUT;
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
          ">>> ",
        ];
      }

      if (cmd === "ssh") {
        return SSH_OUTPUT;
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
        return TRACEROUTE_OUTPUT;
      }

      if (cmd === "man") {
        const page = args[0] || "";
        if (page === "teddy" || page === "lafamila") return MAN_TEDDY_OUTPUT;
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
        return [
          "help                    Show this help",
          "clear                   Clear the screen",
          "echo [text]             Print text",
          "date                    Print current date",
          "whoami                  Who am I?",
          "",
          "-- Bar Commands --",
          "order [drink]           Order a drink (beer/soju/coffee/water)",
          "menu                    View the tech stack menu",
          "tab                     Check your bar tab",
          "tip                     Get a random dev tip",
          "jukebox                 Play some music",
          "",
          "-- Navigation --",
          "game                    Go to game page",
          "todo                    Go to todo page",
          "portfolio               Go to portfolio page",
          "articles                Go to articles page",
          "",
          "Psst... developers might find some hidden commands too. 🤫",
        ];
      }

      // Don't handle — let Terminal built-ins try
      return undefined;
    },
    [elapsedSeconds, onClose, printDelayed, runMatrixEffect, runSlTrain]
  );

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
            prompt="guest@ted-yee-beer-house"
            height="100%"
            className="h-full"
            welcomeMessages={[
              "🍺 Welcome to Ted-yee Beer House Terminal v2.0.0",
              "Type 'help' for a list of commands.",
              "Or just try whatever comes to mind... 😉",
            ]}
            onExit={onClose}
            headerControls={
              <div className="flex items-center gap-2">
                <button
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
