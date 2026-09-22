import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Only pure logic is tested (e.g. src/lib); no DOM environment needed.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
