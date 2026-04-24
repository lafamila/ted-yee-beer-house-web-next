"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { GithubIcon, LinkedinIcon, Mail, Terminal as TerminalIcon } from "lucide-react";
import NeonSign from "./bar/NeonSign";
import BeerGlass from "./bar/BeerGlass";
import Coaster from "./bar/Coaster";
import HouseRules from "./bar/HouseRules";
import BarTab from "./bar/BarTab";
import WeatherWindow from "./bar/WeatherWindow";
import WeatherBackground from "./bar/WeatherBackground";
import BarTerminalOverlay, {
  BAR_SECTIONS,
  type BarSectionId,
} from "./bar/BarTerminalOverlay";
import VIPMenu from "./bar/VIPMenu";
import { useWeather } from "./bar/useWeather";
import { useKonamiCode } from "./bar/useKonamiCode";
import { ThemeProvider, useTheme } from "./bar/theme";
import TeddyAdventureGame from "./bar/game/TeddyAdventureGame";
import TeddyInventory from "./bar/game/TeddyInventory";
import type {
  BartenderReaction,
  ExternalDragItemId,
  GameChoice,
  GameDialogueState,
  GameSceneObjectId,
  InventoryItem,
} from "./bar/game/types";

type ChoiceContext = "bartender-menu" | "order-menu" | null;
type ExternalFocus =
  | "menu-board"
  | "house-rules"
  | "drink-station"
  | "weather-window"
  | null;

interface StoryFlags {
  introduced: boolean;
  bellFound: boolean;
  frameSeen: boolean;
  guestBookRead: boolean;
  beerDelivered: boolean;
  coasterDelivered: boolean;
  forecastDelivered: boolean;
}

const BARTENDER_CHOICES: GameChoice[] = [
  { id: "talk", label: "1. Talk", hint: "See what Teddy says now" },
  { id: "order", label: "2. Order", hint: "Use the click-friendly order menu" },
  { id: "cancel", label: "3. Cancel", hint: "Back away politely" },
];

const ORDER_CHOICES: GameChoice[] = [
  { id: "beer", label: "Beer", hint: "Safe, cold, and easy" },
  { id: "soju", label: "Soju", hint: "Sharper and more direct" },
  { id: "highball", label: "Highball", hint: "Smooth late-night option" },
  { id: "back", label: "Back", hint: "Return to Teddy" },
];

const TALK_DIALOGUES = {
  intro: [
    "So you're the one wandering around after hours.",
    "I'm Teddy. I keep the bar running after dark and the build green before sunrise.",
    "Click around, bring me anything interesting, and I might show you the better stories.",
  ],
  low: [
    [
      "The trick is keeping one eye on the code and the other on the room.",
      "Both break if you ignore the quiet details for too long.",
    ],
    [
      "Regulars think this place is cozy by accident.",
      "Developers know every cozy thing is secretly a lot of state management.",
    ],
  ],
  mid: [
    [
      "You move like someone who reads changelogs for fun.",
      "That's either promising or dangerous. Usually both.",
    ],
    [
      "The terminal gets louder the longer you stay.",
      "Good sign. Means the room has decided to trust you a little.",
    ],
  ],
  high: [
    [
      "At this point you're not just visiting.",
      "You're helping the place remember what kind of night it wants to be.",
    ],
    [
      "Funny thing about affection meters: they look gamey, but people notice effort the same way.",
      "You keep bringing the right energy and the dialogue tree opens itself.",
    ],
  ],
};

const IDLE_LINES = {
  low: [
    "If you need a hint, start by clicking me or the service bell.",
    "The easy order menu tops out early. The terminal is where the gremlin energy lives.",
    "Some of the room likes being handed back to me instead of just clicked.",
  ],
  high: [
    "You know the room better now. Try feeding Teddy a prop from outside the game.",
    "The bar keeps notes on people who pay attention. Check the inventory if you missed one.",
    "If the terminal opens, I stop pretending this is just a normal shift.",
  ],
};

const EXTERNAL_FOCUS_LABELS: Record<Exclude<ExternalFocus, null>, string> = {
  "menu-board": "Teddy keeps glancing toward the menu board.",
  "house-rules": "Teddy is waiting for the rules sign to stop swinging.",
  "drink-station": "Teddy notices you hovering around the drink station.",
  "weather-window": "Teddy checks the weather outside while he talks.",
};

