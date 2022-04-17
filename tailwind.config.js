module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-accent': 'var(--color-primary-accent)',
        secondary: 'var(--color-secondary)',
        'secondary-accent': 'var(--color-secondary-accent)',

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
