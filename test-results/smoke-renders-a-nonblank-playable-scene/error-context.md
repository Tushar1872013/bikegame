# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.js >> renders a nonblank playable scene
- Location: tests\smoke.spec.js:4:1

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: locator('#loading')
Expected pattern: /hidden/
Received string:  "loading"
Timeout: 15000ms

Call log:
  - Expect "toHaveClass" with timeout 15000ms
  - waiting for locator('#loading')
    3 × locator resolved to <div id="loading" class="loading">…</div>
      - unexpected value "loading"

```

```yaml
- strong: Loading...
- text: Ready!
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { PNG } from 'pngjs';
  3  | 
  4  | test('renders a nonblank playable scene', async ({ page }) => {
  5  |   const errors = [];
  6  |   page.on('console', (message) => {
  7  |     if (message.type() === 'error') errors.push(message.text());
  8  |   });
  9  |   page.on('pageerror', (error) => errors.push(error.message));
  10 | 
  11 |   await page.goto('/', { waitUntil: 'domcontentloaded' });
> 12 |   await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 15000 });
     |                                          ^ Error: expect(locator).toHaveClass(expected) failed
  13 |   await expect(page.locator('#speed')).toHaveText(/\d+/);
  14 |   await page.waitForTimeout(1000);
  15 |   const fpsText = await page.locator('#fps').textContent();
  16 |   const fps = Number(fpsText.replace(/\D/g, ''));
  17 |   expect(fps).toBeLessThanOrEqual(60);
  18 | 
  19 |   const screenshot = await page.screenshot();
  20 |   const png = PNG.sync.read(screenshot);
  21 |   const seen = new Set();
  22 | 
  23 |   for (let y = 80; y < png.height - 80; y += 24) {
  24 |     for (let x = 80; x < png.width - 80; x += 24) {
  25 |       const index = (png.width * y + x) * 4;
  26 |       seen.add(`${png.data[index]},${png.data[index + 1]},${png.data[index + 2]}`);
  27 |     }
  28 |   }
  29 | 
  30 |   expect(seen.size).toBeGreaterThan(12);
  31 |   expect(errors).toEqual([]);
  32 | });
  33 | 
```