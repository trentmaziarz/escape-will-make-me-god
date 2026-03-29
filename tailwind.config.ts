import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
          ghost: "var(--text-ghost)",
        },
        accent: {
          red: "var(--accent-red)",
          "red-hover": "var(--accent-red-hover)",
          "red-dim": "var(--accent-red-dim)",
        },
        difficulty: {
          auto: "var(--difficulty-auto)",
          easy: "var(--difficulty-easy)",
          medium: "var(--difficulty-medium)",
          hard: "var(--difficulty-hard)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          hover: "var(--border-hover)",
          accent: "var(--border-accent)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
        full: "0",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        dissolve: {
          "0%": { opacity: "1", filter: "blur(0)", transform: "scale(1)" },
          "50%": { opacity: "0.5", filter: "blur(2px)", transform: "scale(0.98)" },
          "100%": { opacity: "0", filter: "blur(8px)", transform: "scale(0.95) translateY(-10px)" },
        },
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(196,30,30,0.3)" },
          "50%": { boxShadow: "0 0 60px rgba(196,30,30,0.6), 0 0 120px rgba(196,30,30,0.2)" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 1px)" },
          "40%": { transform: "translate(2px, -1px)" },
          "60%": { transform: "translate(-1px, -2px)" },
          "80%": { transform: "translate(1px, 2px)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.8s ease-out forwards",
        dissolve: "dissolve 0.8s ease-out forwards",
        "pulse-red": "pulseRed 2s infinite",
        glitch: "glitch 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
