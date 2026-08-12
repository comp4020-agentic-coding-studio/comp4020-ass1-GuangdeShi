import { defineConfig } from 'vite'

// A relative base keeps the build portable: it works served from a domain
// root, from a subpath, or from a GitHub Pages project URL without changes.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
})
