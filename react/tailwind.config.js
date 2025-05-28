/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'nu-blue': '#0033A0',
        'nu-gold': '#FFC72C',
      },  
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
