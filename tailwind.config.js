/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090D",
        surface: "#0E1017",
        "surface-border": "#1E2230",
        primary: {
          DEFAULT: "#3B82F6", // Tactical Blue
          glow: "#60A5FA",
        },
        accent: {
          red: "#EF4444",    // Alert/Police red
          emerald: "#10B981", // Active/Green status
          purple: "#8B5CF6", // Gang/VIP purple
          amber: "#F59E0B",  // Warning gold
        }
      },
      animation: {
        'gradient-pulse': 'gradientPulse 12s ease infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-reverse': 'floatReverse 10s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        gradientPulse: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.6' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.85' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(30px, -40px) scale(1.08)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1.05)' },
          '50%': { transform: 'translate(-40px, 35px) scale(0.95)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
};
