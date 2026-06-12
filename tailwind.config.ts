import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
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
        border: "#1C2230"
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-data)", "JetBrains Mono", "monospace"]
      },
      boxShadow: {
        signal: "0 0 0 1px rgba(92, 225, 230, 0.38), 0 0 24px rgba(92, 225, 230, 0.08)",
        panel: "0 18px 55px rgba(0, 0, 0, 0.28)"
      },
      keyframes: {
        "fade-slide": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "cyan-flash": {
          "0%": { color: "var(--ink)", textShadow: "none" },
          "35%": { color: "var(--signal)", textShadow: "0 0 14px rgba(92, 225, 230, 0.6)" },
          "100%": { color: "var(--ink)", textShadow: "none" }
        },
        "feed-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        "fade-slide": "fade-slide 150ms ease-out both",
        "cyan-flash": "cyan-flash 650ms ease-out",
        "feed-in": "feed-in 180ms ease-out both",
        ticker: "ticker 34s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
