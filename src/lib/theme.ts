/**
 * Palette constants for JS consumers (charts, canvas) that cannot read CSS
 * variables. Keep in sync with src/app/globals.css.
 */
export const COLORS = {
  bg: "#07080c",
  panel: "#0e1117",
  panel2: "#131826",
  edge: "#1c2230",
  edgeBright: "#2b3349",
  ink: "#e8ecf4",
  muted: "#6b7488",
  signal: "#5ce1e6",
  danger: "#ff4d5e",
  warn: "#ffb020",
  profit: "#3ddc97",
} as const;
