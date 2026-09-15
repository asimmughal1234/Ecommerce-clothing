import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#E8E3D6",
        cream: "#F8F5EE",
        ink: "#23241F",
        clay: "#8A4632",
        "clay-light": "#B5715A",
        moss: "#4C5738",
        sand: "#C7B79E",
        line: "#D3CBB9",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-work-sans)", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        // Proportional rather than a fixed cap, so the layout keeps growing on
        // wide monitors instead of stranding the content in a narrow column.
        content: "96%",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
