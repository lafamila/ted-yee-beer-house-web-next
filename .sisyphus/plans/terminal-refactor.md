# Terminal Refactor — Shared Component + Landing/Game Updates

## TL;DR

> **Quick Summary**: Extract a shared Terminal component (Landing design + Game logic) that both the landing page and /game page use. Update landing commands, fix game page layout.
> 
> **Deliverables**:
> - `src/components/ui/Terminal/Terminal.tsx` — Shared terminal component with TerminalOverlay visual design + TerminalSection's full keyboard/history/read() logic
> - `src/components/ui/Terminal/index.ts` — Barrel export
> - `src/app/_components/TerminalOverlay.tsx` — Rewritten to wrap shared Terminal in framer-motion overlay
> - `src/app/_components/Introduction.tsx` — Updated with new command set
> - `src/app/game/page.tsx` — Rewritten to use shared Terminal with flex layout
> - `src/app/game/_components/TerminalSection.tsx` — Deleted (replaced by shared component)
> - `src/lib/types.ts` — Updated with new terminal config types
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Task 1 (types) → Task 2 (shared component) → Tasks 3,4,5 (consumers) → Task 6 (verification)

---

## Context

### Original Request
사용자가 3가지 수정을 요청:
1. /game 페이지 터미널이 landing 페이지 우측 하단 floating button 터미널과 같은 디자인이어야 함. 단, GamePlaySection 아래 나머지 영역을 채운 expanded 상태로 고정.
2. Landing 페이지 터미널 명령어를 /game 터미널 명령어 기반으로 갱신 (sudo 제외, game/todo 내비게이션 추가)
3. Terminal을 모든 페이지에서 사용 가능한 공용 컴포넌트화. 사용 시 원하는 명령어를 지정/추가 가능하게 설계.

### Interview Summary
**Key Discussions**:
- Design standard: Landing TerminalOverlay design (dark bg, backdrop-blur, lucide icons, blue `>` prompt)
- /game terminal: NO header buttons (maximize/minimize/close) — always expanded
- Landing commands: Complete replacement with game commands (minus sudo) + game/todo navigation
- Shared component includes full imperative API: read()/print()/focus()/blur()
- No test infrastructure in frontend project — no automated tests

**Research Findings**:
- Two completely separate terminal implementations share zero code
- TerminalSection (game) has superior logic: keyboard handling, history, read() API, onCommand prop
- TerminalOverlay (landing) has desired visual design but lacks features
- Game page layout needs flex-col conversion for terminal to fill remaining space
- Shared types already in `src/lib/types.ts`, tokenizer in `src/lib/utils.ts`

### Metis Review
**Identified Gaps** (addressed):
- Navigation mechanism for `game`/`todo` commands → Resolved: Use `window.location.href` (simpler, no Next.js router dependency in shared component)
- `exit` command fate → Resolved: Landing terminal keeps `exit` (calls onClose). Game terminal has no `exit` (always visible).
- Line coloring → Resolved: Use TerminalOverlay color scheme (green for output, gray for input lines)
- `.terminal` CSS class cleanup → Resolved: Remove from globals.css, inline styles in shared component
- Tab completion scope → Guardrail: Keep current behavior (builtIn names only), do NOT expand

---

## Work Objectives

### Core Objective
Create a single shared Terminal component that unifies two separate implementations, using the Landing page's visual design with the Game terminal's full-featured logic. Both pages consume this shared component with their own command configurations.

### Concrete Deliverables
- `src/components/ui/Terminal/Terminal.tsx` — Shared component (forwardRef, imperative API)
- `src/components/ui/Terminal/index.ts` — Barrel export
- Updated `src/app/_components/TerminalOverlay.tsx` — Overlay wrapper using shared Terminal
- Updated `src/app/_components/Introduction.tsx` — New command set via onCommand
- Updated `src/app/game/page.tsx` — Flex layout + shared Terminal
- Deleted `src/app/game/_components/TerminalSection.tsx`
- Updated `src/lib/types.ts` — Add TerminalProps interface if needed
- Updated `src/app/globals.css` — Remove `.terminal` class (no longer needed)

### Definition of Done
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] Landing page floating button opens terminal overlay with correct commands
- [ ] Landing terminal has commands: help, clear, echo, date, whoami, ping, sum, game, todo
- [ ] Landing terminal does NOT have: about, projects, contact, sudo
- [ ] /game terminal fills remaining space below GamePlaySection
- [ ] /game terminal has TerminalOverlay visual design (dark bg, backdrop-blur, blue prompt)
- [ ] /game terminal has NO header buttons (maximize/minimize/close)
- [ ] /game sudo flow still works (password prompt via read())
- [ ] /game admin commands forwarded to Kaboom still work
- [ ] Shared Terminal accepts custom commands via onCommand prop
- [ ] Shared Terminal exposes read()/print()/focus()/blur() via ref

### Must Have
- TerminalOverlay visual design on ALL terminals (dark bg, backdrop-blur, lucide Terminal icon, blue `>` prompt)
- Full keyboard handling (ArrowUp/Down history, Ctrl+C/L, Tab completion, Enter)
- `onCommand` prop for consumer-defined commands with priority over builtIns
- Imperative API via forwardRef: focus(), blur(), read(opts), print(msg)
- Game page flex layout: GamePlaySection fixed height + Terminal flex-1
- Navigation commands (`game`, `todo`) use `window.location.href` — NOT `useRouter`

