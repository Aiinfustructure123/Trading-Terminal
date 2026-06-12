import type { Config } from "tailwindcss";

/**
 * ALPHA TERMINAL design token system.
 *
 * Colors are defined as space-separated RGB channels in `globals.css` (:root)
 * and consumed here via `rgb(var(--token) / <alpha-value>)` so every token
 * supports Tailwind opacity modifiers (e.g. `bg-signal/20`) and can be
 * re-themed from a single place.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        bg: "rgb(var(--bg) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        "panel-2": "rgb(var(--panel-2) / <alpha-value>)",
        edge: "rgb(var(--edge) / <alpha-value>)",
        // Text
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        // Signal colors (semantic only — never decorative)
        signal: "rgb(var(--signal) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        warn: "rgb(var(--warn) / <alpha-value>)",
        profit: "rgb(var(--profit) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Strict type scale
        eyebrow: ["11px", { lineHeight: "14px", letterSpacing: "0.08em" }],
        micro: ["10px", { lineHeight: "13px" }],
        data: ["13px", { lineHeight: "18px" }],
        "data-lg": ["15px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "20px" }],
        metric: ["22px", { lineHeight: "26px", letterSpacing: "-0.01em" }],
        "metric-lg": ["34px", { lineHeight: "38px", letterSpacing: "-0.02em" }],
        display: ["28px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
      },
      borderColor: {
        DEFAULT: "rgb(var(--edge) / <alpha-value>)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgb(var(--edge) / 0.6), 0 8px 24px -12px rgb(0 0 0 / 0.6)",
        "signal-glow": "0 0 0 1px rgb(var(--signal) / 0.5), 0 0 20px -2px rgb(var(--signal) / 0.35)",
        "danger-glow": "0 0 0 1px rgb(var(--danger) / 0.5), 0 0 16px -4px rgb(var(--danger) / 0.3)",
        overlay: "0 24px 64px -16px rgb(0 0 0 / 0.7)",
      },
      keyframes: {
        "fade-slide-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "row-slide-in": {
          "0%": { opacity: "0", transform: "translateY(-8px)", backgroundColor: "rgb(var(--signal) / 0.08)" },
          "100%": { opacity: "1", transform: "translateY(0)", backgroundColor: "transparent" },
        },
        "tick-flash": {
          "0%": { color: "rgb(var(--signal))" },
          "100%": { color: "rgb(var(--ink))" },
        },
        "tick-flash-up": {
          "0%": { backgroundColor: "rgb(var(--profit) / 0.18)" },
          "100%": { backgroundColor: "transparent" },
        },
        "tick-flash-down": {
          "0%": { backgroundColor: "rgb(var(--danger) / 0.18)" },
          "100%": { backgroundColor: "transparent" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-slide-in": "fade-slide-in 150ms ease-out both",
        "row-slide-in": "row-slide-in 350ms ease-out both",
        "tick-flash": "tick-flash 600ms ease-out",
        "tick-flash-up": "tick-flash-up 600ms ease-out",
        "tick-flash-down": "tick-flash-down 600ms ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
      backdropBlur: {
        terminal: "16px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
