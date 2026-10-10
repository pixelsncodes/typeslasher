import { defineConfig } from 'vite';

// Generated artwork is refreshed explicitly. Avoid Windows file locks while
// newly generated originals are being copied or optimized for this preview.
export default defineConfig({server:{host:'127.0.0.1',port:5175,watch:{ignored:['**/*.png','**/*.jpg','**/*.webp']}}});
