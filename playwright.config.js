export default {
  testDir: './tests',
  timeout: 60000,
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173/Bike-game/',
    reuseExistingServer: true,
    timeout: 30000,
  },
  use: {
    baseURL: 'http://127.0.0.1:5173/Bike-game/',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure'
  }
};
