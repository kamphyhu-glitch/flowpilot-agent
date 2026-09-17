import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17181b",
        canvas: "#f6f7f9",
        violet: "#6658e8",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(16, 24, 40, 0.04), 0 10px 30px rgba(16, 24, 40, 0.04)",
      },
    },
  },
  plugins: [],
} satisfies Config;
