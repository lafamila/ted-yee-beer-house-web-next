"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as PhaserNamespace from "phaser";
import { cn } from "@/lib/utils";
import type {
  BartenderReaction,
  ExternalDragItemId,
  GameDialogueState,
  GameSceneObjectId,
} from "./types";
import { isExternalDragItemId } from "./types";

interface TeddyAdventureGameProps {
  affection: number;
  affectionLabel: string;
  reaction: BartenderReaction;
  focusLabel: string | null;
  isTerminalOpen: boolean;
  dialogue: GameDialogueState;
  onAdvanceDialogue: () => void;
  onChoiceSelect: (choiceId: string) => void;
  onBartenderClick: () => void;
  onSceneObjectClick: (objectId: GameSceneObjectId) => void;
  onExternalDrop: (itemId: ExternalDragItemId) => void;
}

interface SceneVisualState {
  affection: number;
  affectionLabel: string;
  reaction: BartenderReaction;
  focusLabel: string | null;
  terminalOpen: boolean;
  dropActive: boolean;
}

const REACTION_VISUALS: Record<
  BartenderReaction,
  { face: string; label: string; accent: string }
> = {
  relaxed: { face: "^_^", label: "Polishing glass", accent: "#7dd3fc" },
  serious: { face: "-_-", label: "Watching terminal", accent: "#f59e0b" },
  "watching-menu": {
    face: "o_o",
    label: "Tracking the menu board",
    accent: "#c084fc",
  },
  serving: { face: "^o^", label: "Sliding over a drink", accent: "#34d399" },
  curious: { face: "._.", label: "Leaning in closer", accent: "#f472b6" },
  warm: { face: "^ᴗ^", label: "Treating you like a regular", accent: "#22c55e" },
  busy: { face: "@_@", label: "Juggling side tasks", accent: "#fb7185" },
};

