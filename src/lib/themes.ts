import type { ThemeKey } from "../types";

export interface ThemeDef {
  key: ThemeKey;
  name: string;
  short: string;
  emoji: string;
  vars: Record<string, string>;
}

export const THEMES: Record<ThemeKey, ThemeDef> = {
  galaxie: {
    key: "galaxie",
    name: "Galaxie",
    short: "Sterne und Nebel",
    emoji: "✦",
    vars: {
      "--bg-deep": "#0c0a1f",
      "--bg-soft": "#1a1538",
      "--bg-card": "#221c46",
      "--bg-card-soft": "#2a2358",
      "--star": "#fff5e1",
      "--star-warm": "#ffe9c4",
      "--nebula-a": "rgba(190, 150, 255, 0.18)",
      "--nebula-b": "rgba(255, 180, 220, 0.10)",
      "--nebula-c": "rgba(120, 170, 255, 0.10)",
      "--accent": "#d8c4ff",
      "--accent-warm": "#ffd6a8",
      "--accent-soft": "rgba(216, 196, 255, 0.18)",
    },
  },
  korallenriff: {
    key: "korallenriff",
    name: "Korallenriff",
    short: "Sterne unter Wasser",
    emoji: "✦",
    vars: {
      "--bg-deep": "#062029",
      "--bg-soft": "#0d3a4a",
      "--bg-card": "#15495b",
      "--bg-card-soft": "#1d5a6f",
      "--star": "#fff0e0",
      "--star-warm": "#ffd0a0",
      "--nebula-a": "rgba(122, 210, 200, 0.18)",
      "--nebula-b": "rgba(255, 160, 130, 0.12)",
      "--nebula-c": "rgba(120, 220, 240, 0.10)",
      "--accent": "#7ad2c8",
      "--accent-warm": "#ffb088",
      "--accent-soft": "rgba(122, 210, 200, 0.20)",
    },
  },
  drachenwald: {
    key: "drachenwald",
    name: "Drachenwald",
    short: "Funken zwischen Bäumen",
    emoji: "✦",
    vars: {
      "--bg-deep": "#0a1a14",
      "--bg-soft": "#163025",
      "--bg-card": "#1f4032",
      "--bg-card-soft": "#26503e",
      "--star": "#fff2c0",
      "--star-warm": "#ffd060",
      "--nebula-a": "rgba(180, 220, 130, 0.15)",
      "--nebula-b": "rgba(255, 200, 100, 0.10)",
      "--nebula-c": "rgba(110, 180, 130, 0.10)",
      "--accent": "#c5d885",
      "--accent-warm": "#ffd060",
      "--accent-soft": "rgba(197, 216, 133, 0.20)",
    },
  },
  wolkenreich: {
    key: "wolkenreich",
    name: "Wolkenreich",
    short: "Lichter über den Wolken",
    emoji: "✦",
    vars: {
      "--bg-deep": "#1a1230",
      "--bg-soft": "#2c2050",
      "--bg-card": "#3a2c66",
      "--bg-card-soft": "#48377a",
      "--star": "#fff8ff",
      "--star-warm": "#ffe5ff",
      "--nebula-a": "rgba(255, 200, 240, 0.18)",
      "--nebula-b": "rgba(200, 220, 255, 0.12)",
      "--nebula-c": "rgba(255, 180, 200, 0.10)",
      "--accent": "#ffc8e8",
      "--accent-warm": "#ffe8c8",
      "--accent-soft": "rgba(255, 200, 232, 0.22)",
    },
  },
};

export const THEME_ORDER: ThemeKey[] = ["galaxie", "korallenriff", "drachenwald", "wolkenreich"];

export function applyTheme(key: ThemeKey): void {
  const theme = THEMES[key];
  const root = document.documentElement;
  for (const [varName, value] of Object.entries(theme.vars)) {
    root.style.setProperty(varName, value);
  }
}