### Must NOT Have (Guardrails)
- Shared Terminal component must NOT import `next/navigation` or `next/router` — must be framework-agnostic
- Do NOT add new builtIn commands beyond current set (help, clear, echo, date, whoami)
- Do NOT expand Tab completion beyond builtIn command names
- Do NOT modify Kaboom.js game commands (tp, speed, jump, gravity, spawn, reset)
- Do NOT modify the sudo/permission logic in game page
- Do NOT add framer-motion as a dependency of the shared Terminal (keep it in the overlay wrapper only)
- Do NOT create test files (no test infrastructure exists)
- Do NOT touch /todo page beyond adding navigation to it via terminal command
- Do NOT over-abstract: no command registry class, no plugin system — keep it simple with `onCommand` prop

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (no test framework set up)
- **Framework**: None

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **Build/Lint**: Use Bash — `npm run build`, `npm run lint`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — start immediately):
├── Task 1: Update types in src/lib/types.ts [quick]
├── Task 2: Create shared Terminal component [deep]
└── Task 3: Clean up globals.css .terminal class [quick]

Wave 2 (Consumers — after Wave 1):
├── Task 4: Rewrite TerminalOverlay + update Introduction (landing) [unspecified-high]
├── Task 5: Rewrite /game page to use shared Terminal [unspecified-high]
└── Task 6: Delete old TerminalSection.tsx [quick]

Wave 3 (Verification — after Wave 2):
├── Task 7: Build + Lint verification [quick]
└── FINAL: Parallel review wave (4 agents)

Critical Path: Task 2 → Task 4,5 → Task 7 → FINAL
Max Concurrent: 3 (Wave 1), 3 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 (types) | — | 2, 4, 5 |
| 2 (shared Terminal) | 1 | 4, 5 |
| 3 (CSS cleanup) | — | 7 |
| 4 (landing page) | 1, 2 | 7 |
| 5 (game page) | 1, 2 | 6, 7 |
| 6 (delete old) | 5 | 7 |
| 7 (build+lint) | 3, 4, 5, 6 | FINAL |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks — T1 → `quick`, T2 → `deep`, T3 → `quick`
- **Wave 2**: 3 tasks — T4 → `unspecified-high`, T5 → `unspecified-high`, T6 → `quick`
- **Wave 3**: 1 task — T7 → `quick` + FINAL wave (4 parallel agents)

---

## TODOs
> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

