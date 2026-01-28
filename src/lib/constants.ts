import type { SortOption } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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