export default function TeddyAdventureGame({
  affection,
  affectionLabel,
  reaction,
  focusLabel,
  isTerminalOpen,
  dialogue,
  onAdvanceDialogue,
  onChoiceSelect,
  onBartenderClick,
  onSceneObjectClick,
  onExternalDrop,
}: TeddyAdventureGameProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const gameRef = useRef<PhaserNamespace.Game | null>(null);
  const bartenderClickRef = useRef(onBartenderClick);
  const objectClickRef = useRef(onSceneObjectClick);
  const [dropActive, setDropActive] = useState(false);

  bartenderClickRef.current = onBartenderClick;
  objectClickRef.current = onSceneObjectClick;

  const sceneState = useMemo<SceneVisualState>(
    () => ({
      affection,
      affectionLabel,
      reaction,
      focusLabel,
      terminalOpen: isTerminalOpen,
      dropActive,
    }),
    [affection, affectionLabel, reaction, focusLabel, isTerminalOpen, dropActive]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      if (!dialogue.visible) return;
      if (dialogue.choices.length > 0) return;

      event.preventDefault();
      onAdvanceDialogue();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogue, onAdvanceDialogue]);

  useEffect(() => {
    if (!gameRef.current) return;
    gameRef.current.registry.set("scene-state", sceneState);
  }, [sceneState]);

  useEffect(() => {
    let isDisposed = false;
    let resizeObserver: ResizeObserver | null = null;

    async function mountGame() {
      const Phaser = await import("phaser");
      if (isDisposed || !containerRef.current) return;

      let backWall: PhaserNamespace.GameObjects.Rectangle | null = null;
      let shelf: PhaserNamespace.GameObjects.Rectangle | null = null;
      let counter: PhaserNamespace.GameObjects.Rectangle | null = null;
      let counterGlow: PhaserNamespace.GameObjects.Ellipse | null = null;
      let bartenderShadow: PhaserNamespace.GameObjects.Ellipse | null = null;
      let bartenderBody: PhaserNamespace.GameObjects.Rectangle | null = null;
      let bartenderApron: PhaserNamespace.GameObjects.Rectangle | null = null;
      let bartenderHead: PhaserNamespace.GameObjects.Arc | null = null;
      let faceText: PhaserNamespace.GameObjects.Text | null = null;
      let moodText: PhaserNamespace.GameObjects.Text | null = null;
      let promptText: PhaserNamespace.GameObjects.Text | null = null;
      let shelfBottleLeft: PhaserNamespace.GameObjects.Rectangle | null = null;
      let shelfBottleMiddle: PhaserNamespace.GameObjects.Rectangle | null = null;
      let shelfBottleRight: PhaserNamespace.GameObjects.Rectangle | null = null;
      let bellBase: PhaserNamespace.GameObjects.Ellipse | null = null;
      let bellDome: PhaserNamespace.GameObjects.Arc | null = null;
      let noteCard: PhaserNamespace.GameObjects.Rectangle | null = null;
      let noteText: PhaserNamespace.GameObjects.Text | null = null;
      let frameOuter: PhaserNamespace.GameObjects.Rectangle | null = null;
      let frameInner: PhaserNamespace.GameObjects.Rectangle | null = null;
      let frameText: PhaserNamespace.GameObjects.Text | null = null;
      let guestBook: PhaserNamespace.GameObjects.Rectangle | null = null;
      let guestBookText: PhaserNamespace.GameObjects.Text | null = null;
      let bartenderZone: PhaserNamespace.GameObjects.Zone | null = null;
      let bellZone: PhaserNamespace.GameObjects.Zone | null = null;
      let noteZone: PhaserNamespace.GameObjects.Zone | null = null;
      let frameZone: PhaserNamespace.GameObjects.Zone | null = null;
      let guestBookZone: PhaserNamespace.GameObjects.Zone | null = null;
      let lastVisualKey = "";

      class TeddyAdventureScene extends Phaser.Scene {
        constructor() {
          super("teddy-adventure-scene");
        }

        create() {
          backWall = this.add.rectangle(0, 0, 100, 100, 0x10151f).setOrigin(0);
          shelf = this.add.rectangle(0, 0, 100, 14, 0x59341d).setOrigin(0.5);
          counter = this.add.rectangle(0, 0, 100, 100, 0x2b1b12).setOrigin(0.5);
          counterGlow = this.add.ellipse(0, 0, 240, 42, 0x3994ef, 0.2);
          bartenderShadow = this.add.ellipse(0, 0, 150, 30, 0x000000, 0.22);
          bartenderBody = this.add.rectangle(0, 0, 134, 168, 0x113052, 1).setStrokeStyle(4, 0x5ac8fa, 0.6);
          bartenderApron = this.add.rectangle(0, 0, 84, 102, 0xe2e8f0, 0.92).setStrokeStyle(2, 0xbdd7f8, 0.8);
          bartenderHead = this.add.circle(0, 0, 44, 0xf3c6a6);
          faceText = this.add.text(0, 0, "^_^", {
            color: "#0f172a",
            fontFamily: "monospace",
            fontSize: "26px",
            fontStyle: "bold",
          }).setOrigin(0.5);
          moodText = this.add.text(0, 0, "Polishing glass", {
            color: "#dbeafe",
            fontFamily: "monospace",
            fontSize: "14px",
          }).setOrigin(0.5);
          promptText = this.add.text(0, 0, "Click Teddy or the room props", {
            color: "#94a3b8",
            fontFamily: "monospace",
            fontSize: "14px",
          }).setOrigin(0.5);

          shelfBottleLeft = this.add.rectangle(0, 0, 28, 70, 0x5b7cff, 0.8).setStrokeStyle(2, 0xc4b5fd, 0.5);
          shelfBottleMiddle = this.add.rectangle(0, 0, 28, 80, 0x10b981, 0.85).setStrokeStyle(2, 0x86efac, 0.5);
          shelfBottleRight = this.add.rectangle(0, 0, 28, 66, 0xf59e0b, 0.85).setStrokeStyle(2, 0xfde68a, 0.5);

          bellBase = this.add.ellipse(0, 0, 92, 26, 0x4b5563, 0.95).setStrokeStyle(2, 0xe5e7eb, 0.6);
          bellDome = this.add.circle(0, 0, 24, 0xf8fafc, 0.95).setStrokeStyle(2, 0x94a3b8, 0.7);

          noteCard = this.add.rectangle(0, 0, 120, 78, 0xfef3c7, 0.92).setStrokeStyle(2, 0xf59e0b, 0.7).setAngle(-6);
          noteText = this.add.text(0, 0, "Need stronger drinks?\nUse the terminal.", {
            color: "#78350f",
            fontFamily: "monospace",
            fontSize: "12px",
            align: "center",
          }).setOrigin(0.5).setAngle(-6);

          frameOuter = this.add.rectangle(0, 0, 116, 86, 0x4a3428, 0.95).setStrokeStyle(4, 0xeab308, 0.75);
          frameInner = this.add.rectangle(0, 0, 84, 54, 0x1e293b, 1).setStrokeStyle(2, 0x60a5fa, 0.55);
          frameText = this.add.text(0, 0, "Teddy\nBuilds by day\nBars by night", {
            color: "#bfdbfe",
            fontFamily: "monospace",
            fontSize: "11px",
            align: "center",
          }).setOrigin(0.5);

          guestBook = this.add.rectangle(0, 0, 110, 26, 0x111827, 0.96).setStrokeStyle(2, 0x64748b, 0.8);
          guestBookText = this.add.text(0, 0, "guest log", {
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: "12px",
          }).setOrigin(0.5);

          bartenderZone = this.add.zone(0, 0, 160, 240).setInteractive({ cursor: "pointer" });
          bellZone = this.add.zone(0, 0, 100, 60).setInteractive({ cursor: "pointer" });
          noteZone = this.add.zone(0, 0, 130, 90).setInteractive({ cursor: "pointer" });
          frameZone = this.add.zone(0, 0, 130, 100).setInteractive({ cursor: "pointer" });
          guestBookZone = this.add.zone(0, 0, 130, 40).setInteractive({ cursor: "pointer" });

          bartenderZone.on("pointerdown", () => bartenderClickRef.current());
          bellZone.on("pointerdown", () => objectClickRef.current("service-bell"));
          noteZone.on("pointerdown", () => objectClickRef.current("terminal-note"));
          frameZone.on("pointerdown", () => objectClickRef.current("wall-frame"));
          guestBookZone.on("pointerdown", () => objectClickRef.current("guest-book"));

          this.tweens.add({
            targets: [bartenderShadow, bartenderBody, bartenderApron, bartenderHead, faceText, moodText],
            y: "+=4",
            duration: 2200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
          });

          this.scale.on("resize", (gameSize: { width: number; height: number }) => {
            this.layoutScene(gameSize.width, gameSize.height);
          });

          this.layoutScene(this.scale.width, this.scale.height);
          this.registry.set("scene-state", sceneState);
        }

        update() {
          const currentState = this.registry.get("scene-state") as SceneVisualState | undefined;
          if (!currentState || !faceText || !moodText || !promptText) return;

          const visual = REACTION_VISUALS[currentState.reaction];
          const focusSuffix = currentState.focusLabel ? ` · ${currentState.focusLabel}` : "";
          const prompt = currentState.dropActive
            ? "Drop the dragged item on Teddy's shift"
            : currentState.terminalOpen
              ? "Terminal is live. Teddy is listening carefully."
              : "Click Teddy, inspect props, or drag an outside item here.";
          const key = [
            currentState.reaction,
            currentState.affectionLabel,
            currentState.focusLabel ?? "",
            currentState.dropActive ? "drop" : "idle",
            currentState.terminalOpen ? "terminal" : "room",
          ].join("|");

          if (key === lastVisualKey) return;

          faceText.setText(visual.face);
          moodText.setText(`${visual.label}${focusSuffix}`);
          moodText.setColor(visual.accent);
          promptText.setText(`Affinity ${currentState.affection}/7 · ${currentState.affectionLabel}\n${prompt}`);
          lastVisualKey = key;
        }

        private layoutScene(width: number, height: number) {
          backWall?.setSize(width, height);
          shelf?.setPosition(width * 0.52, height * 0.27).setSize(width * 0.5, 16);
          counter?.setPosition(width * 0.5, height * 0.76).setSize(width * 0.86, height * 0.2);
          counterGlow?.setPosition(width * 0.5, height * 0.82).setSize(width * 0.52, 46);
          bartenderShadow?.setPosition(width * 0.5, height * 0.66);
          bartenderBody?.setPosition(width * 0.5, height * 0.48);
          bartenderApron?.setPosition(width * 0.5, height * 0.51);
          bartenderHead?.setPosition(width * 0.5, height * 0.34);
          faceText?.setPosition(width * 0.5, height * 0.34);
          moodText?.setPosition(width * 0.5, height * 0.64);
          promptText?.setPosition(width * 0.5, height * 0.91);

          shelfBottleLeft?.setPosition(width * 0.38, height * 0.2);
          shelfBottleMiddle?.setPosition(width * 0.52, height * 0.19);
          shelfBottleRight?.setPosition(width * 0.66, height * 0.2);

          bellBase?.setPosition(width * 0.24, height * 0.73);
          bellDome?.setPosition(width * 0.24, height * 0.7);
          bellZone?.setPosition(width * 0.24, height * 0.71);

          noteCard?.setPosition(width * 0.77, height * 0.61);
          noteText?.setPosition(width * 0.77, height * 0.61);
          noteZone?.setPosition(width * 0.77, height * 0.61);

          frameOuter?.setPosition(width * 0.22, height * 0.24);
          frameInner?.setPosition(width * 0.22, height * 0.24);
          frameText?.setPosition(width * 0.22, height * 0.24);
          frameZone?.setPosition(width * 0.22, height * 0.24);

          guestBook?.setPosition(width * 0.74, height * 0.73);
          guestBookText?.setPosition(width * 0.74, height * 0.73);
          guestBookZone?.setPosition(width * 0.74, height * 0.73);

          bartenderZone?.setPosition(width * 0.5, height * 0.46);
        }
      }

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        backgroundColor: "#0b1020",
        transparent: false,
        scene: TeddyAdventureScene,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });

      game.registry.set("scene-state", sceneState);
      gameRef.current = game;

      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || !gameRef.current) return;

        const width = Math.max(entry.contentRect.width, 320);
        const height = Math.max(entry.contentRect.height, 320);
        gameRef.current.scale.resize(width, height);
      });

      resizeObserver.observe(containerRef.current);
    }

    void mountGame();

    return () => {
      isDisposed = true;
      resizeObserver?.disconnect();
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [sceneState]);

  const currentLine = dialogue.lines[dialogue.index] ?? "";
  const reactionVisual = REACTION_VISUALS[reaction];

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDropActive(false);

    const draggedItem = event.dataTransfer.getData("text/plain");
    if (!isExternalDragItemId(draggedItem)) return;

    onExternalDrop(draggedItem);
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#08111f]/95 shadow-[0_30px_120px_rgba(2,6,23,0.6)]">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/25 backdrop-blur-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#7dd3fc]">
            Point & Click Shift
          </p>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Teddy&apos;s After-Hours Build Bar
          </h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono" style={{ color: reactionVisual.accent }}>
            {reactionVisual.label}
          </p>
          <p className="text-[11px] text-gray-500">Click scene props or deliver outside items.</p>
        </div>
      </div>

      <div
        className={cn(
          "relative aspect-[16/10] min-h-[420px] sm:min-h-[500px]",
          dropActive && "ring-2 ring-[#7dd3fc] ring-inset"
        )}
      >
        <button
          type="button"
          ref={containerRef}
          aria-label="Teddy adventure game scene"
          className="absolute inset-0 pt-16 text-left bg-transparent border-0 p-0"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onBartenderClick();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDropActive(true);
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={handleDrop}
        />

        <div className="absolute inset-x-4 top-20 z-20 flex justify-between pointer-events-none">
          <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-mono text-gray-300 backdrop-blur-sm">
            Affinity {affection}/7 · {affectionLabel}
          </div>
          {focusLabel && (
            <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-mono text-gray-300 backdrop-blur-sm">
              {focusLabel}
            </div>
          )}
        </div>

        {dropActive && (
          <div className="absolute inset-x-6 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-dashed border-[#7dd3fc]/60 bg-[#08111f]/75 px-5 py-6 text-center backdrop-blur-sm pointer-events-none">
            <p className="text-sm font-semibold text-white">Drop the item on Teddy&apos;s shift</p>
            <p className="text-xs text-gray-400 mt-1">
              He&apos;ll react and may turn it into a new story beat.
            </p>
          </div>
        )}

        {dialogue.visible && (
          <div className="absolute inset-x-4 bottom-4 z-30">
            {dialogue.choices.length > 0 && (
              <div className="absolute right-0 bottom-full mb-3 w-40 space-y-2">
                <div className="rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl backdrop-blur-md">
                  {dialogue.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => onChoiceSelect(choice.id)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-[#7dd3fc]/50 hover:bg-white/10"
                    >
                      <span className="block text-xs font-semibold text-white">
                        {choice.label}
                      </span>
                      {choice.hint && (
                        <span className="block text-[10px] text-gray-400 mt-1">
                          {choice.hint}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative rounded-2xl border border-white/10 bg-black/70 px-5 py-4 shadow-2xl backdrop-blur-md">

              <div className="pr-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#7dd3fc] mb-2">
                  {dialogue.speaker}
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-gray-100 min-h-[48px]">
                  {currentLine}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-mono text-gray-500">
                    {dialogue.choices.length > 0
                      ? "Choose a response"
                      : "Press Enter to continue"}
                  </p>
                  {dialogue.choices.length === 0 && (
                    <button
                      type="button"
                      onClick={onAdvanceDialogue}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition hover:bg-white/10"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
