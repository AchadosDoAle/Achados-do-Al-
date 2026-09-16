import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta escura do site público (Achado do Alê)
        bg: {
          DEFAULT: "#07111F",
          secondary: "#0D1B2D",
        },
        card: "#10243A",
        text: {
          DEFAULT: "#F8FAFC",
          muted: "#A8B5C5",
        },
        gold: {
          DEFAULT: "#F5B942",
          light: "#FFD66B",
          dark: "#B87912",
        },
        trust: "#2FBF8F",
        danger: "#FF6B6B",

        // Paleta clara usada só no painel administrativo (/admin, /login)
        brand: {
          DEFAULT: "#3D1E6D",
          light: "#5B3593",
        },
        accent: {
          DEFAULT: "#FF4F81",
          dark: "#D93368",
        },
        discount: "#FFC93C",
        cream: "#FFF9F2",
        ink: "#221333",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
