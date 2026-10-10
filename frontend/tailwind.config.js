/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gov-blue': '#2457A6',
        'gov-navy': '#17365D',
        'gov-saffron': '#E88924',
        'gov-saffron-light': '#FFF5E8',
        'gov-green': '#258451',
        'gov-bg': '#F5F8FC',
        'gov-blue-pale': '#EAF1FF',
        'gov-text': '#243247',
        'gov-text-sec': '#5D6B7C',
        'gov-border': '#DCE4EE',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
