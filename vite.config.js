import { defineConfig } from 'vite';
import solidStyled from 'vite-plugin-solid-styled';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solidPlugin(),
    solidStyled({
      prefix: 'my-prefix', // optional
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
      '/auth': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/user': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/items': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/trading': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/discord': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/rain': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/leaderboard': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/cases': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/battles': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/roulette': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/crash': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/coinflip': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/jackpot': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/slots': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/mines': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/blackjack': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/admin': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/surveys': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/fairness': { target: 'http://127.0.0.1:3000', changeOrigin: true },
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
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js'
    }
  },
});