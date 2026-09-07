/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        steel: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        telemetry: {
          emerald: '#059669',
          emeraldLight: '#10b981',
          emeraldGlow: 'rgba(16, 185, 129, 0.15)',
          amber: '#d97706',
          cyan: '#0891b2',
          red: '#dc2626',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        'panel-raised': '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
        'tactile-btn': 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 2px rgba(15, 23, 42, 0.12)',
        'tactile-btn-active': 'inset 0 2px 4px rgba(15, 23, 42, 0.15)',
        'tactile-emerald': 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 4px rgba(5, 150, 105, 0.3)',
      },
      borderRadius: {
        'industrial': '4px',
      }
    },
  },
  plugins: [],
}
