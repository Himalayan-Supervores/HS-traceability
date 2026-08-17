/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16221C",
        paper: "#FAFAF7",
        pine: {
          50: "#EEF3EE",
          100: "#D7E3D8",
          200: "#AFC7B2",
          400: "#5C8362",
          600: "#2F5233",
          700: "#243F27",
          900: "#152317",
        },
        marigold: {
          50: "#FBF2E2",
          100: "#F4DDA9",
          400: "#DDA53F",
          500: "#C98A2B",
          600: "#A96E1D",
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
