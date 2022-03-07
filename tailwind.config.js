const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./app/**/*.tsx'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        coolGray: colors.slate,
        gray: colors.neutral,
      },
      typography(theme) {
        return {
          DEFAULT: {
            css: {
              'a code': { textDecoration: 'underline' },
              pre: {
                color: theme('colors.gray.900'),
                backgroundColor: theme('colors.gray.100'),
              },
            },
          },
          dark: {
            css: {
              color: theme('colors.gray.300'),
              '[class~="lead"]': { color: theme('colors.gray.400') },
              a: { color: theme('colors.gray.100') },
              strong: { color: theme('colors.gray.100') },
              'ul > li::before': { backgroundColor: theme('colors.gray.700') },
              hr: { borderColor: theme('colors.gray.900'), },
              blockquote: {
                color: theme('colors.gray.100'),
                borderLeftColor: theme('colors.gray.500'),
              },
              h1: { color: theme('colors.gray.100') },
              h2: { color: theme('colors.gray.100') },
              h3: { color: theme('colors.gray.100') },
              h4: { color: theme('colors.gray.100') },
              code: { color: theme('colors.gray.300') },
              'a code': { color: theme('colors.gray.300') },
              hr: { borderColor: theme('colors.gray.500') },
              pre: {
                color: theme('colors.gray.200'),
                backgroundColor: theme('colors.gray.900'),
              },
              thead: {
                color: theme('colors.gray.100'),
                borderBottomColor: theme('colors.gray.700'),
              },
              'tbody tr': { borderBottomColor: theme('colors.gray.800') },
            },
          },
        }
      },
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
  ],
}
