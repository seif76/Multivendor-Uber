/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#007233', // Elnaizak green
        secondary: '#ffffff', // white for text or backgrounds
        dark: '#1a1a1a',
      },
      fontFamily: {
        elnaizak: ['Cairo', 'System'], // Example: add custom font if needed
      },
    },
  },
  plugins: [],
};
