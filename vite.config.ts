import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Code splitting otimizado para melhor caching
        manualChunks: {
          // Bibliotecas React - raramente mudam
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Supabase - API client
          'supabase': ['@supabase/supabase-js'],
          
          // React Query - gestão de estado
          'query': ['@tanstack/react-query'],
          
          // Bibliotecas UI pesadas
          'ui': ['framer-motion', '@dnd-kit/core', '@dnd-kit/sortable'],
          
          // Bibliotecas de gráficos
          'charts': ['recharts'],
          
          // Ícones - carregados em múltiplas páginas
          'icons': ['lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Permitir importação de ficheiros HTML como strings (exceto index.html)
  assetsInclude: ['emails_html/**/*.html'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
