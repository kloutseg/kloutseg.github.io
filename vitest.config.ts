/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';
import { svelteTesting } from '@testing-library/svelte/vite';

export default getViteConfig({
  plugins: [svelteTesting()],
  
  test: {
    // Configuração básica do Vitest
    globals: true,
    environment: 'happy-dom',
    
    // Setup files
    setupFiles: ['./src/test-setup.ts'],
    
    // Incluir arquivos de teste
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.astro/**'],
    
    // Configurações de coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,svelte}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.{test,spec}.{js,ts}',
        'src/layouts/**',
        'src/pages/**',
      ],
    },
  },
});
