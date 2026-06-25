/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,mdx}",
    "./components/**/*.{js,jsx,mdx}",
    "./hooks/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-hi": "rgb(var(--surface-hi) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          2: "rgb(var(--primary-2) / <alpha-value>)",
        },
        accent: "rgb(var(--accent) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        main: "rgb(var(--text-main) / <alpha-value>)",
        secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        dim: "rgb(var(--text-dim) / <alpha-value>)",
        hairline: "rgb(var(--hairline) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(0,0,0,0.45)",
        glow: "0 0 0 1px rgb(var(--primary) / 0.25), 0 14px 40px -12px rgb(var(--primary) / 0.45)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
