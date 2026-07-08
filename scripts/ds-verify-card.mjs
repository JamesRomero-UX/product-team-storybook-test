// Load a rendered card via SERVE_URL (env) in headless Chromium, capture console
// + failed requests + a screenshot, and report whether the mount actually painted.
import { chromium } from 'playwright';

const url = process.env.SERVE_URL;
const out = process.argv[2] || 'scratchpad-preview/card.png';
if (!url) { console.error('SERVE_URL env required'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
const failed = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) => failed.push(`${r.url()} — ${r.failure()?.errorText}`));

await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(2500);

const info = await page.evaluate(() => {
  const root = document.getElementById('r0');
  return {
    hasDsPreview: !!window.__dsPreview,
    dsKeys: Object.keys(window.__dsPreview || {}),
    hasRiskSmart: !!window.RiskSmart,
    rootChildren: root ? root.children.length : -1,
    rootTextLen: root ? (root.innerText || '').trim().length : -1,
    errText: root && root.className === 'ds-err' ? root.innerText : null,
    // signals the register template actually built:
    tables: document.querySelectorAll('table').length,
    buttons: document.querySelectorAll('button').length,
    h1: (document.querySelector('h1,h2')?.innerText || '').slice(0, 80),
  };
});

await page.screenshot({ path: out, fullPage: false });
await browser.close();

const errors = logs.filter((l) => l.startsWith('[error]') || l.startsWith('[pageerror]'));
console.log(JSON.stringify({ ...info, errorCount: errors.length, errors: errors.slice(0, 8), failed: failed.slice(0, 8) }, null, 2));
