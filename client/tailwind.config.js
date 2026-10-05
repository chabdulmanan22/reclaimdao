/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // User Primary Colors
        charcoal: {
          DEFAULT: '#2F2F34',
          50: '#F4F4F5',
          100: '#E4E4E7',
          200: '#C7C7CC',
          300: '#9E9EA4',
          400: '#5C5C64',
          500: '#2F2F34', // Main Charcoal (Primary content text)
          600: '#26262A',
          700: '#1E1E21',
          800: '#151518',
          900: '#0E0E10',
        },
        coolgray: {
          DEFAULT: '#8B9098',
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E2E5E8',
          300: '#C5CAD0',
          400: '#A4AAB3',
          500: '#8B9098', // Main Cool Gray (Secondary / Neutral)
          600: '#737880',
          700: '#5C6067',
          800: '#46494F',
          900: '#323438',
        },
        electric: {
          DEFAULT: '#3D7EFF', // Main Electric Blue (All buttons / actions)
          50: '#F0F5FF',
          100: '#E0ECFF',
          200: '#BAD6FF',
          300: '#8FBBFF',
          400: '#649EFF',
          500: '#3D7EFF',
          600: '#2667F5', // Hover state
          700: '#1750D0', // Active state
          800: '#0F3DA6',
          900: '#0B2C7A',
        },
        // Primary alias maps directly to Electric Blue for all Tailwind components
        primary: {
          50: '#F0F5FF',
          100: '#E0ECFF',
          200: '#BAD6FF',
          300: '#8FBBFF',
          400: '#649EFF',
          500: '#3D7EFF',
          600: '#2667F5',
          700: '#1750D0',
          800: '#0F3DA6',
          900: '#0B2C7A',
          950: '#061A47',
        },
        // Semantic background surfaces
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F4F9',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'electric-gradient': 'linear-gradient(135deg, #3D7EFF 0%, #2667F5 100%)',
        'electric-light-gradient': 'linear-gradient(135deg, #F0F5FF 0%, #E0ECFF 100%)',
        'surface-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
      },
      boxShadow: {
        'btn': '0 4px 14px 0 rgba(61, 126, 255, 0.35)',
        'btn-hover': '0 6px 20px 0 rgba(61, 126, 255, 0.5)',
        'card-soft': '0 4px 20px -2px rgba(47, 47, 52, 0.06), 0 2px 6px -1px rgba(47, 47, 52, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(47, 47, 52, 0.1), 0 4px 10px -2px rgba(47, 47, 52, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        }
      }
    },
  },
  plugins: [],
}