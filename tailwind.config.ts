import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0C0C0C",
        mist: "#D7E2EA",
        paper: "#F3F5F4",
        accent: "#BB62AE",
      },
      fontFamily: {
        sans: ["Kanit", "PingFang SC", "Microsoft YaHei", "sans-serif"],
      },
      borderRadius: {
        shell: "2.5rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
