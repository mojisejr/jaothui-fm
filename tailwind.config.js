/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f39c12',
        secondary: '#4a4a4a',
      },
      maxWidth: {
        'mobile': '400px',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        jaothui: {
          "primary": "#f39c12",
          "secondary": "#4a4a4a",
          "accent": "#f39c12",
          "neutral": "#4a4a4a",
          "base-100": "#ffffff",
          "base-200": "#f9f9f9",
          "base-300": "#f5f5f5",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
}