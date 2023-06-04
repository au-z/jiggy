import { defineConfig } from 'vite'

export default defineConfig(() => {
  return {
    build: {
      minify: false,
      sourcemap: true,
      emptyOutDir: false,
      lib: {
        name: 'jiggy',
        entry: 'src/index.ts',
        formats: ['es'],
      },
    },
  }
})
