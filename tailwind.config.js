/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        optiPurple: {
          50: '#f6f2fc',
          100: '#efe6fa',
          200: '#dfccf6',
          300: '#c0a9f0',
          400: '#9b6ff0',
          500: '#7a3ff2',
          600: '#672ee6',
          700: '#4e23b8',
          800: '#391a86',
          900: '#2a1460'
        }
      }
    },
  },
  plugins: [],
}
