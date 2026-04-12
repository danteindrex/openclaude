import type { Config } from "tailwindcss";
import { designTokens } from "./src/lib/design-tokens";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-bright": "var(--color-surface-bright)",
        "surface-dim": "var(--color-surface-dim)",
        "surface-container": "var(--color-surface-container)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-high": "var(--color-surface-container-high)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        primary: "var(--color-primary)",
        "primary-container": "var(--color-primary-container)",
        secondary: "var(--color-secondary)",
        "secondary-container": "var(--color-secondary-container)",
        tertiary: "var(--color-tertiary)",
        "tertiary-container": "var(--color-tertiary-container)",
        error: "var(--color-error)",
        "error-container": "var(--color-error-container)",
        outline: "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",
        "on-background": "var(--color-on-background)",
        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "on-primary": "var(--color-on-primary)",
        "on-primary-container": "var(--color-on-primary-container)",
        "on-secondary": "var(--color-on-secondary)",
        "on-secondary-container": "var(--color-on-secondary-container)",
      },
      fontFamily: {
        headline: [designTokens.fonts.headline],
        body: [designTokens.fonts.body],
        label: [designTokens.fonts.label],
      },
      borderRadius: {
        tactile: "1.5rem",
        tactileLg: "2rem",
      },
      boxShadow: {
        "neumorphic-raised": "var(--shadow-neumorphic-raised)",
        "neumorphic-inset": "var(--shadow-neumorphic-inset)",
        "neumorphic-soft": "var(--shadow-neumorphic-soft)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
      },
    },
  },
};

export default config;
