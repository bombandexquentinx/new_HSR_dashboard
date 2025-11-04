import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";
// import tailwindcss from "@tailwindcss/vite"
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server:{
    port: 3000,
    cors: {
      // the origin you will be accessing via browser
      origin: 'http://localhost:5000',
    },
    proxy: {
      '/api': { // This key defines the path prefix that will be proxied
        target: "http://localhost:5000", // The URL of your backend API
        changeOrigin: true, // Ensures the host header is changed to the target URL
        rewrite: (path) => path.replace(/^\/api/, ''), // Optional: Removes '/api' prefix from the request sent to the backend
      },
    }
  }
})
