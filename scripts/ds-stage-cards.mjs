// Stage design-sync cards for a set of stories: build each preview bundle
// (JS + CSS) and author its card HTML shell into _stage/, resilient to
// per-story build failures. Then the staged tree is pushed via DesignSync.
//
// Usage: node scripts/ds-stage-cards.mjs <group> <manifest.json>
//   manifest.json: [{ "name": "TablePage", "story": "src/page-templates/TablePage.stories.tsx",
//                     "exports": ["Default","Empty"], "viewport": "1440x900" }, ...]
import { execFileSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [group, manifestPath] = process.argv.slice(2);
const items = JSON.parse(readFileSync(resolve(repoRoot, manifestPath), 'utf8'));
const stage = resolve(repoRoot, '_stage');

const cardHtml = (name, group, viewport) => `<!-- @dsCard group="${group}" viewport="${viewport}" -->
<!doctype html>
<html><head><meta charset="utf-8">
  <link rel="stylesheet" href="../../../styles.css">
  <link rel="stylesheet" href="../../../_ds_bundle.css">
  <link rel="stylesheet" href="../../../_preview/${group}/${name}.css">
  <style>
    html,body{margin:0;padding:0;background:#fff}
    #r0{min-height:100vh}
    .ds-err{padding:24px;font:14px/1.5 system-ui;color:#b91c1c}
  </style>
</head><body class="atomic-ui">
  <div id="r0"></div>
  <script src="../../../_vendor/react.js"></script>
  <script src="../../../_vendor/react-dom.js"></script>
  <script src="../../../_ds_bundle.js"></script>
  <script src="../../../_preview/${group}/${name}.js"></script>
  <script>
    (function(){
      var h=React.createElement;
      var P=(window.RiskSmart&&window.RiskSmart.PreviewRoot)||React.Fragment;
      var q=null; try{q=new URLSearchParams(location.search).get('story')}catch(e){}
      var dp=window.__dsPreview||{};
      var keys=[]; for(var k in dp){ if(typeof dp[k]==='function'&&/^[A-Z]/.test(k)) keys.push(k); }
      var pick=null;
      if(q){ for(var i=0;i<keys.length;i++){ if(keys[i]===q||keys[i].toLowerCase()===q.toLowerCase()){pick=keys[i];break;} } }
      if(!pick) pick = keys.indexOf('Default')>=0 ? 'Default' : keys[0];
      var el=document.getElementById('r0');
      if(!pick){ el.className='ds-err'; el.textContent='⚠ no PascalCase render export in ${name}.js'; return; }
      try{ ReactDOM.createRoot(el).render(h(P,{},h(dp[pick]))); }
      catch(e){ el.className='ds-err'; el.textContent='⚠ '+((e&&e.message)||e); }
    })();
  </script>
</body></html>
`;

const results = [];
for (const it of items) {
  const outJs = resolve(stage, `_preview/${group}/${it.name}.js`);
  const viewport = it.viewport || '1440x900';
  try {
    execFileSync('node', [
      resolve(repoRoot, 'scripts/ds-preview-build.mjs'),
      resolve(repoRoot, it.story),
      it.exports.join(','),
      outJs,
    ], { cwd: repoRoot, stdio: 'pipe', timeout: 240000 });
    const cardDir = resolve(stage, `components/${group}/${it.name}`);
    mkdirSync(cardDir, { recursive: true });
    writeFileSync(resolve(cardDir, `${it.name}.html`), cardHtml(it.name, group, viewport));
    const cssOk = existsSync(outJs.replace(/\.js$/, '.css'));
    results.push({ name: it.name, status: 'ok', css: cssOk });
    console.log(`✓ ${it.name}${cssOk ? '' : ' (NO CSS!)'}`);
  } catch (e) {
    const msg = (e.stderr ? e.stderr.toString() : e.message).split('\n').filter(Boolean).slice(-3).join(' | ');
    results.push({ name: it.name, status: 'FAIL', error: msg });
    console.log(`✗ ${it.name}: ${msg.slice(0, 300)}`);
  }
}
console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(results.map((r) => ({ name: r.name, status: r.status, ...(r.error ? { error: r.error.slice(0, 200) } : {}) })), null, 2));
