import type { SortOption } from "./types";

function resolveApiRoot(apiUrl: string | undefined): string {
  const fallback = "http://localhost:3031/api";

  if (!apiUrl) {
    return fallback;
  }

  const normalizedUrl = apiUrl.replace(/\/+$/, "");

  if (normalizedUrl.endsWith("/todo") || normalizedUrl.endsWith("/travel")) {
    return normalizedUrl.replace(/\/(todo|travel)$/, "");
  }

  return normalizedUrl;
}

export const API_ROOT_URL = resolveApiRoot(process.env.NEXT_PUBLIC_API_URL);
export const TODO_API_BASE_URL = `${API_ROOT_URL}/todo`;
export const TRAVEL_API_BASE_URL = `${API_ROOT_URL}/travel`;

export const LIVEKIT_URL =
  process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "created", label: "생성순" },
  { value: "name", label: "이름순" },
  { value: "updated", label: "최근편집순" },
];

export const DEFAULT_CODE_LANGUAGE = "typescript";

export const EDITOR_THEME = "vs-dark";
export const AllIcons = [
  "Beer",
  "Cake",
  "Flash",
  "IceCream",
  "Idea",
  "King",
  "Mountain",
  "Nut",
  "Pizza",
  "Plant",
  "Radio",
  "Skull",
];

export const GAME_TILE = 32;
