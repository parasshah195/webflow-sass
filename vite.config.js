import {chunkSplitPlugin} from 'vite-plugin-chunk-split';

export default {
  build: {
    sourcemap: true,
  },
  plugins: [
    chunkSplitPlugin()
  ]
}