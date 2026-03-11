# Easter Eggs Guide — Ted-yee Beer House

> A comprehensive guide to all hidden features, interactions, and developer easter eggs.
> **Spoiler warning**: This document reveals all secrets. Proceed at your own risk.

---

## Visual / Interactive Easter Eggs

### 1. Neon Sign (Title: "Ted-yee Beer House")

| Clicks | Effect |
|--------|--------|
| 1–2 | Subtle flicker animation |
| 3–4 | Heavy flicker — random letters turn off/on |
| 5 | Letters turn off one by one, leaving only **"Ted Beer"** |
| 6 | Electric spark effect → full recovery → hidden subtitle appears: *"Est. 2026 — Powered by Caffeine & Soju"* |

After the full cycle, the sign resets and can be triggered again.

### 2. Ted-yee Backronym (Hover Easter Egg)

**Trigger**: Hover over the "Ted-yee" part of the neon sign for **3+ seconds**.

**Result**: The letters separate and reveal the hidden meaning:

```
T ech
E nthusiast
D eveloper
—
Y our
E veryday
E ngineer
```

Each line appears with a typing animation.

### 3. Beer Glass

| Clicks | Effect |
|--------|--------|
| 1–2 | Glass wobbles side to side |
| 3–4 | Beer slowly fills up (CSS clip-path animation) |
| 5 | Foam overflows the glass |
| 6 | **Drunk effect** — entire page tilts 0.5° and blurs for 3 seconds |
| 7+ | Glass tips over — amber gradient "spill" overlay cascades down the screen, then resets |

### 4. Coaster (Under the Beer Glass)

| Clicks | Effect |
|--------|--------|
| 1–3 | Spins faster with each click |
| 4 | Flies off screen like a frisbee |
| — | Hidden message revealed underneath (random): `"WiFi Password: undefined"`, `"404: Coaster Not Found"`, `"// TODO: add coaster"`, `"git stash pop coaster"`, `"NullCoasterException"` |
| — | Returns like a boomerang after 3 seconds |

### 5. House Rules Sign

| Clicks | Effect |
|--------|--------|
| 1–2 | Sign tilts slightly |
| 3–4 | One nail comes loose, sign hangs crooked |
| 5 | Sign falls with bounce physics |
| — | Flips to reveal **"The Real Rules"** on the back, including: *"Real Rule #1: The password is always 'password'"* (meta-hint for the game page password) |
| — | Resets after 7 seconds |

### 6. Konami Code — VIP Mode

**Trigger**: `↑ ↑ ↓ ↓ ← → ← → B A`

**Result**: Opens the **VIP Lounge** menu — a golden-themed cocktail menu where tech stacks are presented as drinks:

- **The React Martini** — *"Shaken, not server-rendered."*
- **Python on the Rocks** — *"Aged in a venv barrel."*
- **The Docker Compose** — *"Takes 10 minutes to build, but runs the same everywhere."*
- **Git Brandy** — *"Smooth until you try to merge two of them."*
- **Kubernetes Kolada** — *"Nobody knows what's inside. Requires 47 YAML files to order."*
- **The Soju Shot** — *"Makes you mass-create GitHub repos at 3am."*

---

## Ambient / Passive Features

### 7. Weather-Reactive Background

Uses visitor's IP geolocation (ip-api.com) + Open-Meteo API to determine local time and weather.

| Condition | Visual Effect |
|-----------|---------------|
| Morning + Clear | Warm amber/golden orbs, sunlit window glow |
| Afternoon + Clear | Orange-pink sunset gradients |
| Night + Clear | Neon sign glows brighter, star particles twinkle |
| Rain (any time) | Rain droplets fall across the screen, warm indoor glow |
| Snow (any time) | Snowflakes drift down, frost edges, cozy warm contrast |
| Cloudy | Muted orbs, overcast ambiance |

### 8. Weather-Aware Bartender

The bartender greeting changes based on weather:

- Rain: *"비 오는 오후엔 여기가 제일이죠. 따뜻한 코드 한 잔 하실래요?"*
- Snow: *"밖에 눈 오네요. 여기서 핫초코 마시면서 코딩하세요."*
- Night: *"야근이세요? 여기 커피 무한리필입니다."*
- Clear daytime: *"날씨 좋은데 코딩하러 오셨네요. 존경합니다. 🫡"*

### 9. Bar Tab Counter

Tracks how long you've been on the page:

| Time | Message |
|------|---------|
| 0–30s | "Just walked in. 🚶" |
| 30s–2m | "Checking out the menu... 👀" |
| 2–5m | "1 beer down. Getting comfortable. 🍺" |
| 5–10m | "The bartender knows your name now. 🤝" |
| 10–30m | "You live here now. Congrats. 🏠" |
| 30m+ | "Tab's getting expensive. Should we call you a cab? 🚕" |

### 10. Hidden Messages

- **HTML source comments**: `<!-- 여기까지 찾아온 당신, 진정한 개발자군요. 커피 한잔 사드릴게요: ☕ -->`
- **Browser console**: ASCII art beer mug + recruitment message on page load

