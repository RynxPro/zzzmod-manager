/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/renderer/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        // Gaming launcher color palette
        gaming: {
          bg: {
            primary: '#0a0a0f',
            secondary: '#101018',
            tertiary: '#1a1a24',
            card: '#1e1e2e',
            overlay: '#252538',
          },
          accent: {
            cyan: '#00f5ff',
            violet: '#8b5cf6',
            magenta: '#f471b5',
            purple: '#a855f7',
            blue: '#3b82f6',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
            muted: '#71717a',
          },
          border: {
            primary: '#27272a',
            accent: '#3f3f46',
            glow: '#00f5ff',
          },
          status: {
            enabled: '#10b981',
            disabled: '#6b7280',
            conflict: '#ef4444',
            warning: '#f59e0b',
          }
        },
        // Moon theme palette for MoonLight Manager (Zenless Zone Zero moon vibes)
        moon: {
          bg: "#0a0f1c", // deep navy night
          surface: "#141a2a", // slightly lighter for cards
          glowViolet: "#7a5af8", // neon violet glow
          glowCyan: "#4dd0e1", // cyan glow
          accent: "#9c6eff", // main accent
          on: "#4ade80", // glowing green (ON)
          off: "#f87171", // muted red (OFF)
          text: "#e4e9f5", // soft white text
          muted: "#8a92b2", // muted secondary text
        },
        // Keep existing neon colors for compatibility
        neon: {
          cyan: "#00f5ff",
          blue: "#00f5ff",
          purple: "#8b5cf6",
          pink: "#f471b5",
          magenta: "#f471b5",
          green: "#10b981",
          cyan: "#00f5ff",
          violet: "#8b5cf6",
          magenta: "#f471b5",
        },
      },
      boxShadow: {
        // Gaming-style glows
        glow: "0 0 0 1px rgba(0, 245, 255, 0.3), 0 0 20px rgba(0, 245, 255, 0.15), 0 4px 32px rgba(0, 245, 255, 0.1)",
        glowPurple: "0 0 0 1px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.15), 0 4px 32px rgba(139, 92, 246, 0.1)",
        glowMagenta: "0 0 0 1px rgba(244, 113, 181, 0.3), 0 0 20px rgba(244, 113, 181, 0.15), 0 4px 32px rgba(244, 113, 181, 0.1)",
        glowViolet: "0 0 0 1px rgba(168, 85, 247, 0.3), 0 0 20px rgba(168, 85, 247, 0.15), 0 4px 32px rgba(168, 85, 247, 0.1)",
        // Moon theme glows (cyan/violet accent)
        moonGlowCyan: "0 0 0 1px rgba(77, 208, 225, 0.35), 0 0 24px rgba(77, 208, 225, 0.18), 0 6px 36px rgba(77, 208, 225, 0.12)",
        moonGlowViolet: "0 0 0 1px rgba(122, 90, 248, 0.35), 0 0 24px rgba(122, 90, 248, 0.18), 0 6px 36px rgba(122, 90, 248, 0.12)",
        // Card shadows
        cardGlow: "0 4px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        cardHover: "0 8px 64px rgba(0, 245, 255, 0.1), 0 0 0 1px rgba(0, 245, 255, 0.2)",
        // Glassmorphism
        glass: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        glassHover: "0 12px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15)",
      },
      backdropBlur: {
        xs: "2px",
        gaming: "12px",
      },
      backgroundImage: {
        'gradient-gaming': 'linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(244, 113, 181, 0.1) 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(30, 30, 46, 0.8) 0%, rgba(37, 37, 56, 0.6) 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(16, 16, 24, 0.9) 100%)',
        // Moon gradients
        'gradient-moon': 'linear-gradient(135deg, rgba(77, 208, 225, 0.10) 0%, rgba(122, 90, 248, 0.10) 100%)',
        'gradient-moon-card': 'linear-gradient(145deg, rgba(20, 26, 42, 0.85) 0%, rgba(20, 26, 42, 0.65) 100%)',
        'gradient-moon-sidebar': 'linear-gradient(180deg, rgba(10, 15, 28, 0.95) 0%, rgba(20, 26, 42, 0.92) 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.15)'
          },
          '50%': { 
            boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.6), 0 0 30px rgba(239, 68, 68, 0.3)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
