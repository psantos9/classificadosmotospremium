/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)'
      },
      screens: {
        xs: '320px',
        sm: '640px',
        md: '960px',
        lg: '1280px',
        xl: '1600px'
      }
    }
  },
  plugins: []
}
