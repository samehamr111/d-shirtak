/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0d",
        paper: "#f7f5f2",
        brand: {
          50: "#e6fff5",
          100: "#b8ffe4",
          200: "#7dffc9",
          300: "#3bf6a9",
          400: "#0de490",
          500: "#00c97a",
          600: "#00a566",
          700: "#028153",
          800: "#086443",
          900: "#0a5138",
        },
      },
      boxShadow: {
        pop: "0 8px 24px -8px rgba(11,11,13,0.18)",
        card: "0 1px 2px rgba(11,11,13,0.04), 0 1px 3px rgba(11,11,13,0.06)",
        dropdown: "0 10px 30px -10px rgba(11,11,13,0.25)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
