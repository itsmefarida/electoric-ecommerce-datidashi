// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}", // <-- 1. Tambahkan path 'providers'
  ],
  theme: {
    extend: {
      colors: {
        'custom-yellow':'#FED700', // <-- 2. Warna kustom Anda tetap ada
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("daisyui")
  ],
  
  // 3. Tambahkan konfigurasi DaisyUI di sini
  daisyui: {
    themes: ["light", "dark"], // Tentukan tema yang ingin Anda gunakan
    darkTheme: "dark", // Tentukan tema mana yang 'dark'
    base: true, // Terapkan style dasar DaisyUI
    styled: true, // Terapkan style komponen DaisyUI
    utils: true, // Tambahkan utility class DaisyUI
    logs: false, // Nonaktifkan log DaisyUI di konsol
  },
};

export default config;