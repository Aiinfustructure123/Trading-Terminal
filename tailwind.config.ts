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
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        panel: "0 8px 30px rgba(5, 8, 14, 0.45)",
        glow: "0 0 0 1px rgba(92, 225, 230, 0.45), 0 0 28px rgba(92, 225, 230, 0.2)",
      },
      keyframes: {
        "flash-update": {
          "0%": { backgroundColor: "rgba(92, 225, 230, 0.28)" },
          "100%": { backgroundColor: "transparent" },
        },
        "slide-in-top": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "flash-update": "flash-update 350ms ease-out",
        "slide-in-top": "slide-in-top 180ms ease-out",
        ticker: "ticker 28s linear infinite",
      },
    },
  },
};

export default config;
