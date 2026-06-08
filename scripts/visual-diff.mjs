#!/usr/bin/env node
// Visual diff: screenshot the Storybook Settings stories so we can read
// them back and compare against the live app.
//
// Usage (from product-team-storybook/):
//   pnpm exec playwright install chromium   # one-time, if not done
//   node scripts/visual-diff.mjs
//
// Output: _comparisons/<timestamp>/storybook--<story>.png
//
// To compare with the live app:
//   1. Open staging.risksmart.link/settings in Chrome
//   2. Take a screenshot of each tab (Cmd-Shift-4 then Space)
//   3. Drop the screenshots into _comparisons/<timestamp>/ named
//      live--settings-users.png / live--settings-modules.png / etc.
//   4. Tell me the folder path and I'll read both pairs.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const STORYBOOK = 'http://localhost:6007';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUT_DIR = join(ROOT, '_comparisons', timestamp);
mkdirSync(OUT_DIR, { recursive: true });

const stories = [
  { name: 'settings-users',         storyId: 'page-templates-settings-page--default' },
  { name: 'settings-modules',       storyId: 'page-templates-settings-page--modules-tab' },
  { name: 'settings-notifications', storyId: 'page-templates-settings-page--notifications-tab' },
  { name: 'settings-data-export',   storyId: 'page-templates-settings-page--data-export-tab' },
];

const VIEWPORT = { width: 1440, height: 900 };

const main = async () => {
  console.log(`\n→ Capturing storybook stories to ${OUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  for (const story of stories) {
    const url = `${STORYBOOK}/iframe.html?id=${story.storyId}&viewMode=story`;
    console.log(`  ${story.name}  →  ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      await page.waitForTimeout(1200); // let Cloudscape finish hydrating
      await page.screenshot({
        path: join(OUT_DIR, `storybook--${story.name}.png`),
        fullPage: true,
      });
    } catch (err) {
      console.error(`    ✗ ${err.message}`);
    }
  }

  await browser.close();

  console.log(`\n✓ Done. PNGs in:`);
  console.log(`  ${OUT_DIR}\n`);
  console.log('  Next: drop matching live-app screenshots into the same folder,');
  console.log('  named live--settings-users.png / live--settings-modules.png /');
  console.log('  live--settings-notifications.png / live--settings-data-export.png.');
  console.log(`  Then run:  open "${OUT_DIR}"\n`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
