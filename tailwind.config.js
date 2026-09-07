module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#850e0e',
          50: '#f9e6e6',
          100: '#f2cdcd',
          200: '#e6a0a0',
          300: '#d87373',
          400: '#c94545',
          500: '#b51f1f',
          600: '#850e0e',
          700: '#6b0b0b',
          800: '#4f0808',
          900: '#360505',
        },
        secondary: {
          DEFAULT: '#9e8c8c',
          50: '#f4f1f1',
          100: '#e9e3e3',
          200: '#d4c8c8',
          300: '#beadad',
          400: '#a89292',
          500: '#9e8c8c',
          600: '#7f7070',
          700: '#615555',
          800: '#433b3b',
          900: '#282222',
        },
        luxury: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'luxury-lg': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      fontFamily: {
        'serif': ['Georgia', '"Times New Roman"', 'Times', 'serif'],
        'sans': ['"Open Sans"', 'system-ui', 'sans-serif'],
        'display': ['"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}