import { defineConfig } from 'vite';
// Add an isolated preview alongside the existing build; never replace index.html.
export default defineConfig({base:'./',publicDir:false,build:{outDir:'dist',emptyOutDir:false,assetsDir:'prototype-assets',rollupOptions:{input:'prototype.html'}}});
