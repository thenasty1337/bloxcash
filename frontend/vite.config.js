import { defineConfig } from 'vite';
import solidStyled from 'vite-plugin-solid-styled';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solidPlugin(),
    solidStyled({
      prefix: 'casino', // optional
      filter: {
        include: 'src/**/*.{js,tsx,jsx}',
        exclude: 'node_modules/**/*.{js,tsx,jsx}',
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        ws: true,
        changeOrigin: true
      },
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js'
      }
    }
  },
});