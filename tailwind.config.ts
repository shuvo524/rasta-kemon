import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f7f1",
          100: "#dcefe0",
          200: "#b9dec2",
          300: "#8ec79d",
          400: "#5cab76",
          500: "#358d58",
          600: "#247144",
          700: "#1d5a37",
          800: "#17452d",
          900: "#14532d",
          950: "#0a2e18",
        },
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          500: "#334e68",
          700: "#243b53",
          800: "#1a2b3c",
          900: "#0f1f2e",
          950: "#0a1722",
        },
        ink: "#1c2420",
        slate2: "#64748b",
        cream: "#faf9f6",
      },
      fontFamily: {
        sans: ["var(--font-bangla)", "Inter", "system-ui", "sans-serif"],
        bangla: ["var(--font-bangla)", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,31,46,0.08), 0 8px 24px -12px rgba(15,31,46,0.18)",
        lift: "0 4px 12px rgba(15,31,46,0.10), 0 16px 32px -16px rgba(15,31,46,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
