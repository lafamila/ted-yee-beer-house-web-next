# ted-yee-beer-house-web-next

Next.js 16 frontend with React 19, Tailwind CSS v4, React Compiler, and Framer Motion.

## STRUCTURE

```
src/
├── app/
│   ├── _components/          # Landing page: Introduction, TerminalOverlay, LocationMap
│   ├── game/
│   │   └── _components/      # Kaboom.js game + terminal (password-gated admin mode)
│   ├── todo/
│   │   └── _components/      # ProjectSection, MemoListSection, MemoSection (531 lines)
│   ├── layout.tsx            # Root layout: Space Grotesk font, dark theme, AppProvider
│   └── page.tsx              # Renders Introduction (portfolio landing)
├── components/
│   ├── ui/                   # Button, Modal, Input, Icon, Checkbox
│   ├── editor/               # MonacoCodeEditor, CheckboxItem
│   └── layout/               # Header, Footer, BackgroundEffect (Header/Footer currently commented out)
├── contexts/
│   └── AppContext.tsx         # Single context for all todo app state + actions
├── lib/
│   ├── api.ts                # fetch-based API client (uses API_BASE_URL)
│   ├── types.ts              # All interfaces: Project, Memo, Terminal, ContentBlock, AppState
│   ├── constants.ts          # API_BASE_URL, SORT_OPTIONS, AllIcons, GAME_TILE
│   └── utils.ts              # cn(), formatDate(), parseContent(), toggleCheckbox(), tokenizeCommandLine()
└── assets/icons/             # 13 SVG icons loaded via @svgr/webpack
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| New page | `src/app/{route}/page.tsx` | App Router. Route-specific components in `_components/` |
| New UI component | `src/components/ui/` | Named exports, `cn()` for class merging |
| API call | `src/lib/api.ts` | All fetch calls. Returns typed promises |
| Types | `src/lib/types.ts` | Must match NestJS interfaces manually |
| App state | `src/contexts/AppContext.tsx` | `useApp()` hook. Single useState with `TodoAppStateInterface` |
| Game logic | `src/app/game/_components/` | Kaboom.js (dynamic import, SSR disabled) |
| Icons | `src/components/ui/Icon.tsx` + `src/assets/icons/` | SVG as React components via @svgr |

## CONVENTIONS

- **`_components/` pattern** — route-specific components live in `src/app/{route}/_components/`
- **Named exports** for shared components (`export function Button`), **default exports** for pages/route components
- **`'use client'`** directive on interactive pages (`todo/page.tsx`, `game/page.tsx`, `AppContext.tsx`)
- **`cn()` utility** for conditional class merging (wraps `clsx`)
- **Interface suffix**: `ProjectInterface`, `MemoInterface`, `TodoAppContextTypeInterface`
- **Custom content syntax**: `-- ` for unchecked checkbox, `--v ` for checked, `[@title](memo://id)` for memo links
- **Korean UI strings** in error messages and sort option labels
- **`@/*` path alias** maps to `./src/*`

## ANTI-PATTERNS

- `API_BASE_URL` defaults to `:8000` (FastAPI direct) — bypasses NestJS BFF in dev
- One `eslint-disable @typescript-eslint/no-explicit-any` in `types.ts` (ReadRequestInterface)
- Header and Footer components exist but are **commented out** in root layout
- `MemoSection.tsx` is 531 lines — complexity hotspot, likely needs decomposition
- URL query param handling in AppContext uses `setTimeout(100ms)` race condition workaround

## TECH STACK

| Dep | Version | Purpose |
|-----|---------|---------|
| next | 16.1.6 | Framework (App Router, Turbopack) |
| react | 19.2.3 | UI library + React Compiler enabled |
| tailwindcss | v4 | Styling (via @tailwindcss/postcss) |
| framer-motion | 12.34.0 | Animations (landing page) |
| kaboom | 3000.1.17 | Game engine (game page) |
| @monaco-editor/react | 4.7.0 | Code editor (memo editing) |
| lucide-react | 0.563.0 | Icon library (landing page) |
| react-markdown | 10.1.0 | Markdown rendering |
| @svgr/webpack | 8.1.0 | SVG → React components (via Turbopack rules) |