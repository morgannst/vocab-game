import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change <REPO> to your GitHub repository name before deploying to GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: '/<REPO>/', // e.g. '/vocab-shapes-game/'
})
