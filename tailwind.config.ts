import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
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
    screens: {},
  },
  plugins: [],
} satisfies Config;
