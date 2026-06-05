import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#667085",
        paper: "#f6f7fb",
        line: "#d9dee8",
        accent: "#0f766e",
        berry: "#be123c",
        navy: "#182235",
        gold: "#b7791f",
        violet: "#5b5fc7",
      },
      boxShadow: {
        panel: "0 16px 45px rgba(24, 34, 53, 0.08)",
        lift: "0 22px 60px rgba(24, 34, 53, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
