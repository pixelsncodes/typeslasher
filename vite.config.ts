import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { watch: { ignored: ['**/design/food-expansion/**'] } },
  build: { rollupOptions: { input: { game: 'index.html', studio: 'assets.html' } } },
});