const DROP_REWARDS: Record<ExternalDragItemId, InventoryItem> = {
  "beer-glass": {
    id: "foam-blueprint",
    name: "Foam Blueprint",
    emoji: "🍺",
    description: "A sketch Teddy made after you handed over the beer glass setup.",
    source: "beer glass delivery",
  },
  coaster: {
    id: "coaster-glitch",
    name: "Coaster Glitch",
    emoji: "🥏",
    description: "A coaster with notes on hidden jokes and one suspicious Wi-Fi clue.",
    source: "coaster delivery",
  },
  "weather-note": {
    id: "forecast-postcard",
    name: "Forecast Postcard",
    emoji: "🌦️",
    description: "A pocket-sized reminder that mood and weather change the whole room.",
    source: "weather window delivery",
  },
};

const SCENE_REWARDS: Partial<Record<GameSceneObjectId, InventoryItem>> = {
  "service-bell": {
    id: "brass-chip",
    name: "Brass Bell Chip",
    emoji: "🔔",
    description: "Proof you found the fastest way to get Teddy's attention.",
    source: "service bell",
  },
  "guest-book": {
    id: "guest-log",
    name: "Guest Log Stub",
    emoji: "📓",
    description: "A torn page full of names, side projects, and one lucky typo.",
    source: "guest log",
  },
  "wall-frame": {
    id: "night-shift-photo",
    name: "Night Shift Photo",
    emoji: "🖼️",
    description: "A little frame reminding you Teddy has always lived between craft and code.",
    source: "wall frame",
  },
};

