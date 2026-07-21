/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#241016",
        berry: { DEFAULT: "#7A1030", dark: "#4F0A20" },
        blush: "#F7E7E2",
        cream: "#FFFBF7",
        gold: "#B9873F",
        taupe: "#75635F",
      },
      fontFamily: {
        display: ['"Trirong"', "ui-serif", "Georgia", "serif"],
        body: ['"IBM Plex Sans Thai"', "ui-sans-serif", "system-ui"],
      },
    }
  },
  plugins: []
};
