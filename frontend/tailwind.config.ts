import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#13343b",
        sky: "#d8f1f2",
        mint: "#dff7e2",
        coral: "#ff8a66",
        cream: "#fffaf2",
      },
      boxShadow: {
        soft: "0 20px 45px rgba(19, 52, 59, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
