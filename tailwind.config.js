
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { optiPurple: {300:"#c084fc",400:"#a855f7",500:"#8b5cf6"} },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pop': { '0%': { opacity: 0, transform: 'scale(0.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 400ms ease-out both',
        'slide-up': 'slide-up 300ms ease-out both',
        'pop': 'pop 220ms ease-out both',
      },
    }
  },
  plugins: [],
};
