import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
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
        panel: "0 0 0 1px var(--border), 0 12px 30px rgba(0, 0, 0, 0.35)",
        glow: "0 0 0 1px rgba(92, 225, 230, 0.25), 0 0 24px rgba(92, 225, 230, 0.18)",
      },
    },
  },
};

export default config;