- [ ] 1. Update terminal types in `src/lib/types.ts`

  **What to do**:
  - Add a new `TerminalProps` interface to `src/lib/types.ts` after the existing terminal types (after line 31):
    ```ts
    export interface TerminalProps {
      /** Header prompt name (e.g. "guest@portfolio:~") */
      prompt?: string;
      /** Welcome lines shown on mount */
      welcomeMessages?: string[];
      /** Consumer-defined command handler — runs BEFORE builtIns */
      onCommand?: CommandHandler;
      /** Optional callback when user types 'exit' — if omitted, 'exit' is not registered */
      onExit?: () => void;
      /** Optional header controls (e.g. maximize/close buttons) — rendered right side of header */
      headerControls?: import('react').ReactNode;
      /** Height of scrollable body — CSS value or number (px). Default: '100%' */
      height?: number | string;
      /** Additional CSS class for the outermost container */
      className?: string;
    }
    ```
  - Keep ALL existing types unchanged: `CommandLineType`, `CommandLine`, `CommandResult`, `CommandHandler`, `TerminalHandler`, `ReadOptionsInterface`, `ReadRequestInterface`, `GameAPIInterface`
  - No other files touched in this task

  **Must NOT do**:
  - Do NOT modify any existing type definitions
  - Do NOT add top-level imports — use inline `import('react').ReactNode` syntax for the `headerControls` field type so the type file stays import-free

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, small addition (~15 lines), no complexity
  - **Skills**: []
    - No special skills needed for a type addition
  - **Skills Evaluated but Omitted**:
    - `playwright`: No UI work
    - `frontend-ui-ux`: No design work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 2, 4, 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/lib/types.ts:1-31` — All existing terminal types. New `TerminalProps` goes after line 31 (after `ReadRequestInterface`)

  **API/Type References**:
  - `src/lib/types.ts:9` — `CommandHandler` type used in `onCommand` prop
  - `src/lib/types.ts:15-20` — `TerminalHandler` type (imperative API, unchanged)

  **WHY Each Reference Matters**:
  - `types.ts:1-31`: Executor needs to see existing types to place the new interface correctly and avoid duplication
  - `CommandHandler` on line 9: The `onCommand` prop in `TerminalProps` uses this exact type

  **Acceptance Criteria**:
  - [ ] `TerminalProps` interface exists in `src/lib/types.ts`
  - [ ] `TerminalProps` has fields: `prompt`, `welcomeMessages`, `onCommand`, `onExit`, `headerControls`, `height`, `className`
  - [ ] All existing types unchanged (diff shows only additions, no modifications)
  - [ ] `npx tsc --noEmit` passes (no type errors)

  **QA Scenarios:**

  ```
  Scenario: TerminalProps interface is correctly defined
    Tool: Bash
    Preconditions: File saved after edit
    Steps:
      1. Run: npx tsc --noEmit 2>&1
      2. Run: grep -c "TerminalProps" src/lib/types.ts
      3. Run: grep "onCommand.*CommandHandler" src/lib/types.ts
    Expected Result:
      - Step 1: Exit code 0, no errors
      - Step 2: Output >= 1 (interface exists)
      - Step 3: Match found (onCommand uses CommandHandler type)
    Failure Indicators: tsc errors, missing interface, wrong type for onCommand
    Evidence: .sisyphus/evidence/task-1-types-tsc.txt

  Scenario: Existing types not modified
    Tool: Bash
    Preconditions: File saved after edit
    Steps:
      1. Run: git diff src/lib/types.ts
      2. Verify diff shows ONLY added lines (no deletions or modifications to existing lines 1-31)
    Expected Result: Diff contains only "+" lines for new TerminalProps interface
    Failure Indicators: Any "-" lines in the diff for existing type definitions
    Evidence: .sisyphus/evidence/task-1-types-diff.txt
  ```

  **Commit**: YES (groups with Tasks 2, 3)
  - Message: `feat(terminal): create shared Terminal component with configurable commands`
  - Files: `src/lib/types.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 2. Create shared Terminal component `src/components/ui/Terminal/`

  **What to do**:
  - Create directory `src/components/ui/Terminal/`
  - Create `src/components/ui/Terminal/index.ts` — barrel export: `export { default as Terminal } from './Terminal'` and `export type { TerminalProps } from '@/lib/types'`
  - Create `src/components/ui/Terminal/Terminal.tsx` — the shared component that merges:
    - **Visual design from TerminalOverlay.tsx** (landing page):
      - Outer container: `bg-black/95 border-t border-white/20 backdrop-blur-xl font-mono` (from TerminalOverlay line 90)
      - Header: `h-10 border-b border-white/10 flex items-center justify-between px-4 bg-white/5` (from line 93)
      - Header left: lucide `Terminal` icon (`w-4 h-4 text-[#3994ef]`) + prompt name in `text-sm text-gray-400` (from lines 94-96)
      - Header right: `{headerControls}` slot (React.ReactNode from props)
      - Body text colors: input lines `text-gray-400`, output lines `text-green-400` (from line 117)
      - Input prompt: lucide `ChevronRight` icon (`w-4 h-4 text-[#3994ef]`) — NOT `text-emerald-400 prompt$` (from line 124)
      - Input field: `bg-transparent border-none outline-none focus:ring-0 placeholder-gray-600` (from line 129)
    - **Full logic from TerminalSection.tsx** (game page):
      - `forwardRef<TerminalHandler, TerminalProps>` pattern (from line 280)
      - State: `lines` (CommandLine[]), `userInput`, `histories`, `historyIndex`, `readRequest` (lines 27-44)
      - `useImperativeHandle` exposing `focus()`, `blur()`, `read(opts)`, `print(msg)` (lines 46-71)
      - `builtInFunctions` memo: help, clear, echo, date, whoami (lines 83-100)
      - `runCommand` — tries `onCommand` first, then builtIns, then "Command not found" (lines 102-141)
      - Full `handleKeyDown` — Enter, Ctrl+C, Ctrl+L, ArrowUp/Down history, Tab autocomplete, readRequest mode (lines 144-222)
      - Auto-scroll on lines/input change (lines 76-81)
      - Auto-focus on mount (lines 72-74)
  - Add `'use client'` directive at top (uses useState, useEffect, useRef)
  - Import `Terminal as TerminalIcon` and `ChevronRight` from `lucide-react`
  - Import types from `@/lib/types`, utils from `@/lib/utils`
  - **builtIn help command**: When displaying help, show ONLY the 5 builtIn command names (help, clear, echo, date, whoami) — consumer commands are NOT listed in builtIn help (consumers override `help` via `onCommand` to show their own full list)
  - **`onExit` handling**: If `onExit` prop is provided, register `exit` as a builtIn that calls `onExit()`. If not provided, `exit` is not a builtIn.
  - **Scrollable body**: Use `ref={scrollRef}` div with `overflow-auto` and `height` from props (default `'100%'`)
  - **className prop**: Apply via `cn()` on outermost container for consumer overrides

  **Must NOT do**:
  - Do NOT import `framer-motion` — animations belong in the overlay wrapper, not the shared component
  - Do NOT import `next/navigation` or `next/router` — navigation commands use `window.location.href` at the consumer level (in onCommand)
  - Do NOT add commands beyond the 5 builtIns (help, clear, echo, date, whoami)
  - Do NOT add macOS traffic light dots (red/yellow/green) — use TerminalOverlay header design
  - Do NOT expand Tab completion beyond builtIn command names

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Core component with complex logic (keyboard handling, imperative API, read() promise flow). Must precisely merge two implementations.
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Visual design merging — needs to faithfully reproduce TerminalOverlay's look while integrating TerminalSection's logic
  - **Skills Evaluated but Omitted**:
    - `playwright`: No browser testing in this task (QA is in final wave)

  **Parallelization**:
  - **Can Run In Parallel**: YES (in Wave 1, but depends on Task 1 for types)
  - **Parallel Group**: Wave 1 (with Tasks 1, 3) — but Task 1 must complete first
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: Task 1 (needs TerminalProps type)

  **References**:

  **Pattern References** (existing code to follow):
  - `src/app/game/_components/TerminalSection.tsx:1-281` — ENTIRE file is the logic source. Copy and adapt ALL state management (lines 27-44), useImperativeHandle (46-71), builtInFunctions (83-100), runCommand (102-141), handleKeyDown (144-222). This is the primary source of truth for behavior.
  - `src/app/_components/TerminalOverlay.tsx:78-139` — Visual design source. Header structure (lines 92-112), body layout (lines 114-135), color scheme (line 90 container, line 117 line colors, line 124 prompt icon).
  - `src/components/ui/Button.tsx` — Example of existing shared UI component structure (named export vs default, file organization)

  **API/Type References**:
  - `src/lib/types.ts:TerminalProps` — Props interface (from Task 1)
  - `src/lib/types.ts:TerminalHandler` (lines 15-20) — Imperative handle shape
  - `src/lib/types.ts:CommandLine` (line 2) — Line type for history state
  - `src/lib/types.ts:ReadRequestInterface` (lines 27-31) — Read request state
  - `src/lib/types.ts:CommandHandler` (line 9) — onCommand prop type
  - `src/lib/utils.ts:tokenizeCommandLine` — Command parsing utility (import from `@/lib/utils`)
  - `src/lib/utils.ts:cn` — Class name merger (import from `@/lib/utils`)

  **External References**:
  - lucide-react: `Terminal` (rename to `TerminalIcon` to avoid conflict), `ChevronRight` — same icons used in TerminalOverlay

  **WHY Each Reference Matters**:
  - `TerminalSection.tsx` is the complete behavioral specification — every keyboard shortcut, every state transition, every edge case. The shared component must replicate this behavior exactly.
  - `TerminalOverlay.tsx:78-139` defines the exact CSS classes and visual structure. The shared component must look identical to the landing terminal.
  - `types.ts` types ensure the component's API contract matches what consumers (game page, landing page) expect.

  **Acceptance Criteria**:
  - [ ] `src/components/ui/Terminal/Terminal.tsx` exists with `'use client'` directive
  - [ ] `src/components/ui/Terminal/index.ts` exports Terminal component and TerminalProps type
  - [ ] Component uses `forwardRef<TerminalHandler, TerminalProps>`
  - [ ] Exposes `focus()`, `blur()`, `read(opts)`, `print(msg)` via `useImperativeHandle`
  - [ ] Has all 5 builtIn commands: help, clear, echo, date, whoami
  - [ ] Visual: `bg-black/95`, `backdrop-blur-xl`, lucide Terminal icon in header, ChevronRight prompt `text-[#3994ef]`
  - [ ] Keyboard: Enter, Ctrl+C, Ctrl+L, ArrowUp/Down, Tab autocomplete all work
  - [ ] `onCommand` prop called before builtIns, `onExit` creates exit builtIn
  - [ ] `headerControls` rendered in header right slot
  - [ ] No imports from `framer-motion`, `next/navigation`, or `next/router`
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: Component compiles and exports correctly
    Tool: Bash
    Preconditions: Files created
    Steps:
      1. Run: npx tsc --noEmit 2>&1
      2. Run: grep "forwardRef" src/components/ui/Terminal/Terminal.tsx
      3. Run: grep "useImperativeHandle" src/components/ui/Terminal/Terminal.tsx
      4. Run: cat src/components/ui/Terminal/index.ts
    Expected Result:
      - Step 1: Exit code 0
      - Step 2: forwardRef<TerminalHandler found
      - Step 3: useImperativeHandle found with focus/blur/read/print
      - Step 4: Barrel export with Terminal and TerminalProps
    Failure Indicators: tsc errors, missing exports, missing imperative methods
    Evidence: .sisyphus/evidence/task-2-component-compile.txt

  Scenario: No forbidden imports in shared component
    Tool: Bash
    Preconditions: Files created
    Steps:
      1. Run: grep -n "framer-motion" src/components/ui/Terminal/Terminal.tsx; echo "exit:$?"
      2. Run: grep -n "next/navigation\|next/router" src/components/ui/Terminal/Terminal.tsx; echo "exit:$?"
    Expected Result:
      - Step 1: No matches (exit code 1)
      - Step 2: No matches (exit code 1)
    Failure Indicators: Any match found — these imports are forbidden in the shared component
    Evidence: .sisyphus/evidence/task-2-forbidden-imports.txt

  Scenario: Visual design matches TerminalOverlay
    Tool: Bash
    Preconditions: Files created
    Steps:
      1. Run: grep "bg-black/95" src/components/ui/Terminal/Terminal.tsx
      2. Run: grep "backdrop-blur-xl" src/components/ui/Terminal/Terminal.tsx
      3. Run: grep "ChevronRight" src/components/ui/Terminal/Terminal.tsx
      4. Run: grep "text-\[#3994ef\]" src/components/ui/Terminal/Terminal.tsx
      5. Run: grep "text-green-400" src/components/ui/Terminal/Terminal.tsx
      6. Run: grep "text-gray-400" src/components/ui/Terminal/Terminal.tsx
    Expected Result: All 6 greps find matches
    Failure Indicators: Any grep returns no match — visual design deviates from TerminalOverlay
    Evidence: .sisyphus/evidence/task-2-visual-design.txt
  ```

  **Commit**: YES (groups with Tasks 1, 3)
  - Message: `feat(terminal): create shared Terminal component with configurable commands`
  - Files: `src/components/ui/Terminal/Terminal.tsx`, `src/components/ui/Terminal/index.ts`
  - Pre-commit: `npx tsc --noEmit`


- [ ] 3. Remove `.terminal` CSS class from `globals.css`

  **What to do**:
  - In `src/app/globals.css`, delete lines 21-24 (the `.terminal` class definition):
    ```css
    /* Game App Styles */
    .terminal {
      @apply rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden font-mono text-white;
    }
    ```
  - These styles are no longer needed — the shared Terminal component has its own inline classes
  - Delete only these 4 lines. Do NOT touch any other CSS.

  **Must NOT do**:
  - Do NOT modify any other CSS rules in globals.css
  - Do NOT add new CSS (styles are in the component now)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Delete 4 lines from one file
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - All: Trivial deletion task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 7 (build verification)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/app/globals.css:21-24` — The exact lines to delete (`.terminal` class)
  - `src/app/game/page.tsx:60` — Usage of `.terminal` class (`className="p-6 h-[80vh] terminal"`) — will be removed in Task 5

  **WHY Each Reference Matters**:
  - `globals.css:21-24`: Executor needs exact location of lines to delete
  - `game/page.tsx:60`: Shows that the only consumer is the game page wrapper (being rewritten in Task 5), confirming safe deletion

  **Acceptance Criteria**:
  - [ ] `.terminal` class no longer exists in `src/app/globals.css`
  - [ ] All other CSS rules in globals.css are unchanged
  - [ ] File still contains `.sidebar-transition` and CodeMirror `.ͼ1` rules

  **QA Scenarios:**

  ```
  Scenario: .terminal class removed
    Tool: Bash
    Preconditions: File saved after edit
    Steps:
      1. Run: grep -c "\.terminal" src/app/globals.css
      2. Run: grep "sidebar-transition" src/app/globals.css
      3. Run: grep "ͼ1" src/app/globals.css
    Expected Result:
      - Step 1: Output is 0 (no .terminal class)
      - Step 2: Match found (other rules preserved)
      - Step 3: Match found (CodeMirror rule preserved)
    Failure Indicators: .terminal still exists, or other rules were deleted
    Evidence: .sisyphus/evidence/task-3-css-cleanup.txt
  ```

  **Commit**: YES (groups with Tasks 1, 2)
  - Message: `feat(terminal): create shared Terminal component with configurable commands`
  - Files: `src/app/globals.css`
  - Pre-commit: none (CSS only)

