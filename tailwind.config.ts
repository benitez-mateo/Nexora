import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        muted: "var(--muted)",
        "muted-2": "var(--muted-2)",
        hairline: "var(--hairline)",
        "hairline-2": "var(--hairline-2)",
        cobalt: "var(--cobalt)",
        "cobalt-soft": "var(--cobalt-soft)",
        "cobalt-ink": "var(--cobalt-ink)",
        pink: "var(--pink)",
        "pink-soft": "var(--pink-soft)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Didot", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "design-sm": "var(--shadow-sm)",
        "design-md": "var(--shadow-md)",
        "design-lg": "var(--shadow-lg)",
        active: "var(--shadow-active)",
        "active-pink": "var(--shadow-active-pink)",
        cobalt: "0 6px 18px rgba(27,61,255,0.28)",
        "cobalt-lg": "0 10px 24px rgba(27,61,255,0.36)",
      },
      borderRadius: {
        design: "14px",
        "design-lg": "22px",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        pulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(27,61,255,0.45)" },
          "70%": { boxShadow: "0 0 0 8px rgba(27,61,255,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(27,61,255,0)" },
        },
        blink: {
          "0%,100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        dash: {
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        rise: "rise 600ms cubic-bezier(.2,.8,.2,1) both",
        "rise-1": "rise 600ms cubic-bezier(.2,.8,.2,1) 60ms both",
        "rise-2": "rise 600ms cubic-bezier(.2,.8,.2,1) 120ms both",
        "rise-3": "rise 600ms cubic-bezier(.2,.8,.2,1) 180ms both",
        pulse: "pulse 1.6s infinite cubic-bezier(.2,.8,.2,1)",
        blink: "blink 1.4s infinite",
        dash: "dash 600ms cubic-bezier(.2,.8,.2,1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
