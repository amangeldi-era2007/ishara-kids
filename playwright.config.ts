import { defineConfig, devices } from '@playwright/test';
const port = process.env.PLAYWRIGHT_PORT ?? '3000';
const url = `http://localhost:${port}`;
export default defineConfig({
  testDir: './tests',
  use: { baseURL: url, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } }],
  webServer: { command: `npm run dev -- --port ${port}`, url, reuseExistingServer: !process.env.CI, timeout: 120000 },
});
