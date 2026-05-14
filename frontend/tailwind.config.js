/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          elevated: 'hsl(var(--surface-elevated))',
          overlay: 'hsl(var(--surface-overlay))',
        },
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          light: 'hsl(var(--brand-light))',
          glow: 'hsl(var(--brand-glow))',
        },
        content: {
          DEFAULT: 'hsl(var(--content))',
          secondary: 'hsl(var(--content-secondary))',
          tertiary: 'hsl(var(--content-tertiary))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          subtle: 'hsl(var(--border-subtle))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'glow': '0 0 20px hsl(var(--brand-glow) / 0.3)',
        'glow-lg': '0 0 40px hsl(var(--brand-glow) / 0.4)',
        'card': '0 4px 24px hsl(0 0% 0% / 0.3)',
        'card-hover': '0 8px 32px hsl(0 0% 0% / 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px hsl(var(--brand-glow) / 0.2)' },
          '50%': { boxShadow: '0 0 30px hsl(var(--brand-glow) / 0.4)' },
        },
        bounceIn: {
          from: { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
