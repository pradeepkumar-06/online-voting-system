
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        glass: 'rgba(255, 255, 255, 0.1)',
        darkBg: '#0f172a',
        darkCard: '#1e293b',
      }
    },
  },
  plugins: [],
}
