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
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
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
        twinkle: {
          "0%, 100%": { opacity: ".25", transform: "scale(.7)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        trail: {
          "0%": { transform: "translate(-10%,60%) rotate(-8deg)", opacity: "0" },
          "15%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { transform: "translate(105%,-25%) rotate(-8deg)", opacity: "0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 10px 30px rgb(0 201 122 / 0.35)" },
          "50%": { boxShadow: "0 14px 46px rgb(0 201 122 / 0.62)" },
        },
      },
      animation: {
        marquee: "marquee 18s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 6s ease-in-out infinite",
        twinkle: "twinkle 2s ease-in-out infinite",
        trail: "trail 4.2s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
