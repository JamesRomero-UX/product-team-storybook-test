// Tight diagnostic for a single story: hits the iframe URL, captures every
// pageerror + console error/warning + failed request, takes a screenshot.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const [storyId, outFile = `tmp/diagnose/${(storyId || '').replace(/[^a-zA-Z0-9_-]+/g, '_')}.png`] = process.argv.slice(2);
if (!storyId) {
  console.error('Usage: node scripts/diagnose-one.mjs <story-id> [output.png]');
  process.exit(1);
}
await mkdir(path.dirname(outFile), { recursive: true });

const url = `http://localhost:6007/iframe.html?id=${storyId}&viewMode=story`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleMsgs = [];
const pageErrors = [];
const failed = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(`[${m.type()}] ${m.text().slice(0, 800)}`);
});
page.on('pageerror', (e) => pageErrors.push(`${e.name}: ${e.message}`));
page.on('requestfailed', (r) => failed.push(`${r.method()} ${r.url()} — ${r.failure()?.errorText}`));
let nav = 'ok';
try {
  await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
  try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch { nav = 'networkidle timeout'; }
  await page.waitForTimeout(1500);
} catch (e) { nav = `goto failed: ${e.message}`; }
await page.screenshot({ path: outFile, fullPage: true });
await browser.close();
console.log(JSON.stringify({ id: storyId, url, screenshot: outFile, nav, consoleMsgs, pageErrors, requestFailed: failed }, null, 2));
