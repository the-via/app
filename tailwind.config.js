module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: 'var(--color-accent)',
        'accent-active': 'var(--color-accent-active)',
        light: 'var(--color-light)',
        medium: 'var(--color-medium)',
        dark: 'var(--color-dark)',
        background: 'var(--color-background)',
      }
    },
  },
  plugins: [],
}
