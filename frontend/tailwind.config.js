/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        third: 'var(--bg-third)',
        accent: 'var(--accent-color)',
      },
      textColor: {
        active: 'var(--accent-text)',
        unactive: 'var(--unactive-color)',
        normal: 'var(--normal-text)',
      },
    },
  },
  plugins: [],
};
