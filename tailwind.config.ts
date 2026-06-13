import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#1e1e1e',
          secondary: '#757575',
          tertiary: '#b3b3b3',
        },
        line: {
          DEFAULT: '#d9d9d9',
          strong: '#303030',
          muted: '#b2b2b2',
        },
        brand: {
          DEFAULT: '#2c2c2c',
          on: '#f5f5f5',
        },
        surface: {
          DEFAULT: '#ffffff',
          neutral: '#e3e3e3',
        },
      },
      boxShadow: {
        dialog: '0 4px 4px -4px rgba(12,12,13,0.05), 0 16px 32px -4px rgba(12,12,13,0.10)',
        'input-inset': 'inset 0 1px 4px 0 rgba(12,12,13,0.05)',
      },
    },
  },
  plugins: [],
} satisfies Config
