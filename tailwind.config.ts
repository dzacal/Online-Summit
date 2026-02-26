import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand scale — values set via CSS variables so they can be changed from /dashboard/settings
        brand: {
          50:  'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },
        // Named semantic tokens — resolved at runtime via CSS variables
        sage:            'var(--color-sage)',
        seafoam:         'var(--color-seafoam)',
        teal:            'var(--color-teal)',
        charcoal:        'var(--color-charcoal)',
        olive:           'var(--color-olive)',
        linen:           'var(--color-linen)',
        'cool-gray':     'var(--color-cool-gray)',
        'vision-purple': 'var(--color-vision-purple)',
      },
    },
  },
  plugins: [],
}

export default config
