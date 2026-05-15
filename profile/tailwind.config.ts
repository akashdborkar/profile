import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

/**
 * Tailwind v4 config — content paths are auto-detected, dark mode and
 * color tokens are configured via @theme / @custom-variant in globals.css.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  plugins: [typography()],
}

export default config
