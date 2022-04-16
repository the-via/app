module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        primaryActive: 'var(--color-primary-active)',
        secondary: 'var(--color-secondary)',
        secondaryActive: 'var(--color-secondary-active)',
        light: 'var(--color-light)',
        medium: 'var(--color-medium)',
        dark: 'var(--color-dark)',
        background: 'var(--color-background)',
      },
      letterSpacing: {
        label: '0.125em'
      }
    },
  },
  plugins: [],
}
