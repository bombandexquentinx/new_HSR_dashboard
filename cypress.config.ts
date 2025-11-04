import { defineConfig } from 'cypress';

const baseUrl: string = process.env.VITE_BASE_URl || 'http://localhost:5173';

export default defineConfig({
  e2e: {
    baseUrl,
    setupNodeEvents() {
      // Implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  }
});