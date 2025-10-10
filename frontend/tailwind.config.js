/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: [
        'Inter var',
        'Inter',
        'ui-sans-serif',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
      ],
      body: ['Inter', 'M PLUS Rounded 1c', 'system-ui', 'sans-serif'],
    },
    extend: {
      transitionProperty: {
        width: 'width',
        height: 'height',
      },
      animation: {
        fastPulse: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.08)',
        lift: '0 10px 20px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      colors: {
        'aws-squid-ink': {
          light: '#1f2937',
          dark: '#0b0b0b',
        },
        'aws-sea-blue': {
          light: '#0ea5e9',
          dark: '#7dd3fc',
        },
        'aws-sea-blue-hover': {
          light: '#0284c7',
          dark: '#60a5fa',
        },
        'aws-aqua': '#22d3ee',
        'aws-lab': '#34d399',
        'aws-mist': '#a5f3fc',
        'aws-font-color': {
          light: '#111827',
          dark: '#e5e7eb',
          gray: '#9ca3af',
          blue: '#3b82f6',
        },
        'aws-font-color-white': {
          light: '#ffffff',
          dark: '#f3f4f6',
        },
        'aws-ui-color': {
          dark: '#0f1115',
        },
        'aws-paper': {
          light: '#f6f7fb',
          dark: '#0b0e12',
        },
        red: '#ef4444',
        'light-red': '#fee2e2',
        yellow: '#f59e0b',
        'light-yellow': '#fef9c3',
        'dark-gray': '#6b7280',
        gray: '#9ca3af',
        'light-gray': '#e5e7eb',
      },
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require('@tailwindcss/typography'), require('tailwind-scrollbar')],
};
