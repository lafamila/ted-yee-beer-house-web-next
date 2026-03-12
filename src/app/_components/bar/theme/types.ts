// ─── Theme Type Definitions ───
// Defines the shape of Bar vs Cafe themes

export type ThemeType = "bar" | "cafe";

// ─── Brand ───
export interface BrandConfig {
  /** Main neon sign text, e.g. "Ted-yee Beer House" / "Ted-yee Coffee House" */
  fullText: string;
  /** Subtitle that appears after neon sign interaction */
  subtitleReveal: string;
  /** Terminal prompt, e.g. "guest@ted-yee-beer-house" */
  terminalPrompt: string;
  /** Terminal welcome messages */
  welcomeMessages: string[];
  /** Console easter egg title */
  consoleTitle: string;
  /** Console easter egg ASCII art lines */
  consoleAsciiLines: string[];
  /** Coaster line 1 (top) */
  coasterLine1: string;
  /** Coaster line 2 (bottom) */
  coasterLine2: string;
}

// ─── Drinks & Orders ───
export interface DrinkConfig {
  /** Available drink items for the "order" command */
  orderItems: string[];
  /** Order prompt text, e.g. "Try: order beer, order soju ..." */
  orderPrompt: string;
  /** Response messages per drink, keyed by drink name, each an array of escalating messages */
  orderResponses: Record<string, string[]>;
  /** Drink that triggers drunk/caffeine effect, with threshold */
  effectDrinks: { name: string; threshold: number }[];
  /** Effect description when over threshold (for drunk/caffeinated) */
  effectType: "drunk" | "caffeinated";
  /** What to say when effect kicks in hard (e.g. soju 3x easter egg) */
  heavyEffectMessages: string[];
  /** Message when "bartender cuts you off" in drunk/caffeine mode */
  cutoffMessage: string;
}

// ─── Menu ───
export interface MenuItem {
  name: string;
  desc: string;
  strength: string;
  price: string;
}

export interface MenuConfig {
  /** ASCII art tech stack menu */
  techMenu: string[];
  /** VIP menu title */
  vipTitle: string;
  /** VIP subtitle */
  vipSubtitle: string;
  /** VIP crown emoji or equivalent */
  vipEmoji: string;
  /** VIP menu items (cocktails or specialty coffees) */
  vipItems: MenuItem[];
}

// ─── Rules ───
export interface RulesConfig {
  /** Heading emoji + text for front rules */
  frontHeading: string;
  /** Front-facing house rules */
  frontRules: string[];
  /** Heading for back (hidden) rules */
  backHeading: string;
  /** Secret rules revealed on interaction */
  backRules: string[];
}

// ─── Bar Tab ───
export interface TabMessage {
  threshold: number;
  message: string;
  drinks: number;
}

export interface BarTabConfig {
  /** Tab progress messages */
  tabMessages: TabMessage[];
  /** Bartender/Barista greeting messages keyed by weather_time */
  greetingMessages: Record<string, string>;
  /** Staff emoji, e.g. 🧑‍🍳 or ☕ */
  staffEmoji: string;
  /** Staff role label, e.g. "Bartender's Recommendation" */
  staffRole: string;
  /** Tab label, e.g. "Bar Tab:" */
  tabLabel: string;
  /** Drink emoji for tab progress, e.g. "🍺" or "☕" */
  drinkEmoji: string;
}

// ─── Terminal Content ───
export interface TerminalConfig {
  /** Neofetch output lines */
  neofetchOutput: string[];
  /** man teddy output */
  manOutput: string[];
  /** brew install output */
  brewInstallOutput: string[];
  /** traceroute output */
  tracerouteOutput: string[];
  /** SSH output */
  sshOutput: string[];
  /** Zen of Teddy */
  zenOutput: string[];
  /** cat /wifi output */
  catWifi: string[];
  /** cat /rules output */
  catRules: string[];
  /** npm install output */
  npmInstallOutput: string[];
  /** Docker run output */
  dockerRunOutput: string[];
  /** Jukebox responses */
  jukeboxResponses: string[];
  /** Dev tips */
  devTips: string[];
  /** git blame output */
  gitBlameOutput: string[];
  /** "cat" with no args (ASCII art) */
  catAscii: string[];
  /** Section labels for sudo rm -rf display */
  sectionLabels: Record<string, string>;
  /** Help text lines */
  helpText: string[];
}

// ─── Colors ───
export interface ColorConfig {
  /** Primary accent color, e.g. "amber" for bar, "brown" for cafe */
  primary: string;
  /** Tailwind classes for coaster gradient */
  coasterGradient: string;
  /** Tailwind classes for coaster border */
  coasterBorder: string;
  /** Tailwind classes for coaster text (line 1) */
  coasterTextColor1: string;
  /** Tailwind classes for coaster text (line 2) */
  coasterTextColor2: string;
  /** HouseRules sign bg */
  rulesBg: string;
  /** HouseRules sign border */
  rulesBorder: string;
  /** HouseRules heading text color */
  rulesHeadingColor: string;
  /** VIP menu gradient bg */
  vipBg: string;
  /** VIP border */
  vipBorder: string;
  /** VIP title color */
  vipTitleColor: string;
  /** VIP item name color */
  vipItemColor: string;
}

// ─── Full Theme ───
export interface AppTheme {
  type: ThemeType;
  brand: BrandConfig;
  drinks: DrinkConfig;
  menu: MenuConfig;
  rules: RulesConfig;
  barTab: BarTabConfig;
  terminal: TerminalConfig;
  colors: ColorConfig;
}
