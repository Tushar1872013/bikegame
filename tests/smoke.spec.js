import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';

test('renders a nonblank playable scene', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 15000 });
  await expect(page.locator('#speed')).toHaveText(/\d+/);
  await page.waitForTimeout(1000);
  const fpsText = await page.locator('#fps').textContent();
  const fps = Number(fpsText.replace(/\D/g, ''));
  expect(fps).toBeLessThanOrEqual(60);

  const screenshot = await page.screenshot();
  const png = PNG.sync.read(screenshot);
  const seen = new Set();

  for (let y = 80; y < png.height - 80; y += 24) {
    for (let x = 80; x < png.width - 80; x += 24) {
      const index = (png.width * y + x) * 4;
      seen.add(`${png.data[index]},${png.data[index + 1]},${png.data[index + 2]}`);
    }
  }

  expect(seen.size).toBeGreaterThan(12);
  expect(errors).toEqual([]);
});
