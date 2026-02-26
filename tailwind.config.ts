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
        // Tony Cho brand scale (maps to existing brand-X classes across the site)
        brand: {
          50:  '#EFF7F4',   // very light seafoam tint
          100: '#CCCCC1',   // soft linen — warmth & comfort
          200: '#A6DCCD',   // seafoam — freshness & calm
          300: '#9A9C91',   // cool gray — balance & sophistication
          400: '#9EA481',   // olive green — nature & harmony
          500: '#6EA451',   // sage green — growth & regeneration (primary CTA)
          600: '#4A6264',   // teal — innovation & trust
          700: '#3D5254',   // deep teal
          800: '#434C4C',   // charcoal gray — authority & grounding
          900: '#2F3636',   // deep charcoal
        },
        // Named semantic tokens for direct use
        sage:    '#6EA451',
        seafoam: '#A6DCCD',
        teal:    '#4A6264',
        charcoal:'#434C4C',
        olive:   '#9EA481',
        linen:   '#CCCCC1',
        'cool-gray': '#9A9C91',
        'vision-purple': '#8B7BA8',
      },
    },
  },
  plugins: [],
}

export default config