- [ ] 4. Rewrite landing page: `TerminalOverlay.tsx` + update `Introduction.tsx` commands

  **What to do**:

  **Part A — Rewrite `src/app/_components/TerminalOverlay.tsx`:**
  - Gut the current implementation and replace with a thin wrapper around the shared Terminal
  - Keep: `'use client'`, `AnimatePresence`, `motion.div`, `isOpen`/`onClose` props, framer-motion spring animation
  - Replace: All internal state (history, input, handleCommand) → shared Terminal handles everything
  - Structure:
    ```tsx
    'use client'
    import { useRef, useState } from 'react'
    import { motion, AnimatePresence } from 'framer-motion'
    import { X, Minimize2, Maximize2 } from 'lucide-react'
    import { Terminal } from '@/components/ui/Terminal'
    import { TerminalHandler } from '@/lib/types'
    
    interface TerminalOverlayProps {
      isOpen: boolean
      onClose: () => void
    }
    
    const TerminalOverlay = ({ isOpen, onClose }: TerminalOverlayProps) => {
      const [isMaximized, setIsMaximized] = useState(false)
      const terminalRef = useRef<TerminalHandler>(null)
      
      return (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1, height: isMaximized ? '100vh' : '300px' }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl flex flex-col"
              onClick={() => terminalRef.current?.focus()}
            >
              <Terminal
                ref={terminalRef}
                prompt="guest@portfolio:~"
                height="100%"
                className="h-full"
                welcomeMessages={[
                  'Welcome to AlexDev Portfolio v2.4.0',
                  "Type 'help' for a list of commands.",
                ]}
                onExit={onClose}
                headerControls={/* maximize + close buttons */}
                onCommand={/* landing command handler */}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )
    }
    ```
  - **headerControls**: Render maximize/minimize toggle + close (X) button — same styling as current lines 98-111:
    ```tsx
    headerControls={
      <div className="flex items-center gap-2">
        <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white">
          {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors text-gray-400 hover:text-red-400">
          <X className="w-4 h-4" />
        </button>
      </div>
    }
    ```
  - **onCommand handler** — the landing page command list:
    ```tsx
    onCommand={(cmd, args) => {
      switch (cmd) {
        case 'help': return [
          'help                    Show this help',
          'clear                   Clear the screen',
          'echo [text]             Print text',
          'date                    Print current date',
          'whoami                  Print prompt name',
          'ping                    pong',
          'sum [num1] [num2] ...   Sum numbers',
          'game                    Go to game page',
          'todo                    Go to todo page',
        ]
        case 'ping': return 'pong'
        case 'sum': return String(args.map(Number).reduce((a, b) => a + b, 0))
        case 'game': window.location.href = '/game'; return 'Navigating to /game...'
        case 'todo': window.location.href = '/todo'; return 'Navigating to /todo...'
      }
    }}
    ```
  - Note: `help`, `clear`, `echo`, `date`, `whoami` are handled by builtIns if onCommand returns undefined. But `help` is overridden here to show the FULL command list including ping/sum/game/todo.

  **Part B — Update `src/app/_components/Introduction.tsx`:**
  - No command changes needed in Introduction.tsx — commands live in TerminalOverlay now
  - The only change: verify import still works (`import TerminalOverlay from './TerminalOverlay'` — this doesn't change)
  - If TerminalOverlay's export signature changed, update the import accordingly

  **Must NOT do**:
  - Do NOT modify Introduction.tsx layout, styling, or content (only adjust import if needed)
  - Do NOT remove framer-motion from TerminalOverlay (it needs the overlay animation)
  - Do NOT add commands beyond: help, clear, echo, date, whoami, ping, sum, game, todo
  - Do NOT add `exit` to the command list display — it's handled by `onExit` prop as a builtIn

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Significant rewrite of TerminalOverlay + careful command handler implementation with navigation
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needs to preserve framer-motion animation while integrating shared component
  - **Skills Evaluated but Omitted**:
    - `playwright`: Browser testing is in final wave

  **Parallelization**:
  - **Can Run In Parallel**: YES (parallel with Task 5 in Wave 2)
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 7 (build verification)
  - **Blocked By**: Tasks 1, 2 (needs shared Terminal component)

  **References**:

  **Pattern References**:
  - `src/app/_components/TerminalOverlay.tsx:1-142` — ENTIRE current file being rewritten. Preserve: framer-motion animation (lines 81-89), header button styling (lines 98-111), interface shape (lines 7-10)
  - `src/app/_components/Introduction.tsx:16-17` — Current import of TerminalOverlay + usage on line 157
  - `src/app/game/page.tsx:71-113` — Game page onCommand pattern showing how command handlers work with switch statement and return values

  **API/Type References**:
  - `src/components/ui/Terminal` — The shared Terminal component (from Task 2)
  - `src/lib/types.ts:TerminalHandler` — For useRef type
  - `src/lib/types.ts:TerminalProps` — Props the Terminal accepts

  **External References**:
  - `framer-motion`: `AnimatePresence`, `motion.div` — already used in current TerminalOverlay
  - `lucide-react`: `X`, `Minimize2`, `Maximize2` — header control icons (already imported in current file)

  **WHY Each Reference Matters**:
  - Current `TerminalOverlay.tsx` — Executor needs to know what to preserve (animation config, button styling) and what to delete (internal state, handleCommand switch)
  - `Introduction.tsx:16-17` — Must verify import still works after rewrite
  - `game/page.tsx:71-113` — Shows the exact pattern for onCommand handlers the executor should follow

  **Acceptance Criteria**:
  - [ ] `TerminalOverlay.tsx` uses `<Terminal>` from `@/components/ui/Terminal`
  - [ ] framer-motion animation preserved (spring, damping: 25, stiffness: 200)
  - [ ] Maximize/minimize/close buttons work (same styling as before)
  - [ ] `onExit={onClose}` connects exit command to close overlay
  - [ ] Landing commands: help returns full 9-command list
  - [ ] `game` command: `window.location.href = '/game'`
  - [ ] `todo` command: `window.location.href = '/todo'`
  - [ ] `ping` returns `'pong'`, `sum` returns sum of args
  - [ ] No internal state for history/input (delegated to shared Terminal)
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: TerminalOverlay uses shared Terminal component
    Tool: Bash
    Preconditions: Files saved
    Steps:
      1. Run: npx tsc --noEmit 2>&1
      2. Run: grep "@/components/ui/Terminal" src/app/_components/TerminalOverlay.tsx
      3. Run: grep "AnimatePresence" src/app/_components/TerminalOverlay.tsx
      4. Run: grep "onExit" src/app/_components/TerminalOverlay.tsx
      5. Run: grep "window.location.href" src/app/_components/TerminalOverlay.tsx
    Expected Result:
      - Step 1: Exit code 0
      - Step 2: Import from shared Terminal found
      - Step 3: framer-motion still used
      - Step 4: onExit={onClose} or similar found
      - Step 5: '/game' and '/todo' navigation found
    Failure Indicators: tsc errors, missing shared Terminal import, missing animation, missing navigation
    Evidence: .sisyphus/evidence/task-4-overlay-rewrite.txt

  Scenario: Old internal command handling removed
    Tool: Bash
    Preconditions: Files saved
    Steps:
      1. Run: grep -c "handleCommand" src/app/_components/TerminalOverlay.tsx
      2. Run: grep -c "switch (cmd)" src/app/_components/TerminalOverlay.tsx
      3. Run: grep -c "case \"about\"" src/app/_components/TerminalOverlay.tsx
    Expected Result:
      - Step 1: 0 (old handler removed)
      - Step 2: 0 or present in onCommand prop (not internal handler)
      - Step 3: 0 (about command removed)
    Failure Indicators: Old internal command logic still present
    Evidence: .sisyphus/evidence/task-4-old-logic-removed.txt
  ```

  **Commit**: YES (groups with Tasks 5, 6)
  - Message: `refactor(terminal): migrate landing and game pages to shared Terminal`
  - Files: `src/app/_components/TerminalOverlay.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 5. Rewrite `/game` page to use shared Terminal with flex layout

  **What to do**:
  - Rewrite `src/app/game/page.tsx` to:
    - Replace import: `import Terminal from './_components/TerminalSection'` → `import { Terminal } from '@/components/ui/Terminal'`
    - Convert layout from block to flex: `<div>` → `<div className="flex flex-col h-screen">`
    - GamePlaySection wrapper: `<div className="flex-none">` around GamePlaySection (keeps fixed height)
    - Terminal wrapper: `<div className="flex-1 min-h-0">` (fills remaining space, `min-h-0` prevents flex overflow)
      - Add `onClick={() => terminalRef.current?.focus()}` on this wrapper
    - Terminal: `<Terminal ref={terminalRef} height="100%" className="h-full" .../>` — fills wrapper
    - Remove `p-6 h-[80vh] terminal` class from terminal wrapper (these are replaced by flex layout)
    - **Keep ALL command logic unchanged**: guest commands (help, ping, sum, date, sudo), permission state, admin/idiot mode, Kaboom forwarding
    - **Keep ALL refs unchanged**: `terminalRef`, `gameRef`, `wrongPasswordCountRef`
    - **Keep ALL state unchanged**: `permission`, `mounted`, `windowWidth`
    - **Keep ALL effects unchanged**: mount effect, resize listener, permission change effect
    - Only changes: import path, outer layout classes, terminal wrapper classes
  - Do NOT change the game page terminal's `prompt`, `welcomeMessages`, or `onCommand` callback
  - The Terminal component no longer has `title` prop — if the current code passes `title=""`, just remove that prop

  **Must NOT do**:
  - Do NOT modify the onCommand callback logic (lines 71-113 of current file)
  - Do NOT modify sudo/permission logic
  - Do NOT modify GamePlaySection props or import
  - Do NOT add `onExit` (game terminal has no exit)
  - Do NOT add `headerControls` (game terminal has no header buttons)
  - Do NOT change the dynamic import of GamePlaySection

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Layout restructuring with flex + careful preservation of complex game logic
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Flex layout conversion needs precise CSS understanding for terminal to fill remaining space
  - **Skills Evaluated but Omitted**:
    - `playwright`: Browser testing is in final wave

  **Parallelization**:
  - **Can Run In Parallel**: YES (parallel with Task 4 in Wave 2)
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 6 (delete old file), Task 7 (build verification)
  - **Blocked By**: Tasks 1, 2 (needs shared Terminal component)

  **References**:

  **Pattern References**:
  - `src/app/game/page.tsx:1-118` — ENTIRE current file. Lines 51-116 are the JSX to restructure. Lines 71-113 are the onCommand callback to preserve EXACTLY.
  - `src/app/game/_components/TerminalSection.tsx:5-12` — Old TerminalSectionProps to compare against new TerminalProps (prompt, height, welcomeMessages, onCommand all carry over; title is removed)

  **API/Type References**:
  - `src/components/ui/Terminal` — The shared Terminal component import path
  - `src/lib/types.ts:TerminalHandler` — Used for `useRef<TerminalHandler>(null)` (already in current code)
  - `src/lib/types.ts:GameAPIInterface` — Used for gameRef (unchanged)
  - `src/lib/constants.ts:GAME_TILE` — Used for resolution calc (unchanged)

  **WHY Each Reference Matters**:
  - `game/page.tsx:1-118` — Executor must understand the FULL file to know what to change (layout) vs preserve (logic). The onCommand callback is 40+ lines of game logic that must be kept verbatim.
  - `TerminalSection.tsx:5-12` — Shows old props interface so executor can map old prop names to new TerminalProps

  **Acceptance Criteria**:
  - [ ] Import changed from `'./_components/TerminalSection'` to `'@/components/ui/Terminal'`
  - [ ] Outer div has `className="flex flex-col h-screen"`
  - [ ] GamePlaySection wrapped in `flex-none` container
  - [ ] Terminal in `flex-1 min-h-0` container
  - [ ] No `h-[80vh]` or `.terminal` class anywhere
  - [ ] All game command logic preserved verbatim (help, ping, sum, date, sudo, admin/idiot)
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: Game page uses shared Terminal with flex layout
    Tool: Bash
    Preconditions: Files saved
    Steps:
      1. Run: npx tsc --noEmit 2>&1
      2. Run: grep "@/components/ui/Terminal" src/app/game/page.tsx
      3. Run: grep "flex flex-col h-screen" src/app/game/page.tsx
      4. Run: grep "flex-1" src/app/game/page.tsx
      5. Run: grep "flex-none" src/app/game/page.tsx
    Expected Result:
      - Step 1: Exit code 0
      - Step 2: Import from shared Terminal found
      - Step 3: Outer flex container found
      - Step 4: Terminal flex-1 wrapper found
      - Step 5: GamePlaySection flex-none wrapper found
    Failure Indicators: tsc errors, old import path, missing flex layout
    Evidence: .sisyphus/evidence/task-5-game-layout.txt

  Scenario: Old classes removed, game logic preserved
    Tool: Bash
    Preconditions: Files saved
    Steps:
      1. Run: grep -c "h-\[80vh\]" src/app/game/page.tsx
      2. Run: grep -c "terminal" src/app/game/page.tsx (should be 0 for CSS class, but Terminal import is OK)
      3. Run: grep -c "_components/TerminalSection" src/app/game/page.tsx
      4. Run: grep -c "sudo" src/app/game/page.tsx
      5. Run: grep -c "setPermission" src/app/game/page.tsx
    Expected Result:
      - Step 1: 0 (old height class removed)
      - Step 3: 0 (old import removed)
      - Step 4: >= 1 (sudo logic preserved)
      - Step 5: >= 1 (permission state preserved)
    Failure Indicators: Old classes still present, or game logic was modified/removed
    Evidence: .sisyphus/evidence/task-5-game-logic-preserved.txt
  ```

  **Commit**: YES (groups with Tasks 4, 6)
  - Message: `refactor(terminal): migrate landing and game pages to shared Terminal`
  - Files: `src/app/game/page.tsx`
  - Pre-commit: `npx tsc --noEmit`


- [ ] 6. Delete old `TerminalSection.tsx`

  **What to do**:
  - Delete `src/app/game/_components/TerminalSection.tsx`
  - This file is fully replaced by `src/components/ui/Terminal/Terminal.tsx`
  - After Task 5 changes the game page import, this file has zero consumers

  **Must NOT do**:
  - Do NOT delete `GamePlaySection.tsx` — only TerminalSection.tsx
  - Do NOT delete the `_components/` directory (GamePlaySection still lives there)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file deletion
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - All: Trivial task

  **Parallelization**:
  - **Can Run In Parallel**: NO (must wait for Task 5)
  - **Parallel Group**: Wave 2 (after Task 5 completes)
  - **Blocks**: Task 7 (build verification)
  - **Blocked By**: Task 5 (game page must be updated first, otherwise build breaks)

  **References**:

  **Pattern References**:
  - `src/app/game/_components/TerminalSection.tsx` — The file to delete (281 lines)
  - `src/app/game/_components/GamePlaySection.tsx` — Must NOT be deleted (still needed)

  **WHY Each Reference Matters**:
  - `TerminalSection.tsx`: Executor needs to confirm this is the right file to delete
  - `GamePlaySection.tsx`: Executor needs to know the sibling file must be preserved

  **Acceptance Criteria**:
  - [ ] `src/app/game/_components/TerminalSection.tsx` does not exist
  - [ ] `src/app/game/_components/GamePlaySection.tsx` still exists
  - [ ] `npx tsc --noEmit` passes (no dangling imports)

  **QA Scenarios:**

  ```
  Scenario: Old terminal file deleted, game section preserved
    Tool: Bash
    Preconditions: Task 5 completed (game page uses shared Terminal)
    Steps:
      1. Run: test -f src/app/game/_components/TerminalSection.tsx && echo "EXISTS" || echo "DELETED"
      2. Run: test -f src/app/game/_components/GamePlaySection.tsx && echo "EXISTS" || echo "MISSING"
      3. Run: npx tsc --noEmit 2>&1
    Expected Result:
      - Step 1: "DELETED"
      - Step 2: "EXISTS"
      - Step 3: Exit code 0 (no broken imports)
    Failure Indicators: TerminalSection.tsx still exists, or GamePlaySection.tsx missing, or tsc errors
    Evidence: .sisyphus/evidence/task-6-file-deletion.txt
  ```

  **Commit**: YES (groups with Tasks 4, 5)
  - Message: `refactor(terminal): migrate landing and game pages to shared Terminal`
  - Files: deleted `src/app/game/_components/TerminalSection.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 7. Full build + lint verification

  **What to do**:
  - Run `npm run build` — must pass with zero errors
  - Run `npm run lint` — must pass with zero errors/warnings
  - If either fails, identify the error and fix it
  - Common issues to watch for:
    - Missing imports after file deletion (Task 6)
    - Unused imports in rewritten files
    - TypeScript strict mode issues with new TerminalProps
    - ESLint unused variable warnings

  **Must NOT do**:
  - Do NOT add `// eslint-disable` comments to silence warnings — fix the actual issue
  - Do NOT add `// @ts-ignore` or `as any` to fix type errors
  - Do NOT modify component behavior to fix build — only fix syntax/import/type issues

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Run commands, read errors, make targeted fixes
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - All: Build/lint verification is command-driven

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after all implementation tasks)
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Tasks 3, 4, 5, 6 (all files must be in final state)

  **References**:

  **Pattern References**:
  - `package.json` — Build and lint scripts (`npm run build`, `npm run lint`)
  - All files from Tasks 1-6 — Any file changed could cause build/lint errors

  **WHY Each Reference Matters**:
  - `package.json`: Executor needs to know exact commands to run
  - Changed files: If build fails, executor needs to trace error back to the source file

  **Acceptance Criteria**:
  - [ ] `npm run build` exits with code 0
  - [ ] `npm run lint` exits with code 0
  - [ ] No `// eslint-disable` added by this task
  - [ ] No `// @ts-ignore` or `as any` added by this task

  **QA Scenarios:**

  ```
  Scenario: Production build succeeds
    Tool: Bash
    Preconditions: All Tasks 1-6 completed
    Steps:
      1. Run: npm run build 2>&1
    Expected Result: Exit code 0, "Compiled successfully" or similar success message
    Failure Indicators: Non-zero exit code, TypeScript errors, module not found errors
    Evidence: .sisyphus/evidence/task-7-build.txt

  Scenario: Lint passes clean
    Tool: Bash
    Preconditions: All Tasks 1-6 completed
    Steps:
      1. Run: npm run lint 2>&1
    Expected Result: Exit code 0, no errors or warnings
    Failure Indicators: Non-zero exit code, ESLint errors/warnings
    Evidence: .sisyphus/evidence/task-7-lint.txt
  ```

  **Commit**: YES (only if fixes were needed)
  - Message: `fix(terminal): address build/lint issues`
  - Files: whatever was fixed
  - Pre-commit: `npm run build && npm run lint`

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build` + `npm run lint`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start dev server. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-page navigation (landing → game via `game` command). Test edge cases: empty commands, unknown commands, rapid input.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Commit 1** (after Task 1+2+3): `feat(terminal): create shared Terminal component with configurable commands` — src/components/ui/Terminal/Terminal.tsx, src/components/ui/Terminal/index.ts, src/lib/types.ts, src/app/globals.css
- **Commit 2** (after Task 4+5+6): `refactor(terminal): migrate landing and game pages to shared Terminal` — src/app/_components/TerminalOverlay.tsx, src/app/_components/Introduction.tsx, src/app/game/page.tsx, deleted src/app/game/_components/TerminalSection.tsx
- **Commit 3** (after Task 7 if fixes needed): `fix(terminal): address build/lint issues`

---

## Success Criteria

### Verification Commands
```bash
npm run build   # Expected: Build successful, zero errors
npm run lint    # Expected: Zero warnings/errors
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Landing terminal overlay works with new command set
- [ ] Game terminal fills remaining space below game canvas
- [ ] Game terminal has TerminalOverlay visual design
- [ ] sudo/password flow works on /game
- [ ] `game` command navigates to /game from landing
- [ ] `todo` command navigates to /todo from landing
- [ ] Shared Terminal component can be imported from `@/components/ui/Terminal`