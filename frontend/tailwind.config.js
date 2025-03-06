/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', '"VT323"', "monospace"],
        "korean-pixel": ["DungGeunMo", "NeoDunggeunmo", "sans-serif"],
        sans: ['"Press Start 2P"', '"VT323"', "DungGeunMo", "NeoDunggeunmo", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#3490dc",
        "gray-2": "#e5e7eb",
        kakao: "#FEE500",
        "form-color": "#FAD0C4",
        "signup-color": "#FFF7F3",
        "carousel-color": "#FAD0C4",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scanline: "scanline 8s linear infinite",
        glitch: "glitch 2.5s infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glitch: {
          "0%": {
            textShadow: "0.05em 0 0 rgba(255, 0, 0, 0.75), -0.05em -0.025em 0 rgba(0, 255, 0, 0.75), -0.025em 0.05em 0 rgba(0, 0, 255, 0.75)",
          },
          "14%": {
            textShadow: "0.05em 0 0 rgba(255, 0, 0, 0.75), -0.05em -0.025em 0 rgba(0, 255, 0, 0.75), -0.025em 0.05em 0 rgba(0, 0, 255, 0.75)",
          },
          "15%": {
            textShadow: "-0.05em -0.025em 0 rgba(255, 0, 0, 0.75), 0.025em 0.025em 0 rgba(0, 255, 0, 0.75), -0.05em -0.05em 0 rgba(0, 0, 255, 0.75)",
          },
          "49%": {
            textShadow: "-0.05em -0.025em 0 rgba(255, 0, 0, 0.75), 0.025em 0.025em 0 rgba(0, 255, 0, 0.75), -0.05em -0.05em 0 rgba(0, 0, 255, 0.75)",
          },
          "50%": {
            textShadow: "0.025em 0.05em 0 rgba(255, 0, 0, 0.75), 0.05em 0 0 rgba(0, 255, 0, 0.75), 0 -0.05em 0 rgba(0, 0, 255, 0.75)",
          },
          "99%": {
            textShadow: "0.025em 0.05em 0 rgba(255, 0, 0, 0.75), 0.05em 0 0 rgba(0, 255, 0, 0.75), 0 -0.05em 0 rgba(0, 0, 255, 0.75)",
          },
          "100%": {
            textShadow: "-0.025em 0 0 rgba(255, 0, 0, 0.75), -0.025em -0.025em 0 rgba(0, 255, 0, 0.75), -0.025em -0.05em 0 rgba(0, 0, 255, 0.75)",
          },
        },
      },
    },
  },
  plugins: [],
};
