import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef1",
          200: "#d9d9df",
          300: "#b8b8c2",
          400: "#8f8f9c",
          500: "#66667a",
          600: "#4c4c60",
          700: "#37374a",
          800: "#23232f",
          900: "#131320",
        },
        accent: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#0a84ff",
          600: "#0071e3",
          700: "#005bb8",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        cardHover:
          "0 4px 12px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.04)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
    },
  },
  plugins: [],
};

export default config;
