/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8ed",
          100: "#ffedcf",
          200: "#ffd99b",
          300: "#ffc368",
          400: "#ffad3a",
          500: "#f58c16",
          600: "#db6b0d",
          700: "#b54d0d",
          800: "#933d13",
          900: "#783413",
        },
      },
      boxShadow: {
        soft: "0 18px 40px -20px rgba(15, 23, 42, 0.35)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.12) 1px, transparent 0)",
      },
      fontFamily: {
        sans: ["'Manrope'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
