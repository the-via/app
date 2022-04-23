module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // TODO remove these colors
        light: 'var(--color-light)',
        medium: 'var(--color-medium)',
        dark: 'var(--color-dark)',
        background: 'var(--color-background)',

        action: 'var(--color-action)',
        background: 'var(--color-background)',
        outline: 'var(--color-outline)',
        text: 'var(--color-text)',
      },
      letterSpacing: {
        label: '0.15em'
      }
    },
  },
  plugins: [],
}
