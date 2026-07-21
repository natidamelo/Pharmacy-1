import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F6E5C',
          light: '#148A73',
          dark: '#0A5244',
          50: '#E8F5F2',
          100: '#C5E8E1',
          500: '#0F6E5C',
          600: '#0A5244',
        },
        warning: {
          DEFAULT: '#C17A1F',
          light: '#D4891F',
          50: '#FDF6E8',
          100: '#F7E2C0',
          500: '#C17A1F',
        },
        danger: {
          DEFAULT: '#C0392B',
          light: '#E04030',
          50: '#FDECEA',
          100: '#F5C2BE',
          500: '#C0392B',
        },
        ink: {
          DEFAULT: '#15191C',
          muted: '#4A5568',
          subtle: '#718096',
        },
        surface: {
          DEFAULT: '#F5F7F6',
          card: '#FFFFFF',
          hover: '#EEF2F0',
        },
        border: {
          DEFAULT: '#DDE4E2',
          strong: '#C5CEC9',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
        glow: '0 0 0 3px rgba(15,110,92,0.25)',
      },
      borderRadius: {
        cell: '6px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-gentle': 'pulseGentle 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGentle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
};

export default config;
