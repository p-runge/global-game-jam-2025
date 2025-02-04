import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    screens: {},
    colors: {
      primary: {
        darkest: "#0B0146",
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
    fontSize: {
      xs: "24px",
      sm: "32px",
      base: "40px",
      lg: "48px",
      xl: "64px",
    },
    borderWidth: {
      xs: "2px",
      sm: "4px",
      DEFAULT: "6px",
      lg: "8px",
      xl: "12px",
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
