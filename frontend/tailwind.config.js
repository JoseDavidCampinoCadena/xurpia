/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': {
          light: '#ffffff',
          dark: '#252527',
          'azul-claro': '#4db6ac',
        'azul-oscuro': '#00acc1',
      },
      boxShadow: {
        'custom-inner': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.2)', // Ajusta los valores a tu gusto
        'custom-2xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      'text-primary': {
          light: '#0f172a',
          dark: '#ffffff',
        },
      },
    },
  },
  plugins: [],
} 