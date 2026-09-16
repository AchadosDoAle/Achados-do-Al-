import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidade visual do Achado do Alê
        brand: {
          DEFAULT: "#3D1E6D", // violeta profundo — confiança, marca
          light: "#5B3593",
        },
        accent: {
          DEFAULT: "#FF4F81", // rosa vibrante — chamada para ação
          dark: "#D93368",
        },
        discount: "#FFC93C", // amarelo — cupom, desconto, urgência
        trust: "#1F9D82", // verde-teal — frete grátis, confirmação
        cream: "#FFF9F2", // fundo geral, quente e claro
        ink: "#221333", // texto principal (violeta quase-preto, não preto puro)
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
