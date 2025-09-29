/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pur_button: "#6246ea",
        pur_button_hover: "#4e36c9",
        black_text: "#2b2c34",
        white_text: "#fffff0",
      }
    },
  },
  plugins: [],
}

