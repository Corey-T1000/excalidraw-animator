/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6965db',
        'primary-darker': '#5b57c2',
      },
    },
  },
  plugins: [],
}