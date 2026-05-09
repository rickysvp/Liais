import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';
import {defineConfig, loadEnv} from 'vite';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async ({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  const plugins = [react()];
  
  // Try to load tailwindcss but don't crash if tsx/node fails on it
  try {
    const tailwind = await import('@tailwindcss/vite');
    plugins.push(tailwind.default());
  } catch (e) {
    console.warn("[Vite Config] Tailwind CSS plugin could not be loaded statically. Styles might be affected in dev mode.");
  }

  return {
    plugins,
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      '__APP_VERSION__': JSON.stringify("0.0.0"),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
