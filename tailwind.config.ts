import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        signal: "var(--signal)",
        danger: "var(--danger)",
        warn: "var(--warn)",
        profit: "var(--profit)",
        line: "var(--line)",
      },
      fontFamily: {
        ui: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        signal: "0 0 0 1px rgba(92, 225, 230, 0.32), 0 0 32px rgba(92, 225, 230, 0.12)",
        panel: "0 18px 80px rgba(0, 0, 0, 0.38)",
      },
      keyframes: {
        "fade-slide": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "cyan-flash": {
          "0%": { color: "var(--signal)", textShadow: "0 0 16px rgba(92, 225, 230, 0.55)" },
          "100%": { color: "inherit", textShadow: "none" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "feed-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-slide": "fade-slide 150ms ease-out both",
        "cyan-flash": "cyan-flash 680ms ease-out both",
        ticker: "ticker 38s linear infinite",
        "feed-in": "feed-in 180ms ease-out both",
      },
    },
  },
};

export default config;
