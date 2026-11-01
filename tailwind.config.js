/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          green: "#22C55E",
          grass: "#4ADE80",
          yellow: "#FACC15",
          pink: "#F472B6",
          chalk: "#FAFAFA",
          black: "#09090B",
          darkgreen: "#15803D",
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        retro: ['"VT323"', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'pixel': '6px 6px 0px 0px #000000',
        'pixel-sm': '4px 4px 0px 0px #000000',
        'pixel-lg': '8px 8px 0px 0px #000000',
        'pixel-active': '2px 2px 0px 0px #000000',
      }
    },
  },
  plugins: [],
}

