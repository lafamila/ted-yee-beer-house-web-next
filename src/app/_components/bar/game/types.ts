export type BartenderReaction =
  | "relaxed"
  | "serious"
  | "watching-menu"
  | "serving"
  | "curious"
  | "warm"
  | "busy";

export type ExternalDragItemId =
  | "beer-glass"
  | "coaster"
  | "weather-note";

export type GameSceneObjectId =
  | "service-bell"
  | "terminal-note"
  | "guest-book"
  | "wall-frame";

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  source: string;
}

export interface GameChoice {
  id: string;
  label: string;
  hint?: string;
}

export type DialogueMode = "story" | "ambient";

export interface GameDialogueState {
  visible: boolean;
  speaker: string;
  lines: string[];
  index: number;
  mode: DialogueMode;
  choices: GameChoice[];
}

export function isExternalDragItemId(value: string): value is ExternalDragItemId {
  return ["beer-glass", "coaster", "weather-note"].includes(value);
}
