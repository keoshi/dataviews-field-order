import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Published to a path, not to a domain root, so assets are referenced
// relatively rather than from `/`.
export default defineConfig({
  base: './',
  plugins: [react()],
});
