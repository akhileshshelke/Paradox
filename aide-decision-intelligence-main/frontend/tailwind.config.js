/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light theme (AQI.in style)
        light: {
          bg: "#f0f4f8",
          surface: "#ffffff",
          border: "#e2e8f0",
          text: "#1a202c",
          muted: "#718096",
          accent: "#0284c7",
        },
        // Dark theme (existing)
        cmd: {
          bg: "#121418",
          nav: "#1b1d24",
          panel: "#25272e",
          border: "#3f4354",
          accent: "#3b82f6",
          text: "#f8fafc",
          muted: "#94a3b8",
        },
        aqi: {
          good: "#00b050",
          satisfactory: "#92d050",
          moderate: "#ffcc00",
          poor: "#ff7c00",
          veryPoor: "#ff0000",
          severe: "#7030a0",
        },
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "-apple-system", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.12)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.16)",
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.5)",
        "aqi-glow": "0 0 30px rgba(0, 176, 80, 0.3)",
      },
      keyframes: {
        pulse_ring: {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        numberTick: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        pulse_ring: "pulse_ring 1.5s ease-out infinite",
        fadeInUp: "fadeInUp 0.6s ease-out forwards",
        fadeIn: "fadeIn 0.4s ease-out forwards",
        slideInLeft: "slideInLeft 0.5s ease-out forwards",
        slideInRight: "slideInRight 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        numberTick: "numberTick 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
