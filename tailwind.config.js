/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16221C",
        paper: "#FAFAF7",
        pine: {
          50: "#F5F4F3",
          100: "#E2DEDC",
          200: "#C3B9B5",
          400: "#837068",
          600: "#60483D",
          700: "#4B382F",
          900: "#31251F",
        },
        marigold: {
          50: "#F7FBF0",
          100: "#E5F2D0",
          400: "#A7D261",
          500: "#98CA45",
          600: "#779B37",
        },
        sage: "#7C8B7F",
        line: "#E4E4DC",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(22,34,28,0.06), 0 1px 1px rgba(22,34,28,0.04)",
      },
    },
  },
  plugins: [],
};