function createEmptyDialogue(): GameDialogueState {
  return {
    visible: false,
    speaker: "Teddy",
    lines: [],
    index: 0,
    mode: "story",
    choices: [],
  };
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function getAffectionLabel(score: number): string {
  if (score <= 1) return "Still sizing you up";
  if (score <= 3) return "Curious regular energy";
  if (score <= 5) return "Trusted after-hours regular";
  return "Favorite person on the late shift";
}

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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [affection, setAffection] = useState(1);
  const [dialogue, setDialogue] = useState<GameDialogueState>(createEmptyDialogue());
  const [choiceContext, setChoiceContext] = useState<ChoiceContext>(null);
  const [gameStatusText, setGameStatusText] = useState(
    "Teddy is polishing a glass and waiting to see what kind of player you are."
  );
  const [externalFocus, setExternalFocus] = useState<ExternalFocus>(null);
  const [reactionOverride, setReactionOverride] = useState<BartenderReaction | null>(null);
  const [gameOrderCount, setGameOrderCount] = useState(0);
  const [storyFlags, setStoryFlags] = useState<StoryFlags>({
    introduced: false,
    bellFound: false,
    frameSeen: false,
    guestBookRead: false,
    beerDelivered: false,
    coasterDelivered: false,
    forecastDelivered: false,
  });
  const drunkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const drunkStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drunkIntensityRef = useRef(0);
  const deleteTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ambientTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogueCompleteRef = useRef<(() => void) | null>(null);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const weather = useWeather();
  const { isVIP, reset: resetVIP } = useKonamiCode();

  const affectionLabel = useMemo(() => getAffectionLabel(affection), [affection]);

  const clearDeleteTimers = useCallback(() => {
    deleteTimersRef.current.forEach(clearTimeout);
    deleteTimersRef.current = [];
  }, []);

  const clearAmbientTimer = useCallback(() => {
    if (ambientTimerRef.current) {
      clearTimeout(ambientTimerRef.current);
      ambientTimerRef.current = null;
    }
  }, []);

  const closeDialogue = useCallback(() => {
    clearAmbientTimer();
    setDialogue(createEmptyDialogue());
    setChoiceContext(null);

    const complete = dialogueCompleteRef.current;
    dialogueCompleteRef.current = null;
    complete?.();
  }, [clearAmbientTimer]);

  const showDialogue = useCallback(
    ({
      speaker = "Teddy",
      lines,
      choices = [],
      mode = "story",
      onComplete,
    }: {
      speaker?: string;
      lines: string[];
      choices?: GameChoice[];
      mode?: GameDialogueState["mode"];
      onComplete?: () => void;
    }) => {
      clearAmbientTimer();
      dialogueCompleteRef.current = onComplete ?? null;
      setDialogue({
        visible: true,
        speaker,
        lines,
        index: 0,
        mode,
        choices,
      });

      if (mode === "ambient") {
        ambientTimerRef.current = setTimeout(() => {
          setDialogue((prev) => (prev.mode === "ambient" ? createEmptyDialogue() : prev));
          dialogueCompleteRef.current = null;
          ambientTimerRef.current = null;
        }, 4300);
      }
    },
    [clearAmbientTimer]
  );

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

  const addAffection = useCallback((amount: number) => {
    setAffection((prev) => Math.max(1, Math.min(7, prev + amount)));
  }, []);

  const addInventoryItem = useCallback((item: InventoryItem) => {
    setInventory((prev) => (prev.some((existing) => existing.id === item.id) ? prev : [...prev, item]));
  }, []);

  const setTemporaryReaction = useCallback((reaction: BartenderReaction, duration = 2600) => {
    if (reactionTimerRef.current) {
      clearTimeout(reactionTimerRef.current);
    }

    setReactionOverride(reaction);
    reactionTimerRef.current = setTimeout(() => {
      setReactionOverride(null);
      reactionTimerRef.current = null;
    }, duration);
  }, []);

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

  const handleDrunkEffect = useCallback(
    (drinkCount: number) => {
      const maxAngle = Math.min(1 + drinkCount * 0.75, 5);
      drunkIntensityRef.current = maxAngle;
      setGameStatusText("The room shivers from one too many terminal orders. Teddy braces against the counter.");
      setTemporaryReaction("busy", 3200);

      if (!drunkIntervalRef.current) {
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

      if (drunkStopTimerRef.current) {
        clearTimeout(drunkStopTimerRef.current);
      }
      drunkStopTimerRef.current = setTimeout(() => {
        stopDrunkEffect();
      }, 8000);
    },
    [setTemporaryReaction, stopDrunkEffect]
  );

  const handleDeleteEffect = useCallback(
    (sections: string[], onComplete: () => void) => {
      clearDeleteTimers();
      setTemporaryReaction("busy", 2200);
      setGameStatusText("Teddy watches the room vanish piece by piece, then pretends none of it happened.");

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
    },
    [clearDeleteTimers, setTemporaryReaction]
  );

  const openBartenderMenu = useCallback(() => {
    setChoiceContext("bartender-menu");
    setTemporaryReaction(affection >= 4 ? "warm" : "curious", 2200);
    showDialogue({
      lines: [
        affection >= 5
          ? "You again. Good. Pick what kind of trouble we're doing this time."
          : "Teddy sets a clean glass down and waits for your move.",
      ],
      choices: BARTENDER_CHOICES,
    });
  }, [affection, setTemporaryReaction, showDialogue]);

  const runTalkScenario = useCallback(() => {
    const lines = !storyFlags.introduced
      ? TALK_DIALOGUES.intro
      : affection >= 6
        ? pickRandom(TALK_DIALOGUES.high)
        : affection >= 4
          ? pickRandom(TALK_DIALOGUES.mid)
          : pickRandom(TALK_DIALOGUES.low);

    if (!storyFlags.introduced) {
      setStoryFlags((prev) => ({ ...prev, introduced: true }));
      addAffection(1);
      setGameStatusText("Teddy finally introduces himself like he expected you to stay.");
    } else {
      setGameStatusText("Talking with Teddy opens up another branch of the night shift.");
    }

    setChoiceContext(null);
    setTemporaryReaction(affection >= 4 ? "warm" : "curious", 2800);
    showDialogue({ lines });
  }, [addAffection, affection, setTemporaryReaction, showDialogue, storyFlags.introduced]);

  const handleSceneObjectClick = useCallback(
    (objectId: GameSceneObjectId) => {
      if (objectId === "service-bell") {
        if (!storyFlags.bellFound) {
          setStoryFlags((prev) => ({ ...prev, bellFound: true }));
          addInventoryItem(SCENE_REWARDS[objectId]!);
          addAffection(1);
        }
        setGameStatusText("The brass bell rings once. Teddy is instantly paying attention.");
        setTemporaryReaction("curious", 2200);
        showDialogue({
          lines: [
            "That bell's mostly for dramatic entrances.",
            "Still, now I know you're serious about exploring.",
          ],
        });
        return;
      }

      if (objectId === "terminal-note") {
        setGameStatusText("Teddy nudges you toward the real terminal for the stronger commands.");
        setTemporaryReaction("serious", 2800);
        setIsTerminalOpen(true);
        showDialogue({
          lines: [
            "The easy-click menu only goes so far.",
            "If you want the riskier route, use the terminal. That's where the real bar keeps its secrets.",
          ],
        });
        return;
      }

      if (objectId === "guest-book") {
        if (!storyFlags.guestBookRead) {
          setStoryFlags((prev) => ({ ...prev, guestBookRead: true }));
          addInventoryItem(SCENE_REWARDS[objectId]!);
          addAffection(1);
        }
        setGameStatusText("You peeked at the guest log and Teddy didn't stop you.");
        setTemporaryReaction("warm", 2400);
        showDialogue({
          lines: [
            "I keep a guest log for people who leave interesting traces behind.",
            "Tonight, you made the page on purpose.",
          ],
        });
        return;
      }

      if (!storyFlags.frameSeen) {
        setStoryFlags((prev) => ({ ...prev, frameSeen: true }));
        addInventoryItem(SCENE_REWARDS[objectId]!);
      }
      addAffection(1);
      setGameStatusText("The frame reminds Teddy that craft and code never really split apart.");
      setTemporaryReaction("warm", 2400);
      showDialogue({
        lines: [
          "That frame is the whole thesis statement in one prop.",
          "Build things carefully, serve people honestly, and let the room remember both.",
        ],
      });
    },
    [
      addAffection,
      addInventoryItem,
      setTemporaryReaction,
      showDialogue,
      storyFlags.bellFound,
      storyFlags.frameSeen,
      storyFlags.guestBookRead,
    ]
  );

  const handleExternalDrop = useCallback(
    (itemId: ExternalDragItemId) => {
      const reward = DROP_REWARDS[itemId];
      addInventoryItem(reward);
      addAffection(1);
      setTemporaryReaction("serving", 2600);

      if (itemId === "beer-glass") {
        setStoryFlags((prev) => ({ ...prev, beerDelivered: true }));
        setGameStatusText("You handed Teddy the drink setup directly. He files that under good instincts.");
        showDialogue({
          lines: [
            "Hand delivery? Nice.",
            "You just unlocked the kind of trust that usually takes three conversations and one bug fix.",
          ],
        });
        return;
      }

      if (itemId === "coaster") {
        setStoryFlags((prev) => ({ ...prev, coasterDelivered: true }));
        setGameStatusText("Teddy flips the coaster, spots the hidden jokes, and lets you keep the best one.");
        showDialogue({
          lines: [
            "You brought the coaster back. Good eye.",
            "Half the room's tiny jokes hide under things people stop noticing.",
          ],
        });
        return;
      }

      setStoryFlags((prev) => ({ ...prev, forecastDelivered: true }));
      setGameStatusText("The forecast note changes the way Teddy talks about the night ahead.");
      showDialogue({
        lines: [
          "Weather changes the room faster than people admit.",
          "You brought me the proof. Keep the postcard; you'll want it later.",
        ],
      });
    },
    [addAffection, addInventoryItem, setTemporaryReaction, showDialogue]
  );

  const handleChoiceSelect = useCallback(
    (choiceId: string) => {
      if (choiceContext === "bartender-menu") {
        if (choiceId === "talk") {
          runTalkScenario();
          return;
        }

        if (choiceId === "order") {
          setChoiceContext("order-menu");
          setTemporaryReaction("serving", 1800);
          showDialogue({
            lines: [
              gameOrderCount >= 2
                ? "The easy menu is getting cut off soon. Pick carefully."
                : "Pick one. I keep the click-route polite on purpose.",
            ],
            choices: ORDER_CHOICES,
          });
          return;
        }

        closeDialogue();
        return;
      }

      if (choiceContext === "order-menu") {
        if (choiceId === "back") {
          openBartenderMenu();
          return;
        }

        if (gameOrderCount >= 2) {
          setChoiceContext(null);
          setTemporaryReaction("serious", 2600);
          setGameStatusText("Teddy cuts off the easy order menu after two drinks and points you toward the terminal.");
          showDialogue({
            lines: [
              "Two drinks is the limit on the safe route.",
              "If you want more than that, you'll need to type the order yourself in the terminal.",
            ],
          });
          return;
        }

        const key = choiceId.toLowerCase();
        const responses = theme.drinks.orderResponses[key];
        const response = responses?.[Math.min(gameOrderCount, (responses?.length ?? 1) - 1)] ?? `Teddy serves ${choiceId}.`;

        setChoiceContext(null);
        setGameOrderCount((prev) => prev + 1);
        addAffection(1);
        setTemporaryReaction("serving", 2400);
        setGameStatusText(`Teddy slides over a ${choiceId} from the point-and-click menu.`);
        showDialogue({
          lines: [
            response,
            "This menu tops out at two drinks. The terminal is where the real chaos lives.",
          ],
        });
      }
    },
    [
      addAffection,
      choiceContext,
      closeDialogue,
      gameOrderCount,
      openBartenderMenu,
      runTalkScenario,
      setTemporaryReaction,
      showDialogue,
      theme.drinks.orderResponses,
    ]
  );

  const currentReaction = useMemo<BartenderReaction>(() => {
    if (reactionOverride) return reactionOverride;
    if (isTerminalOpen) return "serious";
    if (externalFocus === "menu-board") return "watching-menu";
    if (externalFocus === "drink-station") return "busy";
    if (externalFocus === "weather-window") return "curious";
    if (affection >= 5) return "warm";
    return "relaxed";
  }, [affection, externalFocus, isTerminalOpen, reactionOverride]);

  const focusLabel = useMemo(() => {
    if (isTerminalOpen) return "The terminal snapped Teddy into dev mode.";
    if (externalFocus) return EXTERNAL_FOCUS_LABELS[externalFocus];
    if (storyFlags.beerDelivered || storyFlags.coasterDelivered || storyFlags.forecastDelivered) {
      return "Teddy now expects you to hand him clues from outside the game.";
    }
    return null;
  }, [externalFocus, isTerminalOpen, storyFlags.beerDelivered, storyFlags.coasterDelivered, storyFlags.forecastDelivered]);

  const advanceDialogue = useCallback(() => {
    if (!dialogue.visible || dialogue.choices.length > 0) return;

    if (dialogue.index < dialogue.lines.length - 1) {
      clearAmbientTimer();
      setDialogue((prev) => ({ ...prev, index: prev.index + 1 }));
      return;
    }

    closeDialogue();
  }, [clearAmbientTimer, closeDialogue, dialogue]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      stopDrunkEffect();
      clearDeleteTimers();
      clearAmbientTimer();
      if (reactionTimerRef.current) {
        clearTimeout(reactionTimerRef.current);
      }
    };
  }, [clearAmbientTimer, clearDeleteTimers, stopDrunkEffect]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const idleInterval = setInterval(() => {
      if (dialogue.visible) return;

      const lines = affection >= 4 ? IDLE_LINES.high : IDLE_LINES.low;
      showDialogue({ lines: [pickRandom(lines)], mode: "ambient" });
    }, 17000);

    return () => clearInterval(idleInterval);
  }, [affection, dialogue.visible, mounted, showDialogue]);

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
      <WeatherBackground weather={weather} />

      <main className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 md:pt-32 pb-20">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <motion.div
              style={sectionStyle("menu-board")}
              onHoverStart={() => setExternalFocus("menu-board")}
              onHoverEnd={() => setExternalFocus(null)}
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-xl">📋</span> Menu
                    </h2>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                      Teddy notices hover
                    </span>
                  </div>
                  <nav className="space-y-2">
                    <MenuLink href="/todo" emoji="📝" label="Memo" desc="Developer notes" />
                    <MenuLink href="/game" emoji="🕹️" label="Game" desc="Pixel adventure" />
                    <MenuLink href="/articles" emoji="📰" label="Articles" desc="Blog posts" />
                    <MenuLink href="/portfolio" emoji="💼" label="Portfolio" desc="The serious page" />
                  </nav>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              onHoverStart={() => setExternalFocus("house-rules")}
              onHoverEnd={() => setExternalFocus(null)}
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex justify-center"
              >
                <HouseRules />
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div style={sectionStyle("bartender-intro")}> 
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                <TeddyAdventureGame
                  affection={affection}
                  affectionLabel={affectionLabel}
                  reaction={currentReaction}
                  focusLabel={focusLabel}
                  isTerminalOpen={isTerminalOpen}
                  dialogue={dialogue}
                  onAdvanceDialogue={advanceDialogue}
                  onChoiceSelect={handleChoiceSelect}
                  onBartenderClick={openBartenderMenu}
                  onSceneObjectClick={handleSceneObjectClick}
                  onExternalDrop={handleExternalDrop}
                />
              </motion.div>
            </div>

            <div style={sectionStyle("beer-glass")}> 
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <ExternalDraggableCard
                  title="Beer Glass"
                  subtitle="Drag to Teddy"
                  dragId="beer-glass"
                  onActivate={() => setExternalFocus("drink-station")}
                  onDeactivate={() => setExternalFocus(null)}
                  onDragStart={() => {
                    setTemporaryReaction("curious", 1800);
                    setGameStatusText("You picked up the beer glass setup to deliver it to Teddy.");
                  }}
                >
                  <BeerGlass />
                </ExternalDraggableCard>

                <ExternalDraggableCard
                  title="Coaster"
                  subtitle="Drag to Teddy"
                  dragId="coaster"
                  onActivate={() => setExternalFocus("drink-station")}
                  onDeactivate={() => setExternalFocus(null)}
                  onDragStart={() => {
                    setTemporaryReaction("curious", 1800);
                    setGameStatusText("You lifted the coaster to see what Teddy does with it.");
                  }}
                >
                  <Coaster />
                </ExternalDraggableCard>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#7dd3fc] mb-3">
                      Outside Links
                    </p>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      The real Teddy still answers outside the game.
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      The bar is playful, but the work is real. If you want the serious route, the links are still here.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-4 text-gray-500">
                    <SocialLink href="https://github.com/lafamila" icon={<GithubIcon className="w-5 h-5" />} label="Github" />
                    <SocialLink href="https://linkedin.com" icon={<LinkedinIcon className="w-5 h-5" />} label="LinkedIn" />
                    <SocialLink href="mailto:hello@example.com" icon={<Mail className="w-5 h-5" />} label="Email" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <div style={sectionStyle("bar-tab")}> 
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <BarTab
                  weather={weather}
                  affection={affection}
                  affectionLabel={affectionLabel}
                  gameStatusText={gameStatusText}
                />
              </motion.div>
            </div>

            <motion.div onHoverStart={() => setExternalFocus("weather-window")} onHoverEnd={() => setExternalFocus(null)}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="relative"
              >
                <button
                  type="button"
                  draggable
                  onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                    event.dataTransfer.setData("text/plain", "weather-note");
                    event.dataTransfer.effectAllowed = "copy";
                    setTemporaryReaction("curious", 1800);
                    setGameStatusText("You tore off a little forecast note to hand Teddy the mood of the night.");
                  }}
                  className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#7dd3fc] cursor-grab active:cursor-grabbing"
                >
                  Drag Note
                </button>
                <WeatherWindow weather={weather} />
              </motion.div>
            </motion.div>

            <div style={sectionStyle("grid-cards")}> 
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <TeddyInventory items={inventory} />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={() => {
          setIsTerminalOpen(true);
          setTemporaryReaction("serious", 2600);
          setGameStatusText("The terminal opens and Teddy's expression sharpens immediately.");
        }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 p-3 sm:p-4 bg-[#3994ef] text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40 group"
        style={{
          boxShadow: "0 0 20px rgba(57, 148, 239, 0.3)",
        }}
      >
        <TerminalIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      </motion.button>

      <BarTerminalOverlay
        isOpen={isTerminalOpen}
        onClose={() => {
          setIsTerminalOpen(false);
          setGameStatusText("The terminal closes and Teddy relaxes back into bartender mode.");
        }}
        elapsedSeconds={elapsed}
        onDrunkEffect={handleDrunkEffect}
        onDeleteEffect={handleDeleteEffect}
      />

      <VIPMenu isVIP={isVIP} onClose={resetVIP} />
    </div>
  );
}

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
      <span className="text-lg group-hover:scale-110 transition-transform">{emoji}</span>
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
  icon: ReactNode;
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

function ExternalDraggableCard({
  title,
  subtitle,
  dragId,
  children,
  onActivate,
  onDeactivate,
  onDragStart,
}: {
  title: string;
  subtitle: string;
  dragId: ExternalDragItemId;
  children: ReactNode;
  onActivate: () => void;
  onDeactivate: () => void;
  onDragStart: () => void;
}) {
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5"
      onHoverStart={onActivate}
      onHoverEnd={onDeactivate}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
          <button
            type="button"
            draggable
            onDragStart={(event: DragEvent<HTMLButtonElement>) => {
              event.dataTransfer.setData("text/plain", dragId);
              event.dataTransfer.effectAllowed = "copy";
              onDragStart();
            }}
            className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#7dd3fc] cursor-grab active:cursor-grabbing"
          >
            deliver
          </button>
        </div>
        <div className="flex items-center justify-center min-h-[180px]">{children}</div>
      </div>
    </motion.div>
  );
}
