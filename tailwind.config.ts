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
      },
    },
  },
  plugins: [],
};

export default config;
