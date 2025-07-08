/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderWidth: {
        '10': '10px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '30': '30px',
      },
    },
  },
  plugins: [],
};
