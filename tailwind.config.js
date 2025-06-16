/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'gradient-glow': 'gradientGlow 8s ease-in-out infinite',
      },
      keyframes: {
        gradientGlow: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
      },
      backgroundSize: {
        'double': '200% 200%',
      },
    },
  },
  plugins: [],
}
