import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        mist: "rgb(var(--mist) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        sand: "rgb(var(--sand) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentSoft: "rgb(var(--accent-soft) / <alpha-value>)",
        olive: "rgb(var(--olive) / <alpha-value>)",
        sunrise: "rgb(var(--sunrise) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "\"Trebuchet MS\"", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(14, 41, 56, 0.12)",
        panel: "0 22px 70px rgba(16, 24, 40, 0.08)"
      },
      backgroundImage: {
        "editorial-grid":
          "linear-gradient(rgba(15, 61, 80, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 61, 80, 0.06) 1px, transparent 1px)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -18px, 0)" }
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          "50%": { transform: "translate3d(20px, -12px, 0) rotate(8deg)" }
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        drift: "drift 14s ease-in-out infinite",
        reveal: "reveal 700ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
