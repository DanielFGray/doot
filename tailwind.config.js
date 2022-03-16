const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./app/**/*.tsx'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        coolGray: colors.slate,
        gray: colors.neutral,
        brand: colors.emerald,
      },
    },
  },
  plugins: [
    require('@danielfgray/tw-heropatterns'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
}
