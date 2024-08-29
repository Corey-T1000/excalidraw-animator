/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6965db',
        'primary-darker': '#5b57d1',
        'primary-darkest': '#4a47b1',
        'primary-light': '#e3e2fe',
        'surface-low': 'hsl(240, 8%, 15%)',
        'surface-mid': 'hsl(240, 6%, 10%)',
        'on-surface': '#e3e3e8',
        'island-bg': '#232329',
      },
    },
  },
  plugins: [],
}