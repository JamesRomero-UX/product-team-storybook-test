import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const stories = process.argv.slice(2);

if (stories.length === 0) {
  console.error(
    'Usage: node scripts/diagnose-stories.mjs <story-id-1> [<story-id-2> ...]\n' +
      'Use "__landing" for the Storybook root.',
  );
  process.exit(1);
}

const OUT = 'tmp/diagnose';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const id of stories) {
  const file = `${id.replace(/[^a-zA-Z0-9_-]+/g, '_')}.png`;
  const url =
    id === '__landing'
      ? 'http://localhost:6007/'
      : `http://localhost:6007/iframe.html?id=${id}&viewMode=story`;
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleMsgs = [];
  const pageErrors = [];
  const requestFailed = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(`${err.name}: ${err.message}`);
  });
  page.on('requestfailed', (req) => {
    requestFailed.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
  });

  let nav = 'ok';
  try {
    await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      nav = 'networkidle timeout';
    }
    await page.waitForTimeout(1500);
  } catch (e) {
    nav = `goto failed: ${e.message}`;
  }

  const outFile = path.join(OUT, file);
  try {
    await page.screenshot({ path: outFile, fullPage: true });
  } catch (e) {
    results.push({ id, screenshot: null, err: `screenshot failed: ${e.message}`, consoleMsgs, pageErrors, requestFailed, nav });
    await page.close();
    continue;
  }

  results.push({ id, url, screenshot: outFile, nav, consoleMsgs, pageErrors, requestFailed });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
