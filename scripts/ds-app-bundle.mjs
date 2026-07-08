// Build the shared RiskSmart app-components bundle: the real app composites
// (PageLayout, RealProviders, Table, DashboardItem, PropertyFilterPanel,
// Navigation, GlobalHeader, modals, rating badges, …) compiled into ONE IIFE
// exposed as `window.RiskSmartApp`, React externalized to window.React. A
// prototype loads _vendor/react → _ds_bundle.js (window.RiskSmart primitives)
// → _ds_app_bundle.js (window.RiskSmartApp composites) and can then compose
// screens from the REAL production components = 1:1 with the live app.
//
// Usage: node scripts/ds-app-bundle.mjs <spec.json> <outJsAbs>
import { build } from 'vite';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [specPath, outFile] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(resolve(repoRoot, specPath), 'utf8'));

const abs = (p) => JSON.stringify(p.replace('@ABS@', repoRoot));
const dev = (p) => JSON.stringify(resolve(repoRoot, 'risksmart-app-main 2', p));
const own = (p) => JSON.stringify(resolve(repoRoot, p));

// preview env CSS → extracted into the bundle's .css (app shell styling)
const previewEnvCss = [
  `import '@cloudscape-design/global-styles/index.css';`,
  `import ${dev('packages/atomic-ui/src/index.css')};`,
  `import ${own('src/page-templates/_people-picker.css')};`,
  `import ${own('src/page-templates/_risk-dashboard.css')};`,
  `import ${own('src/page-templates/_scheduler.css')};`,
].join('\n');

// group specs by module so each module is imported once
const byMod = new Map();
for (const e of spec.exports) {
  const key = e.spec.startsWith('@ABS@') ? abs(e.spec) : JSON.stringify(e.spec);
  if (!byMod.has(key)) byMod.set(key, []);
  byMod.get(key).push(e);
}
const importLines = [];
const exportNames = [];
let i = 0;
for (const [mod, exps] of byMod) {
  const binds = exps.map((e) => {
    const local = `_e${i++}`;
    exportNames.push({ name: e.name, local });
    return e.kind === 'default' ? `default as ${local}` : `${e.name} as ${local}`;
  });
  importLines.push(`import { ${binds.join(', ')} } from ${mod};`);
}
const entryCode = `${previewEnvCss}
${importLines.join('\n')}
${exportNames.map((e) => `export const ${e.name} = ${e.local};`).join('\n')}
`;

const reactGlobals = () => {
  const V = new Map([
    ['react', `const R=window.React; export default R; const {createElement,cloneElement,createContext,createRef,forwardRef,isValidElement,lazy,memo,Children,Component,PureComponent,Fragment,StrictMode,Suspense,useCallback,useContext,useDebugValue,useDeferredValue,useEffect,useId,useImperativeHandle,useInsertionEffect,useLayoutEffect,useMemo,useReducer,useRef,useState,useSyncExternalStore,useTransition,startTransition,version}=R; export {createElement,cloneElement,createContext,createRef,forwardRef,isValidElement,lazy,memo,Children,Component,PureComponent,Fragment,StrictMode,Suspense,useCallback,useContext,useDebugValue,useDeferredValue,useEffect,useId,useImperativeHandle,useInsertionEffect,useLayoutEffect,useMemo,useReducer,useRef,useState,useSyncExternalStore,useTransition,startTransition,version};`],
    ['react-dom', `const R=window.ReactDOM; export default R; const {render,hydrate,createPortal,flushSync,unmountComponentAtNode,findDOMNode,unstable_batchedUpdates,unstable_renderSubtreeIntoContainer,createRoot,hydrateRoot,version}=R; export {render,hydrate,createPortal,flushSync,unmountComponentAtNode,findDOMNode,unstable_batchedUpdates,unstable_renderSubtreeIntoContainer,createRoot,hydrateRoot,version};`],
    ['react-dom/client', `const R=window.ReactDOM; export const createRoot=R.createRoot; export const hydrateRoot=R.hydrateRoot; export default R;`],
    // react-dom/server is NOT in the runtime UMD, and bundling it from node_modules
    // (react-dom@19) crashes against React 18.3.1 UMD (reads v19 internals). Stub it —
    // consumers (help content HTML conversion) degrade to empty string in previews.
    ['react-dom/server', `function rs(){return '';} const S={renderToStaticMarkup:rs,renderToString:rs,renderToStaticNodeStream:rs,renderToNodeStream:rs,version:'18.3.1'}; export default S; export const renderToStaticMarkup=rs; export const renderToString=rs;`],
    ['react-dom/server.browser', `function rs(){return '';} const S={renderToStaticMarkup:rs,renderToString:rs,version:'18.3.1'}; export default S; export const renderToStaticMarkup=rs; export const renderToString=rs;`],
    ['react/jsx-runtime', `const R=window.React; function j(t,p,k){ if(k!==void 0){p=Object.assign({},p,{key:k});} return R.createElement(t,p); } export const jsx=j; export const jsxs=j; export const Fragment=R.Fragment;`],
    ['react/jsx-dev-runtime', `const R=window.React; function j(t,p,k){ if(k!==void 0){p=Object.assign({},p,{key:k});} return R.createElement(t,p); } export const jsxDEV=j; export const jsx=j; export const jsxs=j; export const Fragment=R.Fragment;`],
  ]);
  return {
    name: 'ds-external-react-globals', enforce: 'pre',
    resolveId(id) { return V.has(id) ? '\0dsreact:' + id : null; },
    load(id) { return id.startsWith('\0dsreact:') ? V.get(id.slice('\0dsreact:'.length)) : null; },
  };
};

await build({
  configFile: resolve(repoRoot, 'vite.config.ts'),
  root: repoRoot,
  logLevel: 'warn',
  plugins: [reactGlobals()],
  define: { 'process.env.NODE_ENV': '"production"' },
  esbuild: { legalComments: 'none' },
  build: {
    write: false, minify: process.env.DS_MINIFY==='false' ? false : 'esbuild', cssMinify: true,
    lib: { entry: '\0ds-app-entry', name: spec.globalName, formats: ['iife'], fileName: () => 'app' },
    rollupOptions: {
      input: '\0ds-app-entry',
      plugins: [{
        name: 'ds-app-virtual-entry', enforce: 'pre',
        resolveId(id) { return id === '\0ds-app-entry' ? '\0ds-app-entry' : null; },
        load(id) { return id === '\0ds-app-entry' ? entryCode : null; },
      }],
    },
  },
}).then((res) => {
  const output = Array.isArray(res) ? res[0].output : res.output;
  const chunk = output.find((o) => o.type === 'chunk');
  const css = output.find((o) => o.type === 'asset' && String(o.fileName).endsWith('.css'));
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, chunk.code);
  if (css) writeFileSync(outFile.replace(/\.js$/, '.css'), css.source);
  console.log(`OK ${spec.globalName}: ${(chunk.code.length / 1024 / 1024).toFixed(1)} MB js, ${css ? (css.source.length / 1024).toFixed(0) + ' KB css' : 'no css'}, ${exportNames.length} exports`);
});
