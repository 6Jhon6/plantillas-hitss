import path from "path" // Importante: para manejar rutas
import { defineConfig } from 'vite'
import react from '@tailwindcss/vite'
import tailwindcss from '@tailwindcss/vite' // Nuevo plugin v4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Añade Tailwind aquí
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Configura el alias para shadcn
    },
  },
})