import { clsx, type ClassValue } from "clsx";
import type { ContentBlockInterface } from "./types";

// 클래스네임 병합
export function cn(...classes: ClassValue[]): string {
  return clsx(classes);
}

// 날짜 포맷팅
export function formatDate(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const diff = now.getTime() - dateObj.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return dateObj.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return "방금 전";
  }
}

// 메모 내용 파싱 (마크다운 + 특수 문법)
export function parseContent(content: string): ContentBlockInterface[] {
  const blocks: ContentBlockInterface[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 체크박스 (체크됨)
    if (line.startsWith("--v ")) {
      blocks.push({
        type: "checkbox",
        content: line.replace("--v ", ""),
        metadata: { checked: true },
      });
    }
    // 체크박스 (미체크)
    else if (line.startsWith("-- ")) {
      blocks.push({
        type: "checkbox",
        content: line.replace("-- ", ""),
        metadata: { checked: false },
      });
    }
    // 코드 블록 시작
    else if (line.startsWith("```")) {
      const language = line.slice(3).trim() || "typescript";
      const codeLines: string[] = [];
      i++; // 다음 줄로 이동

      // 코드 블록 끝까지 수집
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }

      blocks.push({
        type: "code",
        content: codeLines.join("\n"),
        metadata: { language },
      });
    }
    // 메모 링크
    else if (line.includes("[@") && line.includes("](memo://")) {
      const match = line.match(/\[@([^\]]+)\]\(memo:\/\/([^\)]+)\)/);
      if (match) {
        const [, memoTitle, memoId] = match;
        blocks.push({
          type: "memo-link",
          content: line,
          metadata: { memoId, memoTitle },
        });
      } else {
        blocks.push({ type: "text", content: line });
      }
    }
    // 일반 텍스트
    else {
      blocks.push({ type: "text", content: line });
    }
  }

  return blocks;
}

// 체크박스 상태 토글
export function toggleCheckbox(content: string, lineIndex: number): string {
  const lines = content.split("\n");

  if (lineIndex < 0 || lineIndex >= lines.length) {
    return content;
  }

  const line = lines[lineIndex];

  if (line.startsWith("--v ")) {
    lines[lineIndex] = line.replace("--v ", "-- ");
  } else if (line.startsWith("-- ")) {
    lines[lineIndex] = line.replace("-- ", "--v ");
  }

  return lines.join("\n");
}

// 고유 ID 생성
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function tokenizeCommandLine(commandLine: string): string[] {
  // split by spaces but keep quoted strings
  const tokens: string[] = [];
  let cur = "";
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < commandLine.length; i++) {
    const ch = commandLine[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === " ") {
      if (cur) {
        tokens.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }
  if (cur) tokens.push(cur);
  return tokens;
}
