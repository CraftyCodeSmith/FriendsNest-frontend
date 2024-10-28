/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      "roboto-r": "var(--font-robotoregular)",
      "roboto-mi": "var(--font-robotomediumitalic)",
    },
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
};
