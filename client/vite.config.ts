import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The API's CORS and origin check accept only http://localhost:5173: fail instead of moving to 5174.
  server: { port: 5173, strictPort: true },
});
