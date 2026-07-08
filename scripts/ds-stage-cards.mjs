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

const cardHtml = (name, group, viewport, layout = 'page') => `<!-- @dsCard group="${group}" viewport="${viewport}" -->
<!doctype html>
<html><head><meta charset="utf-8">
  <link rel="stylesheet" href="../../../styles.css">
  <link rel="stylesheet" href="../../../_ds_bundle.css">
  <link rel="stylesheet" href="../../../_preview/${group}/${name}.css">
  <style>
    html,body{margin:0;padding:0;background:#fff}
    ${layout === 'grid'
      ? '#r0{padding:20px}.ds-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;align-items:start}.ds-cell{border:1px solid #e5e7eb;border-radius:8px;padding:14px;min-width:0;overflow:hidden}.ds-cell>h4{margin:0 0 10px;font:600 11px system-ui;color:#6b7280;text-transform:uppercase;letter-spacing:.05em}'
      : layout === 'component'
      ? '#r0{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px;box-sizing:border-box}'
      : '#r0{min-height:100vh}'}
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
      var MODE=${layout === 'grid' ? "'grid'" : "'single'"};
      var q=null; try{q=new URLSearchParams(location.search).get('story')}catch(e){}
      var dp=window.__dsPreview||{};
      var keys=[]; for(var k in dp){ if(typeof dp[k]==='function'&&/^[A-Z]/.test(k)) keys.push(k); }
      var el=document.getElementById('r0');
      function mount(node,key){ try{ReactDOM.createRoot(node).render(h(P,{},h(dp[key])))}catch(e){node.className='ds-err';node.textContent='⚠ '+((e&&e.message)||e)} }
      if(MODE==='grid' && !q){
        if(!keys.length){ el.className='ds-err'; el.textContent='⚠ no exports in ${name}.js'; return; }
        var g=document.createElement('div'); g.className='ds-grid'; el.appendChild(g);
        for(var i=0;i<keys.length;i++){ var cell=document.createElement('section'); cell.className='ds-cell'; cell.innerHTML='<h4></h4><div></div>'; cell.firstChild.textContent=keys[i]; g.appendChild(cell); mount(cell.lastChild,keys[i]); }
        return;
      }
      var pick=null;
      if(q){ for(var j=0;j<keys.length;j++){ if(keys[j]===q||keys[j].toLowerCase()===q.toLowerCase()){pick=keys[j];break;} } }
      if(!pick) pick = keys.indexOf('Default')>=0 ? 'Default' : keys[0];
      if(!pick){ el.className='ds-err'; el.textContent='⚠ no PascalCase render export in ${name}.js'; return; }
      mount(el,pick);
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
    writeFileSync(resolve(cardDir, `${it.name}.html`), cardHtml(it.name, group, viewport, it.layout || 'page'));
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
