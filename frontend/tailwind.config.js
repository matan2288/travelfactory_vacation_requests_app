/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    '../index.html',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        'bg-alt': '#FBFCFD',
        surface: '#FFFFFF',
        border: '#F1F3F6',
        'border-hover': '#E3E6EA',
        foreground: '#0F172A',
        'text-muted': '#475569',
        'text-subtle': '#64748B',
        accent: '#0F172A',
        'accent-hover': '#334155',
        'accent-soft': '#F8F9FB',
        'accent-muted': '#F1F3F6',
        success: '#16A34A',
        neutral: {
          50: '#FBFCFD',
          100: '#F6F7F9',
          200: '#EFF1F4',
          300: '#E3E6EA',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
