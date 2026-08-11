/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#040404",
        paper: "#faf9f6",
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
        pop: {
          400: "#a78bfa",
          500: "#7c5cfa",
          600: "#6338f0",
        },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        sans: ["'Poppins'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        pop: "0 12px 30px -12px rgb(0 0 0 / 0.35)",
        glow: "0 0 0 1px rgb(0 201 122 / 0.15), 0 20px 40px -16px rgb(0 201 122 / 0.45)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.333%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--float-rotate, 0deg))" },
          "50%": { transform: "translateY(-14px) rotate(var(--float-rotate, 0deg))" },
        },
      },
      animation: {
        marquee: "marquee 18s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
