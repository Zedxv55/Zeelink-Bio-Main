import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// โหมด demo (ไม่มี .env) ยังคงทำงานได้ — Supabase client มี fallback อยู่แล้วใน supabaseClient.ts
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0', // dev only — เปิดให้เข้าถึงจากเครื่องอื่นใน LAN (เทสบนมือถือ)
  },
  plugins: [react()],
  build: {
    // แบ่ง chunk เพื่อลดขนาดไฟล์หลัก (แก้ปัญหา bundle 724kB)
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          leaflet: ['leaflet'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
