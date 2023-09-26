import {chunkSplitPlugin} from 'vite-plugin-chunk-split';

export default {
  root: 'src',
  build: {
    outDir: '../dist',
    sourcemap: true,
  },
  plugins: [
    chunkSplitPlugin()
  ]
}