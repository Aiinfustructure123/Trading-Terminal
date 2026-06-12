import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Core palette ──────────────────────────────────────────────────
        bg:      "#07080C",
        panel:   "#0E1117",
        ink:     "#E8ECF4",
        signal:  "#5CE1E6",
        danger:  "#FF4D5E",
        warn:    "#FFB020",
        profit:  "#3DDC97",
        // ── Border ────────────────────────────────────────────────────────
        border:  "#1C2230",
        // ── Semantic aliases expected by shadcn slots ──────────────────────
        background:   "#07080C",
        foreground:   "#E8ECF4",
        card:         { DEFAULT: "#0E1117", foreground: "#E8ECF4" },
        popover:      { DEFAULT: "#0E1117", foreground: "#E8ECF4" },
        primary:      { DEFAULT: "#5CE1E6", foreground: "#07080C" },
        secondary:    { DEFAULT: "#1C2230", foreground: "#E8ECF4" },
        muted:        { DEFAULT: "#1C2230", foreground: "#6B7488" },
        accent:       { DEFAULT: "#5CE1E6", foreground: "#07080C" },
        destructive:  { DEFAULT: "#FF4D5E", foreground: "#E8ECF4" },
        ring:         "#5CE1E6",
        input:        "#1C2230",
      },
      fontFamily: {
        sans:  ["Space Grotesk", "system-ui", "sans-serif"],
        mono:  ["JetBrains Mono", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.08em" }],
        xs:    ["11px", { lineHeight: "16px", letterSpacing: "0.05em" }],
        sm:    ["13px", { lineHeight: "20px" }],
        base:  ["14px", { lineHeight: "22px" }],
        md:    ["15px", { lineHeight: "24px" }],
        lg:    ["18px", { lineHeight: "28px" }],
        xl:    ["22px", { lineHeight: "32px" }],
        "2xl": ["28px", { lineHeight: "36px" }],
        "3xl": ["36px", { lineHeight: "44px" }],
        "4xl": ["48px", { lineHeight: "56px" }],
      },
      borderColor: {
        DEFAULT: "#1C2230",
      },
      borderRadius: {
        sm:   "4px",
        DEFAULT: "6px",
        md:   "8px",
        lg:   "12px",
        xl:   "16px",
        full: "9999px",
      },
      spacing: {
        "panel": "1px",
      },
      boxShadow: {
        "signal-glow":  "0 0 12px 2px rgba(92, 225, 230, 0.35)",
        "danger-glow":  "0 0 12px 2px rgba(255, 77, 94, 0.35)",
        "profit-glow":  "0 0 12px 2px rgba(61, 220, 151, 0.35)",
        "warn-glow":    "0 0 12px 2px rgba(255, 176, 32, 0.35)",
        "panel":        "inset 0 0 0 1px #1C2230",
      },
      keyframes: {
        "tick-flash": {
          "0%":   { color: "#5CE1E6" },
          "100%": { color: "inherit" },
        },
        "fade-slide-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-top": {
          "0%":   { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ticker-scroll": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.6" },
        },
        "skeleton": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "tick-flash":    "tick-flash 600ms ease-out",
        "fade-slide-in": "fade-slide-in 150ms ease-out",
        "slide-in-top":  "slide-in-top 150ms ease-out",
        "ticker-scroll": "ticker-scroll 40s linear infinite",
        "pulse-ring":    "pulse-ring 2s ease-in-out infinite",
        "skeleton":      "skeleton 1.5s ease-in-out infinite",
      },
      backgroundImage: {
        "skeleton-shimmer": "linear-gradient(90deg, #0E1117 25%, #1C2230 50%, #0E1117 75%)",
      },
    },
  },
  plugins: [],
};

export default config;
