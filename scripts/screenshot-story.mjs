import { chromium } from 'playwright';

const [storyId, outputPath, width = 1280, height = 800] = process.argv.slice(2);

if (!storyId || !outputPath) {
  console.error(
    'Usage: node scripts/screenshot-story.mjs <story-id> <output-path> [width] [height]',
  );
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
});
await page.goto(
  `http://localhost:6007/iframe.html?id=${storyId}&viewMode=story`,
);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();
console.log(`Saved: ${outputPath}`);
