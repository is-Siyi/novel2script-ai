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
        ink: "#172033",
        muted: "#667085",
        paper: "#f7f4ef",
        line: "#d8d2c8",
        accent: "#0f766e",
        berry: "#9f1239",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(23, 32, 51, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
