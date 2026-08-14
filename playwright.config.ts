import { defineConfig, devices } from '@playwright/test';

const chromiumLaunchOptions = process.env.CHROME_PATH
  ? {
      launchOptions: {
        executablePath: process.env.CHROME_PATH,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    }
  : {};

export default defineConfig({
  testDir: './e2e',

  // Timeout para testes
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  // Rodar testes em paralelo
  fullyParallel: true,

  // Prevenir falhas por testes em quarentena
  forbidOnly: !!process.env.CI,

  // Retry em CI
  retries: process.env.CI ? 2 : 0,

  // Workers
  ...(process.env.CI ? { workers: 1 } : {}),

  // Reporter
  reporter: 'html',

  // Configurações compartilhados
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Configuração de projetos para diferentes browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...chromiumLaunchOptions },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'], ...chromiumLaunchOptions },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Servidor de desenvolvimento
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
    env: { PUBLIC_GTM_ID: process.env.PUBLIC_GTM_ID || 'GTM-PLAYWRIGHT' },
    timeout: 120 * 1000,
  },
});
