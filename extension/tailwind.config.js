/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,html}',
    './src/popup/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode Tokens
        light: {
          bg: '#FFFFFF',
          secondary: '#F8FAFC',
          border: '#E5E7EB',
          text: '#111827',
          muted: '#6B7280',
          accent: '#2563EB',
          accentHover: '#1D4ED8',
          success: '#16A34A',
          danger: '#DC2626',
        },
        // Dark Mode Tokens
        dark: {
          bg: '#0F172A',
          card: '#111827',
          border: '#1F2937',
          text: '#F9FAFB',
          muted: '#94A3B8',
          accent: '#3B82F6',
          accentHover: '#2563EB',
          success: '#22C55E',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        DEFAULT: '180ms',
        fast: '150ms',
        normal: '200ms',
        slow: '250ms',
      },
    },
  },
  plugins: [],
};
