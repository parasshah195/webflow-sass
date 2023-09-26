import { defineConfig } from 'vite';
import {chunkSplitPlugin} from 'vite-plugin-chunk-split';

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    chunkSplitPlugin()
  ]
})