---

## Terminal Easter Eggs

The terminal is opened via the floating blue button (bottom-right).

### Bar Commands (listed in `help`)

| Command | Response |
|---------|----------|
| `order beer` | Pours a beer (responses escalate with repeated orders) |
| `order soju` | Serves soju (3x triggers the **drunk mode** easter egg) |
| `order coffee` | Artisanal pour-over... just kidding, it's instant |
| `menu` | Tech stack displayed as a bar menu with beer pairings |
| `tab` | Shows session time + estimated drinks + fake tab total |
| `tip` | Random dev tip (mix of useful and absurd) |
| `jukebox` | Various music jokes (including a rick-roll) |

### Developer Easter Eggs — Tier 1 (Instinctive)

These are commands any developer would naturally try:

| Command | Response |
|---------|----------|
| `sudo rm -rf /` | Fake deletion sequence of bar files, then "Just kidding. But your tab just doubled." |
| `vim` / `vi` / `nvim` | **Traps you in vim mode.** All input shows `-- INSERT --`. Must type `:q!` or `:wq` to escape. Congratulates you on being "one of the 3% who escape vim on the first try." |
| `git blame` | Shows `git blame src/life/choices.ts` with humorous life decisions by Teddy |
| `neofetch` | ASCII beer art + system info parody (Coffee: 142%, Bugs: 0%*) |
| `cat` | ASCII cat art. Supports subpaths: `cat /menu`, `cat /rules`, `cat /wifi` (Password: undefined) |
| `git push --force` | Warning about overwriting 3 months of work. "Your tech lead is typing..." |
| `git commit -m "fix"` | Commits but warns: "Your commit message is a crime against humanity." |

### Developer Easter Eggs — Tier 2 (Habitual)

| Command | Response |
|---------|----------|
| `npm install` | Fake install with deprecation warnings for `sleep@1.0.0` and `weekend@2.0.0` |
| `npm audit fix` | "fixed 0 of 3 vulnerabilities... try `--force` to break even more things" |
| `brew install beer` | Homebrew-style output that pours a beer. "Do not operate kubectl after consumption." |
| `docker run` | Shows `productivity:latest` as Exited, `procrastination:lts` as Up 47 hours |
| `python` / `python3` | **Enters fake Python REPL mode.** Supports: `import this` (Zen of Teddy), `import antigravity` (gravity keeps beer in glass), `print()`, `exit()` |
| `ssh root@production` | "WARNING: DEPLOYING ON FRIDAY NIGHT. Connection refused. The bartender has revoked your production access." |
| `curl localhost` | Returns JSON: `{"status":"open","beer":"cold","bugs":"0","lies":"1"}` |

### Developer Easter Eggs — Tier 3 (Deep Cuts)

| Command | Response |
|---------|----------|
| `sl` | ASCII steam locomotive scrolls across the terminal (the classic `ls` typo joke) |
| `traceroute teddy` | Life journey as network hops: childhood → first-hello-world → cs-degree → startup → "that year we don't talk about" → ted-yee-beer-house |
| `man teddy` | Full UNIX man page for Teddy. Options include `--sleep (deprecated)` |
| `matrix` | Matrix rain effect with Japanese characters, followed by "Wake up, developer..." |
| `order soju` ×3 | After 3 sojus: room spins, input gets garbled, bartender cuts you off. "Stay hydrated, developer." |
| `top` / `htop` | Process list showing `sleep` at PID 69 with 0% CPU (nice try) |
| `ping google.com` | Returns time=0.69ms (nice) |
| `uptime` | Shows bar session time with load average: ☕☕☕ |
| `ls` | Lists bar directories: `bar/ fridge/ jukebox/ terminal/ memories/` |
| `pwd` | `/home/teddy/ted-yee-beer-house` |

### The Zen of Teddy (via `python` → `import this`)

```
Beer is better than wine (in this house).
Explicit is better than implicit, except for easter eggs.
Simple is better than complex, but complex is more fun.
Errors should never pass silently, unless it's Friday.
In the face of ambiguity, order another round.
There should be one obvious way to do it — but hide 12 others.
Now is better than never, but after this beer is often better than now.
If the implementation is hard to explain, buy the reviewer a drink.
```

---

## Navigation

The terminal also serves as a navigation tool:

| Command | Destination |
|---------|-------------|
| `game` | /game (Kaboom.js pixel game) |
| `todo` | /todo (Developer memo app) |
| `portfolio` | /portfolio (Original portfolio page) |
| `articles` | /articles (Blog) |
| `prank` | /prank (Laggy cursor prank page) |

---

## Technical Notes

- **No new dependencies** — all features built with existing stack (React 19, Framer Motion, Tailwind v4, Lucide)
- **Weather API**: ip-api.com (geolocation) + Open-Meteo (weather data) — both free, no API keys required
- **Terminal modes**: vim and python modes intercept input via the Terminal component's command handler state machine
- **All easter eggs reset** after their animation cycle — they can be triggered repeatedly
