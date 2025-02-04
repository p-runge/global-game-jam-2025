import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    screens: {},
    colors: {
      primary: {
        darkest: "#011A7F",
        darker: "#011A7F",
        dark: "#0257E8",
        DEFAULT: "#3198FA",
        light: "#37CAFD",
        lighter: "#57FAF9",
        lightest: "#C3FCFB",
      },
      yellow: "#FDF36F",
      orange: "#F86A46",
      highlight: "#E354E1",
      white: "#FDFCFA",
      black: "#050737",
      transparent: "transparent",
    },

    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      width: {
        card: "180px",
      },
      height: {
        card: "300px",
      },
    },
  },
  plugins: [],
} satisfies Config;
